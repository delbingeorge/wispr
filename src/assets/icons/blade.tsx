import type { IconProps } from './types';
export function Blade({ size = 24, strokeWidth = 1.6, title, ...rest }: IconProps) {
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
      <circle cx="6.2" cy="17.6" r="2.8" />
      <circle cx="17.8" cy="17.6" r="2.8" />
      <path d="M8.5 15.5 18.8 4.2M15.5 15.5 5.2 4.2" />
    </svg>
  );
}
