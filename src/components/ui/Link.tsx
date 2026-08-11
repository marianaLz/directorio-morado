import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { linkClass } from './linkClasses';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  className?: string;
  children: ReactNode;
};

export default function Link({
  href,
  className = '',
  children,
  ...rest
}: Props) {
  const classes = [linkClass, className].filter(Boolean).join(' ');
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
