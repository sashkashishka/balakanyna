import { unwrap } from 'solid-js/store';
import type { TTask } from 'shared/types/task.ts';
import type { IGameState, IGlobalState, ICell } from '../../types.ts';
import { GameDifficultyManager } from '@/utils/gameDifficultyManager.ts';
import { random } from '@/utils/random.ts';
import { shuffle } from '@/utils/shuffle.ts';
import { compose } from '@/utils/compose.ts';
import { ITEM_PRESETS, ITEMS_LENGTH } from '../../constants.ts';

interface IContext
  extends Pick<IGlobalState, 'streak'>,
    Partial<Pick<IGameState, 'field' | 'dimensions' | 'pickingBoard'>> {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
  progress?: number;
  itemsToShow?: number; //
  itemsToSearch?: number; // by default from 1 to length - 1 (depends on progress)
}

export function calcProgress(ctx: IContext): IContext {
  const game = new GameDifficultyManager();

  const streak = unwrap(ctx.streak);

  streak.forEach((v) => {
    game.update(v.result);
  });

  return {
    ...ctx,
    progress: game.getDifficulty(),
  };
}

export function calcDimensions(ctx: IContext): IContext {
  const y = Math.round(ctx.config.y.max * ctx.progress!);

  return {
    ...ctx,
    dimensions: {
      x: 5,
      y: Math.max(ctx.config.y.min, y),
    },
  };
}

export function calcItemsToShow(ctx: IContext): IContext {
  return {
    ...ctx,
    itemsToShow: Math.max(
      ctx.config.items.min,
      ctx.config.items.max * ctx.progress!,
    ),
  };
}

export function calcItemsToSearch(ctx: IContext): IContext {
  return {
    ...ctx,
    itemsToSearch: Math.min(
      Math.floor(Math.max(1, ITEMS_LENGTH * ctx.progress!)),
      ITEMS_LENGTH - 1,
    ),
  };
}

export function generateShuffledList(ctx: IContext): IContext {
  const qty = ctx.dimensions!.y * ctx.dimensions!.x;

  const preset = shuffle(ITEM_PRESETS[ctx.config.preset]);
  const list = Array.from<ICell>({ length: qty });

  for (let i = 0; i < ctx.itemsToShow!; i++) {
    list[i] = {
      item: preset[i]!,
      disappear: i + 1 <= ctx.itemsToSearch!,
    };
  }

  return {
    ...ctx,
    field: shuffle(list),
  };
}

export function populatePickingBoard(ctx: IContext): IContext {
  const currentCells = ctx.field!.filter(Boolean);
  const preset = ITEM_PRESETS[ctx.config.preset];

  const additionalItems = random(2, 2 + ITEMS_LENGTH * ctx.progress!);
  const boardLength = Math.min(
    ITEMS_LENGTH,
    currentCells.length + additionalItems,
  );

  const filteredSample = shuffle(
    preset.filter((item) => !currentCells.find((v) => v.item === item)),
  );

  const pickingBoard = shuffle([
    ...currentCells,
    ...filteredSample
      .slice(0, boardLength - currentCells.length)
      .map((item) => ({ item, disappear: false })),
  ]);

  return {
    ...ctx,
    pickingBoard,
  };
}

export const getNextGame = compose(
  populatePickingBoard,
  generateShuffledList,
  calcItemsToShow,
  calcItemsToSearch,
  calcDimensions,
  calcProgress,
);

export function getInitialState(
  config: IContext['config'],
  globalStore: IGlobalState,
): IGameState {
  const { field, dimensions, pickingBoard } = getNextGame({
    streak: globalStore.streak,
    config,
  });

  return {
    dimensions: dimensions!,
    limitType: config.limit.type,
    field: field!,
    pickingBoard: pickingBoard!,
    timer: config.limit.value,
    rounds: {
      current: 0,
      total: config.limit.value,
    },
    phase: 'remember',
    proceedType: null,
  };
}
