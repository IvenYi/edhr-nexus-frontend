const fs = require('fs-extra');
const path = require('path');

const outputDir = path.resolve(__dirname, '../src/perms');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sourceIds = `
udEprGw17s0qZMwU
Sfz4PnFf3sawFGg6
7HT6hGUbeb89RUld
0PWIvaFSoR0nuVWr
6M5PWfEraA5WVT7s
75aRvZfIDmTauopG
TW4S7Rcksu11L5p5
GeORhJfWJ6VNb2aS
MKeeo0bECAAfWA5y
80FU1GYLNbOLCnVq
FoBK5qc5zUwy5rP6
12tEdpw075F0EezA
ipiWPMPsonFwT1g6
jmjmoinestgyx5v2
MATmfZ5rEKEmK5w5
tfYhgmtuEhilDrfq
yqhLmkkrP6KHaFju
ZTKX9yhB196lO8R4
WreYXtplvFVWugqh
J0qWKcuiYHUhnPD9
7Dut0RmyB2MKKwCX
Wwaoub8P0qlQc4Zx
7BVosXf8n6rUe4NC
1XdBYCKYeWPSmbMn
uliNFbkRn3Sm74oV
FXo9ZTuZEQyQ0CJa
Yb0p6Lhs8y8ryTyN
1pc8W36ExbxiSOqo
Pqay0N6pqpvfU3LY
yQdehdtJfFe12eK7
ZtDBbr2eFwQi78eH
v5f0D3U6hNTpy5rE
Faz26S4SuNAgWMku
DYZDh4Ywz05WbJtS
HRqm2w3XBl4440Qq
VPeM6KBa72dMvYnW
p4bnRHf25TsND3DB
0bsddkFeajmM5xGZ
Hu0lZpKGqYQn67eT
KfI0mTmBVCDdG5dh
Ot7OMXHSKjgsQ9x1
Sf3gwqrIEKpqnl6a
Z8wr3ofEihsUyXaV
ZeGhfcSsbeX6WtEd
eOyP9pJ8VAmju914
NgZW0CvPKRrxdHqn
uF6Uk7QrYMXyAwvt
xVxcoYhTQbxdjBOj
mNHgNaahM9UYQoYo
J11vA9eKvC8TT8WB
KdJ42pOHFa0s0ZoA
eJEHmTJ1zICBvFqE
E9FYnd5xTMFOtBo9
fVK2NFKdsPCh8TOV
vvzaKinYHA52oTnx
ktHNRWmT81U1fXlN
9G7FM3ywxzE93pKD
vMipwIigkofZWXaZ
lTAEKgli7Khg7PZj
qZv3VXin9kSJK45k
5sva1nARxWtqh9P2
piWmnqHuoGz0lPbT
TqSbonk5uKPHUj1B
Cuka2WxkIfvQ0bp9
7b6FJJlKZ052JTf3
3pibNla2ZERlPCiL
E3Mmeg9JiuXToFdV
gVIW738ZSGt6AjAH
yBXfe23FaYFMYJEm
RjKzo6EdSnHNlmKP
CifUtc2KN8DkYOCD
dpfy5mU4FdW7VgvJ
x0qBMLkqfEnrQIKn
alZhuQdZvgCmnArr
xpVGiCNDY7nudBCB
tyoHQd8csqyYtWSC
g6pNduR3j4U213mK
ojHkCwoTOEGKzBCg
enroF2eYbLD0XuGR
7Lef9g45pXLWsV0l
yTVsIu4JZyb3TLWf
fors3CkYIAQoTvuH
NitUWKMOARRlus5h
XYgMlKq3jm14mvYE
JUqUfHvzSj60N9QM
AbZnlPDotXILEdzI
4DaC2b9M2igqYlNv
eMWKgpAPIGcJrTmf
q0BmlYXcpMnGQNhq
dBnvRDz3endkRUSz
BZ3jCs4QqXVtOM2o
4gQoOVmfg8EnVFqC
JVJFWQgWPsHTcQh1
SQM8BCiLRqYi4K7Q
bffzSCvic7zCOEld
zQhfQVoa1vzoiCWK
HR7XAQkSnA81CQcb
qknjArscswWn1K1V
VN7AVJ6qbewLOlja
kFlDImzABzxg6ci6
231SJJeDGINwfHku
3297izmWDKWOq7cy
uJhQ35MiTLrhS952
jbTLS1ooYqt6hipB
InREvCbJ14LIOaBJ
jZxRAWFPjtXlKSWa
K9J63I8KsLFqBTVF
4bhsUDyCNPUTGjMI
39ZRZfpUwePpLNGH
qfN3sBTgEHfUIY1C
ICADjsLsa7bqi0y8
aXp7fP80unCnaXnD
7qZbB7vBEoc7JAsY
9xZJSEtfecKBE6fY
wYkZ8ZMtQnPOYLH1
uaGa8Vqg0evDE525
lXL13eKQdaXk2jhy
myQ6srCtaiZ7OVFo
i9x8TzooubDZv3aR
asr0jLIVCk0lwjIT
9dr99JOdPxkd6VZR
h7OKaQOUEs3tBwGD
pK0S0DIUBNaHmHUJ
NO12v9ofIhCHwHoo
dIljTw6hPRD8Y5BT
dznILrd4Pe4stV9V
67o3Ly1iuhHI2CZn
EOULfy0NbhYChOeg
ydVidFF0s1Oei61S
QJ2xENCJtFR329Ku
xYfRRZabVtKXKCKU
I3yBLCA6EllzUbIj
8hmmtGybVrRKbJ7q
9VIG9q4D56FaoJtU
GMdCg1AycuJ7yONG
gavszDHla9dQQ2Ju
oNvXBRgNuAQvqywF
x5gUANHjtdPJHH8K
pkeeqv6x5FvlDB1A
vhzhTFh1Prj9OICi
oBWopYve9uQllf0q
rFQG6NK2GYNeSUtB
xQUbG43iideTqKaa
rLaps504on0UZ6JB
BtH7PTvrcjnnRCas
Rz6YbDikDmBT30Oh
lsbCPKbBscnG6KaD
clPiZ4BAEIXP4Nh6
Miyp6puNooPuKvnD
z5nGOTyBR2Y5yimG
rG3IMAmymiVzJBM1
8UKYm6HC1e5lMGSA
UnQURcQC25iG2rJi
b4ZJu25GMhRTotkS
X4G3khkjJN6W2RbR
D2wmg5QiBn2xnqsw
dyR6lEm2cY26ASfu
QDSrujrq7UxoCLsA
BCZ8ewhTUEUJ2mRN
3xM8l54kGy3WXbYD
mTX6DG9WX5USuewm
XeaWqxeer1akMjRh
6ySpMxAQ8CCIoEBi
ZVpitg8vlLj1sUDt
8IWv9QTr7V0fYJPu
hYFwg9kHDRnP2u7r
vcOgVzi3WCNDPrDj
InzmLCc8yNwvWkmL
cWqj9qAbJJumk3oe
WcaXVd1QLug6pP10
R0JGLwnt492r796o
Nri6pQoCRWgkMKSe
N5pXtrQHzDbHIRms
m29w2FmZwRI2H4UG
QTo7OgcJDL4hXq1T
iImx45f9ZeolOEJG
zK4gNlSLFFNOUOe7
4VSBHDhK9QVdlKMI
6i7N9T3NbiXIHldj
hoLnvUiurZwOYzXq
l0X3bLmsghdwWoiN
qFzrFJZ7CXkExBDa
KKCq6cNj8idMpSMu
JuLOgSVlgIWj7TQa
1Ny2coqMCLlfjmgT
3d3Y4ZCqtV0rw1Rx
mIaX6YboRYkUnITM
LvmtO3CvnXvKVicj
B5LfXnA9BHd7p6OQ
xZn34WgUDQy2Ttcb
wcZ3kvyOiENOjCNr
Ir76G8cFkfqWla5D
G1vDhme8euAQB93V
z2SROgsuwQZqqeOC
kiBMVHCqEzDgsezU
2bkkhFS8HhT5DSZ2
espTG94g3H9FSYqo
7ehkKLrV5V7znoTC
ZVmxxCPHOXFg0eQv
n4WKnBi57gc4aQ8e
`
  .split(/\s+/)
  .filter(Boolean);

