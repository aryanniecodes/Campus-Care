export const Input = ({ label, id, error, className = "", ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3.5 bg-white dark:bg-gray-800 border rounded-xl outline-none transition-all shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 ${
          error 
            ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20" 
            : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};
