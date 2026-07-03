<template>
  <div class="page-wrap">
    <a-button type="primary" @click="addVar" style="width: 200px; margin-bottom: 12px">
      <template #icon>
        <plus-outlined />
      </template>
      {{ t('sys.new') + t('sys.pageDesigner.variable') }}
    </a-button>
    <div class="list-item" v-for="item in varsList" :key="item.id">
      <div class="list-name ell">{{ item.key }}</div>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div class="list-key">{{ t(`sys.pageDesigner.${item.varInfo.type}`) }}</div>
        <div class="list-key">
          <a-button type="link" @click.stop="editVar(item)">
            <template #icon><edit-outlined /></template>
          </a-button>
          <a-button type="link" danger @click.stop="delVar(item)">
            <template #icon><delete-outlined /></template>
          </a-button>
        </div>
      </div>
    </div>
    <var-modal @register="register" @ok="handleVarOk" />
  </div>
</template>

<script setup lang="ts">
  import { useModal } from '/@/components/Modal';
  import VarModal from './modal.vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { computed } from 'vue';
  import { uuid2 } from '/@/utils/uuid';

  const { t } = useI18n();
  const { pageJson } = useDesigner();
  const [register, { openModal, closeModal }] = useModal();
  const addVar = () => {
    openModal();
  };
  const varsList = computed(() => {
    return pageJson?.pageVars || [];
  });

  const editVar = async (item) => {
    openModal(true, { id: item.id, varInfo: item.varInfo });
  };
  const delVar = async (item) => {
    pageJson.pageVars = pageJson.pageVars.filter((n) => n.id !== item.id);
  };
  const handleVarOk = async (data) => {
    if (data.id) {
      let targetItem = pageJson.pageVars.find((n) => n.id === data.id);
      targetItem.key = data.varInfo.key;
      targetItem.varInfo = cloneDeep(data.varInfo);
    } else {
      pageJson.pageVars.push({
        id: uuid2(16, 16),
        key: data.varInfo.key,
        type: 'var',
        varInfo: cloneDeep(data.varInfo),
      });
    }
    closeModal();
  };
</script>

<style lang="less" scoped>
  .page-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .list-item {
      width: 100%;
      padding: 14px -16px 10px;
      border-bottom: 1px solid @gct-modal-border-color;
      cursor: pointer;

      &:hover {
        background-color: #ebebeb;

        .list-name {
          color: var(--ant-primary-color);
        }
      }

      .list-key {
        margin-top: 5px;
        color: #9d9da6;
      }
    }
  }
</style>