const permissionConfig = {
  OnlineForm: {
    InsertCate: '新建分类',
    RenameCate: '分类重命名',
    DeleteCate: '删除分类',
    Insert: '新建表单',
    InsertVer: '版本创建',
    CopyDefaultVer: '复制(携带默认版本)',
    UpdateVer: '版本编辑',
    CopyCurrentVer: '复制(携带指定版本)',
    CopyVer: '版本复制',
    Design: '设计',
    DeleteVer: '版本删除',
    Controller: '受控',
    Withdraw: '撤回',
    ProcessDesign: '流程设计',
    ButtonsDesign: '按钮设计',
    Effect: '生效日期',
    CompareVersion: '版本对比',
    Import: '导入',
    Export: '导出',
  },
  eDHR: {
    InsertCate: '新建分类',
    RenameCate: '分类重命名',
    DeleteCate: '删除分类',
    Insert: '新建eDHR',
    InsertVer: '版本创建',
    CopyDefaultVer: '复制(携带默认版本)',
    UpdateVer: '版本编辑',
    CopyCurrentVer: '复制(携带指定版本)',
    CopyVer: '版本复制',
    Design: '设计',
    DeleteVer: '版本删除',
    Controller: '受控',
    Withdraw: '撤回',
    Update: '编辑',
    Effect: '生效日期',
  },
  'document-filling': {
    Insert: '新建任务',
    Fill: '填报',
    Forward: '转发',
    Update: '编辑',
    Resend: '重新发送',
    Delete: '删除',
  },
  'document-task': {
    Handle: '处理',
  },
  'dhr-task': {
    Handle: '处理',
  },
  'change-task': {
    Handle: '处理',
  },
  'print-tmpl': {
    Insert: '新建',
    Design: '设计',
    Update: '编辑',
    Delete: '删除',
  },
  'file-task': {
    Download: '下载',
    BatchDownload: '批量下载',
    BatchDelete: '批量删除',
  },
  'my-file-task': {
    Download: '下载',
    BatchDownload: '批量下载',
    BatchDelete: '批量删除',
  },
  'edhr-tracked': {
    Reverse: '反向追溯',
  },
  'document-tracked': {
    Reverse: '反向追溯',
  },
  'user-management': {
    Insert: '新建',
    Import: '导入',
    Export: '导出',
    Update: '编辑',
    ResetPwd: '重置密码',
    ResetSignPwd: '重置签名密码',
    Delete: '删除',
  },
  'organization-member': {
    InsertOrg: '添加下级部门',
    UpdateOrg: '编辑下级部门',
    DeleteOrg: '删除下级部门',
    Insert: '添加用户',
    Import: '导入',
    Export: '导出',
    Update: '编辑',
  },
  'role-management': {
    Insert: '新建',
    Update: '编辑',
    Perm: '权限配置',
    EnableDisable: '启用/禁用',
    Delete: '删除',
  },
  'user-group': {
    Insert: '新建',
    Delete: '删除',
    Update: '编辑',
  },
  'user-granted': {
    Insert: '添加',
    HandOver: '移除并交接',
  },
  'ds-management': {
    Insert: '新建',
    Update: '编辑/启用/禁用',
    Delete: '删除',
  },
  'service-dictionary': {
    Insert: '新建',
    Update: '编辑',
    Delete: '删除',
  },
  ReportDataSet: {
    Insert: '新建',
    Update: '编辑',
    Delete: '删除',
  },
  'edhr-filling': {
    ADD_FORM: '表单添加',
  },
  'approval-product-process-task': {
    Handle: '处理',
  },
  'approval-routing-task': {
    Handle: '处理',
  },
  'approval-doc-task': {
    Handle: '处理',
  },
  'ipaas-flow': {
    AddCate: '新建分类',
    RenameCate: '分类重命名',
    DeleteCate: '删除分类',
    AddIpaas: '新建连接流',
    Import: '导入',
    Export: '导出',
    Edit: '编辑',
    Design: '设计',
    Delete: '删除',
    Recall: '重试',
  },
  'ipaas-connector': {
    AddCate: '新建分类',
    RenameCate: '分类重命名',
    DeleteCate: '删除分类',
    AddConnector: '新建连接器',
    Import: '导入',
    Export: '导出',
    Config: '配置',
    Edit: '编辑',
    Delete: '删除',
    ClearLog: '清空调试日志',
  },
  'device-interconnection': {
    AddDevice: '新建设备',
    ImportDevice: '导入设备',
    BatchExportDevice: '批量导出设备',
    EditDevice: '编辑设备',
    CopyDevice: '复制设备',
    DeleteDevice: '删除设备',
    AddParams: '新建参数',
    ImportParams: '导入参数',
    BatchExportParams: '批量导出参数',
    EditParams: '编辑参数',
    DeleteParams: '删除参数',
  },
  'audit-center': {
    FormHandle: '表单审核',
    TmplHandle: '模板审核',
    ChangeHandle: '变更审核',
  },
};

