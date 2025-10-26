import { prisma } from '@/shared/lib/prisma';

const activityResolvers = {
  Query: {
    userActivityLogs: async (
      _: unknown,
      {
        userId,
        limit = 1000,
        fromDate,
        toDate,
      }: { userId: string; limit?: number; fromDate?: string; toDate?: string }
    ) => {
      interface WhereCondition {
        userId: string;
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      }

      const where: WhereCondition = { userId };

      // Add date range filter if provided
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
          where.createdAt.gte = new Date(fromDate);
        }
        if (toDate) {
          // Set toDate to end of day (23:59:59.999)
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.createdAt.lte = endOfDay;
        }
      }

      const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: true,
        },
      });

      return logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              name: log.user.name,
              role: log.user.role.toLowerCase(),
              accountStatus: log.user.accountStatus.toLowerCase(),
              lastLogin: log.user.lastLogin?.toISOString(),
              country: log.user.country,
              createdAt: log.user.createdAt.toISOString(),
            }
          : null,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        path: log.path,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdAt: log.createdAt.toISOString(),
      }));
    },

    allActivityLogs: async (
      _: unknown,
      { limit = 1000, fromDate, toDate }: { limit?: number; fromDate?: string; toDate?: string }
    ) => {
      interface WhereCondition {
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      }

      const where: WhereCondition = {};

      // Add date range filter if provided
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
          where.createdAt.gte = new Date(fromDate);
        }
        if (toDate) {
          // Set toDate to end of day (23:59:59.999)
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.createdAt.lte = endOfDay;
        }
      }

      const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: true,
        },
      });

      return logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              name: log.user.name,
              role: log.user.role.toLowerCase(),
              accountStatus: log.user.accountStatus.toLowerCase(),
              lastLogin: log.user.lastLogin?.toISOString(),
              country: log.user.country,
              createdAt: log.user.createdAt.toISOString(),
            }
          : null,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        path: log.path,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdAt: log.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    createActivityLog: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          userId?: string;
          action: string;
          description: string;
          ipAddress?: string;
          userAgent?: string;
          path?: string;
          metadata?: string;
        };
      }
    ) => {
      const log = await prisma.activityLog.create({
        data: {
          userId: input.userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          action: input.action as any,
          description: input.description,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          path: input.path,
          metadata: input.metadata ? JSON.parse(input.metadata) : null,
        },
        include: {
          user: true,
        },
      });

      return {
        id: log.id,
        userId: log.userId,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              name: log.user.name,
              role: log.user.role.toLowerCase(),
              accountStatus: log.user.accountStatus.toLowerCase(),
              lastLogin: log.user.lastLogin?.toISOString(),
              country: log.user.country,
              createdAt: log.user.createdAt.toISOString(),
            }
          : null,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        path: log.path,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdAt: log.createdAt.toISOString(),
      };
    },
  },
};

export default activityResolvers;
