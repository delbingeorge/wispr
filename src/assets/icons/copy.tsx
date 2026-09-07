import type { IconProps } from './types';
export function Copy({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.2" />
      <path d="M15.6 5.4a2.2 2.2 0 0 0-2.2-2H5.6a2.2 2.2 0 0 0-2.2 2.2v7.8a2.2 2.2 0 0 0 2 2.2" />
    </svg>
  );
}