// ! 废弃
// const perms = {
//   'product-family': 'Insert/新建 Copy/复制 Update/编辑 Delete/删除 Trace/建模追溯 IMPORT/导入', // 产品家族
//   'product-modeling':
//     'Insert/新建 Copy/复制产品 Delete/删除产品 Trace/建模追溯 InsertVer/版本创建 UpdateVer/版本编辑 CopyVer/版本复制 DeleteVer/版本删除 IMPORT/导入', // 产品建模
//   'document-item':
//     'InsertCate/新建分类 RenameCate/分类重命名 DeleteCate/删除分类 Insert/新建项目 Update/编辑项目 Delete/删除项目 Trace/建模追溯 IMPORT/导入', // 表单项目
//   'edhr-use': 'Insert/新建 Update/编辑 Delete/删除', // eDHR 应用
//   'document-filling': 'Insert/新建 Fill/填报 Forward/转发 Delete/删除', // 表单填报
//   'document-task': 'Handle/处理', // 表单审核
//   'edhr-tracked': 'EDHRRelate/eDHR关联 Reverse/反向追溯', // eDHR 追溯
//   'document-tracked': 'Insert/新建 Update/编辑 Delete/删除', // 表单追溯
//   'user-management':
//     'Insert/新建 Update/编辑 ResetPwd/重置密码 Delete/删除 Import/导入 Export/导出', // 用户管理
//   'organization-member':
//     'InsertOrg/添加下级组织 UpdateOrg/编辑下级组织 Insert/添加用户 Delete/删除 Import/导入 Export/导出', // 组织成员
//   'role-management': 'Insert/新建 Update/编辑 Delete/删除 Perm/权限配置 ', // 角色管理
//   'user-group': 'Insert/新建 Update/编辑 Delete/删除', // 权限管理
//   'user-granted': 'Insert/添加用户 HandOver/移除并交接', // 用户席位
//   'ds-management': 'Insert/新建 Update/编辑 Delete/删除', // 数据源管理
//   'record-change': 'Annotate/变更记录（批注） Cancel/表单作废 Update/表单变更', // 记录变更
//   'process-intervention': 'Detail/详情 Transfer/转办 Withdraw/撤回', // 流程干预
// };

