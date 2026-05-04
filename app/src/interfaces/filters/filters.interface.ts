export const OrderDirection = {
    ASC: "asc",
    DESC: "desc",
} as const;


export const OrderBy = {
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
} as const;

export interface SearchQuery {
    page?: number;
    limit?: number;
    search?: string;
    order_by?: OrderBy;
    order_direction?: OrderDirection;
}


export type OrderDirection = (typeof OrderDirection)[keyof typeof OrderDirection];
export type OrderBy = (typeof OrderBy)[keyof typeof OrderBy];

