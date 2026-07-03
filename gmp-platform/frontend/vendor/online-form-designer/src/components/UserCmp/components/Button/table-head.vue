<template>
  <div class="flex header-btn">
    <div
      v-if="diasplayBtn.length"
      class="display-btn"
      :class="{ radius: !hideBtn?.length }"
      @click="
        $emit('notify', {
          key: diasplayBtn[0].key,
          type: diasplayBtn[0].useCustomizeCmp ? 'importData' : '',
        })
      "
    >
      {{ diasplayBtn[0].name }}
    </div>
    <a-dropdown class="ml-1px hide-btn" v-if="hideBtn?.length">
      <template #overlay>
        <a-menu>
          <a-menu-item
            v-for="btn of hideBtn"
            :key="btn.key"
            @click="
              $emit('notify', { key: btn.key, type: btn.useCustomizeCmp ? 'importData' : '' })
            "
          >
            {{ btn.name }}
          </a-menu-item>
        </a-menu>
      </template>
      <EllipsisOutlined />
    </a-dropdown>
  </div>
</template>
<script setup lang="ts" name="table-head">
  import type { IButtonProps } from '../../types/index.d';
  import { computed } from 'vue';

  interface Props {
    buttons?: IButtonProps[];
  }

  const props = defineProps<Props>();

  defineEmits(['notify']);

  const hideBtn = computed(() => {
    return props.buttons?.filter((e, idx) => idx) || [];
  });

  const diasplayBtn = computed(() => {
    return props.buttons?.filter((e, idx) => !idx) || [];
  });
</script>
<style scoped lang="less">
  .header-btn {
    align-items: center;
    .display-btn {
      cursor: pointer;
      font-size: 14px;
      padding: 5px 20px;
      color: #fff;
      background-color: var(--ant-primary-color);
      border-radius: 4px 0 0 4px;
      &:hover {
        color: #fff;
        border-color: var(--ant-primary-color-hover);
        background: var(--ant-primary-color-hover);
      }
    }
    .hide-btn {
      cursor: pointer;
      color: #fff;
      padding: 9px 8px;
      background-color: var(--ant-primary-color);
      border-radius: 0 4px 4px 0;
      &:hover {
        color: #fff;
        border-color: var(--ant-primary-color-hover);
        background: var(--ant-primary-color-hover);
      }
    }
  }
  :deep(.ant-dropdown-menu-item) {
    width: 96px;
  }
  .radius {
    border-radius: 4px !important;
  }
</style>
