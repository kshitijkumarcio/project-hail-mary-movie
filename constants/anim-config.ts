import { Easing } from 'motion';

export const easing065: Easing = [0.65, 0, 0.35, 1];
export const easing016: Easing = [0.16, 1, 0.3, 1];

export const before = `before:absolute before:content-[" "] before:-left-0 before:-bottom-[1px] before:block before:w-[100%] before:h-[0.5px] before:bg-white before:duration-1000 before:transition-all before:cubic-bezier(0.19, 1, 0.22, 1) before:scale-x-0 before:origin-left hover:before:scale-x-100 hover:before:delay-300`;

export const after = `after:absolute after:content-[" "] after:left-0 after:-bottom-[1px] after:block after:w-full after:h-[0.5px] after:bg-white after:duration-1000 after:transition-all after:cubic-bezier(0.19, 1, 0.22, 1) after:origin-right after:delay-300 hover:after:scale-x-0 hover:after:delay-0`;

export const atfAnimConfig = {
  layer1_delay: 0,
  layer1_duration: 0.7,
  layer2_delay: 0,
  layer2_duration: 0.7,
};
