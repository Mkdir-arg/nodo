import * as React from 'react';

export interface LucideProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

function createIcon(path: React.ReactNode) {
  return function Icon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {path}
      </svg>
    );
  };
}

export const Home = createIcon(
  <>
    <path d="M3 9l9-7 9 7" />
    <path d="M9 22V12h6v10" />
    <path d="M3 22h18" />
  </>
);

export const FolderKanban = createIcon(
  <>
    <path d="M3 4h5l2 3h11v13H3z" />
    <path d="M9 10v6" />
    <path d="M13 10v4" />
    <path d="M17 10v2" />
  </>
);

export const FileText = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </>
);

export const Bell = createIcon(
  <>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>
);

export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </>
);

export const Menu = createIcon(
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);

export const PanelRightOpen = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M15 3v18" />
  </>
);

export const Sun = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M18.36 5.34l-1.41 1.41" />
  </>
);

export const Moon = createIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79" />
);

export const User = createIcon(
  <>
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </>
);

export const X = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const ChevronLeft = createIcon(
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRight = createIcon(
  <polyline points="9 18 15 12 9 6" />
);
