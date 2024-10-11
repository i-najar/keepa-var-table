export const getMonthAgoTimeStamp = () => {
  let d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0, 0);
  const timeStampMilliseconds = d.getTime();
  return timeStampMilliseconds;
};
