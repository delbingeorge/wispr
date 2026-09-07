import type { IconProps } from './types';
export function Pause({ size = 24, title, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <rect x="5.2" y="5" width="5.4" height="14" rx="1.1" />
      <rect x="13.4" y="5" width="5.4" height="14" rx="1.1" />
    </svg>
  );
}
