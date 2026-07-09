<template>
  <div
    class="px12px py4px text-[#384356] text-[12px] h26px ks-row-middle bg-[#FFFFFF] rounded-4px shadow cursor-pointer"
    @click.stop="changeGlobal"
  >
    <i class="iconfont icon-shezhi1 mr8px text-[#384356]"></i>
    {{ $t('sys.pageDesigner.globalSetting') }}
  </div>
</template>
<script setup lang="ts">
  const changeGlobal = () => {};
</script>
<style lang="less" scoped>
  .shadow {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.08);
  }

  .iconfont {
    color: #384356;
    font-size: 14px;
  }
</style>
