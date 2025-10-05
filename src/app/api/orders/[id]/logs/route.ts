import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getUserFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const logContent = `
ORDER LOG HISTORY
==================

Order Number: ${order.orderNumber}
Customer: ${order.user.name || 'N/A'} (${order.user.email})
Order Date: ${order.createdAt.toLocaleString()}
Current Status: ${order.status}
Payment Status: ${order.paymentStatus}
Total: €${order.total.toFixed(2)}

LOG ENTRIES:
${order.logs.length === 0 ? 'No logs available yet.' : ''}
${order.logs
  .map(
    (log) =>
      `[${log.createdAt.toLocaleString()}] ${log.action}
Performed by: ${log.performedBy || 'System'}
Description: ${log.description}
---`
  )
  .join('\n\n')}

Generated at: ${new Date().toLocaleString()}
`.trim();

    return new NextResponse(logContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="order-${order.orderNumber}-log.txt"`,
      },
    });
  } catch (error) {
    console.error('Error generating order log:', error);
    return NextResponse.json({ error: 'Failed to generate log' }, { status: 500 });
  }
}
