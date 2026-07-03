<template>
  <van-switch
    v-if="BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
    v-bind="separatorAttr"
    v-model="exampleValue"
    size="16px"
  />

  <component
    v-else
    :is="cmp[bindCompStyleType]"
    v-bind="separatorAttr"
    v-model:value="exampleValue"
  />
</template>

<script setup lang="ts" name="gct-switch">
  import { ref, toRefs, computed, toRef } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';

  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';

  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps(widgetProps);

  const exampleValue = ref(true);

  const { bindCompStyleType, fieldType, readonly, disabled } = toRefs(props.widget.props);

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const { example } = transformField2Component(fieldType.value);

  const exampleOptions = (Array.isArray(example) ? (example ?? []) : [example]).map(
    (text, index: number) => {
      return {
        label: t(text ?? ''),
        value: index === 0,
      };
    },
  );

  const switchReadonly = toRef(() => props.rowReadonly || readonly!.value);

  const separatorAttr = computed(() => {
    const res = {};
    if (bindCompStyleType.value === BindCmpStyleEnum.CMP_BOOLEAN) {
      Object.assign(res, {
        class: switchReadonly.value ? 'mobile-field-boolean--readyonly' : '',
        // todo tangjian 移动端主题色
        // activeColor: '#0DAA9C',
      });
    }
    return {
      design: true,
      readonly: switchReadonly.value,
      disabled: disabled.value,
      fieldType: fieldType.value,
      tagStyle: props.widget.style,
      options: exampleOptions,
      multiple: false,
      ...res,
    };
  });
</script>
<style scoped lang="less">
  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    &.van-switch--on {
      background-color: var(--van-primary-color);
    }
  }
</style>
