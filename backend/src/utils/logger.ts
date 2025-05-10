import prisma from '../../prisma/client';

export const logActivity = async (params: {
    userId: number;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    entity: string;
    targetId?: number;
    detail?: string;
}) => {
    await prisma.activityLog.create({
        data: {
            ...params,
        },
    });
};