<template>
  <div class="w-full" style="width: 100%">
    <div
      class="p12px h100px ks-row-center-middle bg-[#fbfbfc]"
      v-if="!refSearch && !noNeedAutoQuery"
    >
      <span class="text-[#5d6474] text-14px">
        {{ t('sys.pageDesigner.selectRefBatchSearch') }}</span
      >
    </div>
    <div v-else class="sop-kit-wrapper">
      <SopDocument
        :isDesign="true"
        :fileList="tableData"
        :showType="showType"
        @update:showType="updateType"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-sop-kit">
  import { toRefs, ref } from 'vue';
  import type { SopKitProps } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SopDocument from './components/sop-document.vue';

  const { t } = useI18n();
  const props = defineProps<{ widget: SopKitProps }>();
  const { refForm, refSearch, noNeedAutoQuery } = toRefs(props.widget?.props);

  const showType = ref<'Card' | 'List'>('List');

  const tableData = ref<any[]>([
    {
      product: '示例产品',
      spec: '示例工艺',
      device: '示例设备',
      sopDocument: {
        file: '/示例图片.png',
        name: '示例图片',
        type: 'internal',
      },
    },
  ]);

  const updateType = (value) => {
    showType.value = value;
  };
</script>

<style scoped lang="less">
  .sop-kit-wrapper {
    :deep(.ant-table.ant-table-middle) {
      .ant-table-tbody > tr > td,
      .ant-table-thead > tr > th {
        padding: 10px;
      }
      .ant-table-thead > tr > th {
        &::before {
          width: 1px;
          background: var(--vxe-table-resizable-line-color);
        }
      }
      .icon-hide {
        display: none;
      }
      .more {
        padding: 0 4px;
        cursor: pointer;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
