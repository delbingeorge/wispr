import type { IconProps } from './types';
export function Trash({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <path d="M4.6 6.3h14.8" />
      <path d="M9.4 6.3V4.2h5.2v2.1" />
      <path d="M6.4 6.3l1 13.5h9.2l1-13.5" />
      <path d="M10.3 9.8v6.4M13.7 9.8v6.4" />
    </svg>
  );
}
