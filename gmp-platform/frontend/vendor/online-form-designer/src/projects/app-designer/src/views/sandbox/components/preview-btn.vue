<template>
  <div class="flex">
    <div class="display-btn" @click="(e) => emit('click', e)">
      <i class="gct-iconfont icon-icon_yulan_btn mr4px"></i> {{ props.title }}
    </div>
    <a-dropdown class="hide-btn">
      <template #overlay>
        <a-menu>
          <a-menu-item @click="(e) => emit('clickSandbox', e)">
            {{ '沙箱预览' }}
          </a-menu-item>
        </a-menu>
      </template>
      <i class="gct-iconfont icon-icon_more_shaxiangyulan"></i>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    title: string;
    icon: string;
  }>();

  const emit = defineEmits(['click', 'clickSandbox']);
</script>
<style lang="less" scoped>
  .display-btn {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 32px;
    border: 1px solid #e0e3eb;
    border-radius: 4px 0 0 4px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      z-index: 3;
      border-color: var(--ant-primary-color);
      color: var(--ant-primary-color);
    }
  }

  .hide-btn {
    position: relative;
    height: 32px;
    margin-left: -1px;
    padding: 8px 4px;
    border: 1px solid #e0e3eb;
    border-radius: 0 4px 4px 0;
    cursor: pointer;

    &:hover {
      z-index: 3;
      border-color: var(--ant-primary-color);
      color: var(--ant-primary-color);
    }
  }
</style>
