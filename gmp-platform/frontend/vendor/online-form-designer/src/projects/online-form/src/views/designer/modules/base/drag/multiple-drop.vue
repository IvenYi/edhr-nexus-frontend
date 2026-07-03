<template>
  <div :class="[ns.b(), disabled && ns.m('disabled')]">
    <div :class="[ns.e('drag-text')]">{{ dragText }}</div>
    <template v-if="items">
      <vue-draggable
        :list="items"
        :animation="200"
        ghost-class="ghost"
        :handle="disabled ? 'not-allow' : `.${ns.be('item', 'icon-drag')}`"
        @change="handleChange"
        @dragover="stopPropagation"
        @drop="stopPropagation"
      >
        <template #item="{ element: item, index }">
          <div
            :class="[ns.b('item'), ns.is('selected', selectedIndex === index)]"
            @click="() => handleSelect(index)"
          >
            <i
              v-if="showDrag && !disabled"
              :class="['iconfont', 'icon-drag', ns.be('item', 'icon-drag')]"
            ></i>
            <div :class="ns.be('item', 'content')">
              <i v-show="item.icon" :class="['iconfont', ns.be('item', 'icon'), item.icon]"></i>
              <span :class="[ns.be('item', 'label')]">{{ item.label }}</span>
            </div>
            <i
              v-if="!disabled"
              :class="['iconfont', 'icon-shanchu1', ns.be('item', 'icon-remove')]"
              @click="
                (e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }
              "
            ></i>
          </div>
        </template>
      </vue-draggable>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import VueDraggable from 'vuedraggable';
  import { DragTransferKey } from './use-drop';

  const ns = {
    b: (block?: string) => `gct-multiple-drop${block ? '-' + block : ''}`,
    e: (element: string) => `gct-multiple-drop__${element}`,
    m: (modifier: string) => `gct-multiple-drop--${modifier}`,
    be: (block: string, element: string) => `gct-multiple-drop-${block}__${element}`,
    is: (name: string, state?: boolean) => (state ? `is-${name}` : ''),
  };

  type ItemData = {
    label: string;
    icon: string;
  };

  withDefaults(
    defineProps<{
      items?: ItemData[];
      dragText?: string;
      selectedIndex?: number;
      disabled?: boolean;
      showDrag?: boolean;
    }>(),
    {
      dragText: $t('sys.onlineForm.dragFieldIn'),
      showDrag: true,
    },
  );

  const emit = defineEmits<{
    (
      e: 'move',
      args: {
        newIndex: number;
        oldIndex: number;
        element: ItemData;
      },
    ): void;
    (e: 'remove', index: number): void;
    (e: 'update:selectedIndex', index: number): void;
  }>();

  const handleChange = (args) => {
    emit('move', args.moved);
    console.log('change', args.moved);
  };

  const handleRemove = (index) => {
    emit('remove', index);
  };

  const handleSelect = (index) => {
    emit('update:selectedIndex', index);
  };

  const stopPropagation = (e: DragEvent) => {
    // 阻止内部的拖动排序冒泡到外层
    if (!e.dataTransfer?.types.includes(DragTransferKey)) {
      e.stopPropagation();
    }
  };
</script>

<style lang="scss" scoped>
  @include b(multiple-drop) {
    user-select: none;
    border: 1px dashed #e6e6e6;
    background: #fafafa;
    border-radius: 4px 4px 4px 4px;
    padding: 8px;
    font-size: 12px;

    @include e(drag-text) {
      line-height: 26px;
      color: #797a7d;
      text-align: center;
    }

    @include m(disabled) {
      .#{bem('multiple-drop-item','icon-drag','')} {
        cursor: not-allowed;
      }
    }
  }

  @include b(multiple-drop-item) {
    margin-top: 4px;
    border: 1px solid transparent;
    padding: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0f0f0;
    border-radius: 4px 4px 4px 4px;
    position: relative;

    // 悬浮样式
    &:hover {
      &::after {
        content: '';
        background: rgba(49, 104, 236, 0.16);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
    }

    //选中样式
    @include when(selected) {
      border-color: #3168ec;
    }

    @include e(content) {
      flex-grow: 1;
      background: #ffffff;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e8ebf0;
      margin: 0 4px;
      padding: 0 8px;
    }

    @include e(icon-drag) {
      color: #c3c3c3;
      cursor: move;
      z-index: 2;
    }

    @include e(icon) {
      margin-right: 4px;
      vertical-align: middle;
      color: #797a7d;
    }

    @include e(label) {
      vertical-align: middle;
      color: #242424;
    }

    @include e(icon-remove) {
      color: #797a7d;
      cursor: pointer;
      z-index: 2;
    }
  }
</style>
