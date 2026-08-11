import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { buttonGhostClass } from './buttonClasses';

type Common = {
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type ButtonAsLink = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string;
  };

export type ButtonGhostProps = ButtonAsButton | ButtonAsLink;

export default function ButtonGhost({ className = '', children, ...rest }: ButtonGhostProps) {
  const classes = [buttonGhostClass, className].filter(Boolean).join(' ');

  if ('href' in rest && typeof rest.href === 'string') {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
