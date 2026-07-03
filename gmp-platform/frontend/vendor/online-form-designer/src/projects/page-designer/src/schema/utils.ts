import { cloneDeep, merge, difference, without, pick, get, has } from 'lodash-es';
import { buildShortUUID } from '/@/utils/uuid';
import allWidgetInfo from '../schema';
import { LowCodeWidget } from '../types/widget-basic-types';
import { Platform, transformBindCmp2CmpType, FormComponents } from '../enum';
import { platform } from '../hooks/usePage';
import { useI18n } from '/@/hooks/web/useI18n';
import { Mapping } from '/@page-designer/types/web/widget-types';
import { FIELD_TYPE, CreateType, MaterialEnum, FieldIconMap } from '/@/enums/appEnum';
import { transformField2Component, basicAttrsUtils } from './field/form/utils';
import { transformField2SearchComponent, basicSearchAttrsUtils } from './field/search/utils';
import { fieldFormSchema, fieldFormBeforeCreate } from './field/form/index';
import { eachTree } from '/@/utils/helper/treeHelper';
import { searchFieldCmpSchema } from './field/search/index';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import { runWidget, runSubtableFieldWidget } from './field/data-table-column';
import { useAsyncOperateField } from '/@page-designer/components/widgets/hooks/useAsyncFields';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

const { t } = useI18n();
const { unBindAsyncStatus } = useAsyncOperateField();
/**
 * 根据type 生成schema
 * @param type
 * @returns
 */
export function createWidgetByType<T extends keyof Mapping>(type: T): Mapping[T] {
  let widgets;
  if (platform.value === Platform.MOBILE) {
    widgets = allWidgetInfo.mobileWidgetSchema;
  } else if (platform.value === Platform.PAD) {
    widgets = allWidgetInfo.padWidgetSchema;
  } else {
    widgets = allWidgetInfo.webWidgetSchema;
  }
  const widgetSchema = widgets[type];
  return cloneWidget<T>(widgetSchema);
}
export function createFieldWidgetByType(type) {
  const widgets = fieldFormSchema;
  const widgetSchema = widgets[type];
  return cloneWidget(widgetSchema);
}
/**复制组件的方法,后续有TODO项 如拖拽进了栅格或一些自带组件的组件后 需要自动添加子组件的ID */
export function cloneWidget<T extends keyof Mapping>(
  widgetSchema: LowCodeWidget.BasicSchema,
): Mapping[T] {
  const instance = cloneDeep(widgetSchema);
  instance.id = buildShortUUID(instance.type);
  instance.alias = t(instance.name);
  if (instance.formItem) {
    instance.props.label = t(instance.name);
  }
  if (instance.platform === Platform.WEB) {
    allWidgetInfo.webWidgetBeforeCreate[instance.type]?.(instance);
  } else if (instance.platform === Platform.PAD) {
    allWidgetInfo.padWidgetBeforeCreate?.[instance.type]?.(instance);
  } else {
    allWidgetInfo.mobileWidgetBeforeCreate[instance.type]?.(instance);
  }
  transformI18n(instance.props);
  return instance as any;
}

/**
 *
 * @param data 字段信息
 * @param param1.materialType 字段所属类型
 * @param param1.preLocation 字段所属组件id(组件标识)
 * @returns
 */

