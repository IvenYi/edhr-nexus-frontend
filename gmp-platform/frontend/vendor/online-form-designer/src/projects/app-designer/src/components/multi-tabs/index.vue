<template>
  <div class="multi-tabs" id="multiTabs">
    <div class="multi-tabs__list">
      <div
        v-for="n in tabs"
        :key="n.id"
        class="multi-tabs__item"
        :class="{
          'multi-tabs__item--active': n.id === tab,
        }"
        @click="onTabClick(n)"
      >
        <div class="w-full px-20px multi-tabs__item-wrap">
          <span class="multi-tabs__item-name">{{ n.name }}</span>
          <close-outlined @click.stop="onTabClose(n)" style="font-size: 16px; zoom: 0.7" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { useMultiTabs } from './useMultiTabs';
  import { nextTick, onMounted } from 'vue';
  import { debounce } from 'lodash-es';

  const { tab, setTab } = useMultiTabs();

  const props = defineProps({
    tabs: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['tab-change', 'tab-close']);

  const onTabClick = (item) => {
    if (item.id === tab.value) return;
    setTab(item.id);
    emit('tab-change', item);
  };

  const onTabClose = async (item) => {
    emit('tab-close', item);
    if (item.id === tab.value && props.tabs.length > 1) {
      const index = props.tabs.findIndex((e) => e.id === item.id);
      const nextIndex = index === 0 ? 1 : index - 1;
      setTab(props.tabs[nextIndex].id);
      await nextTick();
      emit('tab-change', props.tabs[nextIndex]);
      await nextTick();
    }
  };

  const setActive = (id) => {
    setTab(id);
  };

  onMounted(() => {
    const scrollContainer = document.getElementById('multiTabs');
    scrollContainer?.addEventListener('wheel', (e) => {
      if (e.deltaY && Number(e.deltaX) == 0) {
        e.preventDefault();
        scrollContainer.scrollBy({ left: e.deltaY * 3, behavior: 'smooth' });
      } else {
        debounce(() => {
          e.preventDefault();
          scrollContainer.scrollBy({ left: e.deltaY, behavior: 'smooth' });
        }, 200);
      }
    });
  });

  defineExpose({
    setActive,
  });
</script>

<style scoped lang="less">
  .multi-tabs {
    font-size: 14px;
    border-bottom: 1px solid #e0e3ea;
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    &:hover {
      &::-webkit-scrollbar {
        display: block;
        height: 4px;
      }
    }
    &__list {
      display: flex;
    }

    &__item {
      position: relative;
      height: 38px;
      padding: 10px 0;
      display: flex;
      align-items: center;
      line-height: 1;
      border-radius: 0;
      cursor: pointer;
      &:has(+ &--active),
      &:last-child,
      &--active {
        .multi-tabs__item-wrap {
          border-right: none;
        }
      }

      &-name {
        white-space: nowrap;
        margin-right: 16px;
      }

      &-line {
        position: absolute;
        width: 1px;
        height: 14px;
        right: 0;
        top: 50%;
        transform: translate(0, -50%);
        background: #e0e3ea;
      }

      &-wrap {
        min-width: 130px;
        display: flex;
        align-items: center;
        border-right: 1px solid #e0e3ea;
      }

      &--active {
        background: #fff;
        color: var(--ant-primary-color);
        border-bottom: 1px solid var(--ant-primary-color);
      }
    }
  }
</style>
