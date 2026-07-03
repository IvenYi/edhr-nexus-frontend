/**
 * 路径分割
 * @param {*} key
 * @returns
 */
function keyPathSplit(key) {
  const result = [];
  const keyChars = key.split('');
  let itemKey = '';

  while (keyChars.length > 0) {
    const firstChar = keyChars.shift();
    if (firstChar === '[') {
      itemKey && result.push(itemKey);
      itemKey = firstChar;
    } else if (firstChar === ']') {
      itemKey += firstChar;
      itemKey && result.push(itemKey);
      itemKey = '';
    } else if (firstChar === '.') {
      itemKey && result.push(itemKey);
      itemKey = '';
    } else {
      itemKey += firstChar;
    }
  }

  itemKey && result.push(itemKey);
  return result;
}

/**
 * jsonpath转换工具
 * 用于ipaas中jsonpath与树结构定义相互转换
 */
export default class JsonPathUtil {
  static toTree(data, options = {}) {
    const result = [];

    data.forEach((originItem) => {
      const keyList = keyPathSplit(originItem.key);
      const keyTypeList = keyList.map((_, index) => {
        if (index === keyList.length - 1) {
          return undefined;
        } else if (keyList[index + 1].startsWith('[')) {
          return 'Array';
        }
        return 'Object';
      });

      let parentChildren = result;
      keyList.forEach((item, index) => {
        const key = item.replace(/[\[\]]/g, '');
        const keyData = parentChildren.find((item) => item.key === key);
        if (!keyData) {
          const newKeyData =
            index === keyList.length - 1
              ? {
                  ...originItem,
                  key: key,
                }
              : {
                  key: key,
                  keyType: keyTypeList[index],
                  valueType: 'INPUT',
                  children: [],
                };
          parentChildren.push(newKeyData);
          parentChildren = newKeyData.children;
        } else {
          parentChildren = keyData.children;
        }
      });
    });

    if (options.root) {
      return [
        {
          ...options.root,
          keyType: data[0]?.key.startsWith('[') ? 'Array' : 'Object',
          valueType: 'INPUT',
          children: result,
        },
      ];
    }

    return result;
  }

  static toList(data, pPath = '', inArray = false, list = []) {
    if (
      (data.keyType === 'Object' || data.keyType === 'Array') &&
      data.valueType !== 'EXPRESSION'
    ) {
      data.children?.forEach((item) => {
        JsonPathUtil.toList(
          item,
          inArray ? `${pPath}[${data.key}]` : (pPath ? pPath + '.' : '') + data.key,
          data.keyType === 'Array',
          list,
        );
      });
    } else {
      list.push({
        ...data,
        key: inArray ? `${pPath}[${data.key}]` : (pPath ? pPath + '.' : '') + data.key,
        keyType: data.keyType,
        value: data.keyType === 'Number' && data.value ? String(data.value) : data.value,
      });
    }
    return list;
  }

  static toRfcList(data, pPath = '', inArray = false, list = []) {
    if (
      (data.keyType === 'STRUCTURES' || data.keyType === 'TABLES') &&
      data.valueType !== 'EXPRESSION'
    ) {
      data.children?.forEach((item) => {
        JsonPathUtil.toRfcList(
          item,
          inArray ? `${pPath}[${data.key}]` : (pPath ? pPath + '.' : '') + data.key,
          data.keyType === 'TABLES',
          list,
        );
      });
    } else {
      list.push({
        ...data,
        key: inArray ? `${pPath}[${data.key}]` : (pPath ? pPath + '.' : '') + data.key,
        keyType: data.keyType,
        value: data.value,
      });
    }
    return list;
  }
}
