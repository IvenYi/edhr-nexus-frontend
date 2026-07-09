<template>
  <van-icon
    v-if="!!moreOptions.length"
    name="setting-o"
    size="20"
    :color="useMore ? '#0daa9c' : '#c8c9cc'"
    @click.stop="showPopup"
  />
  <van-popup v-model:show="show" position="bottom" teleport="body">
    <div class="flex flex-col h-full">
      <div class="text-center text-18px font-bold p12px leading-8 title">更多选项</div>
      <div class="overflow-y-scroll flex-1 mb-4px option-container">
        <van-cell
          @click="setVal(i)"
          :class="{
            'is-active': activeKey === i.value,
          }"
          v-for="i in columns"
          :key="i.value"
        >
          <template #title>
            <span>{{ i.text }}</span>
          </template>
          <template #right-icon>
            <div class="ks-row-middle">
              <van-icon
                name="success"
                class="text-18px primary-color"
                v-if="activeKey === i.value"
              />
            </div>
          </template>
        </van-cell>
      </div>
      <div class="w-full p-12px shadow-top">
        <van-button class="w-full px-4px" type="primary" @click="onConfirm">完成</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, reactive } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';

  const { t } = useI18n();

  const props = defineProps<{ useMore; moreOptions; ope; fieldType }>();

  const emit = defineEmits(['update:ope', 'update:useMore', 'clear']);

  const show = ref(false);

  const activeKey = ref(props.useMore || '');

  const columns = computed(() => {
    return props.moreOptions.map((key) => {
      return {
        text: t(`sys.model.${key}`),
        value: key,
      };
    });
  });

  const setVal = (data) => {
    if (activeKey.value === data.value) {
      activeKey.value = '';
    } else {
      activeKey.value = data.value;
    }
  };

  const showPopup = () => {
    show.value = true;
  };

  const onConfirm = () => {
    if (!activeKey.value) {
      emit('update:ope', [...(SEARCH_TYPE[props.fieldType!].default || [])]);
      emit('update:useMore', '');
    } else {
      emit('update:ope', [activeKey.value]);
      emit('update:useMore', activeKey.value);
      emit('clear');
    }
    onCancel();
  };

  const onCancel = () => {
    show.value = false;
  };
</script>
<style scoped lang="less">
  .title {
    z-index: 1;
    top: 0;
    width: 100%;
    position: relative;
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
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.12);
  }

  .option-container {
    min-height: 200px;
  }
  .is-active {
    color: var(--van-primary-color);
  }
  .border-r {
    border-right: 1px solid var(--van-cell-border-color);
  }
  .border-b {
    position: relative;
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
  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }

  :deep(.van-search) {
    padding: 14px 16px;
    &.border-all {
      .van-search__content {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
    .van-search__content {
      &:focus {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
  }
</style>
