import type { IconProps } from './types';
export function Warning({ size = 24, strokeWidth = 1.7, title, ...rest }: IconProps) {
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
      <path d="M12 3.4 22 20.6H2z" />
      <path d="M12 9.6v5" />
      <path d="M12 17.6v.1" />
    </svg>
  );
}
