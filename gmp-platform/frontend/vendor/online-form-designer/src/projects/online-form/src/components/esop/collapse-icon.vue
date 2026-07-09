<template>
  <a-tooltip placement="bottom">
    <template #title>
      <span>{{ isCollapse ? $t('sys.unfold') : $t('sys.collapse') }}</span>
    </template>
    <div
      v-bind="$attrs"
      :class="['collapse-icon', isCollapse && 'is-collapse']"
      @click="clickCollapse()"
    >
      <i class="gct-iconfont icon-fanhui-padduan"></i>
    </div>
  </a-tooltip>
</template>

<script lang="ts" setup name="collapse-icon">
  const props = withDefaults(
    defineProps<{
      /** 是否折叠 */
      isCollapse?: boolean;
    }>(),
    {
      isCollapse: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:isCollapse', value: boolean): void;
  }>();

  function clickCollapse() {
    emit('update:isCollapse', !props.isCollapse);
  }
</script>

<style lang="less" scoped>
  .collapse-icon {
    width: 24px;
    height: 24px;
    background: #ffffff;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
    border-radius: 100px 100px 100px 100px;
    border: 1px solid #e0e3eb;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    > .gct-iconfont {
      transform: rotate(0);
      color: #8b8b8b;
      font-size: 14px;
    }

    &.is-collapse {
      transform: rotate(180deg);
    }

    &:hover {
      background: #f2f5f8;
      > .gct-iconfont {
        color: #1a1d23;
      }
    }
  }
</style>
