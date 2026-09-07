import type { IconProps } from './types';
export function VolumeLow({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M11.4 3.8 6.2 8.2H2.8v7.6h3.4l5.2 4.4z" />
      <path d="M15.4 9.2a4 4 0 0 1 0 5.6" />
    </svg>
  );
}
