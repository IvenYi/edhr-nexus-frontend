const axios = require('axios');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const EnvConfigJson = require('../../../helper/env.config.json');

let branch = '';

try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch (err) {
  console.error(`获取分支异常: ${err.message}`);
}

const envKey = Object.keys(EnvConfigJson).find((item) => branch.includes(item));

if (!envKey) {
  console.error('当前分支未配置环境，请联系管理员');
  return;
}

console.log(`当前分支: ${branch}`);
console.log(`当前分支对应环境: ${envKey}`);
console.log(`当前分支对应地址: ${EnvConfigJson[envKey]}`);

const API_DOCS_LIST = [
  {
    name: 'gct-platform',
    refer:
      EnvConfigJson[envKey] +
      '/gct-platform/v2/api-docs?group=%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0API',
  },
  {
    name: 'gct-apaas',
    refer: EnvConfigJson[envKey] + '/gct-apaas/v2/api-docs?group=apaas%E5%B9%B3%E5%8F%B0API',
  },
];

/**
 * 类型转换
 */
const getJsType2 = (prop) => {
  const { type, items } = prop;
  let jsType = type || 'any';
  if (type === 'integer') {
    jsType = 'number';
  } else if (type === 'array') {
    jsType = items.originalRef ? `Array<${items.originalRef}>` : 'any[]';
  } else if (prop.originalRef && prop.$ref) {
    jsType = prop.originalRef.replace(/[«,»]/g, '');
  }
  return jsType.replace(/[«,»]/g, '');
};

/**
 * 类型转换
 */
const getJsType = (type) => {
  let jsType = type || 'any';
  if (type === 'integer') {
    jsType = 'number';
  }
  return jsType;
};

(async function run() {
  for (let item of API_DOCS_LIST) {
    console.log(`Service ${item.name} start ...`);
    await generate(item);
  }
})();
// API_DOCS_LIST.forEach(async (p) => {

// });

/**
 * 生成指定项目的api
 * @param {*} project
 */
