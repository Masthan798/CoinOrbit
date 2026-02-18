export const checkRange = (value, range) => {
  if (range === 'All') return true;
  if (!value) return false;

  if (range.startsWith('>')) {
    const threshold = parseFloat(range.replace(/[^\d.]/g, ''));
    const multiplier = range.includes('B') ? 1000000000 : (range.includes('K') ? 1000 : 1);
    return value > threshold * multiplier;
  }
  if (range.startsWith('<')) {
    const threshold = parseFloat(range.replace(/[^\d.]/g, ''));
    return value < threshold;
  }
  if (range.includes('to')) {
    let [min, max] = range.split(' to ');
    const getVal = (str) => {
      const num = parseFloat(str.replace(/[^\d.]/g, ''));
      const mult = str.includes('B') ? 1000000000 : (str.includes('M') ? 1000000 : (str.includes('K') ? 1000 : 1));
      return num * mult;
    };
    return value >= getVal(min) && value <= getVal(max);
  }
  return true;
};

export const checkChangeRange = (value, range) => {
  if (range === 'All') return true;
  if (value === null || value === undefined) return false;

  if (range === '> +50%') return value > 50;
  if (range === '+10% to +50%') return value >= 10 && value <= 50;
  if (range === '0% to +10%') return value >= 0 && value < 10;
  if (range === '-10% to 0%') return value >= -10 && value < 0;
  if (range === '-50% to -10%') return value >= -50 && value < -10;
  if (range === '< -50%') return value < -50;
  return true;
};
