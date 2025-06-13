import { unwrap } from 'solid-js/store';
import type { TTask } from 'shared/types/task.ts';
import type { IGameState, IGlobalState } from '../../types.ts';
import { random } from '@/utils/random.ts';
import { compose } from '@/utils/compose.ts';
import { easeInSine } from '@/utils/easingFunctions.ts';
import { COLORS, ANIMATIONS } from '../../screens/Game/constants.ts';

interface IContext
  extends Pick<IGlobalState, 'streak'>,
    Partial<
      Pick<IGameState, 'field' | 'searchNumber' | 'color' | 'animationDuration'>
    > {
  config: Extract<TTask, { type: 'findFlashingNumber' }>['config'];
  progress?: number;
  fieldDimensions?: {
    x: number;
    y: number;
  };
  positionalDigit?: number;
}

export function calcProgress(ctx: IContext): IContext {
  const streak = unwrap(ctx.streak);
  const successful = streak
    .slice(-ctx.config.streak.length - 1)
    // TODO: improve algorithm to avoid progress plateau
    // when user picked wrong number multiple times in a row
    // example
    // 111111 -> 6
    // 111110 -> 5
    // 110111 -> 5
    // 011111 -> 5
    // in order to move on with higher difficulty you should
    // go through 6 games in a row with the same difficulty
    .reduce((acc, curr) => acc + Number(curr.result), 0);

  return {
    ...ctx,
    progress: easeInSine(Math.min(1, successful / ctx.config.streak.length)),
  };
}

export function calcFieldDimensions(ctx: IContext): IContext {
  const x = Math.round(ctx.config.x.max * ctx.progress!);
  const y = Math.round(ctx.config.y.max * ctx.progress!);

  return {
    ...ctx,
    fieldDimensions: {
      x: Math.max(ctx.config.x.min, x),
      y: Math.max(ctx.config.y.min, y),
    },
  };
}

export function calcPositionalDigit(ctx: IContext): IContext {
  const pd = Math.round(ctx.config.positionalDigit.max * ctx.progress!);

  return {
    ...ctx,
    positionalDigit: Math.max(ctx.config.positionalDigit.min, pd),
  };
}

function generateUniqueNumberList(positionalDigit: number, qty: number) {
  const numbers = new Set<number>();
  const min = 10 ** (positionalDigit - 1);
  const max = 10 ** positionalDigit - min;

  while (numbers.size < qty) {
    const randomNumber = random(min, max);
    numbers.add(randomNumber);
  }

  return Array.from(numbers);
}

function generateAnimationList(qty: number) {
  const l = ANIMATIONS.length;
  const tmp = Array.from<number>({ length: l }).fill(0);

  const list = [];

  while (list.length < qty) {
    const idx = random(0, l - 1);
    const threshold = random(0, 2) + qty / l;

    if (tmp[idx]! < threshold) {
      list.push(ANIMATIONS[idx]);
    }
  }

  return list;
}

function generateColorList(qty: number) {
  const l = COLORS.length;
  const tmp = Array.from<number>({ length: l }).fill(0);

  const list = [];

  while (list.length < qty) {
    const idx = random(0, l - 1);
    const threshold = random(0, 3) + qty / l;

    if (tmp[idx]! < threshold) {
      list.push(COLORS[idx]);
    }
  }

  return list;
}

export function generateField(ctx: IContext): IContext {
  const qty = ctx.fieldDimensions!.y * ctx.fieldDimensions!.x;

  const uniqueList = generateUniqueNumberList(ctx.positionalDigit!, qty);
  const animationList = generateAnimationList(qty);
  const colorList = generateColorList(qty);

  const field: IGameState['field'] = [];

  for (let y = 0; y < ctx.fieldDimensions!.y; y++) {
    field[y] = [];

    for (let x = 0; x < ctx.fieldDimensions!.x; x++) {
      const idx = y * ctx.fieldDimensions!.x + x;
      field[y]![x] = {
        number: uniqueList[idx]!,
        animation: animationList[idx]!,
        color: colorList[idx]!,
      };
    }
  }

  return {
    ...ctx,
    field,
  };
}

export function pickSearchNumber(ctx: IContext): IContext {
  const randomX = random(0, ctx.fieldDimensions!.x - 1);
  const randomY = random(0, ctx.fieldDimensions!.y - 1);

  return {
    ...ctx,
    searchNumber: ctx.field![randomY]![randomX]!.number,
  };
}

export function pickAnimationDuration(ctx: IContext): IContext {
  return {
    ...ctx,
    animationDuration: random(
      ctx.config.animation.min,
      ctx.config.animation.max,
    ),
  };
}

export function pickColor(ctx: IContext): IContext {
  return {
    ...ctx,
    color: COLORS[random(0, COLORS.length - 1)],
  };
}

export const getNextGame = compose(
  pickColor,
  pickSearchNumber,
  pickAnimationDuration,
  generateField,
  calcPositionalDigit,
  calcFieldDimensions,
  calcProgress,
);

export function getInitialState(
  config: IContext['config'],
  globalStore: IGlobalState,
): IGameState {
  const { field, searchNumber, animationDuration, color } = getNextGame({
    streak: globalStore.streak,
    config,
  });

  return {
    field: field!,
    searchNumber: searchNumber!,
    timer: config.duration,
    animationDuration: animationDuration!,
    color: color!,
  };
}
