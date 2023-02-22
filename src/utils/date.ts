import dayjs from "dayjs";

export const getTimeOfDay = () => {
  const hour = dayjs().hour();
  if (hour < 12) {
    return "Morning";
  } else if (hour < 18) {
    return "Afternoon";
  } else {
    return "Evening";
  }
};
