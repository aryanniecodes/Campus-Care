export const Input = ({ label, id, error, className = "", ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3.5 bg-white border rounded-xl outline-none transition-all shadow-sm placeholder-gray-400 text-gray-800 ${
          error 
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
            : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
