import type { IconProps } from './types';
export function ExpandUp({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M3.6 14.4 12 6l8.4 8.4" />
      <path d="M3.6 9.6 12 1.2l8.4 8.4" />
    </svg>
  );
}
