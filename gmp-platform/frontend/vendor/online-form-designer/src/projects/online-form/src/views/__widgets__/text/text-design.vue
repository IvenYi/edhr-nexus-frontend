<template>
  <div class="w-full h-full flex" :style="style">
    <i class="iconfont" :class="icon" v-if="icon"></i>
    <span class="ws-pre-wrap">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { pick } from 'lodash-es';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { PaperWidgeValueType } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import type { IBindField } from '@gct/nocode-base';

  const props = defineProps<{
    widget: PaperWidget.Text;
  }>();

  const { doc } = useSpreadSheet();
  const { getFieldMeta } = useModelFields();

  const text = computed(() => {
    let text = props.widget.value;
    if (props.widget.valueType === PaperWidgeValueType.Fixed && !text) {
      text = $t('sys.pageDesigner.pleaseInputText');
    } else if (props.widget.valueType === PaperWidgeValueType.Field) {
      if (text) {
        const fieldMeta: IBindField = {
          /** 字段key */
          field: props.widget.value,
          model: props.widget.modelKey,
          ...pick(props.widget, [
            'fieldType',
            'modelLink',
            'fieldLink',
            'isFieldModel',
            'subModelKey',
            'subFieldKey',
            'createType',
            'refModelKey',
          ]),
        };
        text = '${' + (getFieldMeta(fieldMeta).name || '') + '}';
      } else {
        text = $t('sys.onlineForm.pleaseConfigureField');
      }
    } else if (props.widget.valueType === PaperWidgeValueType.Formula && !text) {
      text = $t('sys.onlineForm.pleaseConfigureFormula');
    }
    return text;
  });

  const icon = computed(() => {
    let text = props.widget.value;
    if (text) {
      return undefined;
    } else if (props.widget.valueType === PaperWidgeValueType.Fixed) {
      return 'icon-wenben1';
    } else if (props.widget.valueType === PaperWidgeValueType.Field) {
      return 'icon-ziduan2';
    } else if (props.widget.valueType === PaperWidgeValueType.Formula) {
      return 'icon-gongshiziduan';
    }
    return undefined;
  });

  const style = computed(() => {
    const styles = props.widget.styles;
    return {
      ...styles,
      fontSize: styles.fontSize + 'px',
    };
  });
</script>

<style lang="less" scoped>
  .iconfont {
    font-size: inherit;
    margin-right: 4px;
  }
</style>
