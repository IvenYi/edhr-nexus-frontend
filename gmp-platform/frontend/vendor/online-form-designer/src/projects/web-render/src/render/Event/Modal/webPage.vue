<template>
  <div :style="computedStyle" role="document" class="relative">
    <Widget :widgetlist="widgetlist" v-if="loading" />
  </div>
  <div v-if="!bottomBtnList.length && !!footerlist.length">
    <a-divider />
    <Widget :widgetlist="footerlist" v-if="loading" />
  </div>
  <div v-if="!!bottomBtnList.length" class="modal-bottom-btn">
    <Widget :widgetlist="bottomBtnList" v-if="loading" />
  </div>
</template>

<script setup lang="ts" name="app1">
  import Widget from '../../widget/index.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { EventsPc } from '../EventsPc';
  import { onMounted, computed, ref } from 'vue';

  const props = defineProps<{
    widgetlist: LowCodeWidget.BasicSchema[];
    footerlist: LowCodeWidget.BasicSchema[];
    bottomBtnList: LowCodeWidget.BasicSchema[];
    bodyStyle: object;
    events: any;
    css: string;
    js: string;
    onOpen?: Function;
    onReady?: Function;
    close: Function;
    pageKey: string;
    isDrawer?: boolean;
    data: any;
  }>();
  const loading = ref(false);
  const pageEvent = new EventsPc(
    { js: props.js, css: props.css, pageKey: props.pageKey },
    { close: props.close },
  );
  const computedStyle = computed(() => {
    let styleObj = { 'min-height': '100px', ...props.bodyStyle, overflow: 'auto' };
    if (props.isDrawer) {
      styleObj['height'] = props?.bottomBtnList?.length
        ? 'calc(100% - 64px)'
        : props?.footerlist?.length
        ? 'calc(100% - 81px)'
        : '100%';
    }
    return styleObj;
  });
  onMounted(async () => {
    props.onReady && (await props.onReady(pageEvent));
    loading.value = true;
    //确保onOpen函数中的组件初始化后才会去调用
    await pageEvent.getReadyByFun(props.onOpen);
    props.onOpen && (await props.onOpen!(pageEvent.context));
    /**弹框初始化钩子函数 */
    pageEvent.runEventByName('onMounted', props.events, props.data);
  });
</script>
<style scoped lang="less"></style>
