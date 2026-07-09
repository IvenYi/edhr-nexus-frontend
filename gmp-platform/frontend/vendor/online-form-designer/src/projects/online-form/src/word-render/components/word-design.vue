<template>
  <div class="word-design-wrapper">
    <doc-design-layout ref="tempRef" />
  </div>
</template>

<script setup lang="ts" name="WordDesign">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PlatformEnum } from '@gct/nocode-base';
  import { DocDesignLayout, useWord, DocModeTypeConst, type WordRuntime } from '@gct-paas/word';
  import { openMockReportUrl } from '../../views/render/__logic__/preview.logic';
  import { putOnlineFormTmplUpdateDesignerById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      id: string;
      modelKey: string;
      /** 是否是预览模式 */
      isPreview?: boolean;
    }>(),
    {
      isPreview: false,
    },
  );

  const { controller }: WordRuntime = useWord(
    {
      requestId: () => props.id,
    },
    {
      suiteKey: 'edhr',
      modelKey: props.modelKey,
      factoryType: 'template',
      isMockReport: false,
      isPreview: props.isPreview,
      renderModeType: DocModeTypeConst.Edit,
    },
  );

  const tempRef = ref();

  const checkHasUnsaved = () => {
    const result = tempRef.value?.verifySave?.();
    console.log(result);
    return result;
  };

  const onSave = async () => {
    const modelJson = controller.value?.exportModel();
    await putOnlineFormTmplUpdateDesignerById(
      { id: props.id },
      {
        designerJson: JSON.stringify(modelJson),
        runtimeJson: JSON.stringify(modelJson),
      },
    );
  };

  const handleSave = async () => {
    await onSave();
    message.success(t('sys.saveSuccess'), 1);
  };

  /** 模拟填报 */
  const handleSimulateFill = async () => {
    await onSave();
    openMockReportUrl({
      tid: props.id,
      mid: props.modelKey,
      platformType: PlatformEnum.INTEGRATION_PAAS_SI,
      url: import.meta.env.VITE_PATHNAME_WEB_FORM_RENDER_WORD_MOCK,
    });
  };

  const handleImportTemplate = (payload) => {
    tempRef.value?.onImportTemplate(payload);
  };

  defineExpose({
    checkHasUnsaved,
    handleSave,
    handleSimulateFill,
    handleImportTemplate,
  });
</script>
<style lang="less" scoped>
  .word-design-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
