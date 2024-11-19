interface IMiddlewareFn<TCtx> {
  (ctx: TCtx, next: () => Promise<void>): Promise<void> | void;
}

interface IMiddlewareObj<TCtx> {
  middleware: MiddlewareFn<TCtx>;
}

export type TMiddleware<TCtx> = IMiddlewareFn<TCtx> | IMiddlewareObj<TCtx>;

export class Composer<TCtx> {
  use(...fns: TMiddleware<TCtx>[]): this;
  get(route: string, ...fns: TMiddleware<TCtx>[]): this;
  put(route: string, ...fns: TMiddleware<TCtx>[]): this;
  post(route: string, ...fns: TMiddleware<TCtx>[]): this;
  patch(route: string, ...fns: TMiddleware<TCtx>[]): this;
  delete(route: string, ...fns: TMiddleware<TCtx>[]): this;
  middleware: TMiddlewareFn<TCtx>;

  static compose(...fns: TMiddleware<TCtx>[]): TMiddlewareFn<TCtx>;
}
