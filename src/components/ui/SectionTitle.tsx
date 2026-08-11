import type { ReactNode } from 'react';
import {
  brandColorVar,
  sectionTitleBaseClass,
  type BrandColor,
} from './sectionHeadingClasses';

type Props = {
  color?: BrandColor;
  id?: string;
  as?: 'h1' | 'h2';
  className?: string;
  children: ReactNode;
};

export default function SectionTitle({
  color = 'primary',
  id,
  as: Tag = 'h2',
  className = '',
  children,
}: Props) {
  const classes = [sectionTitleBaseClass, className].filter(Boolean).join(' ');
  return (
    <Tag id={id} className={classes} style={{ color: brandColorVar(color) }}>
      {children}
    </Tag>
  );
}
