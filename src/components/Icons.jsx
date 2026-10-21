const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ThumbUp = () => (
  <svg {...base}>
    <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" />
    <path d="M7 11l4-8c1.7 0 3 1.3 3 3v3h5.3a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 18.1 20H7" />
  </svg>
);
export const ThumbDown = () => (
  <svg {...base}>
    <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Z" />
    <path d="M17 13l-4 8c-1.7 0-3-1.3-3-3v-3H4.7a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 5.900 4H17" />
  </svg>
);
export const Bookmark = () => (
  <svg {...base}>
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  </svg>
);
export const Columns = () => (
  <svg {...base}>
    <rect x="3" y="4" width="7" height="16" rx="1" />
    <rect x="14" y="4" width="7" height="16" rx="1" />
  </svg>
);
export const Shuffle = () => (
  <svg {...base}>
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);
export const Search = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.500-3.500" />
  </svg>
);
export const Star = () => (
  <svg {...base} fill="currentColor" strokeWidth="1" width="13" height="13">
    <path d="m12 2.500 2.900 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8L12 2.500Z" />
  </svg>
);
export const Close = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
