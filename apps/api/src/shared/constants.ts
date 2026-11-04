export enum MemberRoles {
    owner = "owner",
    manager = "manager",
    cashier = "cashier"
}

export enum Permissions {
    BUSINESS_READ = "businesses.read",
    BUSINESS_MANAGE = "businesses.manage",

    MEMBERS_READ = "members.read",
    MEMBERS_MANAGE = "members.manage",

    STORES_READ = "stores.read",
    STORES_MANAGE = "stores.manage",

    PRODUCTS_READ = "products.read",
    PRODUCTS_MANAGE = "products.manage",

    ORDERS_CREATE = "orders.create",
    ORDERS_CANCEL = "orders.cancel",

    REPORTS_READ = "reports.read"
}


export const RolePermissions:Record<MemberRoles, readonly Permissions[]> = {
    [MemberRoles.owner]: Object.values(Permissions),

    [MemberRoles.manager]: [
        Permissions.BUSINESS_READ,
        Permissions.MEMBERS_READ,
        Permissions.STORES_READ,
        Permissions.STORES_MANAGE,
        Permissions.PRODUCTS_READ,
        Permissions.PRODUCTS_MANAGE,
        Permissions.ORDERS_CREATE,
        Permissions.ORDERS_CANCEL,
        Permissions.REPORTS_READ
    ],

    [MemberRoles.cashier]: [
        Permissions.BUSINESS_READ,
        Permissions.PRODUCTS_READ,
        Permissions.ORDERS_CREATE
    ]
};