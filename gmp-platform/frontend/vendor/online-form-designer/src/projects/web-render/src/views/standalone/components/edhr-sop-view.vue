<template>
  <EsopPreview :defaultSelectedFile="target" :sopList="documentList" :hiddenBlank="true" />
</template>

<script lang="ts" setup>
  import type {
    ISelectedDocument,
    ISopDocument,
  } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/esop-kit/type';
  import type { IESopKit } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/esop-kit/schema';
  import EsopPreview from '/@online-form/components/esop/esop-preview.vue';

  interface Props {
    widget: IESopKit;
    target: ISelectedDocument;
    documentList: { sopDocument: ISopDocument }[];
    blank: boolean;
  }

  const props = defineProps<Props>();
  const { target, documentList } = props;
</script>
