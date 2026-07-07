import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
import { uuid2 } from '@/utils/uuid';

type FieldLike = Record<string, any>;

function normalizeFieldKey(type?: string, index = 1) {
  const prefix = String(type || 'field')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${prefix || 'field'}_${index}`;
}

function collectFieldKeysFromPaper(paper: any, used: Set<string>) {
  paper?.cells?.forEach?.((row: any[]) => {
    row.forEach((cell) => {
      const fields = [cell?.fieldMeta, ...(cell?.multiFieldsContent ?? []).map((item) => item?.fieldMeta)];
      fields.forEach((field) => {
        if (field?.model && field?.field) {
          used.add(`${field.model}.${field.field}`);
        }
      });
    });
  });
}

export function calcUsedFields(opts: { paper?: any; sheets?: Array<{ paper?: any }> } = {}) {
  const used = new Set<string>();
  collectFieldKeysFromPaper(opts.paper, used);
  opts.sheets?.forEach((sheet) => collectFieldKeysFromPaper(sheet.paper, used));
  return [...used];
}

export function useReverseModeling() {
  const { modelMetaMap } = useModelFields();

  function getModelFields(modelKey?: string) {
    if (!modelKey) return [];
    if (!modelMetaMap.value[modelKey]) {
      modelMetaMap.value[modelKey] = { meta: { key: modelKey, name: modelKey }, fields: [] };
    }
    return modelMetaMap.value[modelKey].fields;
  }

  function initialize() {}
  function clearUnusedModel() {}

  function getFieldDTO(opts: { type?: string; model?: string; refModel?: string; tableType?: string }) {
    const fields = getModelFields(opts.model);
    let index = fields.length + 1;
    let key = normalizeFieldKey(opts.type, index);
    while (fields.some((field) => field.key === key)) {
      index += 1;
      key = normalizeFieldKey(opts.type, index);
    }

    return {
      id: uuid2(),
      key,
      name: key,
      type: opts.type,
      modelKey: opts.model,
      bindInfo: opts.refModel,
      defaultValue: {
        type: 'NONE',
        value: undefined,
      },
      uniqueConstraint: {
        type: 'NONE',
        fieldKeys: undefined,
      },
      createType: 'CUSTOM',
      tableType: opts.tableType,
    };
  }

  function getFieldConfig(fieldType?: string) {
    return {
      specificConfig: {
        displayRule: {
          exp: fieldType === 'MFG_ORDER' ? 'code_' : 'name_',
          relationColumns: [fieldType === 'MFG_ORDER' ? 'code_' : 'name_'],
        },
      },
    };
  }

  function addField(field: FieldLike) {
    const modelKey = field.modelKey || field.model;
    const fields = getModelFields(modelKey);
    if (!fields.some((item) => item.key === field.key)) {
      fields.push(field);
    }
  }

  function addSubModel(model: FieldLike = {}) {
    const key = model.key || model.modelKey || `sub_model_${Object.keys(modelMetaMap.value).length + 1}`;
    if (!modelMetaMap.value[key]) {
      modelMetaMap.value[key] = {
        meta: {
          key,
          name: model.name || key,
          subModel: 1,
          subModelType: model.subModelType,
        },
        fields: [],
      };
    }
    return modelMetaMap.value[key];
  }

  function removeField(opts: { fieldKey?: string; modelKey?: string }) {
    const fields = getModelFields(opts.modelKey);
    const index = fields.findIndex((field) => field.key === opts.fieldKey);
    if (index >= 0) {
      fields.splice(index, 1);
    }
  }

  function updateField(field: FieldLike) {
    const fields = getModelFields(field.modelKey || field.model);
    const index = fields.findIndex((item) => item.key === field.key);
    if (index >= 0) {
      fields[index] = {
        ...fields[index],
        ...field,
      };
    }
  }

  function findField(opts: { fieldKey?: string; modelKey?: string }) {
    return getModelFields(opts.modelKey).find((field) => field.key === opts.fieldKey);
  }

  function getAllFieldVos() {
    return Object.values(modelMetaMap.value).flatMap((model: any) => model.fields ?? []);
  }

  function validateOnlyBusinessKey() {
    return true;
  }

  function isStashedField() {
    return false;
  }

  function isPresetField(field: FieldLike) {
    return ['BUILTIN', 'SYSTEM'].includes(field?.createType);
  }

  return {
    initialize,
    getFieldDTO,
    getFieldConfig,
    addField,
    addSubModel,
    removeField,
    updateField,
    findField,
    clearUnusedModel,
    getAllFieldVos,
    validateOnlyBusinessKey,
    isStashedField,
    isPresetField,
  };
}
