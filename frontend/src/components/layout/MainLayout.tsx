"use client";

import { useEffect, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  sideOpen: boolean;
  controlOpen: boolean;
}

export default function MainLayout({ children, sideOpen, controlOpen }: MainLayoutProps) {
  useEffect(() => {
    const body = document.body;
    if (sideOpen || controlOpen) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }

    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, [sideOpen, controlOpen]);

  return <>{children}</>;
}
