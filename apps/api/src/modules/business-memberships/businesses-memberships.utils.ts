import { MemberRoles } from "../../shared/constants.js";
import { NotAllowedError } from "../../shared/errors.js";
import { id } from "../../shared/types.js";
import { businessMembershipsService } from "./businesses-memberships.sevice.js";

export async function requireOwner(business_id: id, userId: id) {
    const hasAccess =
        await businessMembershipsService.checkRoleAccess(
            business_id,
            userId,
            MemberRoles.owner
        );

    if (!hasAccess) {
        throw new NotAllowedError("not allowed");
    }
}