<template>
  <div
    class="line-process"
    v-if="
      tagWidgetStyle &&
      tagWidgetStyle.tagStyleOpen &&
      tagWidgetStyle.tagType === tagEnum.PROGRESS &&
      tagWidgetStyle.progressStyle?.tagType === 'line'
    "
  >
    <span
      class="process-percent"
      :style="{
        color: tagWidgetStyle.progressStyle?.color,
      }"
    >
      {{ percent }}%
    </span>
    <div class="line-area">
      <div
        class="line-per"
        :style="{ width: percent + '%', background: tagWidgetStyle.progressStyle?.color }"
      ></div>
      <div class="line-bg"></div>
    </div>
  </div>

  <a-progress
    :strokeWidth="10"
    :width="50"
    :percent="percent"
    :strokeColor="tagWidgetStyle.progressStyle?.color"
    v-else-if="
      tagWidgetStyle &&
      tagWidgetStyle.tagStyleOpen &&
      tagWidgetStyle.tagType === tagEnum.PROGRESS &&
      tagWidgetStyle.progressStyle?.tagType !== 'line'
    "
    :type="tagWidgetStyle.progressStyle?.tagType"
  />

  <taglabel :label="value" :tagWidgetStyle="tagWidgetStyle" :type="fieldType" v-else />
</template>

<script setup lang="ts">
  import { FormulaTable } from '/@page-designer/types/web';
  import { ref, toRaw, toRef, watch } from 'vue';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { useDisplayRuleColumnByStyles } from '/@web-render/render/Event/utils/displayRule';
  import { insetDep } from '/@web-render/render/Event/Dependency/controller';
  import { tagEnum } from '/@page-designer/enum';
  import { ReturnTypeEnum } from '/@/components/Expression/types';
  import BigNumber from 'bignumber.js';

  const props = defineProps<{
    widget: FormulaTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();
  const { formula, field, fieldType } = props.widget.props;
  insetDep({ expression: formula, rowData: props.rowValue }, (res) => {
    if (res === undefined || res === null) {
      res = '';
    }
    if (fieldType === ReturnTypeEnum.Boolen) {
      res = res ? props.widget.props?.truelabel : props.widget.props?.falselabel;
    }
    props.rowValue[field] = res + '';
  });
  const preLocation = toRaw(props.widget.preLocation!);
  const rowV = ref(props.rowValue);
  /**初始化样式 */
  rowV.value._STYLE || (rowV.value._STYLE = {});
  const value = toRef(() => props.rowValue[field]);

  const percent = toRef(() => {
    try {
      const v = BigNumber(value?.value || 0).times(100);
      return v > 100 ? 100 : v;
    } catch (error) {
      return 0;
    }
  });
  const tableForm = { [preLocation]: rowV.value };
  const columnFontStyleByRule = toRaw(props.widget.style.columnFontStyleByRule);
  const columnBackgroundByRule = toRaw(props.widget?.style?.columnBackgroundByRule)?.filter(
    (i) => i.backgroundColor,
  );
  const tagWidgetStyle = useDisplayRuleColumnByStyles(columnFontStyleByRule, tableForm);
  const tagBgStyle = useDisplayRuleColumnByStyles(columnBackgroundByRule, tableForm);

  rowV.value._STYLE[field] = tagBgStyle;
</script>
<style scoped lang="less">
  .line-process {
    margin-top: -5px;
  }

  .process-percent {
    display: inline-block;
    width: 100%;
    font-size: 12px;
    // padding: 0 4px;
    text-align: right;
  }

  .line-area {
    position: relative;
    width: 100%;
    // padding: 0 4px;
    height: 4px;

    .line-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #e6e9ef;
    }

    .line-per {
      position: absolute;
      z-index: 5;
      top: 0;
      left: 0;
      height: 4px;
      border-radius: 2px;
    }
  }
</style>
