<template>
  <div class="image-card">
    <div class="img">
      <a-image :src="transformUrl(item.path)" />
    </div>
    <div class="footer">
      <div class="title" :title="item.name">{{ item.name }}</div>
      <div class="action">
        <a-dropdown>
          <ellipsis-outlined />
          <template #overlay>
            <a-menu @click="(e) => handleMenuClick(e, item)">
              <a-menu-item :key="MenuItem.Move" v-if="userActions.Update">
                {{ t('sys.component.userCmp.move') }}
              </a-menu-item>
              <a-menu-item :key="MenuItem.Delete" v-if="userActions.Delete">
                {{ t('sys.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { createVNode, inject } from 'vue';
  import type { AssetsResponse } from '/@/apis/gct-platform/model';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { deleteAssets } from '/@/apis/gct-platform/AssetsController';
  import { Modal } from 'ant-design-vue';
  import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

  enum MenuItem {
    Move,
    Delete,
  }

  defineProps<{
    item: AssetsResponse;
    userActions: {
      CategoryManagement: boolean;
      Insert: boolean;
      Update: boolean;
      Delete: boolean;
    };
  }>();

  const emit = defineEmits(['delete']);
  const { t } = useI18n();
  const openChangeModal = inject('openChangeModal') as Function;

  // 操作
  const handleMenuClick = async (e, item) => {
    switch (e.key) {
      case MenuItem.Move:
        openChangeModal(true, item);
        break;
      case MenuItem.Delete:
        Modal.confirm({
          title: t('sys.sureToDelete'),
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          async onOk() {
            await deleteAssets({
              ids: item.id,
            });
            emit('delete');
          },
          onCancel() {},
        });

        break;
      default:
    }
  };
</script>

<style lang="less" scoped>
  .image-card {
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #eaedf1;
    border-radius: 4px 4px 4px 4px;
    .img {
      width: 100%;
      // height: 135px;
      aspect-ratio: 16 / 9;
      border-radius: 2px 2px 2px 2px;
      border-bottom: 1px solid #f3f3f3;
      :deep(.ant-image) {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }
      :deep(.ant-image-img) {
        width: 100%;
        height: 100%;
        transition: all 0.3s;
        object-fit: scale-down;
        &:hover {
          transform: scale(1.2);
        }
      }
    }
    .footer {
      display: flex;
      justify-content: space-between;
      // height: 56px;
      padding: 12px;
      background-color: #fcfcfd;
      position: relative;
      .title {
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 500;
      }
    }
  }

  .icon {
    transform: rotate(90deg);
  }
</style>
