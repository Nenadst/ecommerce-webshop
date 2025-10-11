import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/shared/lib/stripe';
import { prisma } from '@/shared/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.orderId) {
          console.error('No orderId in session metadata');
          return NextResponse.json({ error: 'No orderId in metadata' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
          where: { id: session.metadata.orderId },
          include: { items: true },
        });

        if (!order) {
          console.error('Order not found:', session.metadata.orderId);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
              stripePaymentIntentId: session.payment_intent as string,
            },
          });

          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });
          }

          await tx.orderLog.create({
            data: {
              orderId: order.id,
              action: 'PAYMENT_COMPLETED',
              description: `Payment completed via Stripe. Payment Intent: ${session.payment_intent}`,
              performedBy: 'system',
            },
          });

          if (order.userId) {
            await tx.cartItem.deleteMany({
              where: { userId: order.userId },
            });
          }
        });

        console.log(`Order ${order.orderNumber} payment completed`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED',
            },
          });

          await prisma.orderLog.create({
            data: {
              orderId: session.metadata.orderId,
              action: 'PAYMENT_FAILED',
              description: 'Checkout session expired',
              performedBy: 'system',
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
            },
          });

          await prisma.orderLog.create({
            data: {
              orderId: order.id,
              action: 'PAYMENT_FAILED',
              description: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
              performedBy: 'system',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
