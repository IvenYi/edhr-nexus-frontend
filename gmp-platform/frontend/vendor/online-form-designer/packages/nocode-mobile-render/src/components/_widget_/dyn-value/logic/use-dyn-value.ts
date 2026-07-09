import { inject, computed, watch, ref } from 'vue';
import { get, cloneDeep, set, omit } from 'lodash-es';
import { DynCompUtils, IDynConfig } from './dynamic';
import { useCurrentPageFormState, useOnlineFormTransformField2Component } from '@gct/nocode-base';

export function useDynValue(props: any) {
  const widgetSchema = ref();
  const widgetConfig = ref<IDynConfig>();

  const { currentPageFormState } = useCurrentPageFormState();

  const currentRowFormData = computed(() => {
    return currentPageFormState.value?.[props.subtableFieldId!]?.[props.realRowIndex!] ?? {};
  });

  watch(
    () => currentRowFormData.value.type_,
    (newType) => {
      if (newType) {
        const config = DynCompUtils[newType];

        widgetConfig.value = config;

        // const otherAttrs = Object.fromEntries(
        //   config.attrsTransform.map((row: any) => {
        //     const value = get(currentRowFormData.value, row.from);
        //     return [
        //       row.to,
        //       row.transform
        //         ? row.transform(value, config.fieldType, currentRowFormData.value)
        //         : value,
        //     ];
        //   }),
        // );

        const otherAttrs = config.attrsTransform.reduce((acc, row) => {
          const value = get(currentRowFormData.value, row.from);
          const transformedValue = row.transform
            ? row.transform(value, config.fieldType, currentRowFormData.value, props.widget.props)
            : value;

          set(acc, row.to, transformedValue); // 处理 `to` 为嵌套路径的情况

          return acc;
        }, {});

        const { cmpKey } = useOnlineFormTransformField2Component(config.fieldType!) || {};

        widgetSchema.value = {
          id: `${cmpKey}_${Date.now()}_${Math.random().toString(36).substr(2)}`,
          component: cmpKey,
          formItem: true,
          event: cloneDeep(props.widget.event),
          style: cloneDeep(props.widget.style),
          props: {
            ...cloneDeep(
              omit(props.widget.props, ['tempOrgOptions', 'tempUserOptions', 'tempModelName']),
            ),
            ...otherAttrs,
            fieldType: config.fieldType,
          },
        };
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.formData.value_,
    (val) => {
      if (widgetConfig.value?.infValKey) {
        props.formData[widgetConfig.value.infValKey] = val;
      }
    },
  );

  return {
    widgetSchema,
    widgetConfig,
  };
}
