<template>
  <div :class="prefixCls">
    <img :class="`${prefixCls}__avator`" :src="userAvatar" />
    <div :class="`${prefixCls}__info`">
      <div :class="`${prefixCls}__name`" :title="userStore?.getUserInfo?.fullname">
        {{ userStore?.getUserInfo?.fullname }}
      </div>
      <a-popover
        v-if="selectTenant?.name && !isBackend"
        trigger="hover"
        v-model:visible="visible"
        @visibleChange="visibleChange"
      >
        <template #content>
          <div class="flex mb-8px">
            <div class="w150px mb-4px">
              <div class="color-[#797A7D]">{{ t('sys.tenantName') }}</div>
              <a-tooltip placement="topLeft">
                <template #title>{{ selectTenant?.name || '选择租户' }}</template>
                <div class="ell">{{ selectTenant?.name || '选择租户' }}</div>
              </a-tooltip>
            </div>
            <div @click.stop="handleClipboardKey(selectTenant?.name)" class="w80px mt-15px copy">
              <i class="iconfont icon-fuzhi primary-gct" style="margin-left: 4px"> </i>
              {{ t('sys.copy') }}
            </div>
          </div>
          <div class="flex">
            <div class="w150px mb-4px">
              <div class="color-[#797A7D]">{{ t('租户标识') }}</div>
              <a-tooltip placement="topLeft">
                <template #title>{{ userStore.getTenant || '--' }}</template>
                <div class="ell">{{ userStore.getTenant || '--' }}</div>
              </a-tooltip>
            </div>
            <div @click.stop="handleClipboardKey(userStore.getTenant)" class="w80px mt-15px copy">
              <i class="iconfont icon-fuzhi primary-gct" style="margin-left: 4px"></i>
              {{ t('sys.copy') }}
            </div>
          </div>
        </template>
        <div :class="`${prefixCls}__tenant`" :title="selectTenant?.name">
          {{ selectTenant?.name || '选择租户' }}
        </div>
      </a-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, unref, watch, ref } from 'vue';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useUserStore } from '/@/store/modules/user';
  // import DefaultAvator from '/@/assets/images/header.jpg';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { ProjectName } from '/@/enums/appEnum';
  import { useGlobSetting } from '/@/hooks/setting';

  const props = defineProps<{
    parentVisible: boolean;
  }>();

  const { t } = useI18n();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { createMessage } = useMessage();
  // const { prefixCls } = useDesign('header-user-dropdown');
  const prefixCls = 'platform-user-info';
  const userStore = useUserStore();
  // 获取默认头像
  const globSetting = useGlobSetting();
  const visible = ref(false);
  const userAvatar = computed(() => {
    const { avatar } = userStore.getUserInfo || {};
    return transformUrl(avatar || globSetting.defaultAvatar);
  });

  const selectTenant = computed(() => {
    return userStore.getTenantList.find((d) => d.id == userStore.getTenant) || null;
  });

  const isBackend = computed(() => {
    return getCurrentProject === ProjectName.BACKEND_MANAGEMENT;
  });

  watch(
    () => props.parentVisible,
    (val) => {
      if (val) {
        visible.value = false;
      }
    },
  );

  const visibleChange = (val) => {
    console.log('val', val);
    if (val && props.parentVisible) {
      visible.value = false;
    }
  };

  function handleClipboardKey(message) {
    const { isSuccessRef } = useCopyToClipboard(message);
    unref(isSuccessRef) && createMessage.success(t('sys.pageDesigner.copySuccess'));
  }
</script>

<style lang="less" scoped>
  @prefix-cls: ~'platform-user-info';
  .@{prefix-cls} {
    display: flex;
    align-items: center;

    &__avator {
      height: 28px;
      width: 28px;
      border-radius: 50%;
      margin-right: 12px;
    }
    &__info {
      font-size: 12px;
      color: #fff;
      line-height: 18px;
      max-width: 90px;
      & > div {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    &__tenant {
      color: rgba(255, 255, 255, 0.64);
      transition: all 0.3s;
      &:hover {
        color: #fff;
      }
    }
  }

  .copy {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    border-radius: 14px;
    color: var(--ant-primary-color);
    cursor: pointer;
    .primary-gct {
      margin-right: 4px;
      // font-size: 12px;
    }
    &:hover {
      background: rgba(2, 106, 200, 0.08);
    }
  }

  .horizontal-mix-sider-layout {
    .@{prefix-cls} {
      &__info {
        color: var(--ant-primary-color);
      }
      &__tenant {
        color: #737e87;
      }
    }
  }
</style>
