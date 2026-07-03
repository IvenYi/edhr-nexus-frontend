<template>
  <div class="online-form-model-design" style="--header-height: 54px">
    <ApaasCollect ref="tempRef" :tid="computedTid" :designMode="designMode" />
  </div>
</template>

<script setup lang="ts" name="FormDesign">
  import ApaasCollect from '/@online-form/views/integration/apaas_si/designer/apaas-collect.vue';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import { computed, ref } from 'vue';

  const props = defineProps<{
    templateInfo: OnlineFormTmplResponse;
    designMode?: DesignMode;
  }>();

  const computedTid = computed(() => {
    return props.templateInfo.id || '';
  });

  const tempRef = ref();

  const checkHasUnsaved = () => {
    const result = tempRef.value?.verifySave();
    console.log(result);
    return result;
  };

  const handleSave = async (payload) => {
    await tempRef.value?.onSave(payload);
  };

  const handleDocPublish = async () => {
    await tempRef.value?.onPublish();
  };

  const handleImportTemplate = (payload) => {
    tempRef.value?.onImportTemplate(payload);
  };

  const handleSimulateFill = () => {
    tempRef.value?.onSimulateFill();
  };

  defineExpose({
    checkHasUnsaved,
    handleSave,
    handleImportTemplate,
    handleSimulateFill,
    handleDocPublish,
  });
</script>
<style lang="less" scoped></style>
