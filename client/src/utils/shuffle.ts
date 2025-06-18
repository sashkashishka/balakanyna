export function shuffle(array: any[]) {
  const result = array.slice();
  let m = array.length;
  let t;
  let i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }

  return result;
}