async function generate(project) {
  let { data } = await axios.get(project.refer);

  const allInterfaces = [];

  const interfaceStates = Object.keys(data.definitions)
    .map((definition) => {
      const interfaceName = definition.replace(/[«,»]/g, '');
      allInterfaces.push(interfaceName);
      const dto = data.definitions[definition];
      const interfaceState =
        `/**\n` +
        ` * title: ${dto.title}\n` +
        ` */\n` +
        `export interface ${interfaceName} {\n` +
        Object.keys(dto.properties || {})
          .map((property) => {
            // console.log(key);
            const required = dto.required?.includes(property);
            let line = `  ${property}${required ? '' : '?'}: ${getJsType2(
              dto.properties[property],
            )};`;
            if (dto.properties[property].description) {
              line += ` // ${dto.properties[property].description}`;
            }
            return line;
          })
          .join('\n') +
        '\n}\n';
      return interfaceState;
    })
    .join('\n');

  console.log('1.Model ...');
  const interfaceFile = `src/apis/${project.name}/model/index.ts`;
  fs.ensureFileSync(interfaceFile);
  fs.writeFileSync(interfaceFile, interfaceStates);
  console.log(`${interfaceFile.padEnd(80, '_')}ok`);

  const apis = [];
  Object.keys(data.paths).forEach((path) => {
    Object.keys(data.paths[path]).forEach((method) => {
      // 当前api需要导入的数据类型
      const importTypes = [];

      const detail = data.paths[path][method];

      // let url = '/' + path.split('/api/')[1];
      let url = path;

      if (!path.includes('/api/')) return;

      const name =
        method +
        path
          .split('/api/')[1]
          .split('/')
          .map((word) =>
            word
              .replace(/([a-z])/, (match, p1) => p1.toUpperCase())
              .replace('{', 'By')
              .replace('}', ''),
          )
          .join('')
          .replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());

      let arguements = [];

      // path参数
      const pathParams = detail.parameters.filter((item) => item.in === 'path');
      let pathInterfaceState = '';
      if (pathParams.length > 0) {
        pathInterfaceState = `export interface ${name}PathInterface {\n`;
        pathParams.forEach((item) => {
          url = url.replace('{' + item.name + '}', '${path?.' + item.name + '}');
          pathInterfaceState += `  ${item.name}${item.required ? '' : '?'}: ${getJsType(
            item.type,
          )}; // ${item.description || '...'}\n`;
        });
        pathInterfaceState += '}\n';
        arguements.push(`path: ${name}PathInterface`);
      }

      // body参数
      const bodyParams = detail.parameters.filter((item) => {
        const inBody = item.in === 'body';
        if (inBody) {
          const {
            schema: { originalRef, type, items },
          } = item;
          if (type === 'array') {
            importTypes.push(items.originalRef);
          } else {
            importTypes.push(originalRef);
          }
          arguements.push(`data: ${type === 'array' ? items.originalRef + '[]' : originalRef}`);
        }
        return inBody;
      });
      // query参数
      const queryParams = detail.parameters.filter((item) => item.in === 'query');
      let queryInterfaceState = '';
      if (queryParams.length > 0) {
        queryInterfaceState = `export interface ${name}QueryInterface {\n`;
        queryParams.forEach((item) => {
          queryInterfaceState += `  ${item.name}${item.required ? '' : '?'}: ${getJsType(
            item.type,
          )}; // ${item.description || '...'}\n`;
        });
        queryInterfaceState += '}\n';
        arguements.push(`params: ${name}QueryInterface = {}`);
      }
      arguements.push('config:AxiosRequestConfig = {}');
      // arguements = arguements.map((item) => `${item} = {}`).join(', ');
      arguements = arguements.map((item) => `${item}`).join(', ');

      // response类型
      const resType = detail.responses['200'].schema?.originalRef?.replace(/[«,»]/g, '');
      // .replace('ResponseEntity', '');
      resType && importTypes.push(resType);

      const description = [`/**\n` + ` * ${detail.summary}\n`, ` */\n`];

      // 处理删除接口的参数位置问题
      const configArgv =
        method === 'delete' ? `joinParamsToUrl: true,\n ...config,\n` : `      ...config,\n`;

      const functionState =
        `export async function ${name}(${arguements}): Promise${
          resType ? '<' + resType + "['data']>" : '<any>'
        } {\n` +
        `  return request(\n` +
        `    {\n` +
        `      url: \`${url}\`,\n` +
        `      method: '${method}',\n` +
        (queryParams.length > 0 ? `      params,\n` : '') +
        (bodyParams.length > 0 ? `      data,\n` : '') +
        configArgv +
        `    },\n` +
        `  );\n` +
        `}`;

      apis.push({
        name,
        url,
        method,
        arguements,
        description,
        pathInterfaceState,
        queryInterfaceState,
        functionState,
        tag: detail.tags[0],
        importTypes,
      });
    });
  });

  const tags = data.tags.map((item) => {
    // console.log(item.description);
    item.fileName = item.description.replace(/\s/g, '') + '.ts';
    item.apis = apis.filter((api) => api.tag === item.name);
    return item;
  });

  console.log('2.Controller ...');
  tags.forEach((tag) => {
    const file = `src/apis/${project.name}/${tag.fileName}`;

    let content = [
      "import request from '@mobile/utils/request';",
      "import type { AxiosRequestConfig } from 'axios';",
    ];

    const importTypes = new Set();
    content.push(
      tag.apis
        .map((api) => {
          api.importTypes.forEach((item) => {
            importTypes.add(item);
          });

          const importState = `import { ${api.name} } from "/@/apis/${
            project.name
          }/${tag.fileName.replace('.ts', '')}"`;
          const desc = ` * ${importState}\n`;
          return (
            api.description[0] +
            desc +
            api.description[1] +
            api.pathInterfaceState +
            api.queryInterfaceState +
            api.functionState
          );
        })
        .join('\n\n'),
    );

    if (importTypes.size > 0) {
      content[0] += `\nimport type { ${[...importTypes]
        .filter((item) => allInterfaces.includes(item))
        .join(', ')} } from './model/index';`;
    }

    fs.ensureFileSync(file);
    fs.writeFileSync(file, content.join('\n\n'));
    console.log(`${file.padEnd(80, '_')}ok`);
  });
}
