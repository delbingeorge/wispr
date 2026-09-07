import type { IconProps } from './types';
export function Expand({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M9 3.6H3.6V9" />
      <path d="M15 3.6h5.4V9" />
      <path d="M15 20.4h5.4V15" />
      <path d="M9 20.4H3.6V15" />
    </svg>
  );
}
