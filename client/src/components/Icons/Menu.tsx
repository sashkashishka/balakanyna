import type { JSX } from 'solid-js';

export function MenuIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 12h16M4 8h16M4 16h8"
      />
    </svg>
  );
}
