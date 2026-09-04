import type { IconProps } from './types';
export function Reset({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M4.6 5.6A8.6 8.6 0 1 1 4.6 12" />
      <path d="M4.6 2.4v3.2h3.2" />
    </svg>
  );
}
