/**
 * 获取数组中符合条件的元素的索引
 * @param arr 数组
 * @param fn 一个函数，如果函数返回true，则返回该项的下标，如果没有找到则返回-1
 */
export function getIndex(arr: any[], fn) {
  if (!arr || arr?.length == 0 || !fn || typeof fn != 'function') {
    return -1;
  }

  if (arr.findIndex) {
    return arr.findIndex(fn);
  }
  let len = arr?.length,
    i = 0,
    index = -1;
  for (; i < len; i++) {
    const item = arr[i];
    if (fn(item, index, arr) === true) {
      index = i;
      break;
    }
  }
  return index;
}

export function findCountryInfo(modelValue, type, iso2, countryList) {
  let value = modelValue;
  if ((value + '').length == 0) {
    return {};
  }
  const isPhone = type.toLowerCase() === 'phone';
  if ((value + '').charAt(0) === '+') {
    value = value.substr(1);
  }
  let item = countryList.filter((item) => {
    if (isPhone) {
      if (iso2) {
        // console.log('iso2', props.iso2, item.iso2);
        return item.iso2 == iso2;
      }
      // 一个国家只有一个手机区号的情况
      if (item.dialCode == value) {
        return true;
      }

      // 一个国家有多个手机区号的情况
      if (item.dialCode == 1 && item.areaCodes) {
        return item.areaCodes.some((areaCode) => areaCode == value);
      }
    } else {
      return item.iso2 == value;
    }
  });
  if (!item || item?.length === 0) {
    item = {};
  } else {
    item = item[0] || {};
  }
  return item;
}
