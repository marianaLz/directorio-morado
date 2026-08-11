import type { ReactNode } from 'react';
import {
  brandColorVar,
  sectionPaddingClass,
  type BrandColor,
} from './sectionHeadingClasses';

type Props = {
  bg?: BrandColor;
  id?: string;
  'aria-labelledby'?: string;
  className?: string;
  children: ReactNode;
};

export default function Section({
  bg = 'white',
  id,
  'aria-labelledby': ariaLabelledby,
  className = '',
  children,
}: Props) {
  const classes = [sectionPaddingClass, className].filter(Boolean).join(' ');
  return (
    <section
      id={id}
      className={classes}
      style={{ backgroundColor: brandColorVar(bg) }}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </section>
  );
}
