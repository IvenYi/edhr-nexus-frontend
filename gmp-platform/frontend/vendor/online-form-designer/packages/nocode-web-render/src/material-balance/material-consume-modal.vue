<template>
  <ModalWrapper :opts="modalOptions" :class="['material-consume-modal']">
    <div class="p24px">
      <a-table
        :columns="columns"
        :data-source="tableData"
        bordered
        :pagination="false"
        size="middle"
        :scroll="{
          y: '500px',
        }"
      >
        <!-- <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'material_id_'">
            {{ returnLable(record) }}
          </template>
        </template> -->
      </a-table>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="material-consume-modal">
  import { reactive, toRef } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    width: 450,
    draggable: true,
    showFooter: false,
    canFullscreen: false,
    mask: false,
    title: $t('sys.edhr.materialConsume'),
    wrapClassName: 'gct-draggable-modal',
  });

  const props = defineProps<{
    modal: IModal;
    data: any[];
  }>();

  const columns = [
    {
      title: $t('sys.model.product'),
      dataIndex: 'product_id_label',
      key: 'product_id_label',
      ellipsis: true,
    },
    {
      title: $t('sys.pageDesigner.fieldCmp.qty_consumed'),
      dataIndex: 'qty_consumed_',
      key: 'qty_consumed_',
      width: 150,
      ellipsis: true,
    },
  ];

  const tableData = toRef(() => props.data);

  function returnLable(row) {
    if (!row.material_id__lb_) return row.material_id_;
    const list = JSON.parse(row.material_id__lb_ || '[]');
    return list[0] || '--';
  }
</script>

<style lang="less" scoped></style>
