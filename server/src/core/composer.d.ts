interface MiddlewareFn<Ctx> {
  (ctx: Ctx, next: () => Promise<void>): Promise<void> | void;
}

interface MiddlewareObj<Ctx> {
  middleware: MiddlewareFn<Ctx>;
}

export type Middleware<Ctx> = MiddlewareFn<Ctx> | MiddlewareObj<Ctx>;

export class Composer<Ctx> {
  use(...fns: Middleware<Ctx>[]): this;
  get(route: string, ...fns: Middleware<Ctx>[]): this;
  put(route: string, ...fns: Middleware<Ctx>[]): this;
  post(route: string, ...fns: Middleware<Ctx>[]): this;
  patch(route: string, ...fns: Middleware<Ctx>[]): this;
  delete(route: string, ...fns: Middleware<Ctx>[]): this;
  middleware: MiddlewareFn<Ctx>;

  static compose(...fns: Middleware<Ctx>[]): MiddlewareFn<Ctx>;
}
