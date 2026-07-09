import { defineAsyncComponent } from 'vue';
import { FIELD_TYPE } from '/@/enums/appEnum';

import { CreateType } from '@gct/runtime';
import { ComponentTypeEnum, useOnlineFormTransformField2Component } from '@gct/nocode-base';
import type { Component } from 'vue';
import { IComponent } from '/@online-form/views/types/base-core-component';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import type { BaseCoreComponent, IBindField } from '@gct/nocode-base';

function asyncImportClassModules() {
  const modules = import.meta.glob(`./**/index.ts`, {
    import: 'default',
  });
  return modules;
}

/**
 * 按需加载动态组件
 * @returns
 */
// function asyncImportModules() {
//   const modules: Record<string, () => Promise<Component>> = import.meta.glob(
//     `./**/component/*-render.{vue,tsx}`,
//   );
//   return modules;
// }

export class AsyncGctOnlineComponents {
  static componentMap = new Map<string, Component>();
  static widgetClassMap = new Map<string, IComponent>();

  static async init() {
    /**根据文件名引用异步组件 */

    // Object.entries({ ...modules }).forEach(([path, value]) => {
    //   const fileNameWithExtension = path.split('/').pop()!;

    //   const fileNameWithoutExtension = fileNameWithExtension
    //     .split('-render')
    //     .slice(0, -1)
    //     .join('.');
    //   fileNameWithoutExtension &&
    //     AsyncGctOnlineComponents.componentMap.set(
    //       'online-form-' + fileNameWithoutExtension,
    //       value.default,
    //     );
    // });

    const classModules = asyncImportClassModules();

    for (const path in classModules) {
      const module = (await classModules[path]()) as IComponent;

      AsyncGctOnlineComponents.widgetClassMap.set(`online-form-${module.component}`, module);
    }
  }
  static getComponentByType(type: string) {
    return AsyncGctOnlineComponents.componentMap.get('online-form-' + type);
  }

  static getWidgetClassMapByType(type: string) {
    return AsyncGctOnlineComponents.widgetClassMap.get('online-form-' + type);
  }
}

export const getFieldWidget = (fieldInfo, style) => {
  const { fieldMeta, fieldWidget }: { fieldMeta: IBindField; fieldWidget: CellWidget.BasicSchema } =
    fieldInfo || {};

  let compKey;
  // 动态表单【value_】特殊处理

  if (fieldMeta.field === 'value_' && fieldMeta.createType === CreateType.BUILTIN) {
    compKey = ComponentTypeEnum.DynValue;
  } else {
    const { cmpKey } = useOnlineFormTransformField2Component(fieldMeta.fieldType!) || {};
    compKey = cmpKey;
  }

  const widgetClass = AsyncGctOnlineComponents.getWidgetClassMapByType(compKey);

  if (widgetClass && widgetClass.wrapperCmpConfig) {
    const widget = widgetClass.wrapperCmpConfig({
      data: {
        info: {
          field: fieldMeta.field,
          fieldType: fieldMeta.fieldType,
          modelKey: fieldMeta.model,
          modelLink: fieldMeta.modelLink,
          fieldLink: fieldMeta.fieldLink,
          isFieldModel: fieldMeta.isFieldModel,
          subModelKey: fieldMeta.subModelKey,
          subFieldKey: fieldMeta.subFieldKey,
          createType: fieldMeta.createType,
          refModelKey: fieldMeta.refModelKey,
          ...fieldWidget,
        },
        style: style,
      },
    });
    return {
      id: `${compKey}_${Date.now()}_${Math.random().toString(36).substr(2)}`,
      component: compKey,
      ...widget,
    } as BaseCoreComponent.BasicSchema;
  }
};
