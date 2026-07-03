<template>
  <div :class="[ns.b()]">
    <a-select
      class="w-full"
      :mode="multiple ? 'multiple' : undefined"
      v-model:value="selectValue"
      :placeholder="t('sys.inputText')"
    >
      <template v-if="includeSubModel">
        <a-select-opt-group v-for="g in fieldOptionGroups" :key="g.key" :label="g.label">
          <a-select-option v-for="f in g.options" :key="f.value" :value="f.value">
            {{ f.label }}
          </a-select-option>
        </a-select-opt-group>
      </template>
      <template v-else>
        <a-select-option v-for="f in masterFieldsOptions" :key="f.value" :value="f.value">
          {{ f.label }}
        </a-select-option>
      </template>
    </a-select>
  </div>
</template>

<script lang="ts" setup name="model-field-select">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from './types';
  import { useModelFieldSelect } from './logic';
  import { computed } from 'vue';
  import { isNil } from 'lodash-es';

  const { masterFieldsOptions, fieldOptionGroups, calcModelFieldKey, getModelFieldByKey } =
    useModelFieldSelect();

  const ns = useNamespace('model-field-select');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: IModelField | IModelField[];
      multiple?: boolean;
      includeSubModel?: boolean;
    }>(),
    {
      value: undefined,
      multiple: false,
      includeSubModel: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: IModelField | IModelField[]): void;
  }>();

  const selectValue = computed({
    get() {
      if (isNil(props.value)) {
        return undefined;
      } else if (props.multiple) {
        return (props.value as IModelField[]).map((v) =>
          calcModelFieldKey(v.model, v.field, v.subModelField),
        );
      } else {
        const v = props.value as IModelField;
        return calcModelFieldKey(v.model, v.field, v.subModelField);
      }
    },
    set(v) {
      if (isNil(v)) {
        emit('update:value', undefined);
      }
      if (props.multiple) {
        emit(
          'update:value',
          (v as string[]).map((key) => ({ ...getModelFieldByKey(key)! })),
        );
      } else {
        emit('update:value', { ...getModelFieldByKey(v as string)! });
      }
    },
  });
</script>

<style lang="scss" scoped>
  $model-field-select: (
    height: auto,
  );

  @include b(model-field-select) {
    @include set-component-css-var(model-field-select, $model-field-select);
    height: getCssVar(model-field-select, height);
    width: 200px;
  }
</style>
