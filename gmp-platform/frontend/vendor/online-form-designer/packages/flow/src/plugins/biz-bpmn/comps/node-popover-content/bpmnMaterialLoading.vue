<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.bomInit') }}</div>
        ：
        <div class="ks-col">{{ data?.bomInit ? $t('sys.open') : $t('sys.closeText') }}</div>
      </div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.labelParsingRules') }}</div>
        ：
        <div class="ks-col">{{ data?.barcodeParsingRulesId }}</div>
      </div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.canHandleUser') }}</div>
        ：
        <div class="ks-col">{{ data?.viewRangeName }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    data: any;
  }>();
</script>
<style lang="less" scoped></style>
