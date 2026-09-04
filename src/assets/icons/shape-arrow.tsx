import type { IconProps } from './types';
export function ShapeArrow({ size = 24, strokeWidth = 1.8, title, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4.6 19.4 19.4 4.6" />
      <path d="M9.6 4.6h9.8v9.8" />
    </svg>
  );
}
