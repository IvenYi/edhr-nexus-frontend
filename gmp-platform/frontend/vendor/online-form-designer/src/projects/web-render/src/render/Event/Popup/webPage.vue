<template>
  <div class="pt50px popbody pb20px">
    <div class="popbox" :style="modalBodyStyle">
      <Widget :widgetlist="widgetlist" />
    </div>

    <div v-if="!!bottomBtnList.length" class="modal-bottom-btn">
      <Widget :widgetlist="bottomBtnList" />
    </div>
    <div v-else-if="!!footerlist.length" class="modal-footer">
      <Widget :widgetlist="footerlist" />
    </div>
  </div>
</template>

<script setup lang="ts" name="app1">
  import Widget from '../../widget/mobile.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { EventsMobile } from '../EventsMobile';
  import { onMounted } from 'vue';

  const props = defineProps<{
    widgetlist: LowCodeWidget.BasicSchema[];
    footerlist: LowCodeWidget.BasicSchema[];
    bottomBtnList: LowCodeWidget.BasicSchema[];
    events: any;
    css: string;
    js: string;
    onOpen?: Function;
    close: Function;
    pageKey: string;
    modalBodyStyle: any;
    data: any;
  }>();
  const pageEvent = new EventsMobile(
    { js: props.js, css: props.css, pageKey: props.pageKey },
    { close: props.close },
  );
  onMounted(async () => {
    //确保onOpen函数中的组件初始化后才会去调用
    await pageEvent.getReadyByFun(props.onOpen);
    await (props.onOpen && props.onOpen!(pageEvent.context));
    /**弹框初始化钩子函数 */
    pageEvent.runEventByName('onMounted', props.events, props.data);
  });
</script>
<style scoped lang="less">
  .popbody {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .popbox {
    height: 100%;
    overflow-y: auto;
  }

  .modal-footer {
    min-height: 50px;
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    border-radius: 0 0 2px 2px;
    background: transparent;
  }
</style>
