<template>
  <div class="icon">
    <div class="icon-item">
      <!-- <svg>
        <use :href="iconHref" />
      </svg> -->
      <i
        :style="{
          '--bg-image': iconBgImage,
        }"
      ></i>
    </div>
    <!-- <div class="action">
      <div>
        <i
          class="icon-change iconfont icon-Transfer"
          v-if="userActions.Update"
          @click="handleMove"
        ></i>
      </div>
      <div>
        <i
          class="icon-del iconfont icon-shanchu"
          v-if="userActions.Delete"
          @click="handleDelete"
        ></i>
      </div>
    </div> -->
  </div>

  <div class="iconName flex items-center justify-between" :title="item.name">
    <div class="ell"> {{ item.name }}</div>

    <a-dropdown class="action">
      <EllipsisOutlined class="icon" />
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
</template>

<script setup lang="ts">
  import { computed, createVNode, inject } from 'vue';
  import type { AssetsResponse } from '/@/apis/gct-platform/model';
  import { transformUrl, fileUrlParser } from '/@/components/Cropper/hooks/useFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { deleteAssets } from '/@/apis/gct-platform/AssetsController';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  const emit = defineEmits(['delete']);
  const { t } = useI18n();
  const userStore = useUserStoreWithOut();
  const openChangeModal = inject('openChangeModal') as Function;
  enum MenuItem {
    Move,
    Delete,
  }

  const props = defineProps<{
    item: AssetsResponse;
    userActions: {
      CategoryManagement: boolean;
      Insert: boolean;
      Update: boolean;
      Delete: boolean;
    };
  }>();

  const iconHref = computed(() => {
    return transformUrl(`/assets/${userStore.getTenant}__group__.svg#icon_asset_${props.item.id}`, {
      random: false,
    });
  });

  const iconBgImage = computed(() => {
    return `url('${fileUrlParser(props.item.path)}')`;
  });

  // 操作
  const handleMenuClick = async (e, item) => {
    switch (e.key) {
      case MenuItem.Move:
        openChangeModal(true, item);
        break;
      case MenuItem.Delete:
        handleDelete();

        break;
      default:
    }
  };
  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.sureToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await deleteAssets({
          ids: props.item.id!,
        });
        emit('delete');
      },
      onCancel() {},
    });
  };
</script>

<style lang="less" scoped>
  .icon {
    &-item {
      width: 88px;
      height: 88px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;

      svg {
        height: 72px;
        width: 72px;
        font-size: 72px;
      }

      i {
        height: 72px;
        width: 72px;
        background-image: var(--bg-image);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
    }
    &-t {
      font-size: 72px;
      color: #7f6695;
    }
  }

  .icon:hover {
    .action {
      opacity: 1;
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .iconName {
    width: 86px;
    margin-top: 10px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:hover {
      .action {
        display: block;
      }
    }
  }
  .action {
    display: none;
  }
</style>
