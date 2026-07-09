<template>
  <div class="content p16px text-[#212528]">
    <div class="ks-row-middle">
      <div
        class="ell text-right mr8px"
        :class="[data.finishTime && 'w64px']"
        :title="i18nScriptTitle"
      >
        {{ $t('sys.script') }}:
      </div>
      <div class="ell ks-col break-all" :title="data.scriptName">
        {{ data.scriptName }}
      </div>
    </div>
    <div v-if="data.finishTime" class="ks-row-middle mt8px">
      <div class="w64px ell text-right mr8px" :title="i18nExecutiveResultTitle">
        {{ $t('sys.pageDesigner.executiveResult') }}:
      </div>
      <div class="ell ks-col text-[#309C41]" :title="i18nSuccessTitle">
        {{ $t('sys.success') }}
      </div>
      <div class="text-[12px] text-[#8F8F8F]">{{ data.finishTime }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  defineProps<{
    data: any;
  }>();

  const i18nScriptTitle = computed(() => $t('sys.script'));

  const i18nExecutiveResultTitle = computed(() => $t('sys.pageDesigner.executiveResult'));

  const i18nSuccessTitle = computed(() => $t('sys.success'));
</script>
<style lang="less" scoped></style>
