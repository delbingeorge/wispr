import type { IconProps } from './types';
export function Opacity({ size = 24, title, ...rest }: IconProps) {
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
      <rect x="2.6" y="2.6" width="4.7" height="4.7" />
      <rect x="12" y="2.6" width="4.7" height="4.7" />
      <rect x="7.3" y="7.3" width="4.7" height="4.7" />
      <rect x="16.7" y="7.3" width="4.7" height="4.7" />
      <rect x="2.6" y="12" width="4.7" height="4.7" />
      <rect x="12" y="12" width="4.7" height="4.7" />
      <rect x="7.3" y="16.7" width="4.7" height="4.7" />
      <rect x="16.7" y="16.7" width="4.7" height="4.7" />
    </svg>
  );
}
