export interface FieldError {
    field: string;
    message: string;
}

export interface ApiErrorBody {
    error: string;
    details?: FieldError[];
}