function convertToPermsFormat(data) {
  const perms = {};
  for (const module in data) {
    const actions = data[module];
    const actionStr = Object.entries(actions)
      .map(([key, label]) => `${key}&${label}`)
      .join(' ');
    perms[module] = actionStr;
  }
  return perms;
}

function run(ds = {}, records = [], idsPool = [], now = new Date().toISOString()) {
  Object.keys(ds).forEach((item) => {
    const relation_id_ = item;
    const children = ds[item].split(/\s+/).filter(Boolean);
    if (children && children.length) {
      children.forEach((child) => {
        const [key_, name_] = child.split('&');
        let record = '';
        record += `<insert tableName="gct_permission">`;
        record += `\n<column name="id_" value="${idsPool.pop() || 'ID不够了'}"/>`;
        record += `\n<column name="key_" value="${key_}"/>`;
        record += `\n<column name="name_" value="${name_}"/>`;
        record += `\n<column name="relation_id_" value="${relation_id_}"/>`;
        record += `\n<column name="terminal_type_" value="WEB"/>`;
        record += `\n<column name="create_user_id_" value="__SYS__"/>`;
        record += `\n<column name="create_user_name_" value="系统"/>`;
        record += `\n<column name="create_time_" valueDate="${now}"/>`;
        record += `\n<column name="modify_user_id_" value="__SYS__"/>`;
        record += `\n<column name="modify_user_name_" value="系统"/>`;
        record += `\n<column name="modify_time_" valueDate="${now}"/>`;
        record += `\n<column name="deleted_" valueNumeric="0"/>`;
        record += `\n<column name="sys_builtin_" valueNumeric="1"/>`;
        record += `\n<column name="draft_" valueNumeric="0"/>`;
        record += `\n<column name="init_commit_id_" value="__0000__"/>`;
        record += `\n</insert>`;
        records.push(record);
      });
    }
  });
  return records;
}

