export interface BaseResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface PaginatedResponseDto<T> extends BaseResponseDto<T> {
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
