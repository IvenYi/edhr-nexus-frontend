<template>
  <div class="h600px">
    <LabelTmplModal
      ref="LabelTmpModalRef"
      :moduleType="PrintTypeEnum.LABEL"
      :isRdo="true"
      :btwForceVisible="true"
      :showPreview="true"
    />
  </div>
</template>
<script setup lang="ts" name="gct-label-select-table">
  import { ref } from 'vue';
  import LabelTmplModal from '/@page-designer/components/widgets/web/__components__/print-tmpl-modal.vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const LabelTmpModalRef = ref();

  function getSelectedData() {
    return LabelTmpModalRef.value?.getSelectedVal()[0] || {};
  }

  defineExpose({
    getSelectedData,
  });
</script>
<style lang="less" scoped>
  :deep(.gct-print-tmpl-modal) {
    // margin-top: 14px;
    padding: 0;

    & > div {
      padding: 0;
    }

    .ant-tabs-tabpane {
      min-height: auto !important;
    }

    .ant-tabs-content {
      border: 0 !important;
    }

    .ant-tabs-nav .ant-tabs-nav-wrap .ant-tabs-tab {
      border: 0;
    }

    .ant-tabs-nav .ant-tabs-nav-wrap .ant-tabs-tab + .ant-tabs-tab {
      margin: 0;
    }

    .gct-print-tmpl-modal-right {
      padding: 16px !important;
    }
  }
</style>
