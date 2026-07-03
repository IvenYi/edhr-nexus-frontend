<template>
  <progressTag
    v-if="
      tagWidgetStyle && tagWidgetStyle.tagStyleOpen && tagWidgetStyle.tagType === tagEnum.PROGRESS
    "
  />
  <taglabel :label="value" :tagWidgetStyle="tagWidgetStyle" :type="widget.props.fieldType" v-else />
</template>

<script setup lang="tsx">
  import { ref, toRaw, toRef, watch } from 'vue';
  import taglabel from '/@page-designer/components/widgets/mobile/__components__/taglabel.vue';
  import { useDisplayRuleColumnByStyles } from '/@web-render/render/Event/utils/displayRule';
  import { insetDep } from '/@web-render/render/Event/Dependency/controller';
  import { tagEnum, ProgressTypeEnum } from '/@page-designer/enum';
  import { ReturnTypeEnum } from '/@/components/Expression/types';
  import { FormulaTable } from '/@page-designer/types/web';
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
  const value = toRef(() => props.rowValue[field]);
  const tableForm = { [preLocation]: rowV.value };
  const columnFontStyleByRule = toRaw(props.widget.style.columnFontStyleByRule);
  const columnBackgroundByRule = toRaw(props.widget?.style?.columnBackgroundByRule)?.filter(
    (i) => i.backgroundColor,
  );
  const tagWidgetStyle = useDisplayRuleColumnByStyles(columnFontStyleByRule, tableForm);
  const tagBgStyle = useDisplayRuleColumnByStyles(columnBackgroundByRule, tableForm);
  if (!rowV.value._STYLE) rowV.value._STYLE = {};
  rowV.value._STYLE[field] = tagBgStyle;

  const percent = toRef(() => {
    try {
      const v = BigNumber(value?.value || 0).times(100);
      return v > 100 ? 100 : v;
    } catch (error) {
      return 0;
    }
  });
  const color = toRef(() => tagWidgetStyle?.value.progressStyle?.color);
  const type = toRef(() => tagWidgetStyle?.value.progressStyle?.tagType);
  const progressTag = {
    render() {
      if (type.value === ProgressTypeEnum.LINE) {
        return (
          <van-progress
            percentage={percent.value}
            color={color.value}
            strokeWidth={10}
          ></van-progress>
        );
      } else {
        return (
          <van-circle
            stroke-linecap="butt"
            stroke-width={100}
            currentRate={percent.value}
            color={color.value}
            text={percent.value + '%'}
          ></van-circle>
        );
      }
    },
  };
</script>
<style scoped lang="less">
  .van-circle {
    --van-circle-size: 48px;
  }
</style>
