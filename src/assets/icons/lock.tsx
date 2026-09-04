import type { IconProps } from './types';
export function Lock({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2.2" />
      <path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8" />
    </svg>
  );
}
