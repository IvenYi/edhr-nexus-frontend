<template>
  <a-row :gutter="[20, 20]">
    <a-col v-for="(item, index) in options" :key="index" :span="12">
      <div
        class="menu-item"
        :class="{ 'is-selected': item.value === value }"
        :data-type="item.value"
        @click="handleItemClick(item.value)"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLevel"
      >
        <div class="menu-item-icon">
          <span>
            <SvgIcon
              size="36"
              :name="
                item.value +
                (hoverItem === item.value || item.value === value ? '_hover' : '_default')
              "
            />
          </span>
        </div>
        <div class="menu-item-info">
          <div class="menu-item-title">{{ item.label }}</div>
          <div v-if="item.message" class="menu-item-desc">{{ item.message }}</div>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { SelectProps } from 'ant-design-vue';
  import { SvgIcon } from '/@/components/Icon';

  const emit = defineEmits(['update:value']);

  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    options: {
      type: Array as PropType<SelectProps['options']>,
      default: () => [],
    },
  });
  console.log('props', props);

  const hoverItem = ref();
  const selectedType = computed(() => {
    return props.value;
  });
  const handleItemClick = (k) => {
    emit('update:value', k);
  };
  const handleMouseEnter = (e) => {
    hoverItem.value = e.target.dataset.type;
  };
  const handleMouseLevel = () => {
    hoverItem.value = '';
  };
</script>
<style lang="less" scoped>
  .menu-item {
    display: flex;
    font-size: 14px;
    padding: 12px;
    border: 1px solid #e8ebf0;
    border-radius: 4px;
    // margin-top: 20px;
    cursor: pointer;
    height: 100%;

    .menu-item-icon {
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--ant-primary-color);
      .svg-icon {
        color: var(--ant-primary-color);
      }
    }
    .menu-item-info {
      flex: 1;
      color: #212528;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .menu-item-desc {
        margin-top: 2px;
        color: #c3c3c3;
        font-size: 12px;
      }
    }
    &:hover {
      background-color: rgba(from var(--ant-primary-color) r g b / 2%) !important;
      border-color: #e0e3ea;
      .menu-item-info {
        color: #384356;
        .menu-item-desc {
          color: #797a7d;
        }
      }
    }
    &.is-selected {
      border-color: var(--ant-primary-color);
      background-color: rgba(from var(--ant-primary-color) r g b / 5%) !important;
      .menu-item-info {
        color: var(--ant-primary-color);
        .menu-item-desc {
          color: #384356;
        }
      }
    }
  }
  :deep(.ant-list-item) {
    border: 0;
    cursor: pointer;
    padding: 10px;
    width: 48%;
    display: inline-block;
    &.is-selected {
      background-color: var(--ant-primary-1);
    }
    .iconfont {
      font-size: 24px;
    }
  }
  .anticon-check {
    font-size: 20px;
    color: var(--ant-primary-color);
  }
</style>
