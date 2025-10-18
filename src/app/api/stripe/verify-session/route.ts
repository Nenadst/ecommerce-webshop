import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/shared/lib/stripe';
import { prisma } from '@/shared/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata?.orderId) {
      return NextResponse.json({ error: 'No order found for this session' }, { status: 404 });
    }

    let order = await prisma.order.findUnique({
      where: { id: session.metadata.orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.payment_status === 'paid' && order.paymentStatus === 'PENDING') {
      console.log(`Processing payment for order ${order.orderNumber} (webhook fallback)`);

      const currentOrder = order;

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: currentOrder.id },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        for (const item of currentOrder.items) {
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
            orderId: currentOrder.id,
            action: 'PAYMENT_COMPLETED',
            description: `Payment completed via Stripe (webhook fallback). Payment Intent: ${session.payment_intent}`,
            performedBy: 'system',
          },
        });

        if (currentOrder.userId) {
          await tx.cartItem.deleteMany({
            where: { userId: currentOrder.userId },
          });
        }
      });

      order = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        include: { items: true },
      });
    }

    return NextResponse.json({
      orderNumber: order!.orderNumber,
      paymentStatus: order!.paymentStatus,
      status: order!.status,
    });
  } catch (error) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify session' },
      { status: 500 }
    );
  }
}
