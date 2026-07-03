<template>
  <div>
    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.previewApp') }}</span>
      </template>
      <div class="icon-wrapper" @click="preview">
        <i class="iconfont icon-yulan"></i>
      </div>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { usePreview } from '/@/hooks/develop/usePreview';

  const { branchId } = useBranch();
  const queryStore = usePathQueryStore();
  const { goPreview } = usePreview();

  const preview = function () {
    goPreview({
      aid: queryStore.getAid()!,
      bid: branchId.value!,
    });
  };
</script>

<style lang="less">
  @import url('/@/layouts/platform/style/icon-wrapper.less');
</style>
