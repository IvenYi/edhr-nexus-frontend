<template>
  <a-select
    v-model:value="value"
    show-search
    allowClear
    :placeholder="t('sys.chooseText')"
    size="small"
  >
    <a-select-option
      v-for="field in options"
      :key="field.key"
      :value="field.key"
      :name="field.name"
    >
      {{ field.name }}
      <!-- [{{ field.key }}] -->
    </a-select-option>
  </a-select>
</template>
<script setup lang="ts" name="data-range-editor">
  import { computed, ref, reactive, toRef, watch } from 'vue';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { isEmpty } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const FormField = ref<FieldMetaDTO[]>([]);
  const value = computed({
    get() {
      return propValue.value || undefined;
    },
    set(val) {
      propValue.value = val;
    },
  });

  watch(
    () => defProps.widget?.props.valueField,
    () => {
      if (!defProps.widget?.props.valueField) {
        propValue.value = undefined;
      }
    },
  );

  const fieldList = ref<FieldMetaDTO[]>();
  async function getFormFieldByKey() {
    FormField.value = (await getFieldMetaList({ modelKey: defProps.widget?.props.modelKey })) || [];
  }
  const getFieldList = async () => {
    await getFormFieldByKey();
    const parentModel = defProps.widget?.props.bindModelKey;
    if (isEmpty(parentModel)) return;
    let list = await getFieldMetaList({ modelKey: parentModel });
    let { filterFields, filterTypes } = propConfig || {};
    fieldList.value = list?.filter((i) => {
      return checkKeyBylist(i.type!, filterFields) && checkKeyBylist(i.createType!, filterTypes);
    });
  };

  function checkKeyBylist(key: string, filters?: string[]): boolean {
    return !filters || filters.indexOf(key) > -1;
  }
  getFieldList();
  const valueField = toRef(() => defProps.widget?.props.valueField.split('$')[0]);
  const modelKey = toRef(() => FormField.value.find((i) => i.key === valueField.value)?.bindInfo);

  const options = toRef(() => {
    if (modelKey.value) {
      return fieldList.value?.filter((i) => i.bindInfo === modelKey.value);
    }
    return [];
  });
</script>

<style lang="less" scoped></style>
