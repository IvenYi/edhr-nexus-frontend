<template>
  <div class="btn-wrap">
    <div
      v-show="dropdownButtons.length"
      :class="['btn-more', { 'is-disabled': rowDisabled }]"
      @click="onClick"
    >
      <IconNext
        :size="20"
        value="icon-park:more"
        :style="{
          marginRight: '0px',
          '--color': '#bfbfbf',
        }"
      />
    </div>
    <AsyncGctComponents
      v-for="(el, i) in showBtnList"
      :key="el.id"
      :widget="el"
      :index="index"
      :formData="rowValue"
      class="ml4px"
    />
    <van-action-sheet v-model:show="showPicker" :cancel-text="$t('sys.cancel')" duration="0.1">
      <div class="content" @click="onCancel">
        <AsyncGctComponents
          :widget="w"
          :formData="rowValue"
          v-for="w in list"
          :key="w.id"
          block
          type="default"
          class="gct-default"
          :index="index"
          :danger="false"
        />
      </div>
    </van-action-sheet>
  </div>
</template>
<script setup lang="ts">
  import { toRaw, computed, ref } from 'vue';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  import { operateSysEnums } from '/@/projects/page-designer/src/enum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { showNotify, showConfirmDialog } from 'vant';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import AsyncGctComponents from '/@page-designer/components/widgets/mobile/index.vue';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['afterDelete']);
  const defProps = defineProps({
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },
    rowValue: {
      type: Object,
      default: () => {},
    },
    visibleButtons: {
      type: Number,
      default: 2,
    },
    rowDisabled: {
      type: Boolean,
    },
    index: {
      type: Number,
    },
  });
  const showPicker = ref(false);
  const children = ref(cloneDeep(defProps.children));
  const list = useDependencyToShowList(children.value, defProps.rowValue);
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
    flex: 1;
    justify-content: end;
  }

  .van-button {
    height: auto;
    padding: 7px 12px;
    // float: right;
  }

  .vant-button {
    & + & {
      margin-left: 8px;
    }
  }

  .btn-more {
    margin-left: 8px;

    &.is-disabled {
      opacity: 0.3;
    }

    .i-icon-more {
      position: relative;
      top: 6px;
    }
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
