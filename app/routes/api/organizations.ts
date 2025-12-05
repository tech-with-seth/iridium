import type { Route } from './+types/organizations';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import {
    removeMember,
    getOrganizationMembership,
} from '~/models/organization.server';
import {
    acceptInvitation,
    revokeInvitation,
} from '~/models/invitation.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();
    const intent = String(formData.get('intent'));

    if (request.method === 'POST' && intent === 'accept-invitation') {
        const token = String(formData.get('token'));
        try {
            await acceptInvitation(token, user.id);
            return data({ success: true });
        } catch (error) {
            return data(
                { error: 'Failed to accept invitation' },
                { status: 400 },
            );
        }
    }

    if (request.method === 'DELETE') {
        if (intent === 'leave-organization') {
            const organizationId = String(formData.get('organizationId'));
            const membership = await getOrganizationMembership(
                organizationId,
                user.id,
            );

            if (!membership) {
                return data({ error: 'Not a member' }, { status: 404 });
            }
            if (membership.role === 'OWNER') {
                return data(
                    { error: 'Owners cannot leave' },
                    { status: 403 },
                );
            }

            await removeMember(organizationId, user.id);
            return data({ success: true });
        }

        if (intent === 'decline-invitation') {
            const invitationId = String(formData.get('invitationId'));
            await revokeInvitation(invitationId);
            return data({ success: true });
        }
    }

    return data({ error: 'Invalid request' }, { status: 400 });
}
