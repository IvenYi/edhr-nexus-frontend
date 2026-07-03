<template>
  <basic-modal
    v-bind="$attrs"
    :title="modalTitle"
    centered
    width="1500px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="registerInner"
  >
    <div style="margin: 0 6px 6px">
      <TableSelectRender class="table-select-modal" :widget="tableSelWidget" ref="tableSelectRef" />
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TableSelectRender from '/@page-designer/components/widgets/web/other/table-select/table-select-render.vue';
  // import { TableSelect } from '/@page-designer/types/web';
  import { ITableSelectButton } from '../schema';

  const { t } = useI18n();
  const emit = defineEmits(['register', 'refresh']);
  const props = defineProps<{
    widget: ITableSelectButton;
  }>();

  const tableSelectRef = ref();
  const isEdit = ref<boolean>(false);

  const tableSelWidget = computed(() => {
    return props.widget?.props.tableSelect;
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    tableSelectRef.value?.setValueBySearch({});
    tableSelectRef.value?.setValue([]);
  };

  const modalTitle = computed(() => {
    return t(props.widget?.props.modalTitle || 'sys.kit.selectMaterial');
  });

  const handleOk = () => {
    const data = tableSelectRef.value?.getValue({ option: true });
    emit('refresh', data);
    closeModal();
  };

  const handleClose = () => {
    isEdit.value = false;
  };
</script>

<style lang="less">
  .table-select-modal {
    .ant-form {
      .gct-search-widget {
        .gct-search-item {
          padding: 12px 5px;
        }
      }
    }
    .table-select-wrap {
      // margin-left: 0 !important;
      // margin-right: 0 !important;
    }
  }
</style>
