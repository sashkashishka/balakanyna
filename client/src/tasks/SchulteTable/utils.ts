import { random } from '@/utils/random.ts';

export const getColor = (n: number, arr: string[]) => arr[n % arr.length];

export function generateSchulteTable(x: number, y: number) {
  const size = x * y;
  const field: number[][] = [];

  for (let i = 1; i <= size; i++) {
    while (true) {
      const xPos = random(0, x - 1);
      const yPos = random(0, y - 1);

      if (!field[yPos]) {
        field[yPos] = [];
      }

      if (field[yPos][xPos] === undefined) {
        field[yPos][xPos] = i;
        break;
      }
    }
  }

  return field;
}
