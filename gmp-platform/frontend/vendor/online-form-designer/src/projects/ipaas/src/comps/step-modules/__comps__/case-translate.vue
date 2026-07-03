<template>
  <div class="bg-[#f6f6f6]" :class="[deep && deep > 0 ? 'px12px' : 'p12px']">
    <div v-if="deep && deep > 0">
      <span v-for="(ele, f) in data.elements" :key="f">
        <span v-show="f > 0" class="mx8px text-[#3168EC]">
          {{ $t('sys.bpmn.logicalOperators.' + data.logicalOperators) }}
        </span>
        <span v-if="ele.type === 'condition'">
          {{ ele.element?.left }} ({{ $t(`sys.ipaas.${ele.element.type}`) }})
          {{ $t('sys.ipaas.conditionOpe.' + ele.element?.operator) }}
          {{ ele.element?.right }}
        </span>
        <case-translate v-else :data="ele.element" :deep="(deep ?? 0) + 1" />
      </span>
    </div>
    <div v-else v-for="(ele, f) in data.elements" :key="f">
      <div v-show="f > 0" class="text-[#3168EC]">
        {{ $t('sys.bpmn.logicalOperators.' + data.logicalOperators) }}
      </div>
      <div v-if="ele.type === 'condition'">
        {{ ele.element?.left }} ({{ $t(`sys.ipaas.${ele.element.type}`) }})
        {{ $t('sys.ipaas.conditionOpe.' + ele.element?.operator) }}
        {{ ele.element?.right }}
      </div>
      <case-translate v-else :data="ele.element" :deep="(deep ?? 0) + 1" />
    </div>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    data: any;
    deep?: number;
  }>();
</script>
<style lang="less" scoped>
  // .case-wrap {
  //   background-color: #f6f6f6;
  //   padding: 8px 12px;
  // }
</style>
