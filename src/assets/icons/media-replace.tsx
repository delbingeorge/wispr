import type { IconProps } from './types';
export function MediaReplace({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="1.6" />
      <path d="M3.4 16.4 8.9 11l4.1 4.4 2.7-2.6 4.9 4.6" />
      <circle cx="8.4" cy="8.9" r="1.35" />
    </svg>
  );
}
