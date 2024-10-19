interface MiddlewareFn<Ctx> {
  (ctx: Ctx, next: () => Promise<void>): Promise<void> | void;
}

interface MiddlewareObj<Ctx> {
  middleware: MiddlewareFn<Ctx>;
}

export type Middleware<Ctx> = MiddlewareFn<Ctx> | MiddlewareObj<Ctx>;

export class Composer<Ctx> {
  use(...fns: Middleware<Ctx>[]): this;
  get(...fns: Middleware<Ctx>[]): this;
  put(...fns: Middleware<Ctx>[]): this;
  post(...fns: Middleware<Ctx>[]): this;
  patch(...fns: Middleware<Ctx>[]): this;
  delete(...fns: Middleware<Ctx>[]): this;
  middleware: MiddlewareFn<Ctx>;
}
