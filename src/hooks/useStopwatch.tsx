import { useState, useEffect } from "react";

export const useStopwatch = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setTime(0);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval as unknown as NodeJS.Timeout);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isActive, time]);

  return { time, isActive, toggle, reset };
};
