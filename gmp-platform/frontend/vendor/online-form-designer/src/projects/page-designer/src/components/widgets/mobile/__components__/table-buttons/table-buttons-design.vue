<template>
  <div class="btn-wrap">
    <div v-show="dropdownButtons.length" class="btn-more" @click.stop="showPicker = true">
      <IconNext
        :size="20"
        value="icon-park:more"
        :style="{
          marginRight: '0px',
          '--color': '#bfbfbf',
        }"
      />
    </div>
    <vantButtonDesign
      v-for="(el, i) in showBtnList"
      :key="el.id"
      :widget="el"
      :parentWidget="parentWidget"
      :parentList="children"
    />
    <van-action-sheet
      zIndex="1000"
      :overlay-style="{ position: 'absolute' }"
      :show="true"
      :cancel-text="$t('sys.cancel')"
      duration="0"
      :teleport="rootEl"
      v-if="showPicker"
      class="gct-van-design-popup"
    >
      <div class="content" @click.stop="onCancel">
        <vantButtonDesign
          :parentList="buttons"
          :parentWidget="parentWidget"
          :widget="w"
          v-for="w in buttons"
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
  import IconNext from '/@/components/Icon/src/IconNext.vue';
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
  const buttons = computed(() => defProps.children);
  const showBtnList = computed(() => buttons.value.slice(0, defProps.visibleButtons));
  const dropdownButtons = computed(() => buttons.value.slice(defProps.visibleButtons));

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
    flex: 1;
    justify-content: end;

    & > div {
      & + div {
        margin-left: 4px;
      }
    }
  }

  .btn-more {
    cursor: pointer;

    .i-icon-more {
      position: relative;
      top: 6px;
    }
  }

  .gct-default {
    :deep(.van-button--default) {
      height: var(--van-button-default-height);
      padding: var(--van-button-normal-padding);
      border: none;
      font-size: var(--van-button-normal-font-size);
    }
  }
</style>
<style>
  .gct-van-design-popup {
    position: absolute !important;
    transition: none;
  }
</style>
