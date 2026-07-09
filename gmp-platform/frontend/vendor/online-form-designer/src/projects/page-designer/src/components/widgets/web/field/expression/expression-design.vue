<template>
  <component
    v-if="isBool"
    :is="cmp[bindCompStyleType ?? '']"
    v-bind="separatorAttr"
    v-model:value="exampleValue"
    v-model:checked="exampleValue"
  />
  <tagelabel v-else v-bind="separatorAttr" />
</template>

<script name="gct-expression" setup lang="ts">
  import { inject, reactive, toRefs, computed, ref } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { Expression } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: Switch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const defProps = defineProps<{ widget: Expression }>();

  const { style } = reactive(defProps.widget);

  const { returnType, bindCompStyleType, readonly, currency, displayTimeType } = toRefs(
    defProps.widget.props,
  );

  const exampleValue = ref(true);

  const { example } = transformField2Component(returnType.value);

  const isBool = computed(() => {
    return returnType.value === 'boolean';
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
        readonly: readonly?.value,
        design: true,
        disabled: false,
        fieldType: returnType.value,
        tagStyle: style,
        options: (Array.isArray(example) ? example ?? [] : [example]).map((text, index: number) => {
          return {
            label: t(text ?? ''),
            value: index === 0,
          };
        }),
      };
    }

    let readonlyValue = example;

    if (Array.isArray(example)) {
      readonlyValue = example.map((e) => t(e));
    } else {
      readonlyValue = t(example || '');
    }
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
      const day = displayTimeType?.value?.includes('d') ? '0 天 ' : '';
      const hour = displayTimeType?.value?.includes('h') ? '00 时 ' : '';
      const minute = displayTimeType?.value?.includes('m') ? '00 分 ' : '';
      const second = displayTimeType?.value?.includes('s') ? '00 秒' : '';
      readonlyValue = `${day}${hour}${minute}${second}`;
    }
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      readonlyValue = `${currency?.value ?? ''}${readonlyValue}`;
    }

    return {
      isDesign: true,
      tagWidgetStyle: style,
      type: returnType.value,
      label: readonlyValue,
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
</style>
