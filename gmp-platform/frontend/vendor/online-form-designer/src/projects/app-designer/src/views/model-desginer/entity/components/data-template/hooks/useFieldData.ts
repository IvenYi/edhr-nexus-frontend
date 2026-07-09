import { clone, cloneDeep, pick } from 'lodash-es';
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FieldColumnType } from '../type';
import { FIELD_TYPE } from '@/enums/appEnum';
import { getExcelTmplInfo } from '/@/apis/gct-apaas/ExcelTmplController';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

const modelKey = ref(); // 当前实体模型的id
const fieldsCache = ref(); // 全部字段的缓存
const dataTplId = ref(); // 当前模板的id
const exclePath = ref(''); // 文件路径

const defaultColSetting: FieldColumnType = {
  name: '',
  aliasName: '',
  bindInfo: '',
  createType: '',
  columnWidth: 20,
  dateFormat: '',
  digits: 1,
  dataDelimiter: '',
  fieldDelimiter: '',
  id: '',
  key: '',
  relationColumns: [],
  required: 0,
  treeNodeColumnField: '',
  type: '',
  userDefined: '',
  regularExp: '',
  regularExpForShow: '',
  valueMap: [
    {
      comment: '',
      value: 'TRUE',
    },
    {
      comment: '',
      value: 'FALSE',
    },
  ],
  checked: false,
  fieldDisabled: false,
  columnDisabled: false,
};

const defaultDataTpl = reactive({
  duplicateKeyUpdate: 1,
  notes: '注意：1.名称不能为空 2.编码不能为空 3.父节点不能为空',
  rowHeight: 100,
  uniqueColumns: [],
});

export function useFieldData() {
  const route = useRoute();
  const fields = ref();
  modelKey.value = route.params.modelKey;
  dataTplId.value = route.params.tplId;

  async function getFieldMeta(isImport: boolean) {
    const data = {
      modelKey: modelKey.value,
      sys: true,
    };
    const responseData = (await getFieldMetaList(data)) || [];
    // 左侧列表字段不包含系统字段，只包含自定义字段及内置字段
    const initData = responseData
      .filter((item) => item.createType !== 'SYSTEM' || isImport)
      .map((item) => {
        const colSetting = cloneDeep(defaultColSetting);
        Object.keys(item).forEach((k) => {
          if (Reflect.has(colSetting, k)) {
            colSetting[k] = item[k];
          }
          if (k == 'name') {
            colSetting.aliasName = item.name || '';
          }

          // 必填字段自动选中，无法取消
          if (!isImport && k === 'required' && item[k] === 1) {
            colSetting.checked = true;
            colSetting.fieldDisabled = true;
            colSetting.columnDisabled = true;
          }
        });
        // 父节点id是必须要填
        if (
          item.createType === 'BUILTIN' &&
          ['parent_id_', 'name_', 'version_'].includes(item.key as string)
        ) {
          colSetting.checked = true;
          colSetting.fieldDisabled = true;
          if (['name_', 'version_'].includes(item.key as string)) {
            colSetting.required = 1;
            colSetting.columnDisabled = true;
          }
        }
        // 父节点集合、序列号不能选择
        if (
          (item.createType === 'BUILTIN' && item.key === 'full_path_') ||
          item.type === FIELD_TYPE.SERIAL
        ) {
          colSetting.checked = false;
          colSetting.fieldDisabled = true;
        }

        return colSetting;
      });
    return initData;
  }

  // 设置
  function setExcelPath(path: string) {
    exclePath.value = path;
  }

  async function getDataTplConfigJson({ isImport } = {}) {
    const initColumns = (await getFieldMeta(isImport)) || [];
    const indexes: number[] = [];
    // 所有 rdo 引用属性
    const rdoRefs = initColumns.filter((col, i) => {
      if (col.type === FIELD_TYPE.RDO_REF) {
        indexes.push(i);
        return true;
      }
      return false;
    });
    rdoRefs.forEach((rdoItem, i) => {
      const index = indexes[i];
      const data = clone(rdoItem);
      data.id = `${data.id}_version_`;
      data.key = `${data.key}_version_`;
      data.aliasName = `${data.aliasName || ''}版本`;
      data.name = `${data.name || ''}版本`;
      data.fieldDisabled = true;
      initColumns.splice(index + 1, 0, data);
    });
    const res = (await getExcelTmplInfo({ id: dataTplId.value })) || {};
    if (!res.configJson) fieldsCache.value = initColumns;
    if (res.configJson) {
      const configJson = JSON.parse(res?.configJson);
      const { columns, duplicateKeyUpdate, notes, rowHeight, uniqueColumns } = configJson;

      const configColumn = initColumns.map((col) => {
        const info = columns.find((item) => col.id == item.id);
        if (info) {
          return {
            ...info,
            checked: true,
            ...pick(col, ['name', 'fieldDisabled', 'columnDisabled']),
          };
        }
        return col;
      });
      fields.value = configColumn;
      fieldsCache.value = configColumn;
      defaultDataTpl.duplicateKeyUpdate = duplicateKeyUpdate;
      defaultDataTpl.notes = notes;
      defaultDataTpl.rowHeight = rowHeight;
      defaultDataTpl.uniqueColumns = uniqueColumns;
    }

    // rdo模型数据唯一判断规则默认设置成rdo名称和rdo版本
    if (res.modelType === 'RDO') {
      defaultDataTpl.uniqueColumns = ['name_', 'version_'];
    }
  }

  // getDataTplConfigJson();

  return {
    modelKey: modelKey.value,
    dataTplId: dataTplId.value,
    fields: fieldsCache,
    defaultDataTpl,
    exclePath,
    setExcelPath,
    getDataTplConfigJson,
  };
}
