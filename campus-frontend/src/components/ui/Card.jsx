import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = false, delay = 0, ...props }) => {
  const baseStyles = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";
  const hoverStyles = hover ? "hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer" : "";

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