export function beginDrag(
  data: { [key: string]: any; type: FIELD_TYPE },
  { materialType = MaterialEnum.MaterialFormField, preLocation = '' } = {},
): LowCodeWidget.FieldSchema {
  console.log(data, materialType, preLocation);
  // console.log('tlog beginDrag start ===> fieldInfo', data);
  // 这里clone一下，不污染组件的基础配置
  const cloneData = cloneDeep(data);
  // ! 字段这边 别名和字段名称初始值都是 data.name
  const basic = {
    id: buildShortUUID(cloneData.type),
    platform: platform.value,
    name: `sys.pageDesigner.fieldCmp.${cloneData.type}`,
    icon: FieldIconMap[cloneData.type],
    alias: cloneData.name,
    isField: true,
    materialType: materialType || MaterialEnum.MaterialFormField,
    preLocation,
  };

  const { cmpKey, attrsTransform = [] } =
    transformField2Component(
      (() => {
        if (data.createType === CreateType.SYSTEM) {
          return FIELD_TYPE.SERIAL;
        }
        //树模型全路径只读
        if (data.createType === CreateType.BUILTIN && data.key === 'full_path_') {
          return FIELD_TYPE.SERIAL;
        }
        if (data.createType === CreateType.BUILTIN) {
          // 新版edhr需要
          if (
            cloneData.modelType === EntityModelTypeEnum.DYNAMIC_FORM ||
            cloneData.modelType === 'CHECK_LIST'
          ) {
            if (cloneData.key === 'type_') {
              return FormComponents.DynamicFormType;
            } else if (cloneData.key === 'value_' || cloneData.key === 'default_value_') {
              return FormComponents.DynamicFormValue;
            } else if (cloneData.key === 'options_') {
              return FormComponents.DynamicFormOpts;
            } else if (cloneData.key === 'show_type_') {
              return FormComponents.DynamicFormShowType;
            }
          }
          if (cloneData.key === 'workflow_step_nodes_' || cloneData.key === 'operations_') {
            return 'workflow_nodes';
          }
          //rdo 逻辑
          if (
            cloneData.modelType === EntityModelTypeEnum.RDO &&
            cloneData.rdoUniqueFieldKey &&
            !cloneData.isFieldModel
          ) {
            return 'rdo_input';
          }
          //工作流
          if (
            (cloneData.key === 'name_' || cloneData.key === 'table_name_') &&
            cloneData.modelType === EntityModelTypeEnum.WORKFLOW &&
            !cloneData.isFieldModel
          ) {
            return 'rdo_input';
          }
        }
        if (
          cloneData.type === FIELD_TYPE.MASTERSLAVE &&
          cloneData.refModelType === EntityModelTypeEnum.DYNAMIC_FORM
        ) {
          return FormComponents.DynamicTable;
        }
        return cloneData.type;
      })(),
    ) || {};
  const cmp = cloneDeep(fieldFormSchema[cmpKey]);

  const otherAttrs = Object.fromEntries(
    attrsTransform
      .concat(
        ((): any => {
          if (cloneData.isFieldModel) {
            return [...basicAttrsUtils.readonly, ...basicAttrsUtils.bindFieldKey];
          }
          if (
            materialType === MaterialEnum.MaterialTableSelectField ||
            materialType === MaterialEnum.DescriptionsFormField
          ) {
            return [...basicAttrsUtils.readonly];
          }
          return [];
        })(),
      )
      .filter((item) => {
        // 关联字段过滤一些基础属性
        if (
          cloneData.isFieldModel &&
          ['required', 'fieldRequired', 'defaultValue', 'defaultMain', 'defaultSysDate'].includes(
            item.to,
          )
        ) {
          return false;
        }
        if (
          materialType === MaterialEnum.MaterialTableSelectField &&
          ['required', 'fieldRequired'].includes(item.to)
        ) {
          return false;
        }
        return true;
      })
      .map((row: any) => {
        const value = get(cloneData, row.from);
        return [row.to, row.transform ? row.transform(value, cloneData) : value];
      }),
  );

  merge(cmp.props, {
    field: cloneData.key,
    fieldId: cloneData.id,
    fieldType: cloneData.type,
    fieldCodeChain: cloneData.fieldCodeChain, // 字段链路
    isFieldModel: cloneData.isFieldModel, // 是否是模型字段
    isCustomField:
      cloneData.createType === CreateType.CUSTOM ||
      [FIELD_TYPE.DATA_TABLE_FORMULA, FIELD_TYPE.READONLYCMP].includes(cloneData.type), // 表单-自定义显示字段
    label: null,
    fieldName: cloneData.name,
    modelKey: cloneData.modelKey,
    bindModelKey: cloneData.bindInfo,
    uniqueConstraintType: cloneData.uniqueConstraint?.type,
    rdoUniqueFieldKey: cloneData.rdoUniqueFieldKey, //rdoUniqueFieldKey rdo 父显示字段标识
    modeldata: {
      modelCategory: cloneData.modelCategory,
      modelType: cloneData.modelType,
    },
    ...otherAttrs,
  });

  if (cloneData.modelCategory === 'view') {
    merge(cmp.props, {
      fieldReadonly: true,
      readonly: true,
      fieldRequired: false,
      required: false,
    });
  }

  transformI18n(cmp.props);
  const widget = merge(cmp, basic);
  fieldFormBeforeCreate[cmpKey]?.(widget);
  if (materialType === MaterialEnum.MaterialTableField) {
    return runWidget(widget);
  }
  if (
    [MaterialEnum.MaterialSubTableField, MaterialEnum.MaterialTableSelectField].includes(
      materialType,
    ) &&
    (widget.platform === Platform.WEB || widget.platform === Platform.PAD)
  ) {
    return runSubtableFieldWidget(widget);
  }
  if (materialType === MaterialEnum.MaterialSubTableModalField) {
    const { subTableModalId } = useDesigner();

    unBindAsyncStatus(subTableModalId.value);
  }
  console.log(widget, widget.props.readonly, '=====> widget.props.readonly');
  return widget;
}

/**
 * 字段组件拖入布局，更新布局关系之后
 * !暂时不需要这么处理
 */
// export function afterMoveInLayout(widgets, source) {
//   if (source && has(source, 'isField') && source.isField) {
//     // 这里clone一下，不污染数据
//     const dataCenter = cloneDeep(widgets);
//     const widgetList = flatten(dataCenter, '');
//     const cmp = widgetList.find((item) => item.id === source.id);
//     if (cmp) {
//       const paths = cmp.path.split('|').filter((item) => /^form_*/g.test(item));
//       console.log('paths', paths);
//       const preLocation = last(paths);
//       if (preLocation) {
//         merge(source, {
//           materialType: MaterialEnum.MaterialFormField,
//           preLocation: preLocation,
//         });
//       }
//     }
//   }
// }

