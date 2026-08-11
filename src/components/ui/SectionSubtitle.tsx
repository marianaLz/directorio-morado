import type { ReactNode } from "react";
import {
  sectionSubtitleBaseClass,
  type BrandColor,
} from "./sectionHeadingClasses";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function SectionSubtitle({ className = "", children }: Props) {
  const classes = [sectionSubtitleBaseClass, className]
    .filter(Boolean)
    .join(" ");
  return <p className={classes}>{children}</p>;
}
