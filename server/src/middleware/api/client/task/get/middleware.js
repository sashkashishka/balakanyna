import * as taskGet from '../../../admin/task/get/middleware.js';

export const route = '/api/client/task/get';
export const method = taskGet.method;
export const middleware = taskGet.middleware;
