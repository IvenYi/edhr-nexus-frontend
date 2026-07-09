<template>
  <progressTag
    v-if="
      tagWidgetStyle && tagWidgetStyle.tagStyleOpen && tagWidgetStyle.tagType === tagEnum.PROGRESS
    "
  />
  <vantField v-else v-model="value" :props="widget.props" :style="widget.style" v-bind="fieldAttr">
    <template #input>
      <template v-if="showQrCode">
        <img
          :src="imgSrc"
          :width="notCardListField ? '32' : '44'"
          :height="notCardListField ? '32' : '44'"
          @click="showPopup"
        />
        <van-popup v-model:show="popupShow" :style="{ padding: '12px 12px 5px 12px' }">
          <img :src="imgSrc" width="120" height="120" />
        </van-popup>
      </template>
      <template v-else>
        <van-switch
          v-if="isBool && BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
          v-bind="separatorAttr"
        />
        <component v-else-if="isBool" :is="cmp[bindCompStyleType]" v-bind="separatorAttr" />

        <taglabel v-else v-bind="separatorAttr" />
      </template>
    </template>
  </vantField>
</template>

<script setup lang="tsx">
  import { ref, toRaw, toRef, watch, computed } from 'vue';
  import taglabel from '/@page-designer/components/widgets/mobile/__components__/taglabel.vue';
  import vantField from '../../__components__/vantField.vue';
  import {
    useDisplayRuleColumnByStyles,
    calculate,
    identify,
  } from '/@web-render/render/Event/utils/displayRule';
  import { tagEnum, ProgressTypeEnum, BindCmpStyleEnum } from '/@page-designer/enum';
  import BigNumber from 'bignumber.js';
  import { FormulaTable } from '/@page-designer/types/web';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { MaterialEnum } from '/@/enums/appEnum';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import bwipjs from 'bwip-js';

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{
    widget: FormulaTable;
    formData: Object;
    index: number;
  }>();
  const { formula, field, fieldType, bindCompStyleType, readonly, showQrCode, digits } =
    props.widget.props;
  const preLocation = toRaw(props.widget.preLocation!);
  const rowV = ref(props.formData);
  const value = toRef(() => props.formData[field]);
  const imgSrc = ref<string>('');
  const popupShow = ref(false);

  const rowArg = identify(formula).map((i) => {
    const arg = i.split('.');
    return arg[1];
  });

  const formulaData = toRef(() => {
    return rowArg.reduce((total, curr) => {
      total[curr] = rowV.value[curr];
      return total;
    }, {});
  });

  const options = computed(() => {
    return [
      {
        label: props.widget.props?.truelabel,
        value: true,
      },
      {
        label: props.widget.props?.falselabel,
        value: false,
      },
    ];
  });

  const isBool = computed(() => {
    return returnType.value === 'boolean';
  });

  const notCardListField = computed(() => {
    return props.widget.materialType !== MaterialEnum.cardListFormField;
  });

  watch(
    formulaData,
    (v) => {
      /**实时计算 */
      calculate(formula, { [preLocation]: v }).then((res) => {
        if (
          res === '' ||
          res === null ||
          res === -Infinity ||
          res === Infinity ||
          Number.isNaN(res)
        ) {
          res = '';
        } else if (returnType.value === FIELD_TYPE.DECIMAL) {
          res = BigNumber(res).toFixed(digits);
        } else if (returnType.value === FIELD_TYPE.INTEGER) {
          res = BigNumber(res).toFixed(0);
        }
        props.formData[field] = res + '';
      });
    },
    {
      deep: true,
      immediate: true,
    },
  );
  const tableForm = { [preLocation]: rowV.value };
  const columnFontStyleByRule = toRaw(props.widget?.style.columnFontStyleByRule);
  const columnBackgroundByRule = toRaw(props.widget?.style?.columnBackgroundByRule)?.filter(
    (i) => i.backgroundColor,
  );
  const tagWidgetStyle = useDisplayRuleColumnByStyles(columnFontStyleByRule, tableForm);
  const tagBgStyle = useDisplayRuleColumnByStyles(columnBackgroundByRule, tableForm);
  const percent = toRef(() => {
    let v = value?.value * 100;
    return v > 100 ? 100 : v;
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
  const fieldAttr = toRef(() => {
    return {
      isLink: false,
      readonly: true,
    };
  });

  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const separatorAttr = computed<any>(() => {
    if (isBool.value) {
      const res = {};
      if (bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: readonly ? 'mobile-field-boolean--readyonly' : '',
          // todo tangjian 移动端主题色
          // activeColor: '#0DAA9C',
        });
      }

      return {
        readonly: readonly,
        disabled: false,
        fieldType: returnType.value,
        tagStyle: props.widget.style,
        options: options.value,
        multiple: false,
        ...res,
        checked: getBoolValue(value.value),
        value: getBoolValue(value.value),
        'model-value': getBoolValue(value.value),
      };
    }

    return {
      type: returnType.value,
      tagWidgetStyle: tagWidgetStyle?.value,
      isDesign: false,
      disabled: false,
      label: value.value ?? '',
    };
  });

  const returnType = toRef(() => {
    if (fieldType !== FIELD_TYPE.DATA_TABLE_FORMULA) {
      return fieldType;
    }
    return props.widget?.props.returnType;
  });

  const showPopup = () => {
    popupShow.value = true;
  };

  watch(
    () => value.value,
    () => {
      if (showQrCode) {
        genImage();
      }
    },
    {
      immediate: true,
    },
  );

  function genImage() {
    try {
      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'qrcode', // 条码类型：qrcode
        text: value.value, // 条码内容
        scale: 3, // 条码缩放比例
      });
      imgSrc.value = canvas.toDataURL('image/png');
      canvas = null;
    } catch (err) {
      console.warn(err);
    }
  }
</script>
<style scoped lang="less">
  .van-circle {
    --van-circle-size: 48px;
  }

  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    &.van-switch--on {
      background-color: rgb(13 170 156 / 50%) !important;
    }
  }
</style>
