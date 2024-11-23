export function getSearchParam(name: string, value: string | number): string {
  const searchParams = new URLSearchParams();
  searchParams.set(name, String(value));
  return `?${searchParams.toString()}`;
}
