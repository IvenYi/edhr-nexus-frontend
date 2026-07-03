<template>
  <van-popover
    v-if="noPopover"
    v-model:show="showPopover"
    placement="top-end"
    :show-arrow="false"
    :offset="[0, 25]"
  >
    <div class="p-8px text-[#212528]">
      <van-button
        class="action-button"
        block
        :disabled="isInsertingBefore"
        :loading="isInsertingBefore"
        size="small"
        loading-text="处理中..."
        @click="handleAction('before')"
      >
        <template #icon>
          <i class="iconfont icon-a-shangcharuhang1 action-icon"></i>
        </template>
        插入上一行
      </van-button>

      <van-button
        class="action-button"
        block
        :disabled="isInsertingAfter"
        :loading="isInsertingAfter"
        size="small"
        loading-text="处理中..."
        @click="handleAction('after')"
      >
        <template #icon>
          <i class="iconfont icon-a-xiacharuhang1 action-icon"></i>
        </template>
        插入下一行
      </van-button>
      <van-button
        class="action-button"
        block
        :disabled="isInsertingAfter"
        :loading="isInsertingAfter"
        size="small"
        loading-text="处理中..."
        @click="handleAction('copy')"
      >
        <template #icon>
          <i class="iconfont icon-fuzhihang action-icon"></i>
        </template>
        复制行
      </van-button>
      <van-button
        v-show="showDelete"
        class="action-button"
        block
        :disabled="isDeleting"
        :loading="isDeleting"
        size="small"
        loading-text="处理中..."
        @click="handleAction('delete')"
      >
        <template #icon>
          <i class="iconfont icon-shanchu2 action-icon"></i>
        </template>
        删除行
      </van-button>
    </div>
    <template #reference>
      <div class="more-wrap ks-row-center-middle">
        <i class="iconfont icon-shiwuliebiao more-icon"></i>
      </div>
    </template>
  </van-popover>
  <!-- <div v-else class="more-wrap ks-row-center-middle">
    <i class="iconfont icon-shiwuliebiao more-icon"></i>
  </div> -->
</template>

<script setup lang="ts" name="fill-main-fields">
  import { ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      isInsertingBefore: boolean;
      isInsertingAfter: boolean;
      isDeleting: boolean;
      showDelete?: boolean;
      noPopover?: boolean;
    }>(),
    {
      isInsertingBefore: false,
      isInsertingAfter: false,
      isDeleting: false,
    },
  );

  const emit = defineEmits<{
    (e: 'before'): void;
    (e: 'after'): void;
    (e: 'delete'): void;
    (e: 'coyp'): void;
  }>();

  const showPopover = ref(false);

  const handleAction = (action: any) => {
    // showPopover.value = false;
    // 解决删除行显隐的时候，气泡还没关闭，偏移距离看着不对
    setTimeout(() => {
      emit(action);
    }, 200);
  };
</script>

<style lang="scss" scoped>
  .action-icon {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    font-size: 18px;
  }

  .more-wrap {
    width: 40px;
    height: 40px;
    background-color: #fff;
  }
  .more-icon {
    font-size: 24px;
    color: var(--van-primary-color);
    // margin-right: -8px;
    // margin-left: 8px;
  }

  .action-button {
    border: none;

    :deep(.van-button__content) {
      justify-content: flex-start;
    }

    :deep(.van-button__content .van-loading) {
      width: 24px;
      height: 24px;
      margin-right: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    + .action-button {
      margin-top: 12px;
    }
  }
</style>
