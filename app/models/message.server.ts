import { prisma } from '~/db.server';
import type { Message } from '~/generated/prisma/client';

export function addMessageToThread(
    message: Pick<Message, 'userId' | 'threadId' | 'role' | 'content'>,
) {
    return prisma.message.create({
        data: message,
    });
}
