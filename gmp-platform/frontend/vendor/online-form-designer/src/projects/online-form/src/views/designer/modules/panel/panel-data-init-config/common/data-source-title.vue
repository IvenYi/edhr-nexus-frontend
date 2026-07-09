<template>
  <div class="data-source-title" :class="isChild && 'is-child'">
    <div class="line"></div>
    <div
      class="icon-area flex items-center h-16px w-16px justify-center cursor-pointer ml-4px mr-4px"
      @click="onChangeExpand"
    >
      <minus-square-outlined v-if="isExpand" class="icon" />
      <plus-square-outlined v-else class="icon" />
    </div>
    <span class="title">{{ title }}</span>
    <div v-if="isChild" class="actions">
      <i
        class="iconfont icon-shanchu primary-gct-hover"
        v-if="items && items.length > 1"
        @click="onDelete"
      ></i>
      <span @click="onAdd" v-if="items && index === items.length - 1">
        <i class="iconfont icon-a-"></i>
        {{ $t('sys.onlineForm.addFieldMapping') }}
      </span>
    </div>
    <i v-else class="iconfont icon-shanchu primary-gct-hover" @click="onDelete"></i>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  import { buildUUID } from '/@/utils/uuid';
  import type { IFieldMapItem } from '/@online-form/views/designer/types';

  const emit = defineEmits<{
    (e: 'update:items', items: IFieldMapItem[] | undefined): void;
    (e: 'on-delete'): void;
    (e: 'update:activeKeys', activeKeys: string[]): void;
  }>();

  const props = defineProps<{
    title: string;
    isChild?: boolean;
    items?: IFieldMapItem[];
    index?: number;
    id: string;
    activeKeys: string[];
  }>();

  // true 展开 false 隐藏
  const isExpand = computed({
    get() {
      return !props.activeKeys.includes(props.id);
    },
    set() {},
  });

  function onChangeExpand() {
    if (isExpand.value) {
      const arr = props.activeKeys || [];
      arr.push(props.id);
    } else {
      const findIndex = props.activeKeys?.findIndex((id) => id === props.id);

      const arr = [...props.activeKeys];
      arr.splice(findIndex, 1);
      emit('update:activeKeys', arr);
    }
  }

  function onAdd() {
    const arr = props.items || [];
    arr.push({
      id: buildUUID(),
      modelKey: undefined,
      subModel: undefined,
      subFieldKey: undefined,
      fields: [],
    });
  }

  function onDelete() {
    if (props.isChild) {
      if (!props.items) {
        return;
      }

      const findIndex = props.items?.findIndex((item) => item.id === props.id);

      const arr = [...props.items];
      arr.splice(findIndex, 1);
      emit('update:items', arr);
    } else {
      emit('on-delete');
    }
  }
</script>

<style scoped lang="less">
  .data-source-title {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: 10px;

    &:not(.is-first) {
      .line {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        pointer-events: none;

        &::before {
          content: '';
          position: absolute;
          height: 10px;
          left: 12px;
          top: -10px;
          border-left: 1px solid #e0e0e0;
        }
      }
    }

    .icon {
      color: #8f8f8f;
    }
    .title {
      display: inline-block;
      font-size: 12px;
      color: #252525;
      line-height: 18px;
    }

    .iconfont {
      line-height: 1;
      width: 14px;
      font-size: 14px;
      cursor: pointer;
      position: absolute;
      right: 0;
      color: #797a7d;
    }

    .actions {
      position: absolute;
      right: 0;
      line-height: 18px;
      display: flex;
      align-items: center;

      .iconfont {
        position: relative;
      }
      > span {
        display: flex;
        line-height: 18px;
        font-size: 12px;
        margin-left: 6px;
        align-items: center;
        cursor: pointer;
        color: var(--ant-primary-color) !important;
        .iconfont {
          color: var(--ant-primary-color) !important;
        }
      }
    }

    &.is-child {
      margin-left: 24px;
      .icon-area {
        margin-left: 0;
      }
      &::before {
        content: '';
        position: absolute;
        height: 1px;
        left: 0;
        top: 50%;
        width: 12px;
        transform: translateX(-100%);
        background: #e0e0e0;
      }
      &::after {
        content: '';
        position: absolute;
        left: -12px;
        top: -10px;
        height: 19px;
        width: 1px;
        background: #e0e0e0;
      }

      .line {
        &::before {
          left: 8px;
        }

        &::after {
          content: '';
          position: absolute;
          height: 8px;
          left: -12px;
          top: 10px;
          border-left: 1px solid #e0e0e0;
        }
      }
    }
  }
</style>
