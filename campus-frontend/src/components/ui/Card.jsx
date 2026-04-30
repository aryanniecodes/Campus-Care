import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = false, delay = 0, ...props }) => {
  const baseStyles = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300";
  const hoverStyles = hover ? "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
