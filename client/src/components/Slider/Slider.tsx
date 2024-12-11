import { onCleanup, onMount, type JSXElement } from 'solid-js';
import { Swiper } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    swiper.init(container);
  });

  onCleanup(() => {
    swiper?.destroy?.(true, true);
  });

  return (
    <div ref={(el) => (container = el)} class="swiper">
      <div class="swiper-wrapper">{children}</div>

      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>

      <div class="swiper-pagination"></div>
    </div>
  );
}
