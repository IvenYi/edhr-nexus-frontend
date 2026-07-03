<template>
  <div class="ks-row h100%" ref="layout">
    <div class="shrink-0 ks-column" :style="{ width: start + 'px' }">
      <div class="vue-header ks-row-middle justify-between">
        <div> Vue3 </div>
        <div>
          <span
            class="iconfont icon-a-tiaozhuanwendang1 mr10px cursor-pointer"
            @click="gohelp"
          ></span>
          <!-- 搜索 -->
          <search-outlined class="icon mr10px" @click="findByKeyword" />
          <!-- 回到顶部 -->
          <up-circle-outlined class="icon mr10px" @click="scrollToTop" />
          <!-- 回到底部 -->
          <down-circle-outlined class="icon mr10px" @click="scrollToBottom" />
          <!-- 格式刷 -->
          <format-painter-outlined class="icon mr10px" @click="handleFormatCodeClick" />
          <!-- 下载 -->
          <cloud-download-outlined class="icon mr10px" @click="handleDownloadLogClick" />
          <!-- 清空 -->
          <clear-outlined class="icon" @click="handleClearClick" />
        </div>
      </div>
      <div class="ks-col">
        <VueEditor class="h100%" v-model:value="code" ref="VueEditorRef" />
      </div>
    </div>
    <div class="cursor-col-resize pl1px pr1px w-1px bg-[#E0E3EA]" @mousedown="mousedown"> </div>
    <div class="ks-col pr5pxl ks-column">
      <div class="vue-header ks-row-middle"> 预览效果 </div>
      <div class="ks-col">
        <VueRender />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { IModal } from '@gct/runtime';
  import { UseDragByLine } from '/@page-designer/components/widgets/hooks/useDragLine';
  import { VueEditor, compileVue, getVueComponentByCode } from '@gct/vue-editor';
  import { COLUMNS_TYPE } from '/@page-designer/enum';
  import { message as Message } from 'ant-design-vue';

  const layout = ref();
  const VueEditorRef = ref();
  const { start, moveDomDown } = UseDragByLine(600, COLUMNS_TYPE.LEFT, { minValue: 400 });
  const defProps = defineProps<{
    modal: IModal;
    code: string;
  }>();
  const code = ref(defProps.code);

  const runtimeCode = computed(() => {
    const data = compileVue(code.value);
    return data;
  });

  defProps.modal.ok = async () => {
    const errs = VueEditorRef.value.getErrors();
    if (errs.length) {
      Message.error('语法错误');
      return Promise.reject();
    }
    return {
      ok: true,
      data: {
        code: code.value,
        runtimeCode: runtimeCode.value,
      },
    };
  };
  function mousedown(e) {
    moveDomDown(e, layout.value);
  }
  const VueRender = computed(() => getVueComponentByCode(runtimeCode.value));

  /**
   * 搜索
   */
  function findByKeyword() {
    try {
      const monacoEditor = VueEditorRef.value.getVueInstance();
      // 先聚焦编辑器
      monacoEditor.focus();
      // 从模型中获取要查找的字符串范围 new Range(startLineNumber, startColumn, endLineNumber, endColumn)
      monacoEditor.setSelection(new monaco.Range(1, 9999, 1, 10000));
      // 触发查找操作
      // this.editor.getAction('actions.find').run() // 查找方式一
      monacoEditor.trigger('', 'actions.find', null); // 查找方式二
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * 设置编辑器滚动到最顶部
   */
  function scrollToTop() {
    const monacoEditor = VueEditorRef.value.getVueInstance();
    monacoEditor.setScrollPosition({ scrollTop: 0 });
  }
  /**
   * 设置编辑器滚动到最底部
   */
  function scrollToBottom() {
    const monacoEditor = VueEditorRef.value.getVueInstance();
    monacoEditor.revealLine(monacoEditor.getModel()!.getLineCount());
  }
  /**
   * 格式化代码
   */
  function handleFormatCodeClick() {
    const monacoEditor = VueEditorRef.value.getVueInstance();
    monacoEditor.getAction('editor.action.formatDocument')!.run(); // 自动格式化代码
  }
  /** 清空 */
  function handleClearClick() {
    const monacoEditor = VueEditorRef.value.getVueInstance();
    monacoEditor.setValue('');
  }
  /**
   * 下载
   */
  function handleDownloadLogClick() {
    const data = code.value;
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([data]);
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    const link: any = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    link.href = (url as any).createObjectURL(blob);
    link.download = 'vue3';
    link.dispatchEvent(event);
  }

  function gohelp() {
    window.open('https://cn.vuejs.org/');
  }
</script>
<style scoped lang="less">
  .vue-header {
    height: 36px;
    padding: 0 12px;
    border-bottom: 1px solid #e0e3ea;
    background-color: #fcfcfd;
    color: #212528;
  }
</style>
