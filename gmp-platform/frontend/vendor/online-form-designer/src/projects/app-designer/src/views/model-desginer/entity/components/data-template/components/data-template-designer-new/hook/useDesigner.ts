import { computed, ref, watch, nextTick } from 'vue';
import {
  getExcelTmplInfo,
  postExcelTmpl,
  putExcelTmplById,
  postExcelTmplV1Config,
} from '/@/apis/gct-apaas/ExcelTmplController';

import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
import { pick } from 'vant/es/utils';
import { DataTemplateEnum, ImportModeEnum } from '../../../type';
import { cloneDeep, omit } from 'lodash-es';
import { COLUMN_FIELD, PickKeys, TEMPLATE_MODEL_MAPPING } from '../../../constant/columns';
import { getViewModelInfo } from '/@/apis/gct-apaas/ViewModelController';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
import { EntityModelTypeEnum } from '/@app-designer/enum';
import { uuid2 } from '/@/utils/uuid';
import { useKeyParser } from '/@/hooks/develop/useKeyParser';

const RDO_FIELD_TYPE_LIST = [
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  FIELD_TYPE.E_DHR_TEMPLATE,
];

const treeData = ref<any[]>([]);
const modelColumns = ref<any[]>([]);
const tableColumns = ref<any[]>([]);
const tmplInfo = ref<object>({});
const modelDetail = ref<object>({});
const expandedTreeKeys = ref<string[]>([]);
const activeModel = ref<string>();

const eventInfo = ref<{
  lsKey?: string;
  vsKey?: string;
  exeType?: number;
}>({});

const exportModel = ref<ImportModeEnum[]>([
  ImportModeEnum.NEW,
  ImportModeEnum.NEW_UPDATE,
  ImportModeEnum.UPDATE,
]);
const treeSpinning = ref(false);
const isBasicMounted = ref(true);
const isMounted = ref(true);
const hasChanged = ref<boolean>(false);
const basicChanged = ref<boolean>(false);

const addonBefore = computed(() => {
  return tmplInfo.value?.type?.toLowerCase();
});

const { keyClip, keyPad, keyPrefix, keySuffix } = useKeyParser(addonBefore);

watch(
  () => tmplInfo.value,
  () => {
    if (!isBasicMounted.value) {
      basicChanged.value = true;
      console.log('basic-change--');
    } else basicChanged.value = false;
  },
  {
    deep: true,
    immediate: false,
  },
);

watch(
  () => [exportModel.value, modelColumns.value, tableColumns.value],
  (val) => {
    if (!isMounted.value) {
      hasChanged.value = true;
      console.log('config-change--', val);
    } else hasChanged.value = false;
  },
  {
    deep: true,
  },
);

