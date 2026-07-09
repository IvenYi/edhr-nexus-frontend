<template>
  <div class="page-wrap">
    <a-button type="primary" @click="addVar" style="width: 200px; margin-bottom: 12px">
      <template #icon>
        <plus-outlined />
      </template>
      {{ t('sys.new') + t('sys.pageDesigner.variable') }}
    </a-button>
    <div class="list-item" v-for="item in gVar" :key="item.key">
      <div class="list-name">{{ item.key }}</div>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div class="list-key">{{ t(`sys.pageDesigner.${item.varInfo.type}`) }}</div>
        <div class="list-key" v-show="item.key !== GlobalParamEnum.SELECT_ID">
          <a-button type="link" @click.stop="editVar(item)">
            <template #icon><edit-outlined /></template>
          </a-button>
          <a-button type="link" danger @click.stop="delVar(item)">
            <template #icon><delete-outlined /></template>
          </a-button>
        </div>
      </div>
    </div>
    <global-var-modal @register="register" @ok="handleVarOk" />
  </div>
</template>

<script setup lang="ts">
  import { useGlobal } from '/@page-designer/hooks/useGlobal';
  import { useModal } from '/@/components/Modal';
  import GlobalVarModal from '../modals/global-var-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { GLOBAL_TYPE, Platform } from '/@page-designer/enum';
  import { GlobalParamEnum } from '@gct/runtime-mobile-render';
  // import { useRoute } from 'vue-router';
  import { useQueryStore } from '/@/store/modules/query';

  const { t } = useI18n();
  const { gVar, addInfo, updateInfo, deleteInfo, queryInfo, queryGVar } = useGlobal();
  const [register, { openModal, closeModal }] = useModal();
  const queryStore = useQueryStore();

  const addVar = () => {
    openModal();
  };
  const editVar = async (item) => {
    const data = (await queryInfo(item.id)) || [];
    if (data?.length) {
      const varInfo = JSON.parse(data![0].configJson!);
      openModal(true, { id: item.id, varInfo });
    }
  };
  const delVar = async (item) => {
    await deleteInfo(item.id);
    queryGVar();
  };
  const handleVarOk = async (data) => {
    const platform = ((queryStore.query as any).platform as Platform) || Platform.WEB;
    if (data.id) {
      await updateInfo(data.id, {
        key: data.varInfo.key,
        type: GLOBAL_TYPE.VAR,
        configJson: JSON.stringify(data.varInfo),
        source: platform,
      });
    } else {
      await addInfo({
        key: data.varInfo.key,
        type: GLOBAL_TYPE.VAR,
        configJson: JSON.stringify(data.varInfo),
        source: platform,
      });
    }
    queryGVar();
    closeModal();
  };
</script>

<style lang="less" scoped>
  .page-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;

    .list-item {
      width: 100%;
      padding: 14px 18px 10px;
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
