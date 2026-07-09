import { reactive, ref, computed } from 'vue';

import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';
import { groupBy, isEmpty, pick } from 'lodash-es';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { EntityModelTypeEnum } from '/@app-designer/enum';

import type { TableEntityModelResponse } from '/@/apis/gct-apaas/model';

import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

/** 关联条件 */
interface IOnExpressions {
  /** 左连接模型key */
  leftModelKey: string;
  /** 左连接字段key */
  leftFieldKey: string | undefined;
  /** 操作符 */
  operator: string;
  /** 右连接模型key */
  rightModelKey: string;
  /** 右连接字段key */
  rightFieldKey: string | undefined;
}

/** 关联配置 */
interface IJoins {
  /** 关联模型key */
  modelKey: string;
  /** 关联方式 */
  type: string;
  /** 关联条件数组 */
  onExpressions: IOnExpressions[];
}

interface IJoinConfig {
  /** 主模型key */
  mainModelKey: string;
  /** 关联配置数组 */
  joins: IJoins[];
}

const entityModelTypes = [
  EntityModelTypeEnum.BASE,
  EntityModelTypeEnum.NDO,
  EntityModelTypeEnum.RDO,
  EntityModelTypeEnum.TREE,
  EntityModelTypeEnum.TRANSACTION,
  EntityModelTypeEnum.WORKFLOW,
];

const editJoinConfig = reactive<IJoinConfig>({
  mainModelKey: '',
  joins: [],
});

const showJoinConfig = reactive<IJoinConfig>({
  mainModelKey: '',
  joins: [],
});

/** 模型下的字段列表 */
const editModelFieldMap = ref<any>({});

const showModelFieldMap = ref<any>({});

const editFilterModelFieldMap = ref<any>({});

const showFilterModelFieldMap = ref<any>({});

const editBasicEntityList = ref<TableEntityModelResponse[]>([]);

const showBasicEntityList = ref<TableEntityModelResponse[]>([]);