export function useDesigner() {
  // 初始化模板基本信息
  async function init(model, id?) {
    isBasicMounted.value = true;
    isMounted.value = true;
    tmplInfo.value = {
      type: model.type === 'QUERY' ? DataTemplateEnum.EXPORT : DataTemplateEnum.IMPORT,
    };
    modelDetail.value = { ...model };
    treeData.value = [];
    modelColumns.value = [];
    tableColumns.value = [];
    expandedTreeKeys.value = [];
    activeModel.value = '';
    if (id) {
      await getTmplInfo(id, model.type);
      await initConfig();
    } else {
      tmplInfo.value.key = uuid2(6);
      eventInfo.value = {
        exeType: undefined,
        lsKey: undefined,
        vsKey: undefined,
      };
    }
    setTimeout(() => {
      isBasicMounted.value = false;
      isMounted.value = false;
    });
  }

  // 查询模板信息
  async function getTmplInfo(id, type) {
    const res: ExcelTmplResponse =
      (await getExcelTmplInfo({
        id,
        modelType: type === 'QUERY' ? 'view' : undefined,
      })) || {};
    Object.assign(tmplInfo.value, pick(res, ['name', 'type', 'id']));
    await nextTick();
    tmplInfo.value.key = keyClip(res.key!);
    const json = res.configJson ? JSON.parse(res.configJson) : undefined;
    tmplInfo.value.configJson = json
      ? Array.isArray(json)
        ? json
        : [
            {
              ...json,
              modelKey: res.modelKey,
            },
          ]
      : undefined;
    eventInfo.value = pick(res, ['exeType', 'lsKey', 'vsKey']);
  }

  // 初始化模板配置信息
  async function initConfig() {
    isMounted.value = true;
    treeData.value = [
      {
        ...modelDetail.value,
        subModel: 0,
        class: 'tree-level-1',
      },
    ];
    if (!treeData.value[0].children?.length) await getFieldList();
    if (!modelColumns.value?.length) getTmplConfig();
    if (tmplInfo.value.type === DataTemplateEnum.IMPORT && modelColumns.value.length) {
      exportModel.value = modelColumns.value[0]?.configJson?.duplicateKeyUpdate || [0, 1, 2];
    }
    expandedTreeKeys.value = modelDetail.value?.id ? [modelDetail.value.id] : [];
    setTimeout(() => {
      isMounted.value = false;
    });
  }

  // 模板配置信息
  const getTmplConfig = () => {
    if (!tmplInfo.value?.configJson) return;
    modelColumns.value = [];
    const configJsons = tmplInfo.value?.configJson || [];
    const treeDataFields = treeData.value.map((e) => e.children || []).flat();
    const computedFields = [];
    treeDataFields.forEach((e) => {
      computedFields.push(...returnFields(e));
    });

    configJsons.forEach((e) => {
      const modelObj = treeData.value.find((f) => f.key === e.modelKey);
      const obj = {
        ...omit(e, ['columns', 'uniqueColumns', 'duplicateKeyUpdate', 'required']),
        key: e.modelKey,
        name: modelObj.name,
        subModel: modelObj.subModel,
        bindField: modelObj.bindField,
        id: modelObj.id,
        children:
          e.columns
            ?.filter((e) => computedFields.some((f) => e.id === f.id))
            .map((e) => {
              return {
                ...e,
                // 版本模型字段历史数据兼容
                required: e.type === FIELD_TYPE.RDO_REF ? false : e.required,
                name: treeDataFields.find((f) => f.id === e.id)?.name || '',
                bindInfo: e.bindInfo,
                notNeedRequired: (e.disabled && e.required) || e.type === FIELD_TYPE.BOOLEAN,
                slots: {
                  header: 'header',
                },
              };
            }) || [],
      };
      if (tmplInfo.value.type === DataTemplateEnum.IMPORT) {
        obj['configJson'] = {
          duplicateKeyUpdate: e.duplicateKeyUpdate,
          required: (e.required || [])
            .filter((e) => computedFields.some((f) => e.id === f.id))
            .map((e) => e.id),
          uniqueColumns: (e.uniqueColumns || [])
            .filter((e) => computedFields.some((f) => e.id === f.id))
            .map((e) => e.id),
        };
      }
      modelColumns.value.push(obj);
    });
    modelColumns.value.forEach((e) => {
      const children = e.children.map((f) => {
        return {
          ...cloneDeep(f),
          params: cloneDeep(f),
        };
      });
      if (!e.subModel) {
        tableColumns.value.push(...children);
      } else {
        tableColumns.value.push({
          modelKey: e.key,
          name: e.bindField?.name,
          title: e.bindField?.name + '（子表）',
          subModel: 1,
          children,
        });
      }
    });
    activeModel.value = modelColumns.value[0].id;
  };

  // 初始化字段tree
  async function getFieldList() {
    if (modelDetail.value.type !== 'QUERY') {
      treeSpinning.value = true;
      const master = await getFieldsFunc(modelDetail.value?.key);
      const subTableModels = (master.model.fieldMetaList || []).filter(
        (e) => e.type === FIELD_TYPE.MASTERSLAVE,
      );
      treeData.value[0].children = master.fields?.filter((e) => e.type !== FIELD_TYPE.MASTERSLAVE);
      const fnList: any[] = subTableModels.map((e) =>
        getFieldsFunc(e.bindInfo, { bindField: { ...e } }),
      );
      const results = await Promise.all(fnList);
      treeSpinning.value = false;
      results.forEach((e) => {
        treeData.value.push({
          ...omit(e.model, ['fieldMetaList']),
          bindField: e.bindField,
          children: e.fields,
          class: 'tree-level-1 subModel',
        });
      });
      // 默认勾选且不可取消的字段
      if (!tmplInfo.value?.configJson) {
        treeData.value.forEach((e) => {
          const dcfs: any = [];
          e.children?.forEach((f) => {
            if (f.checked && f.disabled) {
              dcfs.push(...returnFields(f));
            }
          });
          if (dcfs.length) {
            modelColumns.value.push({ ...e, children: dcfs });
            if (e.subModel) {
              tableColumns.value.push({
                title: e.bindField?.name + '（子表）',
                name: e.bindField?.name,
                modelKey: e.key,
                subModel: 1,
                children: [...dcfs],
              });
            } else {
              tableColumns.value.push(...dcfs);
            }
            if (!activeModel.value) activeModel.value = e.id;
          }
        });
      }
    } else {
      const queryInfo = (await getViewModelInfo({ id: modelDetail.value.id })) || {};
      const res = queryInfo.fieldConfig?.fields || [];
      treeData.value[0].children = res
        .filter((e) => {
          const fieldTypes =
            TEMPLATE_MODEL_MAPPING[tmplInfo.value?.type || DataTemplateEnum.EXPORT][
              modelDetail.value?.type
            ].fields || [];
          return fieldTypes.includes(e.type);
        })
        .map((e) => {
          return { ...e, modelKey: e.originModelKey };
        });
    }
  }

  async function getFieldsFunc(modelKey, params?) {
    return new Promise((resolve) => {
      getModelMetaDetail({
        modelKey,
      }).then((res) => {
        const fields = filterFieldsByType(res.fieldMetaList || [], res.type);
        resolve({ fields, model: res, ...params });
      });
    });
  }

  function filterFieldsByType(data, modelType) {
    return data
      .filter((e) => {
        const fieldTypes =
          TEMPLATE_MODEL_MAPPING[tmplInfo.value?.type || DataTemplateEnum.IMPORT][modelType]
            .fields || {};
        if (e.createType === CreateType.BUILTIN) {
          return (
            (fieldTypes[e.createType]?.includes(e.type) && e.initCommitId === '__0000__') ||
            (fieldTypes[e.createType]?.includes(e.key) && e.initCommitId !== '__0000__') ||
            e.rdoUniqueFieldKey
          );
        } else {
          return fieldTypes[e.createType]?.includes(
            e.createType === CreateType.SYSTEM ? e.key : e.type,
          );
        }
      })
      .map((e) => {
        /**rdo特定标识 */
        const rdoUniqueFieldKey =
          e.rdoUniqueFieldKey && tmplInfo.value.type === DataTemplateEnum.IMPORT;
        // RDO、NDO默认勾选且不可取消的字段
        const disabledFields =
          TEMPLATE_MODEL_MAPPING[tmplInfo.value?.type || DataTemplateEnum.IMPORT][modelType]
            .disabled || {};
        const isDisabled = disabledFields[e.createType]?.includes(e.key);
        const disabledModelTypes = [EntityModelTypeEnum.RDO, EntityModelTypeEnum.NDO];
        return {
          ...e,
          checked: isDisabled || rdoUniqueFieldKey,
          disabled: isDisabled || rdoUniqueFieldKey,
          notNeedRequired:
            (isDisabled && disabledModelTypes.includes(modelType)) ||
            e.type === FIELD_TYPE.BOOLEAN ||
            rdoUniqueFieldKey,
          required:
            tmplInfo.value.type === DataTemplateEnum.IMPORT &&
            ((isDisabled && disabledModelTypes.includes(modelType)) ||
              e.type === FIELD_TYPE.BOOLEAN ||
              rdoUniqueFieldKey),
        };
      });
  }

  // 树-选择字段
  function onFieldTreeCheck(ckeys, e, callback?) {
    const { node, checked } = e;
    const nodeData = cloneDeep(node.dataRef);
    if (!checked) {
      clearUncheckedField(nodeData);
    }
    if (!node.parent) {
      if (checked) {
        const modelObj: any = modelColumns.value.find((e) => e.id === nodeData.id);
        if (!modelObj && nodeData.children.length) {
          const children = cloneDeep(nodeData.children);
          nodeData.children = [];
          const tObj: any = {
            title: nodeData.bindField?.name + '（子表）',
            name: nodeData.bindField?.name,
            modelKey: nodeData.key,
            subModel: 1,
            children: [],
          };
          if (!nodeData.subModel) {
            modelColumns.value.unshift(nodeData);
          } else {
            modelColumns.value.push(nodeData);
            tableColumns.value.push(tObj);
          }
          children.forEach((e) => {
            nodeData.children.push(...returnFields(e));
            if (!node.subModel) {
              tableColumns.value.push(...returnFields(e));
            } else {
              tObj.children.push(...returnFields(e));
            }
          });
        } else {
          const notExistFields = nodeData.children.filter(
            (e) => !modelObj.children.some((f) => e.id === f.id),
          );
          notExistFields.forEach((e) => {
            const cLength = modelObj.children.length;
            modelObj.children.push(...returnFields(e));
            if (modelObj.subModel) {
              const obj = tableColumns.value.find((e) => e.modelKey === modelObj.key);
              obj.children.push(...returnFields(e));
            } else {
              tableColumns.value.splice(cLength, 0, ...returnFields(e));
            }
          });
        }
      } else {
        const deleteFields: any = [];
        nodeData.children.forEach((e) => {
          if (!e.disabled || !e.checked) {
            deleteFields.push(...returnFields(e));
          }
        });
        const deleteIds = deleteFields.map((e) => e.id);
        const modelObj = modelColumns.value.find((e) => e.id === nodeData.id) || {};
        modelObj.children = modelObj.children.filter((e) => !deleteIds.includes(e.id));
        if (!modelObj.children.length) {
          modelColumns.value = modelColumns.value.filter((e) => e.id !== nodeData.id);
        }
        if (modelObj.subModel) {
          const idx = tableColumns.value.findIndex((e) => e.modelKey === nodeData.id);
          const obj = tableColumns.value.find((e) => e.modelKey === nodeData.id);
          obj.children = obj.children.filter((e) => !deleteIds.includes(e.id));
          if (!obj.children.length && idx > -1) tableColumns.value.splice(idx, 1);
        } else {
          tableColumns.value = tableColumns.value.filter((e) => !deleteIds.includes(e.id));
        }
      }
    } else {
      modelColumnsData(node, checked, callback);
    }
    if (!modelColumns.value.some((e) => e.id === activeModel.value)) {
      activeModel.value = modelColumns.value[0]?.id;
    }
  }

  function modelColumnsData(node, checked, callback?) {
    const nodeData = cloneDeep(node.dataRef);
    const pModel = cloneDeep(node.parent.node);
    const modelObj: any = modelColumns.value.find((e) => e.id === pModel.id);
    const tObj: any = {
      title: pModel.bindField?.name + '（子表）',
      name: pModel.bindField?.name,
      modelKey: pModel.key,
      subModel: 1,
      children: [],
    };
    if (!modelObj) {
      pModel.children = [];
      if (!pModel.subModel) {
        modelColumns.value.unshift(pModel);
        tableColumns.value.unshift(...returnFields(nodeData));
      } else {
        modelColumns.value.push(pModel);
        tableColumns.value.push(tObj);
      }
      tObj.children.push(...returnFields(nodeData));
      pModel.children.splice(0, 0, ...returnFields(nodeData));
    } else if (!checked) {
      const idx = modelObj.children?.findIndex((e) => e.id === nodeData.id);
      modelObj.children.splice(idx, 1);
      if (RDO_FIELD_TYPE_LIST.includes(nodeData.type)) {
        const vIdx = modelObj.children?.findIndex((e) => e.id === `${nodeData.id}_version_`);
        modelObj.children.splice(vIdx, 1);
      }
      modelColumns.value = modelColumns.value.filter((e) => e.children?.length);
      if (modelObj.subModel) {
        const obj = tableColumns.value.find((e) => e.modelKey === pModel.id);
        const tIdx = obj.children.findIndex((e) => e.id === nodeData.id);
        if (tIdx > -1) obj.children.splice(tIdx, 1);
        if (RDO_FIELD_TYPE_LIST.includes(nodeData.type)) {
          const vIdx = obj.children?.findIndex((e) => e.id === `${nodeData.id}_version_`);
          obj.children.splice(vIdx, 1);
        }
      } else {
        tableColumns.value = tableColumns.value.filter(
          (e) =>
            !(
              e.id === nodeData.id ||
              (RDO_FIELD_TYPE_LIST.includes(nodeData.type) && e.id === `${nodeData.id}_version_`)
            ),
        );
      }
      tableColumns.value = tableColumns.value.filter((e) => !e.children || e.children.length);
    } else {
      modelObj.children.push(...returnFields(nodeData));
      if (modelObj.subModel) {
        const obj = tableColumns.value.find((e) => e.modelKey === pModel.id);
        obj.children.push(...returnFields(nodeData));
        callback && callback();
      } else {
        tableColumns.value.splice(modelObj.children.length - 1, 0, ...returnFields(nodeData));
      }
    }
  }

  // 取消勾选时，清除相关的配置项
  function clearUncheckedField(field) {
    const { modelKey, id } = field;
    if (tmplInfo.value.type !== DataTemplateEnum.IMPORT) return;
    modelColumns.value.forEach((e) => {
      if (e.key === modelKey) {
        const filteredNodes = returnFields(field).map((e) => e.id);
        e.configJson.required =
          e.configJson.required?.filter((e) => !filteredNodes.includes(e)) || [];
        e.configJson.uniqueColumns =
          e.configJson.uniqueColumns?.filter((e) => !filteredNodes.includes(e)) || [];
      }
    });
  }

  // 树-选中时，标准化字段信息
  function returnFields(node) {
    const obj = {
      ...cloneDeep(COLUMN_FIELD),
      ...pick(node, PickKeys),
    };

    if (RDO_FIELD_TYPE_LIST.includes(node.type)) {
      obj.aliasName = `${node.name || ''}-版本名称`;
      obj.name = `${node.name || ''}-版本名称`;
      const versionNode = {
        ...obj,
        id: `${node.id}_version_`,
        key: `${node.key}_version_`,
        aliasName: `${node.name || ''}-版本号`,
        name: `${node.name || ''}-版本号`,
      };
      return [
        { ...obj, params: { ...obj } },
        { ...versionNode, params: { ...versionNode } },
      ];
    } else {
      return [{ ...obj, params: { ...obj } }];
    }
  }

  // 保存模板基本信息
  async function saveBasic() {
    const data = {
      ...tmplInfo.value,
      modelKey: modelDetail.value?.key,
      version: 1,
      key: keyPad(tmplInfo.value.key),
    };
    if (tmplInfo.value.id) {
      await putExcelTmplById({ id: tmplInfo.value.id }, data);
    } else {
      const id = await postExcelTmpl(data);
      tmplInfo.value.id = id;
    }
  }

  function updateColumn(mId, fId) {
    console.log('update', tableColumns.value, mId, fId);
    let obj = tableColumns.value.find((e) => mId === e.modelKey && fId === e.id);
    if (!obj) {
      const mObj = tableColumns.value.find((e) => e.modelKey === mId);
      obj = mObj?.children.find((e) => fId === e.id);
    }
    return obj?.params || {};
  }

  async function saveConfig(isEdit = false) {
    const data = {
      configJsons: modelColumns.value!.map((e) => {
        const obj = {
          columns: e.children.map((f) => {
            const fObj = updateColumn(f.modelKey, f.id);
            return {
              ...f,
              width: fObj.width,
              aliasName: fObj.aliasName,
            };
          }),
          type: e.subModel ? 2 : 1,
          modelKey: e.key,
          rowHeight: 100,
          relationColumnName: e.subModel ? e.bindField?.name : undefined,
          relationColumnKey: e.subModel ? e.bindField.key : undefined,
        };
        if (tmplInfo.value.type === DataTemplateEnum.IMPORT) {
          const { required, uniqueColumns } = e.configJson;
          obj.duplicateKeyUpdate = exportModel.value;
          obj.required = e.children.filter((f) => required.includes(f.id));
          obj.uniqueColumns = e.children.filter((f) => uniqueColumns.includes(f.id));
        }
        return obj;
      }),
      key: keyPad(tmplInfo.value.key),
      modelKey: modelDetail.value.key,
      modelTemplateName: tmplInfo.value.name,
      ...eventInfo.value,
    };
    await postExcelTmplV1Config(data, {
      transferToConfig: { headers: { operateType: isEdit ? 'UPDATE' : 'INSERT' } },
    });
    hasChanged.value = false;
  }

  return {
    tmplInfo,
    modelDetail,
    eventInfo,
    init,
    getTmplInfo,
    saveBasic,
    basicChanged,

    hasChanged,
    activeModel,
    modelColumns,
    tableColumns,
    treeData,
    initConfig,
    exportModel,
    saveConfig,

    treeSpinning,
    onFieldTreeCheck,
    expandedTreeKeys,

    keyClip,
    keyPad,
    keySuffix,
    keyPrefix,
    addonBefore,
  };
}
