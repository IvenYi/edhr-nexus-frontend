<template>
  <div class="user-occupy" v-if="occupyInfo.occupyId">
    <svg-icon src="/assets/design-view/icon_shejizhong.svg" />
    {{ t('sys.user') }}&nbsp;<span class="user-occupy__username" :title="occupyInfo.occupyName">{{
      truncatedName
    }}</span
    >&nbsp;{{ t('sys.pageDesigner.designing') }}...
  </div>
</template>

<script setup lang="ts">
  import { useUserOccupy } from '../useUserOccupy';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const { t } = useI18n();

  const { occupyInfo } = useUserOccupy();

  // 限制显示12个字符，不管是中文还是英文
  const truncatedName = computed(() => {
    if (!occupyInfo.value.occupyName) return '';

    // 将字符串截断为最多12个字符
    if (occupyInfo.value.occupyName.length <= 12) {
      return occupyInfo.value.occupyName;
    }

    return occupyInfo.value.occupyName.substring(0, 12) + '...';
  });
</script>

<style lang="less" scoped>
  .gct-svg-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  .user-occupy {
    // color: #5c616a;
    color: #fff;
    display: flex;
    align-items: center;
    line-height: 1em;
    font-size: 12px;
    &__username {
      color: var(--ant-primary-color);
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      vertical-align: bottom;
    }
    .iconfont {
      margin-right: 6px;
    }
  }
  .designer-stage,
  .so-toolbar {
    .user-occupy {
      color: #5c616a;
    }
  }
</style>
