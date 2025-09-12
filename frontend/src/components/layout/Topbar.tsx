'use client';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b flex items-center px-4 shadow-sm">
      <button
        className="md:hidden mr-2 text-xl"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        &#9776;
      </button>
      <span className="font-semibold">Nodo</span>
    </header>
  );
}
