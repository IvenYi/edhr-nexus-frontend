<template>
  <div
    class="designer"
    :style="pageThumbnailsStyle"
    :class="{
      'designer--hosted': hostedDesigner,
      'designer--page-thumbnails-open': hostedDesigner && activeTab === 'form' && pageThumbnailsVisible,
    }"
  >
    <div v-if="!hostedDesigner" class="designer__header">
      <designer-header />
    </div>
    <template v-if="activeTab === 'form'">
      <div class="designer__toolbar">
        <toolbar />
      </div>
      <div class="designer__spread-sheet">
        <spread-sheet :loading="loading" />
      </div>
      <div v-if="hostedDesigner && pageThumbnailsVisible" class="designer__page-thumbnails">
        <DesignerSidePanel :active-panel="activeSidePanel" @close="pageThumbnailsVisible = false" />
      </div>
      <div
        v-if="hostedDesigner && pageThumbnailsVisible"
        class="designer__page-thumbnails-resizer"
        role="separator"
        aria-label="调整分页缩略图宽度"
        aria-orientation="vertical"
        @pointerdown="startPageThumbnailsResize"
      ></div>
      <div class="designer__toolkit">
        <toolkit
          :show-fields="true"
          :page-thumbnails-visible="pageThumbnailsVisible"
          :active-side-panel="activeSidePanel"
          @select-side-panel="selectSidePanel"
        />
      </div>
      <div class="designer__panel">
        <panel />
      </div>
    </template>
    <div v-else class="designer__hosted-content">
      <div v-if="activeTab === 'model'" class="designer__hosted-pane">
        <div class="designer__hosted-pane-title">建模设计</div>
        <div class="designer__hosted-metadata">
          <div class="designer__hosted-field">
            <span class="designer__hosted-label">模型名称</span>
            <span class="designer__hosted-value">{{ localModelInfo.name || '本地表单模型' }}</span>
          </div>
          <div class="designer__hosted-field">
            <span class="designer__hosted-label">模型编码</span>
            <span class="designer__hosted-value">{{ localModelInfo.key || 'local_form_model' }}</span>
          </div>
          <div class="designer__hosted-field designer__hosted-field--stacked">
            <span class="designer__hosted-label">字段定义</span>
            <div class="designer__hosted-tags">
              <span v-for="field in localFields" :key="field.key" class="designer__hosted-tag">
                {{ field.name }} / {{ field.key }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="designer__hosted-pane designer__hosted-pane--empty">
        <div class="designer__hosted-pane-title">流程设计</div>
        <div class="designer__hosted-empty">当前模板暂无流程设计内容</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="apaas-dp-print">
  import SpreadSheet from '/@online-form/views/designer/modules/sheet.vue';
  import Toolbar from '/@online-form/views/designer/modules/toolbar.vue';
  import DesignerHeader from '/@online-form/views/designer/modules/header.vue';
  import Toolkit from '/@online-form/views/designer/modules//toolkit.vue';
  import DesignerSidePanel from '/@online-form/views/designer/modules/designer-side-panel.vue';
  import Panel from '/@online-form/views/designer/modules/panel.vue';
  import { usePrint } from '/@online-form/views/designer/hooks/usePrint';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import {
    getLocalDesignerFieldList,
    getLocalDesignerModelInfo,
  } from '/@online-form/views/designer/hooks/local-designer-cache';
  import { initializeHostedDesigner } from '/@online-form/views/designer/bridge/template-designer-host';
  import type { TemplateDesignerTabKey } from '/@online-form/views/designer/bridge/template-designer-protocol';
  import { PlatformEnum } from '@gct/nocode-base';

  import { computed, onBeforeUnmount, ref } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const { setPlatformType } = useSpreadSheet();
  const { initialize, loading } = usePrint();
  let cleanupHostedDesigner: (() => void) | undefined;
  let cleanupPageThumbnailsResize: (() => void) | undefined;
  const PAGE_THUMBNAILS_MIN_WIDTH = 180;
  const PAGE_THUMBNAILS_MAX_WIDTH = 300;
  type HostedSidePanelKey = 'pages' | 'fields' | 'widgets';
  const hostedDesigner = computed(() => route.query.hosted === '1');
  const activeTab = ref<TemplateDesignerTabKey>('form');
  const activeSidePanel = ref<HostedSidePanelKey>('pages');
  const pageThumbnailsVisible = ref(true);
  const pageThumbnailsWidth = ref(220);
  const pageThumbnailsStyle = computed<Record<string, string>>(() => ({
    '--page-thumbnails-size': `${pageThumbnailsWidth.value}px`,
  }));
  const localModelInfo = computed(() => getLocalDesignerModelInfo());
  const localFields = computed(() => getLocalDesignerFieldList());

  const clampPageThumbnailsWidth = (width: number) => {
    return Math.min(PAGE_THUMBNAILS_MAX_WIDTH, Math.max(PAGE_THUMBNAILS_MIN_WIDTH, width));
  };

  const selectSidePanel = (panel: HostedSidePanelKey) => {
    activeSidePanel.value = panel;
    pageThumbnailsVisible.value = true;
  };

  const stopPageThumbnailsResize = () => {
    cleanupPageThumbnailsResize?.();
    cleanupPageThumbnailsResize = undefined;
  };

  const startPageThumbnailsResize = (event: PointerEvent) => {
    event.preventDefault();
    stopPageThumbnailsResize();

    const startX = event.clientX;
    const startWidth = pageThumbnailsWidth.value;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      pageThumbnailsWidth.value = clampPageThumbnailsWidth(startWidth + moveEvent.clientX - startX);
    };
    const handlePointerUp = () => {
      stopPageThumbnailsResize();
    };

    document.body.classList.add('designer-page-thumbnails-resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp, { once: true });
    document.addEventListener('pointercancel', handlePointerUp, { once: true });

    cleanupPageThumbnailsResize = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.body.classList.remove('designer-page-thumbnails-resizing');
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  };

  setPlatformType(PlatformEnum.INTEGRATION_PAAS_DP);
  if (hostedDesigner.value) {
    initializeHostedDesigner({
      setActiveTab: (tab) => {
        activeTab.value = tab;
      },
    }).then((cleanup) => {
      cleanupHostedDesigner = cleanup;
    });
  } else {
    initialize(route.query.id as string, undefined, undefined, route.query.env as string, route.query.model as string);
  }

  onBeforeUnmount(() => {
    stopPageThumbnailsResize();
    cleanupHostedDesigner?.();
  });
</script>

<style lang="less">
  @import url('/@online-form/views/designer/styles/designer.less');
  @import url('/@online-form/views/designer/styles/spread-sheet.less');
  @import url('/@online-form/views/designer/styles/panel.less');
  @import url('/@online-form/views/designer/styles/antd.override.less');
  @import url('/@online-form/views/designer/styles/drop-box.less');
  @import url('/@online-form/views/designer/styles/dynamic-area.less');
  @import url('/@online-form/views/designer/styles/hover.less');

  .img-preview {
    z-index: 2000 !important;
  }

  .designer.designer--hosted {
    --header-size: 0px;
  }

  .designer__hosted-content {
    grid-column: 1 / -1;
    grid-row: 2 / 4;
    min-width: 0;
    min-height: 0;
    background: #f4f6fa;
    padding: 24px;
    overflow: auto;
  }

  .designer__hosted-pane {
    max-width: 960px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  }

  .designer__hosted-pane-title {
    font-size: 18px;
    line-height: 26px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
  }

  .designer__hosted-metadata {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .designer__hosted-field {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .designer__hosted-field--stacked {
    flex-direction: column;
    gap: 10px;
  }

  .designer__hosted-label {
    min-width: 72px;
    font-size: 13px;
    line-height: 20px;
    color: #6b7280;
  }

  .designer__hosted-value {
    font-size: 14px;
    line-height: 22px;
    color: #111827;
  }

  .designer__hosted-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .designer__hosted-tag {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    background: #f3f4f6;
    color: #374151;
    font-size: 12px;
    line-height: 18px;
  }

  .designer__hosted-pane--empty {
    display: flex;
    flex-direction: column;
    min-height: 220px;
  }

  .designer__hosted-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
    color: #6b7280;
    font-size: 14px;
  }
</style>
