<template>
  <span>
    {{ t(`sys.onlineForm.timeDiffFormat.${widget.format || TimeDiffFormat.D_H_MIN_S}`) }}
  </span>
</template>

<script setup lang="ts">
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { TimeDiffFormat } from '@gct/nocode-base';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    widget: PaperWidget.TimeDiff;
  }>();

  const { t } = useI18n();
</script>

<style></style>
