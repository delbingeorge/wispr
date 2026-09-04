import type { IconProps } from './types';
export function FastForward({ size = 24, strokeWidth = 1.5, title, ...rest }: IconProps) {
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
      <path d="M3.6 6.6 11.2 12l-7.6 5.4z" />
      <path d="M12.8 6.6 20.4 12l-7.6 5.4z" />
    </svg>
  );
}
