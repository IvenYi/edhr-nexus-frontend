<template>
  <img
    v-if="showQrCode"
    :src="imgSrc"
    :width="notCardListField ? '32' : '44'"
    :height="notCardListField ? '32' : '44'"
  />
  <template v-else>
    <van-switch
      v-if="isBool && BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
      v-bind="separatorAttr"
      v-model="exampleValue"
    />
    <component
      v-else-if="isBool"
      :is="cmp[bindCompStyleType]"
      v-bind="separatorAttr"
      v-model:value="exampleValue"
    />
    <taglabel v-else v-bind="separatorAttr" />
  </template>
</template>

<script setup lang="ts">
  import { FormulaTable } from '/@page-designer/types/web';
  import { toRefs, computed, ref, watch } from 'vue';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import bwipjs from 'bwip-js';
  import { MaterialEnum } from '@gct/runtime';

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{
    widget: FormulaTable;
  }>();

  const { returnType, bindCompStyleType, readonly, showQrCode } = toRefs(props.widget.props);

  const { example } = transformField2Component(returnType?.value);

  const exampleValue = ref(true);

  const imgSrc = ref<string>('');

  const isBool = computed(() => {
    return returnType.value === 'boolean';
  });

  const notCardListField = computed(() => {
    return props.widget.materialType !== MaterialEnum.cardListFormField;
  });

  const separatorAttr = computed(() => {
    if (isBool.value) {
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
        tagStyle: props.widget.style,
        options: (Array.isArray(example) ? (example ?? []) : [example]).map(
          (text, index: number) => {
            return {
              label: $t(text ?? ''),
              value: index === 0,
            };
          },
        ),
      };
    }

    return {
      isDesign: true,
      type: returnType.value,
      tagWidgetStyle: props.widget.style,
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
<style scoped lang="less">
  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    &.van-switch--on {
      background-color: var(--van-primary-color);
    }
  }
</style>
