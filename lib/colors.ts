export const availableColors = [
  "slate", "gray", "red", "orange", "amber", "green", "emerald", 
  "teal", "cyan", "blue", "indigo", "violet", "purple", "pink", "rose"
] as const;

export type ColorOption = typeof availableColors[number];

export const colorClassMap: Record<string, string> = {
  slate: "bg-slate-500 hover:bg-slate-600 text-white",
  gray: "bg-gray-500 hover:bg-gray-600 text-white",
  red: "bg-red-500 hover:bg-red-600 text-white",
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  amber: "bg-amber-500 hover:bg-amber-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  emerald: "bg-emerald-500 hover:bg-emerald-600 text-white",
  teal: "bg-teal-500 hover:bg-teal-600 text-white",
  cyan: "bg-cyan-500 hover:bg-cyan-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  indigo: "bg-indigo-500 hover:bg-indigo-600 text-white",
  violet: "bg-violet-500 hover:bg-violet-600 text-white",
  purple: "bg-purple-500 hover:bg-purple-600 text-white",
  pink: "bg-pink-500 hover:bg-pink-600 text-white",
  rose: "bg-rose-500 hover:bg-rose-600 text-white",
};

export const badgeColorClassMap: Record<string, string> = {
  slate: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-300 dark:border-red-700",
  orange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-800 dark:text-orange-300 dark:border-orange-700",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800 dark:text-amber-300 dark:border-amber-700",
  green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-300 dark:border-green-700",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-800 dark:text-emerald-300 dark:border-emerald-700",
  teal: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-800 dark:text-teal-300 dark:border-teal-700",
  cyan: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-800 dark:text-cyan-300 dark:border-cyan-700",
  blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-300 dark:border-blue-700",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-800 dark:text-indigo-300 dark:border-indigo-700",
  violet: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-800 dark:text-violet-300 dark:border-violet-700",
  purple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-800 dark:text-purple-300 dark:border-purple-700",
  pink: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-800 dark:text-pink-300 dark:border-pink-700",
  rose: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-800 dark:text-rose-300 dark:border-rose-700",
};

export const solidColorClassMap: Record<string, string> = {
  slate: "bg-slate-500",
  gray: "bg-gray-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
};
