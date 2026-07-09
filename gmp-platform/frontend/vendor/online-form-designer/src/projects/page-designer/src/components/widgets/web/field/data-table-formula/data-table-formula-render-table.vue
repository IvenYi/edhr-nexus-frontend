<template>
  <a-image
    v-if="showQrCode"
    :src="imgSrc"
    :preview="{
      src: imgSrc2,
      onVisibleChange: onVisibleChange,
      maskClassName: 'custom-formula-preview',
    }"
    width="36"
    height="36"
    style="width: 36px !important"
  >
    <template #previewMask></template>
  </a-image>
  <template v-else>
    <component
      v-if="returnType === EntityFormulaReturnTypeEnum.Boolen"
      :is="cmp[bindCompStyleType ?? '']"
      v-bind="separatorAttr"
    />
    <template v-else>
      <progressTag
        v-if="
          tagWidgetStyle &&
          tagWidgetStyle.tagStyleOpen &&
          tagWidgetStyle.tagType === tagEnum.PROGRESS
        "
        :tagWidgetStyle="tagWidgetStyle"
        :tagBgStyle="tagBgStyle"
        :percent="percent"
      />
      <FieldReadonly :label="value" :tagWidgetStyle="tagWidgetStyle" :type="returnType" v-else />
    </template>
  </template>
</template>

<script setup lang="tsx">
  import { ref, toRaw, toRef, computed, watch, nextTick } from 'vue';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { useDisplayRuleColumnByStyles } from '/@web-render/render/Event/utils/displayRule';
  import { insetDep } from '/@web-render/render/Event/Dependency/controller';
  import { tagEnum, ProgressTypeEnum, BindCmpStyleEnum } from '/@page-designer/enum';
  import { EntityFormulaReturnTypeEnum, ReturnTypeEnum } from '/@/components/Expression/types';
  import { FormulaTable } from '/@page-designer/types/web';
  import BigNumber from 'bignumber.js';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { Switch as ASwitch } from 'ant-design-vue';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import { convertMappingType } from '/@page-designer/schema/field/form/utils';
  import bwipjs from 'bwip-js';
  import progressTag from './progressTag.vue';

  const props = defineProps<{
    widget: FormulaTable;
    formData: Object;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();
  const { formula, field, fieldType, bindCompStyleType, readonly, showQrCode, digits } =
    props.widget.props;

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: ASwitch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

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

  const imgSrc = ref<string>('');
  const imgSrc2 = ref<string>('');
  // const PopupContainer = getParentPopupContainer(props);

  insetDep(
    {
      expression: formula,
      rowData: props.formData,
    },
    (res) => {
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
    },
  );
  const preLocation = toRaw(props.widget.preLocation!);
  const rowV = ref(props.formData);
  const value = toRef(() => props.formData[field]);
  const tableForm = { [preLocation]: rowV.value };
  const columnFontStyleByRule = toRaw(props.widget.style.columnFontStyleByRule);
  const columnBackgroundByRule = toRaw(props.widget?.style?.columnBackgroundByRule)?.filter(
    (i) => i.backgroundColor,
  );
  const tagWidgetStyle = useDisplayRuleColumnByStyles(columnFontStyleByRule, tableForm);
  const tagBgStyle = useDisplayRuleColumnByStyles(columnBackgroundByRule, tableForm);
  if (!rowV.value._STYLE) rowV.value['_STYLE'] = {};
  rowV.value._STYLE[field] = tagBgStyle;

  const percent = toRef(() => {
    try {
      const v = BigNumber(value?.value || 0).times(100);
      return v > 100 ? 100 : v;
    } catch (error) {
      return 0;
    }
  });

  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || Number.isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const separatorAttr = computed(() => {
    if (returnType.value === EntityFormulaReturnTypeEnum.Boolen) {
      const res = {};
      if (bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: 'field-boolean--readyonly wauto',
        });
      }

      return {
        ...res,
        readonly: readonly,
        disabled: false,
        fieldType: returnType.value,
        tagStyle: props.widget.style,
        options: options.value,
        checked: getBoolValue(value.value),
        value: getBoolValue(value.value),
      };
    }

    return {
      tagWidgetStyle: props.widget.style,
      type: returnType.value,
      isDesign: false,
      label: value.value,
    };
  });

  const returnType = toRef(() => {
    if (fieldType !== FIELD_TYPE.DATA_TABLE_FORMULA) {
      return fieldType;
    }
    return convertMappingType(props.widget?.props.returnType);
  });

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

  const onVisibleChange = (visible, prevVisible) => {
    if (visible) {
      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'qrcode', // 条码类型：qrcode
        text: value.value || '', // 条码内容
        scale: 4, // 条码缩放比例
        backgroundcolor: '#ffffff',
        paddingleft: '3',
        paddingright: '3',
        paddingtop: '3',
        paddingbottom: '3',
      });
      imgSrc2.value = canvas.toDataURL('image/png');
      canvas = null;
    }
  };

  async function genImage() {
    try {
      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'qrcode', // 条码类型：qrcode
        text: value.value || '', // 条码内容
        scale: 1, // 条码缩放比例
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

  :deep(.custom-formula-preview.ant-image-mask) {
    background: transparent;
  }
</style>

<style lang="less">
  .data-table-formula-table-pop {
    .ant-popover-inner-content {
      padding: 12px;
    }
  }
</style>
