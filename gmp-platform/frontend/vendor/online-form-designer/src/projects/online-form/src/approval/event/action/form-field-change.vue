<template>
  <div :class="[ns.b()]">
    <table :class="[ns.e('table')]">
      <thead>
        <tr :class="[ns.b('title')]">
          <th width="300">{{ $t('sys.appDesigner.approval.fieldName') }}</th>
          <th width="300">{{ $t('sys.pageDesigner.fieldValue') }}</th>
          <th width="100">{{ $t('sys.operation') }}</th>
        </tr>
      </thead>
      <tbody v-if="local.changeFormFields?.length">
        <tr v-for="(item, index) in local.changeFormFields" :key="index + 'changeFormFields'">
          <td>
            <ModelFieldSelect :class="[ns.e('field-select')]" v-model:value="item.field" />
          </td>
          <td>
            <FieldTypeEditor
              :class="[ns.e('field-value')]"
              :field-info="item.field"
              v-model:value="item.value"
            />
          </td>
          <td>
            <a-button type="text" danger size="small" @click="() => onRemove(index)">
              {{ $t('sys.delText') }}
            </a-button>
          </td>
        </tr>
      </tbody>
    </table>
    <a-button @click="addField"> {{ $t('sys.onlineForm.addChangeField') }} </a-button>
  </div>
</template>

<script lang="ts" setup name="form-field-change">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IANEAFormFieldChange } from '../types';
  import { ModelFieldSelect } from '/@online-form/components/model-field-select';
  import { FieldTypeEditor } from '/@online-form/components/field-type-editor';

  const ns = useNamespace('form-field-change');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value: IANEAFormFieldChange;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IANEAFormFieldChange): void;
  }>();

  const local = computedEx({
    get: () => {
      return props.value;
    },
    set: (v) => {
      emit('update:value', v);
    },
    deep: true,
  });

  const onRemove = (index: number) => {
    local.value.changeFormFields?.splice(index, 1);
  };

  const addField = () => {
    if (!local.value.changeFormFields) {
      local.value.changeFormFields = [];
    }
    local.value.changeFormFields?.push({} as any);
  };
</script>

<style lang="scss" scoped>
  $form-field-change: (
    height: auto,
  );

  @include b(form-field-change) {
    @include set-component-css-var(form-field-change, $form-field-change);
    height: getCssVar(form-field-change, height);

    @include e(field-select) {
      width: auto;
    }

    @include e(field-value) {
      width: auto;
    }
  }
</style>
