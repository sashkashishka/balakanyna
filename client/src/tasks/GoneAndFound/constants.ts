import type { TItemPreset, TItemPresets } from './types.ts';

import avocado from './images/avocado.png';
import broccoli from './images/broccoli.png';
import cabbage from './images/cabbage.png';
import carrot from './images/carrot.png';
import chiliPepper from './images/chilli-pepper.png';
import corn from './images/corn.png';
import eggplant from './images/eggplant.png';
import eggplant2 from './images/eggplant2.png';
import lemon from './images/lemon.png';
import onion from './images/onion.png';
import tomato from './images/tomato.png';
import zucchini from './images/zucchini.png';

import defaultFieldBg from './images/grass.webp';
import defaultPickBg from './images/wood-crate.png';

export const ITEM_PRESETS: TItemPresets = {
  default: [
    avocado,
    broccoli,
    cabbage,
    carrot,
    chiliPepper,
    corn,
    eggplant,
    eggplant2,
    lemon,
    onion,
    tomato,
    zucchini,
  ],
};

export const ITEM_PRESETS_BG: Record<
  TItemPreset,
  { fieldBg: string; pickBg: string }
> = {
  default: {
    fieldBg: defaultFieldBg,
    pickBg: defaultPickBg,
  },
};

export const ITEMS_LENGTH = 12;
