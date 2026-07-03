<template>
  <a-input value="弹窗" readonly>
    <template #suffix>
      <a-button type="link" size="small" @click="editSub">{{
        $t('sys.pageDesigner.editModal')
      }}</a-button>
    </template>
  </a-input>
</template>

<script setup lang="ts" name="sub-modal-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  console.log(propValue);

  const { setSubTableModalDesignState } = useDesigner();
  const { setSelectedWidget } = useSelectedWidget();
  const { setFieldToolkit } = useToolkit();
  function editSub() {
    const form = propValue.value.children[0].children[0];
    setSubTableModalDesignState(true, defProps?.widget?.id);
    setSelectedWidget(propValue.value);
    if (form) {
      console.log(form, propValue.value, defProps.widget);
      setFieldToolkit({
        modelKey: form.props.model,
        formId: form.id,
        childParentModelKey: form.props.refParentModelkey,
      });
    }
  }
</script>

<style lang="less" scoped></style>
