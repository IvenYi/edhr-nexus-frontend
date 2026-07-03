<template>
  <Popup
    v-model:show="visible"
    :position="modalProps.position"
    :teleport="teleport"
    :style="popStyle"
    z-index="2000"
    @closed="cancel"
    :duration="0"
  >
    <div class="popupheaher ks-row-middle">
      <div class="w30px"></div>
      <div class="ks-col"> {{ modalProps.title }}</div>
      <div class="w30px text-left cursor-pointer" @click.stop="close">
        <van-icon name="cross"
      /></div>
    </div>
    <webPage v-if="visible" v-bind="pageProps" :modalBodyStyle="modalBodyStyle" />
  </Popup>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import webPage from './webPage.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import Globals from '../utils/runGlobalByPage';
  import { Popup } from 'vant';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { pick, merge, get, has, cloneDeep } from 'lodash-es';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();
  const defProps = defineProps<{
    pageKey: string;
    destroyVm: Function;
  }>();

  const visible = ref(false);
  const modalProps: any = reactive({
    mModalWidth: 0,
    mUnitType: '',
    title: '',
    position: 'right',
  });
  const pageProps = ref<{
    widgetlist: LowCodeWidget.BasicSchema[];
    footerlist: LowCodeWidget.BasicSchema[];
    events: any[];
    css: string;
    js: string;
    onOpen: Function;
    close: Function;
    pageKey: string;
  }>({
    footerlist: [],
    widgetlist: [],
    events: [],
    css: '',
    js: '',
    onOpen: () => {},
    close: close,
    pageKey: defProps.pageKey,
  });
  var colseCallback: Function | null = null;

  const modalBodyStyle = reactive({});

  const popStyle = computed(() => {
    return {
      height: '100%',
      width: `${modalProps.mModalWidth}${modalProps.mUnitType}`,
      maxWidth: '100%',
    };
  });

  async function open({ title, onOpen, onClose, data }: any = {}) {
    const modaldata = await Globals.getModalById(defProps.pageKey);
    const { props, css, runJs, children, events } = modaldata;
    const { wrapperStyle } = useStyle(modaldata);
    merge(
      modalBodyStyle,
      pick(wrapperStyle.value, [
        'backgroundColor',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
      ]),
    );

    modalProps.mUnitType = get(props, 'unitType', '%');
    modalProps.mModalWidth = !has(props, 'modalWidth')
      ? get(props, 'modalWidthPercent', 70)
      : get(props, 'modalWidth', 60);
    modalProps.title = title || props?.modalTitle;
    pageProps.value.bottomBtnList = children?.find((n) => n.type === 'bottom-button-container')
      ? [children?.find((n) => n.type === 'bottom-button-container')]
      : [];
    const bodyWidget = children?.find((n) => n.type === 'modalBody')?.children || [];
    const footerWidget = children?.find((n) => n.type === 'modalFooter')?.children || [];
    pageProps.value.footerlist = footerWidget;
    pageProps.value.widgetlist = cloneDeep(bodyWidget);
    pageProps.value.css = css || '';
    pageProps.value.js = runJs || '';
    pageProps.value.events = events || [];
    pageProps.value.data = data;
    onOpen && (pageProps.value.onOpen = onOpen);
    onClose && (colseCallback = onClose);
    visible.value = true;
  }
  function close(...arg) {
    visible.value = false;
    colseCallback && colseCallback(...arg);
  }
  function cancel() {
    defProps.destroyVm && defProps.destroyVm();
  }

  defineExpose({ open, close });
</script>
<style scoped lang="less">
  .popupheaher {
    position: absolute;
    z-index: 999;
    top: 0;
    width: 100%;
    height: 50px;
    border-bottom: 1px solid #e0e3eb;
    background-color: #fff;
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
    text-align: center;
  }
</style>
