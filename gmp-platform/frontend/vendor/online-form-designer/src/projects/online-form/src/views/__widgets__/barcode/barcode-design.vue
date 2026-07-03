<template>
  <div
    class="widget-barcode h-full w-full"
    :class="[isInCell ? 'absolute top-0px left-0px' : '']"
    :style="widgetStyle"
  >
    <div class="wrapper">
      <canvas ref="canvasRef"></canvas>
      <div class="text" v-if="props.widget.showValue">{{ text }}</div></div
    >
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { pick } from 'lodash-es';
  import bwipjs from 'bwip-js';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { PaperWidgeValueType } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import type { IBindField } from '@gct/nocode-base';

  const canvasRef = ref();

  const props = defineProps<{
    widget: PaperWidget.Barcode;
    isInCell?: boolean;
  }>();

  const { doc } = useSpreadSheet();
  const { getFieldMeta } = useModelFields();

  const widgetStyle = computed(() => {
    const justifyContent = props.widget.styles?.justifyContent;
    return justifyContent
      ? {
          display: 'flex',
          justifyContent,
        }
      : {};
  });

  const text = computed(() => {
    let text = props.widget.value;
    if (props.widget.valueType === PaperWidgeValueType.Fixed && !text) {
      text = $t('sys.pageDesigner.pleaseInputText');
    } else if (props.widget.valueType === PaperWidgeValueType.Field) {
      if (text) {
        // 兼容单元格组件 页眉页脚组件的模型key
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

  /**
   * Note that bwip-js normalizes the BWIPP width and height options to always be in millimeters.
   * The resulting images are rendered at 72 dpi.
   * To convert to pixels, use a factor of 2.835 px/mm (72 dpi / 25.4 mm/in).
   * The bwip-js scale options multiply the width, height, and padding.
   * refer: http://bwip-js.metafloor.com/
   */

  watch([canvasRef, () => props.widget.codeType], ([el]) => {
    if (!el) return;
    try {
      bwipjs.toCanvas(el, {
        bcid: props.widget.codeType,
        text: 'THIS IS CODE 39', // 条码内容
        scale: 1, // 条码缩放比例
        height: 100, // 条码高度
      });
    } catch (err) {
      console.warn(err);
    }
  });
</script>

<style lang="less" scoped>
  .widget-barcode {
    .wrapper {
      text-align: center;
      font-size: 12px;
      white-space: nowrap;
      line-height: 1em;
      height: 100%;
      width: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      overflow: hidden;
      flex: none;
    }

    .text {
      margin-top: 2px;
    }
  }
</style>
