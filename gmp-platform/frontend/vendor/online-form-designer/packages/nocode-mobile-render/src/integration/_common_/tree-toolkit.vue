<template>
  <div class="mobile-tree-toolkit" v-if="!treeVisible">
    <div class="toolkit-item" @click.stop="open">
      <GctIcon class="mb-6px" value="icon-preset:edhr-arrow_expand" :size="16" />
      <span>展开目录</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="tree-toolkit">
  const props = defineProps<{
    treeVisible: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'open'): void;
  }>();

  function open() {
    emit('open');
  }
</script>

<style scoped lang="less">
  .mobile-tree-toolkit {
    background: #ffffff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 99;
    padding: 4px;
    border-radius: 0 16px 16px 0;

    .toolkit-item {
      display: flex;
      flex-direction: column;
      padding: 20px 10px;
      border-radius: 4px;
      text-align: center;
      align-items: center;
      cursor: pointer;

      > span {
        text-align: center;
        line-height: 19px;
        font-size: 12px;
        color: #026ac8;
        width: 16px;
        font-size: 16px;
      }
    }
  }
</style>
