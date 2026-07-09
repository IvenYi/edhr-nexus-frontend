<template>
  <div class="page-history-item">
    <div class="page-history-item__time">{{ itemData.createTime }}</div>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div class="page-history-item__name ell pr-2px" :title="itemData.createUserName">{{
        itemData.createUserName
      }}</div>
      <div class="page-history-item__action">
        <a-tooltip arrowPointAtCenter>
          <template #title>{{ t('sys.preview') }}</template>
          <i class="iconfont icon-yulan mr-12px" @click="openPreviewModal(itemData.id ?? '')"></i>
        </a-tooltip>
        <a-tooltip arrowPointAtCenter>
          <template #title>{{ t('sys.pageDesigner.pageDiff') }}</template>
          <i class="iconfont icon-Compare mr-12px" @click="handleCompare(itemData)"></i>
        </a-tooltip>
        <a-popconfirm
          :title="t('sys.sureToDo')"
          :okText="t('sys.okText')"
          placement="topRight"
          @confirm="() => $emit('recover', itemData.id ?? '')"
        >
          <a-tooltip arrowPointAtCenter>
            <template #title>{{ t('sys.pageDesigner.recover') }}</template>
            <i class="iconfont icon-recover mr-12px"></i>
          </a-tooltip>
        </a-popconfirm>
        <a-popconfirm
          :title="t('sys.sureToDo')"
          :okText="t('sys.okText')"
          placement="topRight"
          @confirm="() => $emit('deleteHistory', itemData.id ?? '')"
        >
          <a-tooltip arrowPointAtCenter>
            <template #title>{{ t('sys.delText') }}</template>
            <i class="iconfont icon-shanchu"></i>
          </a-tooltip>
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="panel-history-item">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PageDesignerLogResponse } from '/@/apis/gct-apaas/model/index';

  const { t } = useI18n();

  const props = defineProps<{
    itemData: PageDesignerLogResponse;
    // itemKey: string;
  }>();

  const emit = defineEmits(['recover', 'deleteHistory', 'openModal', 'itemCompare']);

  const openPreviewModal = (id) => {
    emit('openModal', id);
  };

  const handleCompare = (data) => {
    emit('itemCompare', data);
  };
</script>

<style lang="less" scoped>
  .page-history-item {
    // line-height: 1.2;
    // padding: 14px 18px 10px;
    // position: relative;
    // border-bottom: 1px solid @gct-modal-border-color;
    // transition: all 0.3s;
    // cursor: pointer;
    &:hover {
      // background-color: #edf6f6;
    }

    &__time {
      color: #333;
      line-height: 22px;
    }

    &__name {
      color: #9d9da6;
      line-height: 22px;
    }

    .iconfont {
      color: #9b9b9b;

      &:hover {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
