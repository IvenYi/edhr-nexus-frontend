<template>
  <div class="field-path-chain-area">
    <a-breadcrumb v-if="fieldPathChains.length !== 0" separator=">">
      <a-breadcrumb-item v-for="(path, index) of fieldPathChains" :key="index">{{
        path
      }}</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>
<script setup lang="ts" name="field-pathchain-editor">
  import { ref, computed, onBeforeMount } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelField, SCOPEINFO } from '/@/components/FieldTransfer/hooks/useModelField';

  const { t } = useI18n();

  const defProps = defineProps(props);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const { getFieldPathChainList } = useModelField();

  const fieldPathChains = ref<string[]>([]);

  onBeforeMount(async () => {
    fieldPathChains.value = await getFieldPathChainList(
      propValue.value,
      defProps.widget?.props.fieldName,
    );
  });
</script>
<style lang="less"></style>
