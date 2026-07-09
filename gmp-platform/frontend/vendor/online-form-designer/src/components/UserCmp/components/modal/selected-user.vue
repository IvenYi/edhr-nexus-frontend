<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.org.selectRows', { sth: selectRows.length })"
    width="700px"
    :height="400"
    :maskClosable="false"
  >
    <div v-for="(item, idx) in selectRows" :key="idx">
      <div class="flex select-row">
        <span class="flex-1 ell">
          {{ idx + 1 }}. <span class="ml-12px" :title="item.fullname">{{ item.fullname }} </span>
        </span>

        <a-tooltip placement="top" :title="t('sys.delete')">
          <i class="iconfont icon-shanchu2 cursor-pointer" @click="deleteItem(idx, item)"></i>
        </a-tooltip>
      </div>
    </div>
    <template #footer>
      <a-button @click="closeModal">{{ t('sys.cancel') }}</a-button>
      <a-button @click="clearSelect">{{ t('sys.pageDesigner.clearSelectedRows') }}</a-button>
    </template>
  </BasicModal>
</template>
<script setup lang="ts" name="selected-user">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const title = ref();

  const selectRows = ref([]);

  const emit = defineEmits(['ok', 'clearSelect', 'cancelSelected']);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      selectRows.value = JSON.parse(JSON.stringify(data.data));
    }
  });

  const deleteItem = (i, item) => {
    selectRows.value.splice(i, 1);
    emit('cancelSelected', i, item);
  };

  const clearSelect = () => {
    selectRows.value = [];
    emit('clearSelect');
    closeModal();
  };
</script>
<style lang="less" scoped>
  .select-row {
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
</style>
