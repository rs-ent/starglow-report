export const formatNumber = (number, suffix = '', fixedValue = 2, locale = 'en') => {
  if (typeof number !== 'number') return number;

  if (locale === 'en') {
    if (number >= 1e12) {
      const formatted = (number / 1e12).toFixed(fixedValue);
      return `${formatted}T${suffix}`;
    } else if (number >= 1e9) {
      const formatted = (number / 1e9).toFixed(fixedValue);
      return `${formatted}B${suffix}`;
    } else if (number >= 1e6) {
      const formatted = (number / 1e6).toFixed(fixedValue);
      return `${formatted}M${suffix}`;
    } else if (number >= 1e3) {
      const formatted = (number / 1e3).toFixed(fixedValue);
      return `${formatted}K${suffix}`;
    } else {
      const formatted = number.toFixed(fixedValue);
      return `${formatted}${suffix}`;
    }
  } else if (locale === 'ko') {
    if (number >= 1e16) {
      const formatted = (number / 1e16).toFixed(fixedValue);
      return `${formatted}경${suffix}`;
    } else if (number >= 1e15) {
      const formatted = (number / 1e15).toFixed(fixedValue);
      return `${formatted}천조${suffix}`;
    } else if (number >= 1e14) {
      const formatted = (number / 1e14).toFixed(fixedValue);
      return `${formatted}백조${suffix}`;
    } else if (number >= 1e13) {
      const formatted = (number / 1e13).toFixed(fixedValue);
      return `${formatted}십조${suffix}`;
    } else if (number >= 1e12) {
      const formatted = (number / 1e12).toFixed(fixedValue);
      return `${formatted}조${suffix}`;
    } else if (number >= 1e11) {
      const formatted = (number / 1e11).toFixed(fixedValue);
      return `${formatted}천억${suffix}`;
    } else if (number >= 1e10) {
      const formatted = (number / 1e10).toFixed(fixedValue);
      return `${formatted}백억${suffix}`;
    } else if (number >= 1e9) {
      const formatted = (number / 1e9).toFixed(fixedValue);
      return `${formatted}십억${suffix}`;
    } else if (number >= 1e8) {
      const formatted = (number / 1e8).toFixed(fixedValue);
      return `${formatted}억${suffix}`;
    } else if (number >= 1e7) {
      const formatted = (number / 1e7).toFixed(fixedValue);
      return `${formatted}천만${suffix}`;
    } else if (number >= 1e6) {
      const formatted = (number / 1e6).toFixed(fixedValue);
      return `${formatted}백만${suffix}`;
    } else if (number >= 1e5) {
      const formatted = (number / 1e5).toFixed(fixedValue);
      return `${formatted}십만${suffix}`;
    } else if (number >= 1e4) {
      const formatted = (number / 1e4).toFixed(fixedValue);
      return `${formatted}만${suffix}`;
    } else {
      const formatted = number.toFixed(fixedValue);
      return `${formatted}${suffix}`;
    }
  }
};