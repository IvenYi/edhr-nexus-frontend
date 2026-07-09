<template>
  <basic-modal
    @register="registerInner"
    :title="t('sys.customSort')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="mx-22px">
      <GctDndContainer v-model:items="items" :config="dndConfig">
        <template #default="{ data }">
          <div class="drag-item">
            <i class="iconfont icon-drag mr-4px"></i>
            <span>{{ data[fieldName] }}</span>
          </div>
        </template>
      </GctDndContainer>
    </div>
  </basic-modal>
</template>

<script setup lang="ts" name="AutoSortModal">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { GctDndContainer } from '@gct/runtime-web';
  import { GCT_DND_INSERT_POS, IGctDndConfig, IGctDndData } from '@gct/runtime';
  import { getDatasetColumnValue } from '/@/apis/gct-platform/PnDatasetController';
  import { uuid2 } from '/@/utils/uuid';

  const { t } = useI18n();
  const dndConfig = ref<IGctDndConfig>({
    group: 'datav-auto-sort',
    direction: 'vertical',
    isDrop: true,
    insertPos: GCT_DND_INSERT_POS.LAST,
    canDrop: () => true,
  });
  const emit = defineEmits(['ok']);

  const atuoKey = ref();
  const items = ref<IGctDndData[]>([]);
  const fieldName = ref();

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    console.log('onDataReceive', data);
    atuoKey.value = data.key;
    fieldName.value = data.column;
    if (!data.sortMap.has(data.key)) {
      const params = {
        column: data.column,
        datasetId: data.datasetId,
      };
      const res = (await getDatasetColumnValue(params)) || {};
      if (res?.rows) {
        items.value = res.rows?.map((i) => {
          return {
            ...i,
            id: uuid2(16, 16),
          };
        });
        console.log(items.value);
      }
    } else {
      items.value = data.sortMap.get(data.key);
    }
  };

  const handleClose = () => {
    items.value = [];
    closeModal();
  };

  const handleOk = async () => {
    try {
      emit('ok', { key: atuoKey.value, items: cloneDeep(items.value) });
    } catch (err) {
      console.log(err);
    }
  };
</script>

<style lang="scss" scoped>
  .drag-item {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    border-bottom: 1px solid #f2f5f8;
    line-height: 22px;
    cursor: pointer;
    .iconfont {
      color: #999;
    }
    &:hover {
      background: #f6fafd;
    }
  }
</style>
