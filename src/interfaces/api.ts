export interface FieldError {
    field: string;
    message: string;
}

// Every error from the API has this shape. details only comes with 400 validation errors.
// TR: API'den gelen her hata bu biçimdedir. details sadece 400 doğrulama hatalarında gelir.
export interface ApiErrorBody {
    error: string;
    details?: FieldError[];
}
