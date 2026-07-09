<template>
  <div class="page-properties">
    <a-collapse v-model:activeKey="activeKey" :bordered="false" expandIconPosition="right" ghost>
      <a-collapse-panel header="通用" key="common">
        <dim-pos
          :height="height"
          :width="width"
          :disabled="true"
          @changeEvent="({ type, value }) => emitChanges(type, value)"
        />
        <labelTemplate v-if="!!project.labelSize" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts" setup name="page-properties">
  import { ref } from 'vue';
  import DimPos from './controls/DimPos.vue';
  import { useProp } from '../../hooks/useProp';
  import labelTemplate from './controls/labelTemplate.vue';
  import { usePage } from '../../hooks/usePage';

  const { project } = usePage();
  const emit = defineEmits(['propchange']);
  const { emitChanges, height, width } = useProp({ emit });
  const activeKey = ref(['common']);
</script>
<style lang="less" scoped>
  :deep(.ant-collapse-header) {
    padding: 5px 12px !important;
    background-color: #f2f4f7;
    color: #333 !important;
    font-size: 14px;
  }
  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 12px;
  }
</style>
