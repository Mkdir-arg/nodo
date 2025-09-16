"use client";

import { ReactNode } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
}

export function FloatingButton({ 
  onClick, 
  icon = <PlusIcon />, 
  className = "" 
}: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center ${className}`}
    >
      {icon}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}