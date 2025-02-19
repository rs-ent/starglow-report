export function safeLangValue(val, locale = 'ko') {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val[locale] || '';
    return '';
}
  
  export function updateLangField(oldVal, lang, newVal) {
    let result =
      typeof oldVal === 'object' && oldVal !== null
        ? { ...oldVal }
        : { ko: '', en: '' };
    result[lang] = newVal;
    return result;
}

export function convertKor(val) {
    if (!val) return { ko: '', en: ''};
    if (typeof val === 'object') return val;
    return { ko: val, en: ''};
}

export function safeLangMapper(val, locale = 'ko') {
  if (Array.isArray(val)) {
    return val;
  }
  
  if (typeof val === 'object') {
    if (Object.prototype.hasOwnProperty.call(val, locale) && Array.isArray(val[locale])) {
      return val[locale];
    }
  }

  return [];
}