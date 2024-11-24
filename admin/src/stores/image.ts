import { type ReadableAtom } from 'nanostores';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { type IFilters } from './_list-filter';
import type { IImage } from '@/types/image';
import { getSearchParam } from '@/utils/network';

export interface IImageListFilters extends IFilters {
  filename?: string;
  min_created_at?: string;
  max_created_at?: string;
  labels?: number[];
}

export const defaultImageListFilters: IImageListFilters = {
  page: 1,
  order_by: 'createdAt',
  dir: 'descend',
};

export const IMAGE_KEYS = {
  list: 'image/list',
  getList(search: ReadableAtom<string>) {
    return [this.list, search];
  },
  image: 'image/get',
  getImage(imageId: string | number) {
    return ['image/get', getSearchParam('id', imageId)];
  },
};

// list and item fetcher store fabrics
export function makeImagesStore(search: ReadableAtom<string>) {
  const $images = createFetcherStore<IPaginatorResponse<IImage>>(
    IMAGE_KEYS.getList(search),
  );
  return $images;
}

export function makeImageStore(imageId: string | number) {
  const $image = createFetcherStore<IImage>(IMAGE_KEYS.getImage(imageId));

  return $image;
}

// mutators
export const $uploadImage = createMutatorStore<File>(
  async ({ data, invalidate }) => {
    const formData = new FormData()

    formData.append('image', data);

    const resp = await fetch('/api/admin/image/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    invalidate(
      (k) => k.startsWith(IMAGE_KEYS.list) || k.startsWith(IMAGE_KEYS.image),
    );

    return resp;
  },
);
