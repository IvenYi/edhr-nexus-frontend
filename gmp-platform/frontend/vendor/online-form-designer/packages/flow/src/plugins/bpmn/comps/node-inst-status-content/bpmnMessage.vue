<template>
  <div class="rounded-8px overflow-hidden">
    <div class="ks-row">
      <div class="item-label" :title="$t('sys.edhr.sender')">{{ $t('sys.edhr.sender') }}</div>
      ：
      <div class="ks-col item-value">
        {{ rangeUserExchange.rangeUser }}
      </div>
    </div>
    <div class="ks-row">
      <div class="item-label" :title="$t('sys.message.content')">{{
        $t('sys.message.content')
      }}</div>
      ：
      <div class="ks-col overflow-hidden item-value">
        <div class="">
          <pre style="width: 100%; word-break: break-all; white-space: pre-wrap">{{
            rangeUserExchange.message
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import type { IGctBpmnNode } from '../../types';

  const props = defineProps<{
    node: IGctBpmnNode;
    nodeInst?: any;
  }>();

  const rangeUserExchange = computed(() => {
    const jsonData = props.nodeInst.rangeUserExchange;
    const data = jsonData ? JSON.parse(jsonData) : { rangeUser: [] };
    return { message: data.message, rangeUser: data.rangeUser.map((e) => e.value).join('; ') };
  });
</script>
