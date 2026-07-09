const ids = `
IRfJhh1Qjta4EL8S
XyXGnIYsAPb3CX2I
EL1Mug8I2Sq2Wgr2
RCNpaPH4Bv2qj8rA
`
  .split(/\s+/)
  .filter(Boolean);

const menus = [
  {
    id_: 'xudRvw6aUPCTB2Yg',
    name_: '基础建模',
    logo_: 'icon-park:waterfalls-h',
    children: [
      {
        id_: 'OllGdLS07z5mGxtM',
        name_: '产品家族',
        link_page_: 'product-family',
      },
      {
        id_: 'deD1Ipwgq2TqX7n2',
        name_: '产品建模',
        link_page_: 'product-modeling',
      },
      {
        id_: 'dbN1BjtJegL7kTZv',
        name_: '表单项目',
        link_page_: 'document-item',
      },
    ],
  },
  {
    id_: 'LOChQ4tlcPzJTZjM',
    name_: '模板管理',
    logo_: 'icon-park:agreement',
    children: [
      {
        id_: 'WSalBmGmJC7FFCgx',
        name_: '表单模板',
        link_page_: 'OnlineForm',
      },
      {
        id_: '5jfVxyM7RUuHTZhM',
        name_: 'eDHR模板',
        link_page_: 'eDHR',
      },
      {
        id_: 'jxivhBPOq53wMILQ',
        name_: 'eDHR应用',
        link_page_: 'edhr-use',
      },
    ],
  },
  {
    id_: 'xJ3ZHGU6TslnHhrp',
    name_: '记录管理',
    logo_: 'icon-park:file-editing',
    children: [
      {
        id_: 'UM7aHD97YfWWpqrM',
        name_: 'eDHR填报',
        link_page_: 'edhr-filling',
      },
      {
        id_: 'ktgmC8EeQn7v87S1',
        name_: '电子放行',
        link_page_: 'release-filling',
      },
      {
        id_: 'RCNpaPH4Bv2qj8rA',
        name_: '表单填报',
        link_page_: 'document-filling',
      },
      {
        id_: 'aWPor72zEL5WyFNE',
        name_: '表单审核',
        link_page_: 'document-task',
      },
      {
        id_: 'Q2nBvDQgYlu8KbbO',
        name_: '表单追溯',
        link_page_: 'document-tracked',
      },
      {
        id_: 'sCDjzpLZN6ItxWL8',
        name_: '放行记录',
        link_page_: 'release-logs',
      },
      {
        id_: 'Vr94D0Bamrth8fL6',
        name_: 'eDHR追溯',
        link_page_: 'edhr-tracked',
      },
    ],
  },
  {
    id_: '6XFey65oXcOOBOFi',
    name_: '组织权限',
    logo_: 'preset-EAM',
    children: [
      {
        id_: 'kj34VkDjBUqSqpNZ',
        name_: '用户管理',
        link_page_: 'user-management',
      },
      {
        id_: 'tdYRMdiSouplD2H2',
        name_: '组织成员',
        link_page_: 'organization-member',
      },
      {
        id_: '8WbbbFtrvOMF5Avf',
        name_: '角色管理',
        link_page_: 'role-management',
      },
      {
        id_: 'dM6FNvIy87AprlSL',
        name_: '权限管理',
        link_page_: 'user-group',
      },
      {
        id_: 'EL1Mug8I2Sq2Wgr2',
        name_: '用户席位',
        link_page_: 'user-granted',
      },
    ],
  },
  {
    id_: 'vrEf96vMIOhlZSg8',
    name_: '集成中心',
    logo_: 'icon-park:data',
    children: [
      {
        id_: 'Iw5XyYSPbgNB5SHz',
        name_: '数据源管理',
        link_page_: 'ds-management',
      },
    ],
  },
  {
    id_: '4Knqiz22EfxsIIyd',
    name_: '系统管理',
    logo_: 'icon-park:setting',
    children: [
      {
        id_: 'jpiIM366KvTTpkIK',
        name_: '记录变更',
        link_page_: 'record-change',
      },
      {
        id_: 'WDijerJ62pWijL0c',
        name_: '流程干预',
        link_page_: 'process-intervention',
      },
    ],
  },
];

function traverse(
  tree = [],
  records = [],
  parent = { level_: 0, id_: 'ROOT', full_path_: 'ROOT' },
) {
  tree.forEach((node, index, arr) => {
    let record = `<insert tableName="gct_menu_config">`;

    const {
      id_,
      name_ = '',
      parent_id_ = parent.id_,
      level_ = parent.level_ + 1,
      logo_ = '',
      link_page_ = '',
      type_,
      visible_ = 1,
      open_mode_ = 'PRESENT',
      menu_type_ = 'WEB',
      sort_num_ = (arr.length - index) * 100,
      deleted_ = 0,
      draft_ = 0,
      init_commit_id_ = '__0000__',
      i18n_config_ = '',
      color_ = '',
      sys_builtin_ = 1,
      full_path_,
      children,
    } = node;

    const id = id_ || ids.pop();
    const fullPath = full_path_ || parent.full_path_ + '/' + id;
    const type = type_ || (children ? 'CATALOG' : 'STANDARD');

    record += `\n<column name="id_" value="${id}"/>`;
    record += `\n<column name="name_" value="${name_}"/>`;
    record += `\n<column name="parent_id_" value="${parent_id_}"/>`;
    record += `\n<column name="level_" valueNumeric="${level_}"/>`;
    record += `\n<column name="logo_" value="${logo_}"/>`;
    record += `\n<column name="link_page_" value="${link_page_}"/>`;
    record += `\n<column name="type_" value="${type}"/>`;

    record += `\n<column name="visible_" valueNumeric="${visible_}"/>`;
    record += `\n<column name="open_mode_" value="${open_mode_}"/>`;
    record += `\n<column name="menu_type_" value="${menu_type_}"/>`;
    record += `\n<column name="sort_num_" valueNumeric="${sort_num_}"/>`;
    record += `\n<column name="deleted_" valueNumeric="${deleted_}"/>`;
    record += `\n<column name="draft_" valueNumeric="${draft_}"/>`;
    record += `\n<column name="init_commit_id_" value="${init_commit_id_}"/>`;
    record += `\n<column name="i18n_config_" value="${i18n_config_}"/>`;
    record += `\n<column name="color_" value="${color_}"/>`;
    record += `\n<column name="sys_builtin_" valueNumeric="${sys_builtin_}"/>`;
    record += `\n<column name="full_path_" value="${fullPath}"/>`;

    record += `\n<column name="create_user_id_" value="c0b3c294-0fd4-11ee-bb99-0242ac120001"/>`;
    record += `\n<column name="create_user_name_" value="管理员"/>`;
    record += '\n<column name="create_time_" valueDate="${now}"/>';
    record += `\n<column name="modify_user_id_" value="c0b3c294-0fd4-11ee-bb99-0242ac120001"/>`;
    record += `\n<column name="modify_user_name_" value="管理员"/>`;
    record += '\n<column name="modify_time_" valueDate="${now}"/>';
    record += `\n</insert>`;

    records.push(record);

    if (children && children.length > 0) {
      traverse(children, records, {
        id_,
        level_,
        full_path_: fullPath,
      });
    }
  });

  return records;
}

const result = traverse(menus);

console.log(result.join('\n\n'));
