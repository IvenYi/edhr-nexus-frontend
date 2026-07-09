<template>
  <div class="h100% overflow-y-auto">
    <van-list v-model:loading="loading" :finished="finished" finished-text="" @load="onLoad">
      <van-cell
        @click="setVal(i)"
        :class="{
          'is-active': selectedKeys.includes(i.value),
        }"
        v-for="i in options"
        :key="i"
      >
        <template #title>
          <iconNodeHtml v-if="iconNode && i._item['icon']" :labelName="i.label" :item="i._item" />
          <span
            class="text-color"
            :style="{
              '--text-color': i?._item?.['textColor'],
            }"
            v-html="i.label"
          ></span>
        </template>
        <template #right-icon>
          <div class="ks-row-middle">
            <van-icon
              name="success"
              class="text-18px primary-color"
              v-if="selectedKeys.includes(i.value)"
            />
          </div>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>
<script setup lang="ts">
  import { ref, h, computed } from 'vue';
  import IconNext from '@/components/Icon/src/IconNext.vue';
  import { Options } from '../typing';

  interface Props extends Options {
    activeKeys: Array<string | number>;
  }
  const props = defineProps<Props>();

  const emit = defineEmits(['update:activeKeys', 'onload']);
  const loading = ref(false);
  const finished = ref(!props.lazy);

  const selectedKeys = computed<Array<string | number>>({
    get() {
      return props.activeKeys;
    },
    set(val) {
      emit('update:activeKeys', val);
    },
  });

  const iconNodeHtml = {
    render: ({ $attrs }) => {
      if ($attrs.labelName) {
        const { iconColor, icon } = $attrs.item || {};
        const iconAttrs: any = { iconColor, icon };
        if (!iconAttrs?.icon) return;
        return h(IconNext, {
          size: 16,
          value: iconAttrs?.icon,
          color: iconAttrs?.iconColor,
          style: 'vertical-align: text-bottom; margin-right: 4px',
        });
      }
    },
  };

  function setVal(value) {
    if (!props.multiple) {
      selectedKeys.value.splice(0, selectedKeys.value.length, value.value);
    } else {
      const idx = selectedKeys.value.findIndex((e) => e === value.value);
      if (idx > -1) {
        selectedKeys.value.splice(idx, 1);
      } else {
        selectedKeys.value.unshift(value.value);
      }
    }
  }

  const onLoad = async () => {
    loading.value = true;
    emit('onload', (f) => {
      loading.value = false;
      finished.value = f;
    });
  };
</script>
<style lang="less" scoped>
  .title {
    z-index: 1;
    top: 0;
    width: 100%;
    &:after {
      position: absolute;
      box-sizing: border-box;
      content: ' ';
      pointer-events: none;
      right: 0;
      bottom: 0;
      left: 0;
      border-bottom: 1px solid var(--van-cell-border-color);
    }
  }
  .shadow-top {
    box-shadow: 0 -1px 4px 0px rgba(0, 0, 0, 0.12);
  }
  .is-active {
    .text-color {
      color: var(--van-primary-color);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .tag-wrap {
    max-width: calc(100% - 4px);
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .text-color {
    color: var(--text-color);
  }
  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }
</style>
