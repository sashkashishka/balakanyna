function replacer(key, value) {
  return value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {})
    : value;
}

export function sortJsonKeys(obj) {
  return JSON.parse(JSON.stringify(obj, replacer));
}
