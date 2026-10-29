import { ApiSuccess } from "./types.js";

export function successResponse<T>(
    data: T,
    message: string
  ): ApiSuccess<T> {
    return {
      success: true,
      message,
      data,
    };
  }