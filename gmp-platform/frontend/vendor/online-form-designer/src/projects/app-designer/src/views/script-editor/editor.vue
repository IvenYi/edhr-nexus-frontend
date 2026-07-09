<template>
  <div class="editor">
    <editor-header class="editor-header" />
    <div class="flex">
      <div class="flex-1 w-200px">
        <editor-toolbar class="editor-toolbar" @on-insert-script="onInsertScript" />
        <div>
          <editor-core ref="editorRef" />
        </div>
      </div>
      <div class="w-500px" ref="rightPanelRef">
        <a-tabs type="card" v-model:active-key="activeTabKey">
          <a-tab-pane v-if="isRagEnabled" key="1" tab="编程助手">
            <code-chat
              :id="scriptId"
              :backend="true"
              :providers="[{ tag: '@', toolTag: 'model_info', getMentions }]"
              :editorRef="editorRef"
            />
          </a-tab-pane>
          <a-tab-pane key="2" tab="修改历史">
            <editor-history class="editor-history" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <editor-console :defaultInput="'{\n    \n}'" />
    <diff-modal @register="registerDiff" />
    <save-as-modal @register="registerSaveAs" />
  </div>
</template>

<script lang="ts" setup name="js-editor">
  import { provide, watch, unref, ref, onMounted } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import interact from 'interactjs';

  import editorHeader from './modules/editor-header.vue';
  import editorHistory from './modules/editor-history.vue';
  import editorToolbar from './modules/editor-toolbar.vue';
  import editorCore from './modules/core/editor-core.vue';
  import diffModal from './modules/modals/diff-modal.vue';
  import saveAsModal from './modules/modals/save-as-modal.vue';
  import EditorConsole from '/@/components/code-editor/editor-console.vue';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';

  import { useModal } from '/@/components/Modal';
  import { useScript } from './hooks/useScript';
  import { useCacheHistory } from '/@/hooks/develop/useCacheHistory';
  import { getBasicConfigAiRagEnabled } from '/@/apis/gct-apaas/BasicConfigController';

  // 是否启用 AI RAG 功能，默认不启用
  const isRagEnabled = ref(false);
  // 默认选中第二标签页
  const activeTabKey = ref('2');

  const ATabs = Tabs;
  const ATabPane = Tabs.TabPane;

  const editorRef = ref();
  const [registerDiff, { openModal: openDiffModal }] = useModal();
  provide('openDiffModal', openDiffModal);
  const [registerSaveAs, { openModal: openSaveAsModal }] = useModal();
  provide('openSaveAsModal', openSaveAsModal);

  const { scriptId, scriptVersionList, loadScript } = useScript();
  const { historyUtils } = useCacheHistory();

  loadScript();

  const rightPanelRef = ref<HTMLElement | null>(null);

  async function getMentions() {
    const models = await getModelComprehensiveModelSummary({
      type: 'NDO,BASE,TREE,TRANSACTION,SIGN',
      report: true,
    });
    if (!models || !Array.isArray(models)) {
      return [];
    }
    return models.map((model) => {
      const val = `${model.name}(${model.key})`;
      return {
        type: 'model',
        label: val,
        value: val,
        sourceValue: model.key,
        toolTag: 'model_info',
        icon: model.icon,
      };
    });
  }

  async function onInit(): Promise<void> {
    const bol = await getBasicConfigAiRagEnabled();
    if (bol == true) {
      isRagEnabled.value = true;
      activeTabKey.value = '1'; // 如果开启了RAG功能，默认选中编程助手标签页
    } else {
      isRagEnabled.value = false;
      activeTabKey.value = '2'; // 如果没有开启RAG功能，默认选中修改历史标签页
    }
  }

  onMounted(() => {
    if (rightPanelRef.value) {
      interact(rightPanelRef.value).resizable({
        edges: { left: true, right: false, bottom: false, top: false },
        margin: 10, // 增加边缘交互区域，使其更容易拖拽
        listeners: {
          move(event) {
            let { x } = event.target.dataset;
            x = (parseFloat(x) || 0) + event.deltaRect.left;

            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
            });

            Object.assign(event.target.dataset, { x });
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 280, height: Infinity },
          }),
        ],
        inertia: true,
      });
    }
  });

  watch(
    scriptVersionList,
    (list) => {
      if (Array.isArray(unref(list)) && unref(list).length) {
        unref(list).forEach((item: any) => {
          if (!historyUtils.isHistoryInfoExist(item.id)) {
            historyUtils.init({ historyId: item.id });
          }
        });
      }
    },
    { immediate: true },
  );

  const onInsertScript = (type) => {
    editorRef.value?.insertSample(type);
  };

  onInit();
</script>

<style lang="less" scoped>
  .editor {
    background: #f1f1f1;
    height: 100vh;
    width: 100vw;
    color: #333;
    position: relative;
    .editor-header {
      height: 56px;

      & + .flex {
        // Ensures this targets the div.flex sibling
        height: calc(100vh - 56px - 46px); // Full height minus header and console
      }
    }

    .editor-toolbar {
      height: 48px;
      background: #fff;

      & + div {
        margin-top: 10px;
        height: calc(100% - 48px - 10px);
        background: #fff;
        padding-top: 12px;
      }
    }

    .w-500px {
      // Container for a-tabs
      background-color: white;
      height: 100%;
      display: flex;
      flex-direction: column;
      width: 500px; // Initial width
      min-width: 200px; // Minimum width for resizing
      max-width: 600px; // Maximum width for resizing
      border-left: 1px solid #d9d9d9; // Add a border for the resize handle
      position: relative; // Needed for interactjs resizing

      :deep(.ant-tabs) {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }

      :deep(.ant-tabs-nav) {
        padding: 0;
        margin: 0;
      }

      :deep(.ant-tabs-content-holder) {
        flex-grow: 1;
        overflow-y: auto; // Important for scrollable tab content
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }

      :deep(.ant-tabs-tabpane) {
        height: 100%;
        display: flex; // Make tabpane a flex container
        flex-direction: column; // Stack children vertically
        // Ensure child components can adapt to width changes
        overflow-x: hidden;

        // Target the direct child of the tab pane (code-chat or editor-history)
        > :first-child {
          flex-grow: 1; // Allow child to grow and fill height
          height: 100%; // Ensure it tries to take full height
          min-height: 0; // Prevents flex item from overflowing its container in some cases
          overflow-y: auto; // Allow internal scrolling for the component
        }
      }
    }
  }
</style>
