<template>
  <div class="btn-wrap">
    <div v-show="dropdownButtons.length" class="btn-more" @click.stop="showPicker = true">
      更多
    </div>
    <div class="ks-col" :class="{ ml8px: !!i }" v-for="(el, i) in showBtnList" :key="el.id">
      <vantButtonDesign :widget="el" :parentWidget="parentWidget" :parentList="children" block />
    </div>
    <van-action-sheet
      :overlay-style="{ position: 'absolute' }"
      :show="true"
      :cancel-text="$t('sys.cancel')"
      duration="0"
      :teleport="rootEl"
      v-if="showPicker"
      class="gct-van-design-popup"
      zIndex="1000"
    >
      <div class="content" @click.stop="onCancel">
        <vantButtonDesign
          :parentList="children"
          :parentWidget="parentWidget"
          :widget="w"
          v-for="w in children"
          :key="w.id"
          block
          type="default"
          class="gct-default"
          :danger="false"
          showHoverLine
        />
      </div>
    </van-action-sheet>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import vantButtonDesign from './button-design.vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const { selectedWidget } = useSelectedWidget();
  const rootEl = document.getElementById('designerRootRef');
  const defProps = defineProps({
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },
    visibleButtons: {
      type: Number,
      default: 2,
    },
    parentWidget: {
      type: Object,
    },
  });
  const showPicker = ref(false);

  const showBtnList = computed(() => defProps.children.slice(0, defProps.visibleButtons));
  const dropdownButtons = computed(() => defProps.children.slice(defProps.visibleButtons));

  function onCancel() {
    showPicker.value = true;
  }
  watch(selectedWidget, (v) => {
    if (!dropdownButtons.value.length) {
      showPicker.value = false;
    }
    showPicker.value = dropdownButtons.value.some((i) => i.id === v.id);
  });
</script>
<style lang="scss" scoped>
  .btn-wrap {
    display: flex;
    align-items: center;
    padding: 0 8px;
  }

  .btn-more {
    width: 60px;
    color: #026ac8;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }

  .gct-default {
    :deep(.van-button--default) {
      height: var(--van-button-default-height);
      padding: var(--van-button-normal-padding);
      border: none;
      font-size: var(--van-button-normal-font-size);
    }
  }

  :deep(.van-button) {
    .van-button__text {
      white-space: wrap;
    }
  }
</style>
<style>
  .gct-van-design-popup {
    position: absolute !important;
    transition: none;
  }
</style>
