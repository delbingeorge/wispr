import type { IconProps } from './types';
export function Checker({ size = 24, title, ...rest }: IconProps) {
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
      <rect x="2" y="2" width="5" height="5" />
      <rect x="12" y="2" width="5" height="5" />
      <rect x="7" y="7" width="5" height="5" />
      <rect x="17" y="7" width="5" height="5" />
      <rect x="2" y="12" width="5" height="5" />
      <rect x="12" y="12" width="5" height="5" />
      <rect x="7" y="17" width="5" height="5" />
      <rect x="17" y="17" width="5" height="5" />
    </svg>
  );
}
