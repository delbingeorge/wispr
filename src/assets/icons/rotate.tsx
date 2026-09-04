import type { IconProps } from './types';
export function Rotate({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.2" />
      <path d="M3.6 3.9v4.2h4.2" />
    </svg>
  );
}
