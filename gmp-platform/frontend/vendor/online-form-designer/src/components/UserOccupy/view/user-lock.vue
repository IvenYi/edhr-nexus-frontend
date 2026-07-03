<template>
  <div class="user-lock" :class="{ locked: lockInfo.id }">
    <template v-if="lockInfo.id">
      <span class="user-lock-info">{{ lockInfo.name + t('sys.pageDesigner.locked') }}</span>
      <template v-if="unlockAvailable">
        <i class="iconfont icon-Lock mr-6px"></i>
        <span @click="unlock">{{ t('sys.pageDesigner.unlock') }}</span>
      </template>
    </template>
    <template v-else>
      <i class="iconfont icon-Unlock"></i>
      <span @click="lock">{{ t('sys.pageDesigner.lock') }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useUserOccupy } from '../useUserOccupy';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { lockInfo, lock, unlock, unlockAvailable } = useUserOccupy();
</script>

<style lang="less" scoped>
  .user-lock {
    color: rgba(255, 255, 255, 0.72);
    cursor: pointer;
    .user-lock-info {
      padding-right: 4px;
      color: rgba(255, 255, 255, 0.72);
    }

    .iconfont {
      color: rgba(255, 255, 255, 0.72);
      margin-right: 6px;
      margin-left: 6px;
    }
    &:hover {
      color: #ffffff;
      .iconfont,
      .user-lock-info {
        color: #ffffff;
      }
    }
    &.locked {
      color: #ff8c4b;
      .iconfont {
        color: #ff8c4b;
      }
      .user-lock-info {
        color: #ffffff;
      }
    }
  }
  // .editor-header {
  //   .user-lock {
  //     color: #666;
  //     .user-lock-info {
  //       color: #666;
  //     }
  //     .iconfont {
  //       color: #666;
  //     }
  //     &:hover {
  //       color: #333;
  //       .iconfont,
  //       .user-lock-info {
  //         color: #333;
  //       }
  //     }
  //   }
  // }
</style>
