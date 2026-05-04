export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
  };
}

export function error(message: string, code = 400, data: any = null): ApiResponse {
  return {
    code,
    message,
    data,
  };
}

export function unauthorized(message = '未登录或Token已过期'): ApiResponse {
  return error(message, 401);
}

export function forbidden(message = '无权限'): ApiResponse {
  return error(message, 403);
}

export function locked(message: string, lockMinutes: number): ApiResponse {
  return error(message, 423, { lock_minutes: lockMinutes });
}
