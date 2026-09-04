import type { IconProps } from './types';
export function EyeOff({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <path d="M4 4.4 20 20.4" />
      <path d="M9.4 5.9A9.6 9.6 0 0 1 12 5.6c6.1 0 10.2 6.4 10.2 6.4a18 18 0 0 1-3.4 4" />
      <path d="M6.5 7.6A18.4 18.4 0 0 0 1.8 12s4.1 6.4 10.2 6.4a9.9 9.9 0 0 0 4-.8" />
      <path d="M10 10a2.9 2.9 0 0 0 4 4" />
    </svg>
  );
}
