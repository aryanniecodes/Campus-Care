import React, { useState, useEffect } from 'react';

const SLATimer = ({ createdAt, status }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timerClass, setTimerClass] = useState("");

  const calculateSLA = () => {
    if (!createdAt) return;

    if (status === "completed") {
      setTimeLeft("Completed");
      setTimerClass("bg-green-100 text-green-700");
      return;
    }

    const created = new Date(createdAt);
    const elapsedHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    const SLA_LIMIT = 24;

    if (elapsedHours >= SLA_LIMIT) {
      const overdueHours = Math.floor(elapsedHours - SLA_LIMIT);
      setTimeLeft(`Overdue by ${overdueHours}h`);
      setTimerClass("bg-red-100 text-red-700 border border-red-200");
    } else {
      const hoursRemaining = Math.floor(SLA_LIMIT - elapsedHours);
      setTimeLeft(`${hoursRemaining}h left`);
      
      if (hoursRemaining < 4) {
        setTimerClass("bg-yellow-100 text-yellow-700 border border-yellow-200");
      } else {
        setTimerClass("bg-green-100 text-green-700 border border-green-200");
      }
    }
  };

  useEffect(() => {
    calculateSLA();
    const interval = setInterval(calculateSLA, 60000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (!createdAt) return null;

  if (status === "completed") {
    return null;
  }

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${timerClass}`}>
      {timeLeft}
    </span>
  );
};

export default SLATimer;
