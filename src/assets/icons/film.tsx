import type { IconProps } from './types';
export function Film({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <rect x="2.8" y="4.6" width="18.4" height="14.8" rx="2.2" />
      <path d="M7.6 4.6v14.8M16.4 4.6v14.8M2.8 12h18.4" />
    </svg>
  );
}
