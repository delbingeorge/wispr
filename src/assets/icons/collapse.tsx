import type { IconProps } from './types';
export function Collapse({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M9.6 3.6V9H4.2" />
      <path d="M14.4 3.6V9h5.4" />
      <path d="M14.4 20.4V15h5.4" />
      <path d="M9.6 20.4V15H4.2" />
    </svg>
  );
}
