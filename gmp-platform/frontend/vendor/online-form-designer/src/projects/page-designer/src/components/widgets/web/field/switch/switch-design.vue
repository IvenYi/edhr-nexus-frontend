<template>
  <component
    :is="cmp[bindCompStyleType]"
    v-bind="separatorAttr"
    v-model:value="exampleValue"
    v-model:checked="exampleValue"
  />
</template>

<script setup lang="ts" name="gct-switch">
  import { toRefs, computed, ref, toRef } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import { Switch as SwitchType } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ widget: SwitchType; rowReadonly?: boolean }>();
  const exampleValue = ref(true);

  const { bindCompStyleType, fieldType, readonly, disabled } = toRefs(props.widget.props);
  const switchReadonly = toRef(() => props.rowReadonly || readonly!.value);
  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: Switch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const { example } = transformField2Component(fieldType.value);
  const exampleOptions = (Array.isArray(example) ? example ?? [] : [example]).map(
    (text, index: number) => {
      return {
        label: t(text ?? ''),
        value: index === 0,
      };
    },
  );

  const separatorAttr = computed(() => {
    const res = {};
    if (bindCompStyleType.value === BindCmpStyleEnum.CMP_BOOLEAN) {
      Object.assign(res, {
        class: switchReadonly.value ? 'field-boolean--readyonly' : '',
      });
    }
    return {
      design: true,
      readonly: switchReadonly.value,
      disabled: disabled.value,
      fieldType: fieldType.value,
      tagStyle: props.widget.style,
      options: exampleOptions,
      ...res,
    };
  });
</script>
<style scoped lang="less">
  .ant-switch {
    &:not(.ant-switch-disabled).field-boolean--readyonly {
      opacity: 0.5;
      pointer-events: none;
    }
  }
  .ant-switch {
    height: 20px;
    line-height: 20px;
    min-width: 32px;
    :deep(.ant-switch-handle) {
      width: 12px;
      height: 12px;
      left: 4px;
      top: 4px;
    }
  }
  .ant-switch-checked {
    :deep(.ant-switch-handle) {
      width: 14px;
      height: 14px;
      left: calc(100% - 16px);
      top: 3px;
    }
  }
</style>