export function changeCmpData(widget: LowCodeWidget.BasicSchema) {
  const cmpType = transformBindCmp2CmpType[widget.props.bindCompStyleType];
  const cmp = cloneDeep(fieldFormSchema[`${cmpType}`]);
  const sourceWidgetPropsAttrs = Object.keys(widget.props);
  const nowWidgetPropsAttrs = Object.keys(cmp.props);
  const commonAttrs = [
    'field',
    'fieldId',
    'fieldType',
    'fieldName',
    'fieldCodeChain',
    'bindFieldKey',
  ];
  // widgets 要删除一些值，然后加入一些值
  const addAttrs = difference(nowWidgetPropsAttrs, sourceWidgetPropsAttrs);
  const delAttrs = without(difference(sourceWidgetPropsAttrs, nowWidgetPropsAttrs), ...commonAttrs);
  widget.type = cmp.type;
  delAttrs.forEach((attr) => {
    delete widget.props[attr];
  });

  const addRes = pick(cmp.props, addAttrs);

  merge(widget.props, addRes);

  transformI18n(widget.props);
}

/**
 * 初始化国际化处理
 * @param props
 */
export function transformI18n(props: LowCodeWidget.BasicSchema['props']) {
  const reg = /^\$\{(\S+)\}$/;
  for (const key in props) {
    const value = props[key];
    if (reg.test(value)) {
      props[key] = t(value.match(reg)?.[1]);
    }
  }
}

/**
 * 创建搜索字段组件
 * @param data
 * @returns
 */
export function createdSearchField(data): LowCodeWidget.SearchSchema {
  const {
    field,
    fieldId,
    fieldName,
    fieldCodeChain,
    fieldType: comType,
    label,
    bindModelKey,
    modelKey,
    returnType,
    type,
    preLocation,
    isFieldModel,
  } = data;

  const basic = {
    id: buildShortUUID(comType),
    name: `sys.pageDesigner.fieldCmp.${type || comType}`,
    icon: FieldIconMap[type || comType],
    isSearchField: true,
    preLocation,
    platform: platform.value,
  };
  const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(comType)
    ? returnType
    : comType;
  data.fieldType = fieldType;
  const { searchCmpKey, attrsTransform } = transformField2SearchComponent(fieldType) || {};
  if (!searchCmpKey) {
    return undefined as any;
  }
  const searchCmp = cloneDeep(searchFieldCmpSchema[searchCmpKey]);
  const otherAttrs = Object.fromEntries(
    attrsTransform.concat([...basicSearchAttrsUtils.ope] as any).map((row: any) => {
      const value = data[row.from];
      return [row.to, row.transform ? row.transform(value) : value];
    }),
  );

  merge(
    searchCmp.props,
    {
      field,
      fieldId,
      fieldType,
      fieldName,
      fieldCodeChain,
      label,
      modelKey,
      bindModelKey,
      disabled: false,
      readonly: false,
      modeldata: {
        modelCategory: data.modelCategory,
        modelType: data.modelType,
      },
      isFieldModel,
      ...otherAttrs,
    },
    searchCmp.props.placeholder && {
      placeholder: t(searchCmp.props.placeholder),
    },
  );
  if (isFieldModel && fieldCodeChain) {
    searchCmp.props.fieldSearchKey = [...(JSON.parse(fieldCodeChain)?.fieldLink || []), field].join(
      '$',
    );
  }
  return merge(searchCmp, basic);
}

export function setChildrenId(widget) {
  if (widget.children?.length) {
    eachTree(widget.children, (child) => {
      child.id = buildShortUUID(child.type);
      return child;
    });
  }
}

/** 获取组件所属位置 */
export const getCompPos = (widget, fieldType, componentType) => {
  return (
    widget.type === componentType &&
    has(widget, 'preLocation') &&
    new RegExp(`^${fieldType}_`).test(get(widget, 'preLocation'))
  );
};

/** 是否是表单字段类型 */
export const isFormFieldType = (widget) => {
  return [
    MaterialEnum.MaterialFormField,
    MaterialEnum.MaterialSubTableModalField,
    widget.materialType === FormComponents.Descriptions,
  ].includes(widget.materialType as MaterialEnum);
};

/**
 * 递归获取所有非字段组件
 *
 * @param {LowCodeWidget.BasicSchema} item
 * @param {string[]} [types=[]]
 * @returns {*}  {string[]}
 */
export function deepFindNotField(item) {
  return item
    .map((node) => ({ ...node }))
    .filter((node) => {
      if (node.props?.model) {
        return predicate(node);
      }
      node.children = node.children && deepFindNotField(node.children);
      return predicate(node);
    });
}

const predicate = (node) => !node.formItem;
