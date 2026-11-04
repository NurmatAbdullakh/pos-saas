import { MemberRoles, Permissions, RolePermissions } from "./constants.js";

export function hasPermission(
    role: MemberRoles,
    permission: Permissions
): boolean {
    return RolePermissions[role].includes(permission)
}