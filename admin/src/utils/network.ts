export function getIdSearchParam(id: string | number): string {
  const searchParams = new URLSearchParams();
  searchParams.set('id', String(id));
  return `?${searchParams.toString()}`;
}
