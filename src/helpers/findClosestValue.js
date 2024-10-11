export const findClosestValue = (dataArray, target) => {
  let closest = null;
  let closestDiff = Infinity;

  for (let i = 0; i < dataArray.length; i += 2) {
    const time = dataArray[i];
    const count = dataArray[i + 1];

    //console.log(`Comparing KeepaTime: ${time} with target: ${target}`);

    const diff = Math.abs(time - target);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = [time, count];
    }
  }
  return closest;
};
