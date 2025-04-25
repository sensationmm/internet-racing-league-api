type IConversions  ={
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export const dateDifference = (date1: Date, date2: Date, unit: keyof IConversions = 'days') => {
  const timeDifferenceMs = date2.getTime() - date1.getTime();

  const conversions: IConversions = {
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000,
  };

  if (!conversions[unit]) {
    throw new Error("Invalid unit provided. Use 'days', 'hours', 'minutes', or 'seconds'.");
  }

  return Math.floor(timeDifferenceMs / conversions[unit]);
}