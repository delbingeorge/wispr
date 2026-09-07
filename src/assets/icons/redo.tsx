import type { IconProps } from './types';
export function Redo({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M15.6 5.6l4.2 4.2-4.2 4.2" />
      <path d="M19.8 9.8H9.7a5.5 5.5 0 0 0 0 11h5.7" />
    </svg>
  );
}
