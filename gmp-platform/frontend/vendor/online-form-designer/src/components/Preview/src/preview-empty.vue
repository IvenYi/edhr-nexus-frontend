<template>
  <div class="flex justify-center items-center h-full">
    <a-empty
      :image="modelEmpty"
      :image-style="{
        height: '100px',
      }"
    >
      <template #description>
        <p class="mt-4 text-gray-400">{{ t('sys.appDesigner.noData') }}</p>
      </template>
    </a-empty>
  </div>
</template>

<script setup lang="ts" name="preview-empty">
  import { useI18n } from '/@/hooks/web/useI18n';
  import modelEmpty from '/@/assets/svg/pic_nodata.svg';

  const { t } = useI18n();
</script>
