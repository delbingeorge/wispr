import type { IconProps } from './types';
export function Rewind({ size = 24, strokeWidth = 1.5, title, ...rest }: IconProps) {
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
      <path d="M11.2 6.6 3.6 12l7.6 5.4z" />
      <path d="M20.4 6.6 12.8 12l7.6 5.4z" />
    </svg>
  );
}
