export const getLatestCount = (dataArray) => {
  if (dataArray.length === 0) return 0;
  return dataArray[dataArray.length - 1];
};
