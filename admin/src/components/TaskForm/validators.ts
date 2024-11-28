export function atLeastOneEntry(_: unknown, items: Array<unknown>) {
  if (!items || items.length === 0) {
    return Promise.reject('At least one item is required.');
  }
  return Promise.resolve(true); // Validation passed
}
