<template>
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
<script name="gct-expression" setup lang="ts">
  import { computed, toRefs, ref } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';

  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);

  const { returnType, fieldType, readonly, bindCompStyleType, currency, displayTimeType } = toRefs(
    props.widget.props,
  );

  const { example } = transformField2Component(returnType?.value);

  const exampleValue = ref(true);

  const isBool = computed(() => {
    return returnType.value === 'boolean';
  });

  const separatorAttr = computed(() => {
    if (isBool.value) {
      const res = {};

      if (bindCompStyleType.value === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: readonly.value ? 'mobile-field-boolean--readyonly' : '',
          // todo tangjian 移动端主题色
          // activeColor: '#0DAA9C',
        });
      }

      return {
        design: true,
        readonly: readonly.value,
        disabled: false,
        fieldType: returnType.value,
        tagStyle: props.widget.style,
        options: (Array.isArray(example) ? (example ?? []) : [example]).map(
          (text, index: number) => {
            return {
              label: t(text ?? ''),
              value: index === 0,
            };
          },
        ),
        multiple: false,
        ...res,
      };
    }

    let readyValue = t(example ?? '');
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
      const day = displayTimeType?.value?.includes('d') ? '0 天 ' : '';
      const hour = displayTimeType?.value?.includes('h') ? '00 时 ' : '';
      const minute = displayTimeType?.value?.includes('m') ? '00 分 ' : '';
      const second = displayTimeType?.value?.includes('s') ? '00 秒' : '';
      readyValue = `${day}${hour}${minute}${second}`;
    }
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      readyValue = `${currency?.value ?? ''}${example}`;
    }

    return {
      type: returnType.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
      label: readyValue,
    };
  });
</script>

<style scoped lang="less">
  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    &.van-switch--on {
      background-color: var(--van-primary-color);
      font-size: 16px;
    }
  }
</style>
