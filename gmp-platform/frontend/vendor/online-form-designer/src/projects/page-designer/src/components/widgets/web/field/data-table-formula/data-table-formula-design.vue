<template>
  <img v-if="showQrCode" :src="imgSrc" width="36" height="36" />
  <template v-else>
    <component
      v-if="returnType == EntityFormulaReturnTypeEnum.Boolen"
      :is="cmp[bindCompStyleType ?? '']"
      v-bind="separatorAttr"
      v-model:value="exampleValue"
      v-model:checked="exampleValue"
    />
    <tagelabel v-else v-bind="separatorAttr" />
  </template>
</template>

<script setup lang="ts">
  import { FormulaTable } from '/@page-designer/types/web';
  import { ref, toRef, reactive, computed, toRefs, watch } from 'vue';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { Switch } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import {
    transformField2Component,
    convertMappingType,
  } from '/@page-designer/schema/field/form/utils';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { EntityFormulaReturnTypeEnum } from '/@/components/Expression/types';
  import bwipjs from 'bwip-js';

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: Switch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const defProps = defineProps<{
    widget: FormulaTable;
  }>();

  const { style, props } = reactive(defProps.widget);

  const { fieldType, bindCompStyleType, readonly, showQrCode } = toRefs(defProps.widget.props);

  const imgSrc = ref<string>('');

  const returnType = toRef(() => {
    if (fieldType.value !== FIELD_TYPE.DATA_TABLE_FORMULA) {
      return fieldType.value;
    }
    return convertMappingType(defProps.widget?.props.returnType);
  });

  const exampleValue = ref(true);

  const { example } = transformField2Component(returnType?.value);

  const separatorAttr = computed(() => {
    if (returnType.value == EntityFormulaReturnTypeEnum.Boolen) {
      const res = {};

      if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: 'field-boolean--readyonly',
        });
      }
      return {
        ...res,
        readonly: readonly.value,
        design: true,
        disabled: false,
        fieldType: returnType.value,
        tagStyle: style,
        options: (Array.isArray(example) ? example ?? [] : [example]).map((text, index: number) => {
          return {
            label: $t(text ?? ''),
            value: index === 0,
          };
        }),
      };
    }

    return {
      isDesign: true,
      tagWidgetStyle: style,
      type: returnType.value,
    };
  });

  watch(
    () => example,
    () => {
      if (showQrCode?.value) {
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
        text: '示例文本', // 条码内容
        scale: 1, // 条码缩放比例
      });
      imgSrc.value = canvas.toDataURL('image/png');
      canvas = null;
    } catch (err) {
      console.warn(err);
    }
  }
</script>
<style scoped lang="less"></style>
