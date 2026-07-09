import { ref, reactive, toRaw, isReactive } from 'vue';

import { OperatorTypeEnum } from '../constant/interface';
import { useUUid } from '@/hooks/web/useUUid';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { FIELD_TYPE } from '@/enums/appEnum';
import { useI18n } from '/@/hooks/web/useI18n';

import { isEmpty } from 'lodash-es';

const { t } = useI18n();

const editDataRulesTree = ref([]);
const showDataRulesTree = ref([]);

export function useDataRulesTree(isReadyOnly) {
  const { getUuidGenerate } = useUUid(ref([]), ref(''), {
    needPrefix: true,
    isString: false,
    prefix: 't_',
  });

  const uuidGenerate = getUuidGenerate([]);

  const transfromReactive = (data) => {
    return data.map((item) => {
      const node = reactive(
        Object.assign(
          {},
          {
            key: item.key,
            pid: item.pid,
            level: item.level,
            class: item.class,
          },
          item.type === 'group'
            ? {
                operatorType: item.operatorType,
                type: item.type,
                children: reactive([]),
              }
            : {
                firstRow: item.firstRow,
                leftValue: item.leftValue,
                operatorValue: item.operatorValue,
                rightValue: item.rightValue,
              },
        ),
      );

      if (Array.isArray(item.children)) {
        node.children?.push(...transfromReactive(item.children));
      }
      return node;
    });
  };

  const setPageTreeItem = (data, len?) => {
    return data.forEach((item, index) => {
      if (Array.isArray(item.children)) {
        item.type = 'group';
        item.class = 'tree-group';
        if (isEmpty(item.operatorType)) {
          item.operatorType = OperatorTypeEnum.AND;
        }
        setPageTreeItem(item.children, item.children.length);
      } else {
        const filterData = data.filter((item) => !item.children);
        if (index === 0 || index === filterData.length - 1) {
          item.class = `${index === 0 ? 'first-node' : ''} ${
            index === filterData.length - 1 ? 'last-node' : ''
          }`;
          item.firstRow = index === 0;
        } else {
          item.class = '';
        }
        item.dataLen = len;
      }
    });
  };

  const addNode = ({ pid, insertId, data, isGroup = false, prevId = '' }) => {
    if (pid === 'init') {
      const node = {
        key: 'root',
        pid: '',
        level: 1,
        class: undefined,
        operatorType: undefined,
        type: undefined,
        children: reactive([]),
      };
      data.push(node);
      return;
    }
    return data.forEach((item) => {
      if (item.key === pid) {
        const childrenNode = reactive(
          Object.assign(
            {},
            {
              key: insertId,
              pid: item.key,
              level: Number(item.level) + 1,
              class: '',
            },
            isGroup
              ? {
                  operatorType: undefined,
                  type: undefined,
                  children: reactive([]),
                }
              : {
                  firstRow: undefined,
                  leftValue: undefined,
                  operatorValue: undefined,
                  rightValue: undefined,
                },
          ),
        );

        if (prevId) {
          const index = item.children.findIndex((k) => k.key === prevId);
          item.children.splice(index + 1, 0, childrenNode);
        } else {
          item.children.push(childrenNode);
        }
        item.children.forEach(i => {
          i.dataLen = item.children?.length;
        }) 
        return;
      }
      if (item.children) {
        addNode({ pid, insertId, data: item.children, isGroup, prevId });
      }
    });
  };

  const deleteNode = (id, data) => {
    return data.forEach((item: any, index: string) => {
      if (item.key === id) {
        data.splice(index, 1);
        return;
      } else {
        if (item.children) {
          deleteNode(id, item.children);
        }
      }
    });
  };

  const createGroupNodes = (data, pid, isInit = false) => {
    const uuid = uuidGenerate.next();
    addNode({ pid: isInit ? 'init' : pid, insertId: uuid, data: data, isGroup: true });
    addNode({
      pid: isInit ? pid : uuid,
      insertId: isInit ? uuid : uuidGenerate.next(),
      data: data,
    });
    setPageTreeItem(data);
  };

  const setTree = (data) => {
    if (!data) {
      // 如果数据不存在，直接初始化新的
      createGroupNodes(
        isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value,
        'root',
        true,
      );
    } else {
      // 转换成页面想要的tree结构
      console.log('转换成页面想要的tree结构', JSON.parse(data));
      if (isReadyOnly) {
        showDataRulesTree.value = transfromReactive(JSON.parse(data));
      } else {
        editDataRulesTree.value = transfromReactive(JSON.parse(data));
      }
    }
  };

  const addNewGroup = (id) => {
    createGroupNodes(editDataRulesTree.value, id);
  };

  const deleteGroup = (id) => {
    deleteNode(id, editDataRulesTree.value);
    setPageTreeItem(editDataRulesTree.value);
  };

  const addNewRow = (pid, id) => {
    const uuid = uuidGenerate.next();
    addNode({
      pid: pid,
      insertId: uuid,
      data: editDataRulesTree.value,
      isGroup: false,
      prevId: id,
    });
    setPageTreeItem(editDataRulesTree.value);
  };

  const deleteRow = (id) => {
    deleteNode(id, editDataRulesTree.value);
    setPageTreeItem(editDataRulesTree.value);
  };

  /** 递归查找是否存在树结构中的值 */
  const findTreePathById = (leafId: string, nodes: any[]) => {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      if (leafId === nodes[i].key) {
        return nodes[i];
      }
      if (nodes[i].children) {
        const findResult = findTreePathById(leafId, nodes[i].children);
        if (findResult) {
          return findResult;
        }
      }
    }
  };

  const updateNodeItem = (id, attr, value, opts?) => {
    const node = findTreePathById(id, editDataRulesTree.value);

    if (attr === 'rightValue') {
      if (opts.isRest) {
        node.rightValue = reactive(
          opts.defaultValues.map((val) => {
            return {
              [opts.key]: val,
            };
          }),
        );
      }
      if (opts.key === 'valueType') {
        node[attr][opts.index] = {};
      }
      node[attr][opts.index][opts.key] = value;
    } else {
      node[attr] = typeof value === 'object' ? reactive(value) : value;
    }

    if (attr === 'leftValue') {
      /** 运算符 */
      node.operatorValue = undefined;
      /** 右值 */
      node.rightValue = undefined;
    } else if (attr === 'operatorValue') {
      node.rightValue = reactive(
        opts.defaultValues.map((val) => {
          return {
            [opts.key]: val,
          };
        }),
      );
    }
  };

  const getAllExpandedKeys = () => {
    const list = flatten(isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value, '');
    return {
      allExpandedKeys: list.map((item) => item.key),
      selectFiledKeys: list.map((item) => item.leftValue?.id).filter((i) => i),
    };
  };

  // tree => 一维数组
  const flatten = (array = [], pathStr) => {
    return [].concat(
      ...array.map((item: any) => {
        item.pathStr = `${pathStr}|${item.children ? item.operatorType : 'content'}`;
        return [].concat(
          {
            key: item.key,
            pid: item.pid,
            operatorType: item.children ? item.operatorType : 'content',
            pathStr: item.pathStr,
            leftValue: item.leftValue,
            operatorValue: item.operatorValue,
            rightValue: item.rightValue,
          },
          flatten(item.children || [], item.pathStr),
        );
      }),
    );
  };

  // 获取exp一维嵌套数组
  const getExpList = (array = [], parent, type) => {
    return [].concat(
      ...array.map((item: any) => {
        let name: string;
        if (
          !item.children &&
          item.leftValue &&
          item.leftValue.key &&
          item.operatorValue &&
          item.key
        ) {
          name = `${item.leftValue.field_search_key || item.leftValue.key}.${item.operatorValue}:${
            item.key
          }`;
          if (type === 'filterConfig') {
            name = `${item.leftValue.modelKey}#${item.leftValue.key}.${item.operatorValue}:${item.key}`;
          } else if (type === 'businessFlow') {
            name = `${item.leftValue.nodeKey}.${item.leftValue.modelKey}.${item.operatorValue}:${item.key}`;
          }
        }

        return [].concat(
          item.children
            ? []
            : item.leftValue && item.leftValue.key && item.operatorValue && item.key
            ? {
                name,
                type: parent.operatorType,
                operatorType: item.children ? item.operatorType : 'content',
                // operatorValue: item.operatorValue,
                // secondarySpliceName: `${item.leftValue.field_search_key || item.leftValue.key}.${
                //   SEARCH_SEVICE.ISNULL
                // }`,
              }
            : [],
          [getExpList(item.children || [], item, type)],
        );
      }),
    );
  };

  const filterExpList = (array: any) => {
    const list: any = [];
    array.forEach((item: any) => {
      if (Array.isArray(item) && item.length !== 0) {
        list.push(filterExpList(item));
      } else if (!Array.isArray(item) && item.operatorType === 'content') {
        list.push(item);
      }
    });
    return list;
  };

  const setExpValue = (array) => {
    const list: any = [];
    array.forEach((item, index) => {
      if (index === 0) {
        list.push(`#before${item.type}#`);
      }
      if (Array.isArray(item) && item.length !== 0) {
        list.push(setExpValue(item));
      } else if (!Array.isArray(item)) {
        // 特殊处理，二次拼接
        // if (item.operatorValue === SEARCH_SEVICE.NOTIN) {
        //   list.push(`#beforeOR#`);
        // }
        list.push(item.name);
        // if (item.operatorValue === SEARCH_SEVICE.NOTIN) {
        //   list.push(item.secondarySpliceName);
        //   list.push('#after#');
        // }
      }

      if (index === array.length - 1) {
        list.push('#after#');
      }
    });
    return list;
  };

  /** 递归得到数据规则算子 */
  const getDataRules = (type, mainModelKey) => {
    const list = flatten(isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value, '');
    let error;
    const query = {};
    const varKeys: any = [];
    const typeMap = {};
    list.forEach((item: any) => {
      if (item.operatorType === 'content') {
        if (isEmpty(item.leftValue) || isEmpty(item.operatorValue) || isEmpty(item.rightValue)) {
          error = t('sys.webRender.saveTip');
          return;
        }
        let key: string = '';
        if (type === 'businessFlow') {
          key = `${item.leftValue.nodeKey}.${item.leftValue.modelKey}.${item.operatorValue}:${item.key}`;
        } else if (type === 'filterConfig') {
          key = `${item.leftValue.modelKey}#${item.leftValue.key}.${item.operatorValue}:${item.key}`;
        } else
          key = `${item.leftValue.field_search_key || item.leftValue.key}.${item.operatorValue}:${
            item.key
          }`;

        if ([SEARCH_SEVICE.ISNOTNULL, SEARCH_SEVICE.ISNULL].includes(item.operatorValue)) {
          Object.assign(query, {
            [key]: null,
          });
        } else {
          if (item.rightValue.some((rv) => isEmpty(rv.result))) {
            error = t('sys.webRender.saveTip');
            return;
          }
          const types: any = [];
          const values = item.rightValue.map((kk) => {
            types.push(kk.valueType);
            if (kk.valueType === 'SYS') {
              varKeys.push(key);
            }
            if (
              [
                FIELD_TYPE.USER_MULTI,
                FIELD_TYPE.ORG_MULTI,
                FIELD_TYPE.USER,
                FIELD_TYPE.ORG,
              ].includes(item.leftValue.type) &&
              kk.valueType === 'FIXED'
            ) {
              const _orgs = kk?.result?.orgs?.map((org) => `ORG:${org}`) ?? [];
              const _users = kk?.result?.users?.map((user) => `USER:${user}`) ?? [];
              if (
                [FIELD_TYPE.USER, FIELD_TYPE.ORG].includes(item.leftValue.type) &&
                [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE].includes(item.operatorValue)
              ) {
                return [..._orgs, ..._users]?.[0];
              }
              return [..._orgs, ..._users];
            }
            return kk?.valueType === 'FIELD'
              ? mainModelKey
                ? `__F__:${mainModelKey}.${kk?.result}`
                : `__F__:${kk?.result.replace('$', '.')}`
              : kk?.result;
          });

          Object.assign(typeMap, {
            [key]: types.length === 1 ? toRaw(types[0]) : toRaw(types),
          });

          Object.assign(query, {
            [key]: values.length === 1 ? toRaw(values[0]) : toRaw(values),
          });
        }
      }
    });

    if (error) {
      return {
        error,
      };
    }

    const explist = setExpValue(
      filterExpList(
        getExpList(
          (isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value)[0].children,
          (isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value)[0],
          type,
        ),
      ),
    );
    const expStr = explist
      .toString()
      .replace(/#beforeAND#,/g, 'AND(')
      .replace(/#beforeOR#,/g, 'OR(')
      .replace(/,#after#/g, ')');

    console.warn('getDataRules query', query);
    console.warn('getDataRules varKeys', varKeys);
    console.warn('getDataRules explist', explist);
    console.warn('getDataRules expStr', expStr);
    return {
      query,
      varKeys,
      exp: expStr,
      treeStr: JSON.stringify(isReadyOnly ? showDataRulesTree.value : editDataRulesTree.value),
      typeMap,
    };
  };

  // ! mock测试用，先不删
  // const temp = (str) => {
  //   const temp = [
  //     'be',
  //     1,
  //     2,
  //     3,
  //     ['be', 4, 5, 6, ['be', 10, 11, 12, 'af'], 'af'],
  //     ['be', 7, 8, 9, ['be', 13, 14, 'af'], 'af'],
  //     'af',
  //   ];

  //   const temp1 = '( 1,2,3, (4,5,6, (10, 11,12) ), (7, 8, 9, ( 13,14 ) ) )';

  //   const before = 'and(';
  //   const after = ')';
  //   data.forEach((item, index) => {
  //     if (index === 0) {
  //       str += before + item;
  //     }
  //     if (index === data.length - 1) {
  //       str += item + after;
  //     }
  //   });

  //   'and(a.ep,b.xx,p.cc,or(c.d,e.f,and(pp.mm,re.mi,or(d.x, c.d)),or(p.p,x.x)),and(i.c,m.m,or(p.x)))'
  //     .replace(/and\(/g, '["')
  //     .replace(/or\(/g, '["')
  //     .replace(/\)/g, '"]')
  //     .replace(/(?<=\])"?(?=\])/g, '')
  //     .replace(/(?<=\w),(?=\w)/g, '","')
  //     .replace(/(?<=\w),(?=\[)/g, '",');
  // };

  const resetTree = () => {
    if (isReadyOnly) {
      showDataRulesTree.value = [];
    } else {
      editDataRulesTree.value = [];
    }
  };

  return {
    setTree,
    showDataRulesTree,
    editDataRulesTree,
    addNewGroup,
    addNewRow,
    deleteGroup,
    deleteRow,
    updateNodeItem,
    getDataRules,
    resetTree,
    getAllExpandedKeys,
  };
}
