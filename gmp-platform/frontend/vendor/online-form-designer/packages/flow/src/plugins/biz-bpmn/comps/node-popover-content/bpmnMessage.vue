<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.sender') }}</div>
        ：
        <div class="ks-col">{{ data.viewRangeName }}</div>
      </div>
      <div class="ks-row">
        <div style="flex-shrink: 0">{{ $t('sys.message.content') }}</div>
        ：
        <div class="ks-col overflow-hidden">
          <pre style="width: 100%; word-break: break-all; white-space: pre-wrap">{{
            data.messageContent
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    data: any;
    node: any;
  }>();
</script>
<style lang="less" scoped></style>
