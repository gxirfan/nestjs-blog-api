interface IBaseResponse<T> {
    statusCode: number; 
    success: boolean; 
    message?: string; 
    data: T | T[] | null; 
}
  
interface IErrorResponse {
    statusCode: number;
    success: boolean; 
    error: string;    
    message: string;  
    timestamp: string;
    path: string;
}

export type {
    IBaseResponse,
    IErrorResponse
}