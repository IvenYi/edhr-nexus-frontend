<!--
 * @Author: wangming
 * @Date: 2023-07-19 13:58:07
 * @LastEditors: wangming
 * @LastEditTime: 2023-07-19 14:28:30
 * @FilePath: /paas-main-front/src/projects/web-render/src/render/widget-visible.vue
 * @Description: 
-->
<template>
  <slot v-if="showComponet"></slot>
  <!-- {{ props.widget.props.hidden }} -->
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, toRef, watch, computed } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { useDependencyToShow } from '../Event/Dependency/useDependencyToShow';

  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: { id_?: string; [key: string]: any };
  }>();

  const Event = getPageEvent();
  Event.runContext(props.widget.id, props.widget);
  const formState = ref(props.formData);
  const { field, isFieldModel } = props.widget.props || {};
  const showComponet = useDependencyToShow(props.widget);
  watch(
    showComponet,
    (v) => {
      /**关联的砖取字段不走默认值逻辑 */
      if (v && field && !isFieldModel) {
        setDefaultValue();
      }
    },
    {
      immediate: true,
    },
  );

  async function setDefaultValue() {
    if (
      ![
        FIELD_TYPE.USER,
        FIELD_TYPE.USER_MULTI,
        FIELD_TYPE.ORG,
        FIELD_TYPE.ORG_MULTI,
        FIELD_TYPE.DATE,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.TIME,
        FIELD_TYPE.MASTERSLAVE,
      ].includes(props.widget.props?.fieldType)
    ) {
      if (props.widget.props.defaultValue !== undefined && props.widget.props.defaultValue !== '') {
        setFiledValue(props.widget.props.defaultValue);
      } else {
        /**异步问题可能会因为默认值赋值晚了引起bug */
        const fieldInfo =
          (props.widget.props.modelKey &&
            (await FieldSchema.getConfigByField(
              props.widget.props.modelKey,
              props.widget.props.field,
            ))) ||
          {};
        if (get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.FIXED) {
          setFiledValue(get(fieldInfo, 'defaultValue.value'));
        }
      }
    }
  }
  function setFiledValue(value) {
    if (formState.value[field] === undefined && !formState.value.id_) {
      formState.value[field] = value;
    }
  }
</script>
