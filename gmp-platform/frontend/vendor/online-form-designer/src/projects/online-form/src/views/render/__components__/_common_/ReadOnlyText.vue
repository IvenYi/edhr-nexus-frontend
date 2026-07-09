<template>
  <span class="nocode-read-only-text" :style="style"
    >{{ showLabel }}<component :is="renderScript"
  /></span>
</template>
<script setup lang="ts">
  import { toRef } from 'vue';
  import { isNil } from 'lodash-es';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { EmptySymbol } from '@gct/nocode-base';

  export interface Props {
    type?: FIELD_TYPE | undefined;
    disabled?: boolean;
    readonlyText?: string | number | Array<string | number>;
    nullValSymbol?: EmptySymbol;
    /** 角标组件 */
    renderScript?: any;
    style: any;
  }

  const props = defineProps<Props>();

  function isEmpty(value) {
    if (isNil(value)) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  }

  const showLabel = toRef(() => {
    if (props.nullValSymbol && isEmpty(props.readonlyText)) {
      if (
        [FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO, FIELD_TYPE.RECORD_NO].includes(
          props.type!,
        ) &&
        props.renderScript
      ) {
        return '';
      }

      return $t(`sys.edhr.emptySymbol.${props.nullValSymbol}`);
    }

    return !isEmpty(props.readonlyText) ? props.readonlyText : '';
  });
  // const comStyle = toRef(() => {
  //   const contentFont = props.tagWidgetStyle?.contentFont;
  //   if (!contentFont) return {};
  //   return schemaToStyle(contentFont);
  // });

  // const getMsgColor = (key) => {
  //   const iconAttrs: any = props.iconExtraProps?.[key] || {};
  //   const color = {};

  //   if (iconAttrs?.textColor) {
  //     Object.assign(color, {
  //       color: iconAttrs?.textColor,
  //     });
  //   }
  //   if (comStyle.value?.color) {
  //     return comStyle.value;
  //   }
  //   return {
  //     ...comStyle.value,
  //     ...color,
  //   };
  // };
</script>
<style scoped lang="less">
  .nocode-read-only-text.annotation-mark {
    color: red;
    cursor: pointer;

    &.annotation-select {
      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        width: 0;
        height: 0;
        border-top: 12px solid red;
        border-left: 12px solid transparent;
        cursor: pointer;
        pointer-events: all;
      }
    }
  }
</style>
