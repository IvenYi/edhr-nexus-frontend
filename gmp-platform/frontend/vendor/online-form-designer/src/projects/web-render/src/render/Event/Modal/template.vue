<template>
  <a-drawer
    class="gct-page-modal"
    v-if="pageProps?.isDrawer"
    v-model:visible="visible"
    v-bind="modalProps"
    placement="right"
    :maskStyle="{ backgroundColor: '#00000000' }"
    :closable="false"
    @close="cancel"
  >
    <template #extra>
      <CloseOutlined @click="close()" />
    </template>
    <ConfigProvider :locale="getAntdLocale">
      <DndProvider :backend="HTML5Backend">
        <webPage v-bind="pageProps" />
      </DndProvider>
    </ConfigProvider>
  </a-drawer>
  <Modal
    class="gct-page-modal"
    v-else
    v-model:visible="visible"
    v-bind="modalProps"
    :footer="null"
    @cancel="cancel"
    :maskClosable="false"
    centered
  >
    <ConfigProvider :locale="getAntdLocale">
      <DndProvider :backend="HTML5Backend">
        <webPage v-bind="pageProps" />
      </DndProvider>
    </ConfigProvider>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted } from 'vue';
  import { Modal, ConfigProvider } from 'ant-design-vue';
  import type { ModalProps } from 'ant-design-vue';
  import webPage from './webPage.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import Globals from '../utils/runGlobalByPage';
  import { useLocale } from '/@/locales/useLocale';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { pick, merge, get, cloneDeep } from 'lodash-es';
  import { DndProvider } from 'vue3-dnd';
  import { HTML5Backend } from 'react-dnd-html5-backend';

  const { getAntdLocale } = useLocale();
  const defProps = defineProps<{
    pageKey: string;
    destroyVm: Function;
  }>();
  const visible = ref(false);
  const modalProps: ModalProps = reactive({});
  const pageProps = ref<{
    widgetlist: LowCodeWidget.BasicSchema[];
    footerlist: LowCodeWidget.BasicSchema[];
    css: string;
    js: string;
    onOpen: Function;
    close: Function;
    onReady: Function;
    pageKey: string;
    events: any;
    data: any;
  }>({
    footerlist: [],
    widgetlist: [],
    events: [],
    css: '',
    js: '',
    onOpen: () => {},
    onReady: () => {},
    close: close,
    pageKey: defProps.pageKey,
    data: null,
  });
  var colseCallback: Function | null = null;

  const getStyle = (styles, info) => {
    const unitType = get(info, 'unitType', 'px');
    return {
      width: `${info?.modalWidth || 800}${unitType}`,
    };
  };

  async function open({ data, title, onOpen, onClose, onReady }: any = {}) {
    const modaldata = await Globals.getModalById(defProps.pageKey);
    const { props, css, runJs, children, events } = modaldata;
    const { wrapperStyle } = useStyle(modaldata);
    modalProps.title = title || props?.modalTitle;
    merge(modalProps, getStyle(wrapperStyle.value, props));
    modalProps.bodyStyle = { ...pick(wrapperStyle.value, ['backgroundColor']), padding: 0 };
    pageProps.value.isDrawer = props?.openMode === 'drawer';
    pageProps.value.bodyStyle = pick(wrapperStyle.value, [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ]);
    pageProps.value.bottomBtnList = children?.find((n) => n.type === 'bottom-button-container')
      ? [children?.find((n) => n.type === 'bottom-button-container')]
      : [];
    pageProps.value.footerlist = children?.[1]?.children || [];
    pageProps.value.widgetlist = cloneDeep(children?.[0]?.children) || [];
    pageProps.value.css = css || '';
    pageProps.value.js = runJs || '';
    pageProps.value.events = events || [];
    pageProps.value.data = data;
    onOpen && (pageProps.value.onOpen = onOpen);
    onReady && (pageProps.value.onReady = onReady);
    onClose && (colseCallback = onClose);
    visible.value = true;
  }
  function close(...arg) {
    visible.value = false;
    defProps.destroyVm && defProps.destroyVm();
    colseCallback && colseCallback(...arg);
  }
  function cancel() {
    defProps.destroyVm && defProps.destroyVm();
    colseCallback && colseCallback();
  }

  defineExpose({ open, close });
</script>
<style lang="less">
  .gct-page-modal {
    .ant-modal-header {
      padding: 16px !important;
    }

    .ant-drawer-header {
      padding: 16px !important;
    }

    .ant-modal-body {
      display: flex;
      flex-direction: column;
      max-height: calc(88vh - 120px);
      overflow: auto;
    }
  }
</style>
