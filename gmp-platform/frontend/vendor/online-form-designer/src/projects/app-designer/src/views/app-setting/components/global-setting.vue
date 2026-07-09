<template>
  <div class="px-12px py-12px">
    <div class="flex justify-between">
      <div>
        <div class="name">空值显示样式</div>
        <div class="color-[#888888]">所有页面设计中，“字段”数据为空时的显示样式</div>
      </div>
      <div class="w228px">
        <a-select
          v-model:value="globalSetting.emptyDisplay"
          placeholder="Please select"
          :options="emptyOptions"
          style="width: 100%"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { globalSetting } = useGlobalSetting();

  const emptyOptions = ref([
    {
      label: '显示为"--"',
      value: '--',
    },
    {
      label: '显示为"(空)"',
      value: 'empty',
    },
    {
      label: '显示为"null"',
      value: 'null',
    },
    {
      label: '显示为"N/A"',
      value: 'N/A',
    },
    {
      label: '不显示',
      value: 'noDisplay',
    },
  ]);
</script>
<style lang="less" scoped>
  .name {
    font-size: 18px;
    font-weight: 500;
  }
</style>
