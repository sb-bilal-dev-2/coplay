
export const secondsToDisplayTime = (seconds = 0) => {
  const d = Number(seconds);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor(d % 60);
  let displayItem = "";
  if (h) {
    displayItem += h + ":";
  }
  if (m < 10 && displayItem.length) {
    displayItem += 0;
  }
  displayItem += m + ":";
  if (s < 10) {
    displayItem += 0;
  }
  displayItem += s;
  return displayItem;
};
