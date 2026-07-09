<template>
  <a-tooltip placement="bottom">
    <template #title>
      <span>{{ $t('sys.menu.messageCenter') }}</span>
    </template>
    <div class="icon-wrapper" @click="handleGo">
      <a-badge :count="count">
        <i class="iconfont icon-xiaoxizhongxin1"></i>
      </a-badge>
    </div>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { PageEnum } from '/@/enums/pageEnum';
  import { ProjectName } from '@/enums/appEnum';
  import { useGo } from '/@/hooks/web/usePage';
  import { getInternalMessageUnreadCount } from '/@/apis/gct-platform/InternalMessageController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import MessageModal from './message-modal.vue';

  const permissionStore = usePermissionStore();
  const go = useGo();
  const usePathQuery = usePathQueryStore();

  const handleGo = async () => {
    if (permissionStore.getCurrentProject === ProjectName.PORTAL) {
      go(PageEnum.MESSAGE_CENTER);
    } else if (permissionStore.getCurrentProject === ProjectName.WEB_RENDER) {
      await gct.openUtil.modal(
        MessageModal,
        {
          appId: usePathQuery.getAid(),
        },
        {
          title: $t('sys.menu.messageCenter'),
          width: 1040,
          height: 800,
          showFooter: false,
        },
      );
    } else {
      window.location.href = `${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#${
        PageEnum.MESSAGE_CENTER
      }`;
    }
  };

  const { mitt } = useMitt();

  const count = ref(0);

  onMounted(() => {
    mitt.on('update-message-count', (changeNum: any) => {
      count.value = changeNum;
    });
    getUnreadCount();
  });

  onBeforeUnmount(() => {
    mitt.off('update-message-count');
  });

  const getUnreadCount = async () => {
    const config = usePathQuery.getAid()
      ? {
          transferToConfig: { headers: { 'App-Tag': usePathQuery.getAid() } },
        }
      : {};
    const res = await getInternalMessageUnreadCount(config);
    count.value = res ? Number(res) : 0;
  };
</script>

<style scoped>
  :deep(.ant-badge-count) {
    height: 12px;
    font-size: 10px;
    line-height: 12px;
  }

  :deep(.ant-badge-multiple-words) {
    padding: 0 5px;
  }
</style>
