<template>
  <div class="btn-wrap">
    <div
      v-show="dropdownButtons.length"
      :class="['btn-more', { 'is-disabled': rowDisabled }]"
      @click="onClick"
    >
      更多
    </div>
    <div :class="{ ml8px: !!i }" class="ks-col" v-for="(el, i) in showBtnList" :key="el.id">
      <AsyncGctComponents :widget="el" block class="w100%" />
    </div>
    <van-action-sheet v-model:show="showPicker" :cancel-text="$t('sys.cancel')" duration="0.1">
      <div class="content" @click="onCancel">
        <AsyncGctComponents
          :widget="w"
          v-for="w in list"
          :key="w.id"
          block
          type="default"
          class="gct-default"
          :danger="false"
        />
      </div>
    </van-action-sheet>
  </div>
</template>
<script setup lang="ts">
  import { toRaw, computed, ref } from 'vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import AsyncGctComponents from '/@web-render/render/widget/widget-mobile-async.vue';
  const emit = defineEmits(['afterDelete']);
  const defProps = defineProps({
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },

    visibleButtons: {
      type: Number,
      default: 2,
    },
    rowDisabled: {
      type: Boolean,
    },
  });
  const showPicker = ref(false);
  const list = useDependencyToShowList(defProps.children);
  const showBtnList = computed(() => list.value.slice(0, defProps.visibleButtons));
  const dropdownButtons = computed(() => list.value.slice(defProps.visibleButtons));
  const onClick = () => {
    if (defProps.rowDisabled) {
      return;
    }
    showPicker.value = true;
  };

  const onCancel = () => {
    showPicker.value = false;
  };
</script>
<style lang="scss" scoped>
  .btn-wrap {
    display: flex;
    align-items: center;
    // padding: 0 8px;
  }

  .btn-more {
    width: 60px;
    color: #026ac8;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }

  .gct-default {
    display: block;

    :deep(.van-button--default) {
      height: var(--van-button-default-height);
      padding: var(--van-button-normal-padding);
      border: none;
      font-size: var(--van-button-normal-font-size);
    }
  }
</style>