export function useJoinConfig(isReadyOnly) {
  /** 实体模型列表 */
  const entityList = computed<{
    [key: string]: TableEntityModelResponse[];
  }>(() => {
    return groupBy(isReadyOnly ? showBasicEntityList.value : editBasicEntityList.value, 'category');
  });

  const selectLinkModelKeys = computed(() => {
    return (isReadyOnly ? showJoinConfig.joins : editJoinConfig.joins).map((join) => join.modelKey);
  });

  const allLinkFieldList = computed(() => {
    const list = [isReadyOnly ? showJoinConfig.mainModelKey : editJoinConfig.mainModelKey]
      .concat(
        ...(isReadyOnly ? showJoinConfig.joins : editJoinConfig.joins).map((item) => item.modelKey),
      )
      .filter((item) => item)
      .map((modelKey) => {
        return (isReadyOnly ? showFilterModelFieldMap.value : editFilterModelFieldMap.value)[
          modelKey
        ];
      })
      .flat()
      .filter((i) => i);
    return list;
  });

  function filterJoinModelOption(key) {
    const keys = selectLinkModelKeys.value.filter((i) => i !== key);
    const list = (isReadyOnly ? showBasicEntityList.value : editBasicEntityList.value).filter(
      (item) => {
        if (
          item.key === (isReadyOnly ? showJoinConfig.mainModelKey : editJoinConfig.mainModelKey)
        ) {
          return false;
        }

        return !keys.includes(item.key ?? '');
      },
    );
    return groupBy(list, 'category');
  }

  function filterRightModelOption(index) {
    return [isReadyOnly ? showJoinConfig.mainModelKey : editJoinConfig.mainModelKey]
      .concat(
        ...(isReadyOnly ? showJoinConfig.joins : editJoinConfig.joins)
          .slice(0, index)
          .map((item) => item.modelKey),
      )
      .filter((item) => item)
      .map((key) => {
        const info = (isReadyOnly ? showBasicEntityList.value : editBasicEntityList.value).find(
          (item) => item.key == key,
        );
        return pick(info, ['key', 'name']);
      });
  }

  function filterRightFieldOption(rightModelKey, leftModelKey, leftFieldKey) {
    const filedInfo =
      ((isReadyOnly ? showModelFieldMap.value : editModelFieldMap.value)[leftModelKey] ?? []).find(
        (item) => item.key === leftFieldKey,
      ) ?? {};
    return (
      (isReadyOnly ? showModelFieldMap.value : editModelFieldMap.value)[rightModelKey] ?? []
    ).filter((item) => {
      return item.mappingType === filedInfo.mappingType;
    });
  }

  async function getModelList() {
    const info =
      (await getDesignerCommonTableEntityModelList({
        type: entityModelTypes.join(),
      })) ?? [];

    if (isReadyOnly) {
      showBasicEntityList.value = info;
    } else {
      editBasicEntityList.value = info;
    }
  }

  /** 根据模型 key 获取模型信息和字段列表 */
  async function getModelDetail2FieldList(modelKey: string) {
    const res = await getModelMetaDetail({
      modelKey,
    });
    return res;
  }

  function setModelFieldToMap(modelKey: string, modelName: string, fieldList: any[] = []) {
    // 模型下的字段列表
    if (!(isReadyOnly ? showModelFieldMap.value : editModelFieldMap.value)[modelKey]) {
      (isReadyOnly ? showModelFieldMap.value : editModelFieldMap.value)[modelKey] = fieldList
        .map((item) => pick(item, ['key', 'name', 'type', 'mappingType']))
        .filter((item) => {
          return ![
            FIELD_TYPE.IMAGE,
            FIELD_TYPE.ATTACHMENT,
            FIELD_TYPE.MASTERSLAVE,
            FIELD_TYPE.USER_MULTI,
            FIELD_TYPE.ORG_MULTI,
            FIELD_TYPE.ENUM_MULTI,
            FIELD_TYPE.REF_MULTI,
            FIELD_TYPE.ESOP,
          ].includes(item.type);
        });
    }

    console.log(editModelFieldMap.value, 'editModelFieldMap');

    if (!(isReadyOnly ? showFilterModelFieldMap.value : editFilterModelFieldMap.value)[modelKey]) {
      (isReadyOnly ? showFilterModelFieldMap.value : editFilterModelFieldMap.value)[modelKey] =
        fieldList
          .filter((item) => {
            return [
              FIELD_TYPE.TEXT,
              FIELD_TYPE.LONG_TEXT,
              FIELD_TYPE.INTEGER,
              FIELD_TYPE.LONG,
              FIELD_TYPE.DOUBLE,
              FIELD_TYPE.DECIMAL,
              FIELD_TYPE.BOOLEAN,
              FIELD_TYPE.DATE,
              FIELD_TYPE.TIME,
              FIELD_TYPE.DATE_TIME,
              FIELD_TYPE.ENUM,
              FIELD_TYPE.ENUM_MULTI,
              FIELD_TYPE.REF,
            ].includes(item.type);
          })
          .map((item) => {
            return {
              ...item,
              modelName,
            };
          });
    }

    console.log(editFilterModelFieldMap.value, 'editFilterModelFieldMap');
  }

  /** 切换主模型 */
  async function changeMainModel(mainModelKey) {
    // 清空数据
    // editJoinConfig.joins = [];

    if (mainModelKey) {
      const info = await getModelDetail2FieldList(mainModelKey);

      if (info) {
        // 模型下的字段列表
        setModelFieldToMap(info.key ?? '', info.name ?? '', info.fieldMetaList);
      }
    }

    // 默认插入一条关联配置
    // editJoinConfig.joins.push({
    editJoinConfig.joins = [
      {
        modelKey: '',
        type: 'INNER',
        onExpressions: [
          {
            leftModelKey: '',
            leftFieldKey: undefined,
            operator: 'equal',
            rightModelKey: '',
            rightFieldKey: undefined,
          },
        ],
      },
    ];
    // }
  }

  /** 切换关联模型 */
  async function changeLinkModel(linkModelKey, index) {
    // 清空数据
    editJoinConfig.joins[index].type = 'INNER';
    // editJoinConfig.joins[index].onExpressions = [];

    if (linkModelKey) {
      const info = await getModelDetail2FieldList(linkModelKey);
      // 模型下的字段列表
      setModelFieldToMap(info?.key ?? '', info?.name ?? '', info?.fieldMetaList);
    }
    // if (info) {
    //   // 模型下的字段列表
    //   setModelFieldToMap(info.key ?? '', info.name, info.fieldMetaList);
    // }

    // 默认插入一条关联条件
    // editJoinConfig.joins[index].onExpressions.push({
    editJoinConfig.joins[index].onExpressions = [
      {
        leftModelKey: linkModelKey,
        leftFieldKey: undefined,
        operator: 'equal',
        rightModelKey: index === 0 ? editJoinConfig.mainModelKey : '',
        rightFieldKey: undefined,
      },
    ];
    // }
  }

  /** 清空条件模型字段 */
  function clearRightFieldKey(_, joinIndex, expIndex, isMain) {
    if (isMain) {
      editJoinConfig.joins[joinIndex].onExpressions[expIndex].leftFieldKey = '';
    } else {
      editJoinConfig.joins[joinIndex].onExpressions[expIndex].rightFieldKey = '';
    }
  }

  /** 新增关联配置 */
  function onAddJoin() {
    editJoinConfig.joins.push({
      modelKey: '',
      type: 'INNER',
      onExpressions: [
        {
          leftModelKey: '',
          leftFieldKey: undefined,
          operator: 'equal',
          rightModelKey: '',
          rightFieldKey: undefined,
        },
      ],
    });
  }

  /** 新建一条关联条件 */
  function handleCreateLinkCondition(joinIndex, expIndex) {
    editJoinConfig.joins[joinIndex].onExpressions.push({
      leftModelKey: editJoinConfig.joins[joinIndex].modelKey,
      leftFieldKey: undefined,
      operator: 'equal',
      rightModelKey: joinIndex === 0 ? editJoinConfig.mainModelKey : '',
      rightFieldKey: undefined,
    });
  }

  /** 删除一条关联条件数据 */
  function handleDeleteLinkCondition(joinIndex, expIndex) {
    if (expIndex === 0) return;
    editJoinConfig.joins[joinIndex].onExpressions.splice(expIndex, 1);
  }

  /** 删除一条关联模型记录 */
  function handleDeleteLinkModel(joinIndex) {
    if (joinIndex === 0) return;

    // todo tangjian 有 bug
    editJoinConfig.joins.splice(joinIndex, 1);
  }

  function validateJoinConfig() {
    let error;
    if (isEmpty(editJoinConfig.mainModelKey)) {
      error = '请选择主模型';
    } else if (editJoinConfig.joins.some((item) => isEmpty(item.modelKey))) {
      error = '请选择关联模型';
    } else {
      editJoinConfig.joins.forEach((item) => {
        if (
          item.onExpressions.some(
            (i) => isEmpty(i.leftFieldKey) || isEmpty(i.rightFieldKey) || isEmpty(i.rightModelKey),
          )
        ) {
          error = t('sys.webRender.saveTip');
          return;
        }
      });
    }

    return error;
  }

  function clearJoinConfig() {
    if (isReadyOnly) {
      showJoinConfig.mainModelKey = '';
      showJoinConfig.joins = [];
      showModelFieldMap.value = {};
      showFilterModelFieldMap.value = {};
      showBasicEntityList.value = [];
    } else {
      editJoinConfig.mainModelKey = '';
      editJoinConfig.joins = [];
      editModelFieldMap.value = {};
      editFilterModelFieldMap.value = {};
      editBasicEntityList.value = [];
    }
  }

  async function setJoinConfig(data) {
    await getModelList();

    const modelKeys = [data.mainModelKey]
      .concat(...(data.joins ?? []).map((item) => item.modelKey))
      .filter((i) => i);

    const lists =
      (await Promise.all(modelKeys?.map((key) => getModelMetaDetail({ modelKey: key })))) ?? [];

    lists.forEach((item: any) => {
      setModelFieldToMap(item.key ?? '', item.name, item.fieldMetaList);
    });

    if (isReadyOnly) {
      showJoinConfig.mainModelKey = data.mainModelKey;
      showJoinConfig.joins = data.joins;
    } else {
      editJoinConfig.mainModelKey = data.mainModelKey;
      editJoinConfig.joins = data.joins;
    }
  }

  return {
    editJoinConfig,
    showJoinConfig,
    showModelFieldMap,
    editModelFieldMap,
    entityList,
    allLinkFieldList,
    filterJoinModelOption,
    filterRightModelOption,
    filterRightFieldOption,
    getModelList,
    getModelDetail2FieldList,
    changeMainModel,
    changeLinkModel,
    clearRightFieldKey,
    onAddJoin,
    handleCreateLinkCondition,
    handleDeleteLinkCondition,
    handleDeleteLinkModel,
    clearJoinConfig,
    validateJoinConfig,
    setJoinConfig,
  };
}
