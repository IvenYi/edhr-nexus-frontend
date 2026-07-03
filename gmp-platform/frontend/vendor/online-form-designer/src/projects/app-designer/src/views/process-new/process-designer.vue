<template>
  <div class="process-designer-new-wrapper">
    <template v-if="currrentTab === ProcessTypeEnum.APPROVAL">
      <ProcessDesign :moduleType="currrentTab" :key="currrentTab" />
    </template>
  </div>
</template>

<script setup lang="ts" name="process-designer">
  import { ref } from 'vue';
  import ProcessDesign from './components/index.vue';
  import { ProcessTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { ProcessTypeOptions } from '/@/layouts/tree-sider-page/constant';

  const props = defineProps<{
    moduleType: ProcessTypeEnum;
  }>();

  const currrentTab = ref<ProcessTypeEnum>(props.moduleType || ProcessTypeOptions[0].code);

  // const handleTabClick = (tab) => {
  //   if (currrentTab.value === tab.code) {
  //     return;
  //   }
  //   currrentTab.value = tab.code;
  // };
</script>

<style scoped lang="less">
  .process-designer-new-wrapper {
    width: 100%;
    height: 100%;
  }
</style>
