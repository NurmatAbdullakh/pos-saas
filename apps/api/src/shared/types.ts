export type id= string;

export type ApiSuccess<T> = {
    success: true;
    message: string;
    data: T;
  };
  
  export type ApiError = {
    success: false;
    message: string;
    error: {
      code: string;
      details?: unknown;
    };
  };
