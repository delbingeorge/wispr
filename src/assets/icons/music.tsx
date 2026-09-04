import type { IconProps } from './types';
export function Music({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M10.4 18.4V4.1l7-2.1v3.4l-7 2.1" />
      <ellipse cx="7.4" cy="19.4" rx="3" ry="2.4" />
    </svg>
  );
}
