import type { IconProps } from './types';
export function ShapeStar({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d="m12 3.6 2.6 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.5l-5.5 3.1 1.3-6.2-4.7-4.3 6.3-.7z" />
    </svg>
  );
}
