const axios = require('axios');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const EnvConfigJson = require('./env.config.json');

let branch = '';
const platform = process.argv[2] || 'all';

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
    platform: 'apaas',
  },
  {
    name: 'gct-ipaas',
    refer: 'helper/ipaas.swagger.json',
    platform: 'ipaas',
  },
  {
    name: 'gct-ipaas2',
    refer: EnvConfigJson[envKey] + '/gct-ipaas/v2/api-docs?group=ipaas%E5%B9%B3%E5%8F%B0API',
    platform: 'ipaas',
  },
  {
    name: 'gct-apaas',
    refer: EnvConfigJson[envKey] + '/gct-apaas/v2/api-docs?group=apaas%E5%B9%B3%E5%8F%B0API',
    platform: 'apaas',
  },
];

const getOriginRef = (data) => {
  const { $ref, originalRef, type } = data;
  if (type) return type;
  if (originalRef) return originalRef;
  if ($ref) {
    const _refs_ = $ref.split('/');
    return _refs_[_refs_.length - 1];
  }
  return 'any';
};

/**
 * 类型转换
 */
const getJsType2 = (prop) => {
  const rootRef = getOriginRef(prop);
  const { type, items } = prop;
  let jsType = type || 'any';
  if (type === 'integer') {
    jsType = 'number';
  } else if (type === 'array') {
    const itemRef = getOriginRef(items);
    jsType = itemRef ? `Array<${itemRef}>` : 'any[]';
  } else if (rootRef) {
    jsType = rootRef.replace(/[«,»]/g, '');
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
  const docs =
    platform === 'all' ? API_DOCS_LIST : API_DOCS_LIST.filter((item) => item.platform === platform);
  for (let item of docs) {
    console.log(`Service ${item.name} start ...`);
    await generate(item);
  }
})();

/**
 * 生成指定项目的api
 * @param {*} project
 */
async function generate(project) {
  let data = null;
  if (project.refer.startsWith('http')) {
    // 根据接口生成
    const res = await axios.get(project.refer);
    data = res.data;
  } else {
    // 根据本地文件生成
    const content = fs.readFileSync(project.refer).toString();
    data = JSON.parse(content);
  }
  if (data === null) return;

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
            // console.log(dto.properties[property]);

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
  Object.keys(data.paths)
    // .filter((path) => {
    //   // 过滤 external开头，但是/external/api/tenant/info/byPortOrDomain需要保留
    //   return !/\/external\/api\/(?!tenant\/info\/byPortOrDomain).+/.test(path);
    // })
    .forEach((path) => {
      Object.keys(data.paths[path]).forEach((method) => {
        // 当前api需要导入的数据类型
        const importTypes = [];

        const detail = data.paths[path][method];

        // let url = '/' + path.split('/api/')[1];
        let url = path;

        if (!path.split('/api/')[1]) {
          return;
        }

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
            .replace(/-([a-z])/g, (match, p1) => p1.toUpperCase()) +
          (path.includes('/external/api/') ? 'External' : '');

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
        const bodyParams = detail.parameters.filter(
          (item) => item.in === 'body' || item.in === 'formData',
        );
        if (bodyParams.length > 0) {
          const { schema: { $ref, originalRef, type, items } = { originalRef: 'any' } } =
            bodyParams[0];
          if (type === 'array') {
            importTypes.push(getOriginRef(items));
          } else {
            importTypes.push(getOriginRef({ $ref, originalRef }));
          }
          arguements.push(
            `data: ${
              type === 'array'
                ? getOriginRef(items) + '[]'
                : getOriginRef({ $ref, originalRef }) || 'any'
            }`,
          );
        }
        // body参数
        // const bodyParams = detail.parameters.filter((item) => {
        //   const inBody = item.in === 'body' || item.in === 'formData';
        //   if (inBody) {
        //     const { schema: { $ref, originalRef, type, items } = { originalRef: 'any' } } = item;
        //     if (type === 'array') {
        //       importTypes.push(getOriginRef(items));
        //     } else {
        //       importTypes.push(getOriginRef({ $ref, originalRef }));
        //     }
        //     arguements.push(
        //       `data: ${
        //         type === 'array'
        //           ? getOriginRef(items) + '[]'
        //           : getOriginRef({ $ref, originalRef }) || 'any'
        //       }`,
        //     );
        //   }
        //   return inBody;
        // });
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
        arguements.push('config = {}');
        // arguements = arguements.map((item) => `${item} = {}`).join(', ');
        arguements = arguements.map((item) => `${item}`).join(', ');

        // response类型
        const resType = getOriginRef(detail.responses['200'].schema ?? []).replace(/[«,»]/g, '');
        // .replace('ResponseEntity', '');
        resType && importTypes.push(resType);

        const description = [`/**\n` + ` * ${detail.summary}\n`, ` */\n`];

        // 请求头增加tenant
        const joinTenantIdToHeader = detail.parameters.some(
          (item) => item.name === 'Tenant-Id' && item.in === 'header',
        );
        // 处理删除接口的参数位置问题
        const joinParamsToUrl = method === 'delete';
        // ipaas 添加额外请求头信息
        const joinUserToHeader = project.platform === 'ipaas';

        let configArgv = ['    {'];
        joinTenantIdToHeader && configArgv.push('      joinTenantIdToHeader: true,');
        joinUserToHeader && configArgv.push('      joinUserToHeader: true,');
        joinParamsToUrl && configArgv.push('      joinParamsToUrl: true,');
        configArgv.push(...['      ...config,', '    },\n']);
        configArgv = configArgv.join('\n');

        const functionState =
          `export async function ${name}(${arguements}): Promise${
            !['any', 'number', 'string', 'null', 'boolean'].includes(resType)
              ? '<' + resType + "['data']>"
              : `<${resType}>`
          } {\n` +
          `  return defHttp.${method}(\n` +
          `    {\n` +
          `      url: \`${url}\`,\n` +
          // `    method: '${method}',\n` +
          (queryParams.length > 0 ? `      params,\n` : '') +
          (bodyParams.length > 0 ? `      data,\n` : '') +
          `    },\n` +
          configArgv +
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

    let content = ["import { defHttp } from '@/utils/http/axios';"];

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
      content[0] += `\nimport { ${[...importTypes]
        .filter((item) => allInterfaces.includes(item))
        .join(', ')} } from './model/index';`;
    }

    fs.ensureFileSync(file);
    fs.writeFileSync(file, content.join('\n\n'));
    console.log(`${file.padEnd(80, '_')}ok`);
  });
}
