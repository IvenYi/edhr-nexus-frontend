<template>
  <widget-component-visible v-if="widgetSchema" :widget="widgetSchema">
    <widget-component
      :widget="widgetSchema"
      :formData="formData"
      :subtableFieldId="subtableFieldId"
      :realRowIndex="realRowIndex"
      :pageRowIndex="pageRowIndex"
      :childSubTableDataIndex="childSubTableDataIndex"
    />
  </widget-component-visible>
</template>

<script setup lang="ts" name="online-form-dyn-value-render">
  import { inject, computed, watch, ref } from 'vue';
  import { get, cloneDeep, set, omit } from 'lodash-es';
  import WidgetComponentVisible from '/@online-form/views/render/__components__/_common_/widget-component-visible.vue';
  import WidgetComponent from '/@online-form/views/render/__components__/_common_/widget-component.vue';
  import { DynCompUtils, IDynConfig } from '../logic/dynamic';
  import { useCurrentPageFormState, useOnlineFormTransformField2Component } from '@gct/nocode-base';
  import type { IDynValue, IBasicInfoItem } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IDynValue;
    formData: Object;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

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
            required: otherAttrs.newSpecificConfig?.newRequired,
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
</script>

<style scoped></style>
