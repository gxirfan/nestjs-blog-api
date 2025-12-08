export interface IPaginationResponse<T> {
    data: T[];
    meta: {
        total: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}