const fs = require('fs-extra');

const SYS = 'src/locales/lang/zh-CN/sys.ts';
const MODULES = 'src/locales/lang/zh-CN/sys';
const KIT_MODULES = 'src/locales/lang/zh-CN/_kit';

const result = {};

run(SYS);
run(MODULES, 'sys');
run(KIT_MODULES, '_kit');

/**
 * 属性递归
 * @param {*} namespace
 * @param {*} data
 */
async function innerRun(namespace = '', data = {}) {
  Object.keys(data).forEach((key) => {
    if (Object.prototype.toString.call(data[key]) === '[object Object]') {
      innerRun(`${namespace}.${key}`, data[key]);
    } else if (Object.prototype.toString.call(data[key]) === '[object String]') {
      result[`${namespace}.${key}`] = data[key];
    }
  });
}

/**
 * 文件递归
 * @param {*} path
 * @param {*} namespace
 */
async function run(path = '', namespace = '') {
  if (path.endsWith('.ts')) {
    const content = fs.readFileSync(path).toString();
    let obj = {};
    eval(content.replace('export default', 'obj='));
    innerRun(`${namespace}${namespace ? '.' : ''}${path.split('/').pop().split('.')[0]}`, obj);
  } else {
    const names = fs.readdirSync(path);
    names.forEach((name) => {
      run(`${path}/${name}`, namespace);
    });
  }
}

const file = 'helper/_i18n_.json';
fs.ensureFileSync(file);
fs.writeFileSync(file, JSON.stringify(result, null, 2));
console.log(`${file.padEnd(80, '_')}ok`);
