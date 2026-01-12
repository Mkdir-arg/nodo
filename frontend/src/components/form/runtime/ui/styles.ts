export const baseInputStyles = `
  w-full px-3 py-2 rounded-lg
  bg-white dark:bg-gray-900
  border border-gray-300 dark:border-gray-600
  transition-all duration-200
  text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900
  focus:border-blue-500
  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
  read-only:bg-gray-50 dark:read-only:bg-gray-800 read-only:cursor-default
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
  bg-[position:right_0.75rem_center]
  bg-no-repeat
  pr-10
`;
