<template>
  <a-button
    class="ref-field-button"
    type="primary"
    @click="addButton()"
    ghost
    style="line-height: 1"
    block
    size="small"
    v-if="!fieldName"
  >
    {{ $t('sys.pageDesigner.clickOnConfiguration') }}
  </a-button>
  <a-button type="primary" @click="editButton()" style="line-height: 1" block v-else size="small">
    {{ fieldName }}
  </a-button>
  <addRefFieldForm ref="addRef" />
</template>

<script setup lang="ts" name="button-refField-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import addRefFieldForm from '../modals/add-ref-field.vue';
  import { onMounted, ref, toRef } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { RefDataTable } from '/@page-designer/types/web';

  const defProps = defineProps(props);
  const fieldName = ref('');
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const widget = toRef<RefDataTable>(defProps.widget as any);
  const addRef = ref<InstanceType<typeof addRefFieldForm> | null>(null);
  const model = toRef(() => widget.value?.props.model);
  onMounted(async () => {
    if (!model.value || !propValue.value) return;
    const list = (await getFieldMetaList({ modelKey: model.value })) || [];
    const data = list.find((i) => i.key === propValue.value);
    fieldName.value = data?.name || '';
  });

  async function addButton() {
    const list = (await getFieldMetaList({ modelKey: model.value })) || [];
    const data = await addRef.value!.open(list);
    propValue.value = data.refField;
    widget.value.props.refForm = data.refForm;
    widget.value.props.refType = data.refType;
    fieldName.value = data.fieldName;
  }
  async function editButton() {
    const list = (await getFieldMetaList({ modelKey: model.value })) || [];
    const form = {
      refForm: widget.value.props.refForm,
      refField: widget.value.props.refField,
      refType: widget.value.props.refType,
      fieldName: fieldName.value,
    };
    const data = await addRef.value!.open(list, form);
    propValue.value = data.refField;
    widget.value.props.refForm = data.refForm;
    widget.value.props.refType = data.refType;
    fieldName.value = data.fieldName;
  }
</script>

<style lang="less" scoped>
  .fieldrow {
    padding: 4px 8px;
    background-color: #f7f7f7;
  }

  .iconfont {
    font-size: 16px;
    margin-right: 4px;
  }

  .ref-field-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
