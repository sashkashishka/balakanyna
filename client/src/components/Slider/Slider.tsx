import { onCleanup, onMount, type JSXElement } from 'solid-js';
import { Swiper } from 'swiper';
import { Pagination } from 'swiper/modules';
import cn from 'classnames';

import 'swiper/css';
import 'swiper/css/pagination';

import styles from './Slider.module.css';

interface IProps {
  children?: JSXElement;
}

export function Slide({ children }: IProps) {
  return <div class="swiper-slide">{children}</div>;
}

export function Slider({ children }: IProps) {
  let container: HTMLDivElement;
  let swiper: Swiper;

  onMount(() => {
    swiper = new Swiper('.swiper', {
      modules: [Pagination],
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet(index, className) {
          return `<span class="${className} ${styles.bullet}">${index + 1}</span>`;
        },
      },
    });

    swiper.init(container);
  });

  onCleanup(() => {
    swiper?.destroy?.(true, true);
  });

  return (
    <>
      <div
        ref={(el) => (container = el)}
        class={cn('swiper', styles.container)}
      >
        <div class="swiper-wrapper">{children}</div>
      </div>

      <div class={cn('swiper-pagination', styles.pagination)}></div>
    </>
  );
}
