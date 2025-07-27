import { McpError } from './utils';
import { return_error } from './utils';

export function handleMcpError(error: any) {
  if (error instanceof McpError) {
    return return_error({ code: error.code, message: error.message });
  }
  if (error && typeof error === 'object') {
    const code = typeof error.code === 'string' ? error.code : 'INTERNAL_ERROR';
    const message = typeof error.message === 'string' ? error.message : '알 수 없는 오류가 발생했습니다.';
    return return_error({ code, message });
  }
  return return_error({ code: 'INTERNAL_ERROR', message: String(error) });
}
