<template>
  <a-select
    :class="['parse-select', `parse-select--${mode}`, allowSwitch && 'parse-select--allow-switch']"
    v-bind="$attrs"
    :open="mode === 'scan' ? false : undefined"
    :searchValue="_searchVal"
    @search="onSearch"
    @keyup.enter.capture="handleEnter"
  >
    <template v-for="(slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}"></slot>
    </template>
    <template #suffixIcon>
      <i class="iconfont icon-saoyisao parse-select__scan-icon"></i>
      <i class="iconfont icon-arrow_down_pad parse-select__dropdown-icon"></i>
      <div @click="switchMode" class="parse-select__suffix parse-select__switch-icon">
        <i class="iconfont icon-qiehuan"></i>
      </div>
    </template>
  </a-select>
</template>

<script lang="ts" setup name="parse-select">
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import type { ITrace } from '@gct/nocode-base';

  const props = defineProps<{
    allowSwitch: boolean;
    mode: 'scan' | 'dropdown';
    searchValue: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:mode', mode: any): void;
    (e: 'search', str: string): void;
    (e: 'scan', str: string): void;
  }>();

  const switchMode = (e: MouseEvent) => {
    emit('update:mode', props.mode === 'scan' ? 'dropdown' : 'scan');
    e.stopPropagation();
  };

  const _searchVal = ref<string>();

  watch(
    () => props.searchValue,
    (val) => {
      _searchVal.value = val;
    },
    { immediate: true },
  );

  const onSearch = (str: string) => {
    _searchVal.value = str;
    emit('search', str);
  };

  const handleEnter = () => {
    if (!_searchVal.value) {
      return;
    }
    emit('scan', _searchVal.value);
    // 清空查询条件
    _searchVal.value = '';
    emit('search', '');
  };
</script>

<style lang="less" scoped>
  .parse-select {
    &:has(.ant-select-clear) {
      &:hover {
        :deep(.ant-select-arrow) {
          display: none;
        }
      }
    }
    :deep(.ant-select-arrow) {
      user-select: none !important;
      pointer-events: unset;
      // background: rgba(0, 0, 0, 0.1);
      width: 24px;
      height: 24px;
      top: 2px;
      right: 0;
      margin-top: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        font-size: 12px;
      }
    }

    :deep(.ant-select-clear) {
      right: 6px;
    }

    &__suffix {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }

    &__dropdown-icon,
    &__scan-icon,
    &__switch-icon {
      display: none;
    }

    &__switch-icon {
      cursor: pointer;
      color: #026ac8;
    }

    &--scan {
      .parse-select__scan-icon {
        display: block;
      }
    }

    &--dropdown {
      .parse-select__dropdown-icon {
        display: block;
      }
    }

    // 允许切换且悬浮到箭头位置处时显示切换图标
    &--allow-switch {
      :deep(.ant-select-arrow) {
        &:hover {
          .parse-select__scan-icon,
          .parse-select__dropdown-icon {
            display: none;
          }
          .parse-select__switch-icon {
            display: flex;
          }
        }
      }
    }
  }
</style>
