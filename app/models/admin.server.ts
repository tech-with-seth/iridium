import { auth } from '~/lib/auth.server';

// User Management

interface CreateUserParams {
    headers: Headers;
    email: string;
    password: string;
    name: string;
    role?: string | string[];
    data?: Record<string, any>;
}

export function createUser({
    headers,
    email,
    password,
    name,
    role,
    data,
}: CreateUserParams) {
    return auth.api.createUser({
        body: {
            email,
            password,
            name,
            role: role as any,
            data,
        },
        // This endpoint requires session cookies
        headers,
    });
}

interface ListUsersParams {
    headers: Headers;
    searchValue?: string;
    searchField?: 'email' | 'name';
    searchOperator?: 'contains' | 'starts_with' | 'ends_with';
    limit?: string | number;
    offset?: string | number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterField?: string;
    filterValue?: string | number | boolean;
    filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
}

export function listUsers({
    headers,
    searchValue,
    searchField,
    searchOperator,
    limit,
    offset,
    sortBy,
    sortDirection,
    filterField,
    filterValue,
    filterOperator,
}: ListUsersParams) {
    return auth.api.listUsers({
        query: {
            searchValue,
            searchField,
            searchOperator,
            limit,
            offset,
            sortBy,
            sortDirection,
            filterField,
            filterValue,
            filterOperator,
        },
        headers,
    });
}

interface UpdateUserParams {
    headers: Headers;
    userId: string;
    data: Record<string, any>;
}

export function updateUser({ headers, userId, data }: UpdateUserParams) {
    return auth.api.adminUpdateUser({
        body: {
            userId,
            data,
        },
        headers,
    });
}

interface SetUserRoleParams {
    headers: Headers;
    userId?: string;
    role: string | string[];
}

export function setUserRole({ headers, userId, role }: SetUserRoleParams) {
    return auth.api.setRole({
        body: {
            userId: userId as any,
            role: role as any,
        },
        headers,
    });
}

interface SetUserPasswordParams {
    headers: Headers;
    userId: string;
    newPassword: string;
}

export function setUserPassword({
    headers,
    userId,
    newPassword,
}: SetUserPasswordParams) {
    return auth.api.setUserPassword({
        body: {
            userId,
            newPassword,
        },
        headers,
    });
}

// User Restrictions

interface BanUserParams {
    headers: Headers;
    userId: string;
    banReason?: string;
    banExpiresIn?: number;
}

export function banUser({
    headers,
    userId,
    banReason,
    banExpiresIn,
}: BanUserParams) {
    return auth.api.banUser({
        body: {
            userId,
            banReason,
            banExpiresIn,
        },
        headers,
    });
}

interface UnbanUserParams {
    headers: Headers;
    userId: string;
}

export function unbanUser({ headers, userId }: UnbanUserParams) {
    return auth.api.unbanUser({
        body: {
            userId,
        },
        headers,
    });
}

interface RemoveUserParams {
    headers: Headers;
    userId: string;
}

export function removeUser({ headers, userId }: RemoveUserParams) {
    return auth.api.removeUser({
        body: {
            userId,
        },
        headers,
    });
}

// Session Management

interface ListUserSessionsParams {
    headers: Headers;
    userId: string;
}

export function listUserSessions({ headers, userId }: ListUserSessionsParams) {
    return auth.api.listUserSessions({
        body: {
            userId,
        },
        headers,
    });
}

interface RevokeUserSessionParams {
    headers: Headers;
    sessionToken: string;
}

export function revokeUserSession({
    headers,
    sessionToken,
}: RevokeUserSessionParams) {
    return auth.api.revokeUserSession({
        body: {
            sessionToken,
        },
        headers,
    });
}

interface RevokeAllUserSessionsParams {
    headers: Headers;
    userId: string;
}

export function revokeAllUserSessions({
    headers,
    userId,
}: RevokeAllUserSessionsParams) {
    return auth.api.revokeUserSessions({
        body: {
            userId,
        },
        headers,
    });
}

// Impersonation

interface ImpersonateUserParams {
    headers: Headers;
    userId: string;
}

export function impersonateUser({ headers, userId }: ImpersonateUserParams) {
    return auth.api.impersonateUser({
        body: {
            userId,
        },
        headers,
    });
}

export function stopImpersonating({ headers }: { headers: Headers }) {
    return auth.api.stopImpersonating({
        headers,
    });
}

// Permissions

interface HasPermissionParams {
    headers: Headers;
    userId?: string;
    role?: string;
    permission?: Record<string, string[]>;
}

export function hasPermission({
    headers,
    userId,
    role,
    permission,
}: HasPermissionParams) {
    return auth.api.userHasPermission({
        body: {
            userId,
            role,
            permission,
        } as any,
        headers,
    });
}
