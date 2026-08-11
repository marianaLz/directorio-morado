import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { buttonOutlineClass } from './buttonClasses';

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

export type ButtonOutlineProps = ButtonAsButton | ButtonAsLink;

export default function ButtonOutline({ className = '', children, ...rest }: ButtonOutlineProps) {
  const classes = [buttonOutlineClass, className].filter(Boolean).join(' ');

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
