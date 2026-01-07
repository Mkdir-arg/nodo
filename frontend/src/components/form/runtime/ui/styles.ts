export const baseInputStyles = `
  w-full px-4 py-3.5 rounded-2xl
  bg-white/90 dark:bg-slate-900/70
  backdrop-blur-xl
  border border-slate-200/60 dark:border-slate-700/60
  shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
  hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-800/50
  transition-all duration-300
  text-slate-900 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
  focus:border-blue-500/50 dark:focus:border-blue-400/50
  focus:shadow-2xl focus:shadow-blue-200/30 dark:focus:shadow-blue-900/30
  disabled:opacity-60 disabled:cursor-not-allowed
  read-only:bg-slate-100/80 dark:read-only:bg-slate-800/60 read-only:cursor-default
`;

export const baseTextareaStyles = `
  ${baseInputStyles}
  min-h-[120px] resize-y
`;

export const baseSelectStyles = `
  ${baseInputStyles}
  appearance-none
  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]
  bg-[length:12px_8px]
  bg-[position:right_1rem_center]
  bg-no-repeat
  pr-12
`;
