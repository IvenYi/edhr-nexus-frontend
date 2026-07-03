<template>
  <component
    v-if="returnType === EntityFormulaReturnTypeEnum.Boolen"
    :is="cmp[bindCompStyleType ?? '']"
    v-bind="separatorAttr"
  />
  <template v-else>
    <progressTag
      :tagWidgetStyle="tagWidgetStyle"
      :tagBgStyle="tagBgStyle"
      :percent="percent"
      v-if="
        tagWidgetStyle && tagWidgetStyle.tagStyleOpen && tagWidgetStyle.tagType === tagEnum.PROGRESS
      "
    />
    <taglabel :label="value" :tagWidgetStyle="tagWidgetStyle" :type="returnType" v-else />
  </template>
</template>

<script setup lang="tsx">
  import { toRaw, toRef, computed } from 'vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
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
  import progressTag from './progressTag.vue';

  const props = defineProps<{
    widget: FormulaTable;
    formData: Object;
  }>();
  const { formula, field, fieldType, bindCompStyleType, readonly, digits } = props.widget.props;

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

  insetDep(
    {
      expression: formula,
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

  const value = toRef(() => props.formData[field]);

  const columnFontStyleByRule = toRaw(props.widget.style.columnFontStyleByRule);

  const tagWidgetStyle = useDisplayRuleColumnByStyles(columnFontStyleByRule);

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
</script>
<style scoped lang="less">
  .van-circle {
    --van-circle-size: 48px;
  }
</style>
