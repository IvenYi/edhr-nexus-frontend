<template>
  <DocRenderLayout ref="renderRef" />
</template>

<script setup lang="ts" name="WordPrintRender">
  import { ref } from 'vue';
  import { DocRenderLayout, useWord, DocModeTypeConst } from '@gct-paas/word';
  import { getConfigInfoByWeb } from '/@online-form/views/integration/utils/interface';
  import { setupPrintSSRBridge } from '../hooks/usePrintSSRBridge';

  const props = withDefaults(
    defineProps<{
      inst: string;
      modelKey: string;
      type: string;
      paramExtraProps?: Record<string, any>;
    }>(),
    {
      type: 'INST',
    },
  );

  const renderRef = ref();

  const { controller } = useWord(
    {
      requestId: () => props.inst,
    },
    props.type === 'INST'
      ? {
          suiteKey: 'edhr',
          modelKey: props.modelKey,
          factoryType: 'instance',
          isMockReport: false,
          isPreview: false,
          isDetailPage: true,
          paramExtraProps: props.paramExtraProps,
          renderModeType: DocModeTypeConst.Print,
          deviceConfig: getConfigInfoByWeb(),
        }
      : {
          suiteKey: 'edhr',
          modelKey: props.modelKey,
          factoryType: 'template',
          isMockReport: false,
          isPreview: true,
          renderModeType: DocModeTypeConst.Edit,
        },
  );

  const transformUrl = (url?: string, { random = true } = {}) => {
    if (!url) {
      return '';
    }
    return (
      `${import.meta.env.VITE_MINIO_PATH}${url.startsWith('/') ? '' : '/'}${url}` +
      (random ? `?${Math.random()}` : '')
    );
  };

  setupPrintSSRBridge('word', {
    getAttachments() {
      const attachments =
        controller.value?.getDocumentAttachmentPaths(['fw:file', 'fw:image']) ?? [];
      return attachments.map((path) => transformUrl(path, { random: false }));
    },

    getPdfBuffer() {
      return renderRef.value?.getPdfBuffer();
    },
  });
</script>
