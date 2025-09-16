"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ${className}`}>
      {children}
    </div>
  );
}