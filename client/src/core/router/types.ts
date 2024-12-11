export interface IRoutesConfig {
  [alias: string]: string;
}

export interface IRoute {
  alias: string;
  pattern: string;
  pathname: string;
  params: Record<string, string>;
  searchParams: Record<string, string>;
}
