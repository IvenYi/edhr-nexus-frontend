<!--
 * @Author: wangming
 * @Date: 2023-07-19 13:58:07
 * @LastEditors: wangming
 * @LastEditTime: 2023-07-19 14:28:30
 * @FilePath: /paas-main-front/src/projects/web-render/src/render/widget-visible.vue
 * @Description:
-->
<template>
  <div :style="positionRect" class="suspension" @dragstart.stop="ondragstart">
    <!-- <slot></slot> -->
    <div
      ref="actionRef"
      :class="{ 'widget-view-action': true, 'one-action': layout && layout.length === 1 }"
      v-show="show"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.selectParentWidget') }}</template>
        <span
          v-if="!layout || layout.includes('upper')"
          class="iconfont icon-fuzujian cursor-pointer"
          @click.stop="upper"
        ></span>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ t('sys.delete') }}</template>
        <span
          v-if="!layout || layout.includes('delete')"
          class="iconfont icon-shanchu cursor-pointer"
          @click.stop="del"
        ></span>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onUnmounted, onMounted, unref, computed, inject, nextTick } from 'vue';
  import { useElementBounding, useMutationObserver } from '@vueuse/core';
  import { SCOPE } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useDesignerController } from '/@/projects/page-designer/src/hooks/useDesigner';

  function ondragstart(e) {
    e.stopPropagation();
  }

  const defProps = defineProps<{
    rootRef: SVGElement;
    zIndex?: Number;
    layout?: Array<string>;
    parentWidget?: Partial<LowCodeWidget.BasicSchema>;
  }>();
  const show = ref(true);
  const positionRect = computed(() => {
    return {
      top: top.value - height.value + 'px',
      left: right.value - width.value + 'px',
      zIndex: defProps.zIndex || 300,
    };
  });
  const { setSelectedWidget } = useSelectedWidget();
  const { isNewDesigner } = useDesigner();
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;

  const c = useDesignerController();

  const { t } = useI18n();
  const emit = defineEmits(['upper', 'delete']);
  const actionRef = ref();
  const { width, height } = useElementBounding(actionRef);

  const { top, right, update } = useElementBounding(defProps.rootRef, { immediate: true });

  useMutationObserver(
    defProps.rootRef,
    () => {
      update();
    },
    {
      attributes: true,
    },
  );

  function upper() {
    // if (isNewDesigner.value) {
    //   c.setSelect(defProps.parentWidget.id);
    // } else {
    defProps.parentWidget && setSelectedWidget(defProps.parentWidget, scope);
    emit('upper');
    // }
  }

  function del() {
    emit('delete');
  }
  onMounted(async () => {
    await nextTick();
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        show.value = !!entry.isIntersecting;
      });
    });
    observer.observe(defProps.rootRef);
    onUnmounted(() => {
      observer.disconnect();
    });
  });
</script>
<style lang="less" scoped>
  .suspension {
    position: fixed;
    background-color: var(--ant-primary-color);
  }

  .widget-view-action {
    display: flex;
    align-items: center;
    height: 30px;
    padding: 5px 8px;
    border-radius: 2px 2px 0 0;
    background-color: rgb(0 0 0 / 20%);
    color: #fff;
    line-height: 30px;
    cursor: pointer;

    &.one-action {
      .iconfont {
        height: 20px;
        width: 20px;
      }
    }

    .iconfont {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 2px;
      font-size: 14px;

      &:hover {
        background-color: rgb(255 255 255 / 48%);
      }
    }
  }
</style>
