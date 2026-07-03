/* eslint-disable guard-for-in */
function type(obj: any) {
  return Object.prototype.toString.call(obj);
}

function addSpace(depth: number) {
  return '  '.repeat(depth);
}

function handleAttributes(obj: any): any {
  if (type(obj) === '[object Object]') {
    return Object.keys(obj).reduce((tmp: any, key: string) => {
      let tmpKey = key;
      if (key.charAt(0) === '-') {
        tmpKey = key.substring(1);
      }
      tmp[tmpKey] = handleAttributes(obj[key]);
      return tmp;
    }, {});
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => handleAttributes(item));
  }
  return obj;
}

function getAttributes(obj: any) {
  let tmp = obj;
  try {
    if (typeof tmp !== 'string') {
      tmp = JSON.parse(obj);
    }
  } catch (error) {
    tmp = JSON.stringify(handleAttributes(obj)).replace(/"/g, "'");
  }
  return tmp;
}

const tn = '\t\n';

// @see issue https://github.com/didi/LogicFlow/issues/718, refactoring of function toXml
function toXml(obj: any, name: string, depth: number) {
  // debugger;
  // console.log(obj);
  const frontSpace = addSpace(depth);
  let str = '';
  const prefix = tn + frontSpace;
  if (name === '-json') return '';
  if (name === '-f_json') return '';
  if (name === '#text') {
    return prefix + obj;
  }
  if (name === '#cdata-section') {
    return `${prefix}<![CDATA[${obj}]]>`;
  }
  if (name === '#comment') {
    return `${prefix}<!--${obj}-->`;
  }
  if (`${name}`.charAt(0) === '-') {
    return ` ${name.substring(1)}="${getAttributes(obj)}"`;
  }
  if (Array.isArray(obj)) {
    str += obj.map((item) => toXml(item, name, depth + 1)).join('');
  } else if (type(obj) === '[object Object]') {
    const keys = Object.keys(obj);
    let attributes = '';
    let children = obj['-json'] ? tn + addSpace(depth + 1) + obj['-json'] : '';
    const f_children = obj['-f_json'] ? tn + addSpace(depth + 1) + obj['-f_json'] : '';

    str += `${depth === 0 ? '' : prefix}<${name}`;

    // debugger;

    // 修改属性节点渲染顺序 by wangcheng
    // const hasIn = keys.includes('bpmn:incoming');
    // const hasOut = keys.includes('bpmn:outgoing');
    // keys = keys.filter((item) => !['bpmn:incoming', 'bpmn:outgoing'].includes(item));
    // hasOut && keys.unshift('bpmn:outgoing');
    // hasIn && keys.unshift('bpmn:incoming');

    // console.log('keys', keys);
    const inOutKey = ['bpmn:incoming', 'bpmn:outgoing'];

    const inOutXml =
      (obj['bpmn:incoming'] ? toXml(obj['bpmn:incoming'], 'bpmn:incoming', depth + 1) : '') +
      (obj['bpmn:outgoing'] ? toXml(obj['bpmn:outgoing'], 'bpmn:outgoing', depth + 1) : '');
    keys.forEach((k) => {
      if (inOutKey.includes(k)) return;
      k.charAt(0) === '-'
        ? (attributes += toXml(obj[k], k, depth + 1))
        : (children += toXml(obj[k], k, depth + 1));
    });

    str +=
      attributes +
      (f_children + inOutXml + children !== ''
        ? `>${f_children}${inOutXml}${children}${prefix}</${name}>`
        : ' />');
  } else {
    str += `${prefix}<${name}>${obj.toString()}</${name}>`;
  }

  return str;
}

function lfJson2Xml(obj: any) {
  console.log('obj seq', obj);
  let xmlStr = '';
  for (const key in obj) {
    xmlStr += toXml(obj[key], key, 0);
  }
  return xmlStr;
}

export { lfJson2Xml, handleAttributes };
