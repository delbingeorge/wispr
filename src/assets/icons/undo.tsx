import type { IconProps } from './types';
export function Undo({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M8.4 5.6 4.2 9.8l4.2 4.2" />
      <path d="M4.2 9.8h10.1a5.5 5.5 0 0 1 0 11H8.6" />
    </svg>
  );
}