/**  ----------- 生成 generate-sql-inserts.ts ----------- */
function getGenerateSqlInsertsTs(data, ids) {
  const perms = convertToPermsFormat(data);
  const result = run(perms, [], ids);

  return `
  // 该文件由脚本自动生成，请勿手动修改
  
  export const perms = ${JSON.stringify(perms, null, 2)};
  
  export const result = ${JSON.stringify(result, null, 2)};
  `;
}

/**  ----------- 生成 edhr-page-perms-keys.ts ----------- */
function genPage2PermsKeyTs(data) {
  const allPerms = new Set();

  const page2Perms = Object.entries(data)
    .map(([page, perms]) => {
      Object.keys(perms).forEach((p) => allPerms.add(p));
      return `  '${page}': [\n    ${Object.keys(perms)
        .map((p) => `'${p}'`)
        .join(',\n    ')}\n  ],`;
    })
    .join('\n');

  const permEnum = Array.from(allPerms)
    .sort()
    .map((p) => `  ${p}: '${p}',`)
    .join('\n');

  return `// 此文件由脚本自动生成，请勿手动修改。

export const Page2PermsKeyMap = {
${page2Perms}
} as const;

export const DhrPermissionEnum = {
${permEnum}
} as const;
`;
}

/**  ----------- 生成 edhr-page-perm.d.ts ----------- */
function genTypesDts(data) {
  const lines = [
    `// 此文件由脚本自动生成，请勿手动修改。`,
    ``,
    `export type PagePermissionMap = {`,
  ];

  Object.entries(data).forEach(([page, perms]) => {
    lines.push(`  '${page}': {`);
    Object.entries(perms).forEach(([key, label]) => {
      lines.push(`    /** ${label} */ ${key}: boolean;`);
    });
    lines.push(`  };`);
  });

  lines.push(`};`);
  lines.push(``);
  lines.push(`export type PagePermissionKey = keyof PagePermissionMap;`);

  return lines.join('\n');
}

// ----------- 生成 perms/index.ts -----------
function genPermsRootIndex(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'generate-sql-inserts.ts');

  const exports = files.map((f) => `export * from './${f.replace(/\.ts$/, '')}';`).join('\n');

  return `// 此文件由脚本自动生成，请勿手动修改。\n\n${exports}\n`;
}

fs.writeFileSync(
  path.join(outputDir, 'edhr-page-perms-keys.ts'),
  genPage2PermsKeyTs(permissionConfig),
  'utf-8',
);

fs.writeFileSync(
  path.join(outputDir, 'edhr-page-perm.d.ts'),
  genTypesDts(permissionConfig),
  'utf-8',
);

fs.writeFileSync(
  path.join(outputDir, 'generate-sql-inserts.ts'),
  getGenerateSqlInsertsTs(permissionConfig, sourceIds),
  'utf-8',
);

fs.writeFileSync(path.join(outputDir, 'index.ts'), genPermsRootIndex(outputDir), 'utf-8');

console.log('✅ 所有eDHR权限点文件和 index.ts 已生成完毕！');
