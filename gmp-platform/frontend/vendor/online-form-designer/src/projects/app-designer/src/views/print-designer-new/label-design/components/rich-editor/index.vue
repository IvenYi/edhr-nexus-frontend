<template>
  <div style="border: 1px solid #e8ebf0">
    <Toolbar
      style="border-bottom: 1px solid #e8ebf0"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      v-model="valueHtml"
      style="height: 400px"
      :defaultConfig="editorConfig"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onBlur="handleBlur"
      @onFocus="handleFocus"
    />
  </div>
</template>

<script setup lang="ts">
  import './style.css'; // 引入 css
  import { onBeforeUnmount, ref, shallowRef, onMounted, defineExpose } from 'vue';
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
  import { IDomEditor, Boot } from '@wangeditor/editor';

  import { registerFormatPaint } from './formatBrush';

  registerFormatPaint();
  const toolbarConfig = {
    toolbarKeys: [
      'undo',
      'redo',
      'FormatPaintMenuConf',
      'clearStyle',
      '|',
      'headerSelect',
      'fontFamily',
      'fontSize',
      'fontFamily',
      'fontSize',
      '|',

      'bold',
      'italic',
      'through',
      'underline',
      'color',
      'bgColor',
      '|',
      {
        key: 'group-justify',
        title: $t('sys.pageDesigner.align'),
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
        menuKeys: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyJustify'],
        // 添加标记类名
        className: 'force-click-menu',
      },
      {
        key: 'indentDropdown',
        title: $t('sys.printDesigner.indentAdjust'),
        iconSvg: `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.0003 1.67969L1.00028 1.71117C0.921708 1.71117 0.857422 1.77545 0.857422 1.85403V2.85403C0.857422 2.9326 0.921708 2.99688 1.00028 2.99688L15.0003 2.9654C15.0789 2.9654 15.1431 2.90112 15.1431 2.82254V1.82254C15.1431 1.74397 15.0789 1.67969 15.0003 1.67969ZM15.0003 9.25112H6.00028C5.92171 9.25112 5.85742 9.3154 5.85742 9.39397V10.394C5.85742 10.4725 5.92171 10.5368 6.00028 10.5368H15.0003C15.0789 10.5368 15.1431 10.4725 15.1431 10.394V9.39397C15.1431 9.3154 15.0789 9.25112 15.0003 9.25112ZM15.0003 13.0368H1.00028C0.921708 13.0368 0.857422 13.1011 0.857422 13.1797V14.1797C0.857422 14.2583 0.921708 14.3225 1.00028 14.3225H15.0003C15.0789 14.3225 15.1431 14.2583 15.1431 14.1797V13.1797C15.1431 13.1011 15.0789 13.0368 15.0003 13.0368ZM15.0003 5.4654H6.00028C5.92171 5.4654 5.85742 5.52969 5.85742 5.60826V6.60826C5.85742 6.68683 5.92171 6.75112 6.00028 6.75112H15.0003C15.0789 6.75112 15.1431 6.68683 15.1431 6.60826V5.60826C15.1431 5.52969 15.0789 5.4654 15.0003 5.4654Z" fill="#666666"/>
<path d="M0.857451 5.40115L0.857451 10.6011L3.85745 8.00115L0.857451 5.40115Z" fill="#666666"/>
</svg>
`,
        menuKeys: ['indent', 'delIndent'],
      },

      'lineHeight',
    ],
    editorConfig: {
      lineHeight: {
        lineHeightList: ['1', '1.15', '1.5', '2', '2.5', '3'],
      },
      fontSize: {
        fontSizeList: [
          '12px',
          '14px',
          '16px',
          '18px',
          '20px',
          '22px',
          '24px',
          '28px',
          '32px',
          '36px',
          '48px',
          '56px',
          '64px',
          '72px',
          '80px',
          '88px',
          '96px',
        ],
      },
      fontFamily: {
        fontFamilyList: ['微软雅黑', '宋体', '黑体', 'Arial', 'Times New Roman'],
      },
    },
  };
  const editorConfig = {
    placeholder: $t('sys.printDesigner.pleaseEnterRichText'),
    readOnly: false, // 确保不是只读模式
    hoverbarKeys: {
      text: null, // 禁用文本选中时的悬浮工具栏
      link: null, // 禁用链接选中时的悬浮工具栏
      image: null, // 禁用图片选中时的悬浮工具栏
      // 其他元素类型的悬浮工具栏
    },
    MENU_CONF: {
      fontSize: {
        fontSizeList: [
          '12px',
          '14px',
          '16px',
          '18px',
          '20px',
          '22px',
          '24px',
          '28px',
          '32px',
          '34px',
          '36px',
          '48px',
          '56px',
          '64px',
          '72px',
          '80px',
          '88px',
          '96px',
        ],
      },
      fontFamily: {
        fontFamilyList: [
          {
            name: $t('sys.printDesigner.font.SimSun'),
            value: 'SimSun, 宋体, STSong, serif',
          },
          {
            name: $t('sys.printDesigner.font.SimHei'),
            value: 'SimHei, 黑体, STHeiti, sans-serif',
          },
          {
            name: $t('sys.printDesigner.font.MicrosoftYahei'),
            value: 'Microsoft Yahei, 微软雅黑, sans-serif',
          },
          {
            name: 'Arial',
            value: 'Arial, sans-serif',
          },
          {
            name: 'Times New Roman',
            value: 'Times New Roman, serif',
          },
        ],
      },
    },
  };

  interface Props {
    content: any;
  }
  const props = defineProps<Props>();
  const emit = defineEmits(['created', 'blur', 'change']);

  // 编辑器实例，必须用 shallowRef
  const editorRef = shallowRef();

  // 内容 HTML
  const valueHtml = ref('');

  // 模拟 ajax 异步获取内容
  onMounted(() => {
    setTimeout(() => {
      valueHtml.value = props.content;
    }, 500);
  });

  // 组件销毁时，也及时销毁编辑器
  onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
  });

  const handleCreated = (editor: IDomEditor) => {
    editorRef.value = Object.seal(editor); // 记录 editor 实例，重要！
    editor.focus(true);

    // 处理悬浮提示
    setTimeout(() => {
      // 加粗
      const boldBtn = document.querySelector('[data-menu-key="bold"]');
      if (boldBtn) {
        boldBtn.setAttribute('data-tooltip', $t('sys.pageDesigner.bold')); // 修改悬浮提示
      }
      // 正文与标题
      const headerSelect = document.querySelector('[data-menu-key="headerSelect"]');
      if (headerSelect) {
        headerSelect.setAttribute('data-tooltip', $t('sys.printDesigner.textAndTitle')); // 修改悬浮提示
      }
      // 倾斜
      const italic = document.querySelector('[data-menu-key="italic"]');
      if (italic) {
        italic.setAttribute('data-tooltip', $t('sys.pageDesigner.italic')); // 修改悬浮提示
      }
      // 删除线
      const through = document.querySelector('[data-menu-key="through"]');
      if (through) {
        through.setAttribute('data-tooltip', $t('sys.pageDesigner.linethrough')); // 修改悬浮提示
      }
      // 下划线
      const underline = document.querySelector('[data-menu-key="underline"]');
      if (underline) {
        underline.setAttribute('data-tooltip', $t('sys.pageDesigner.underline')); // 修改悬浮提示
      }
      // 字体颜色
      const color = document.querySelector('[data-menu-key="color"]');
      if (color) {
        color.setAttribute('data-tooltip', $t('sys.printDesigner.fontColor')); // 修改悬浮提示
      }
      // 背景颜色
      const bgColor = document.querySelector('[data-menu-key="bgColor"]');
      if (bgColor) {
        bgColor.setAttribute('data-tooltip', $t('sys.pageDesigner.backgroundColor')); // 修改悬浮提示
      }
      // 清除样式
      const clearStyle = document.querySelector('[data-menu-key="clearStyle"]');
      if (clearStyle) {
        clearStyle.setAttribute('data-tooltip', $t('sys.printDesigner.clearStyle')); // 修改悬浮提示
      }
      // 行距调整
      const lineHeight = document.querySelector('[data-menu-key="lineHeight"]');
      if (lineHeight) {
        lineHeight.setAttribute('data-tooltip', $t('sys.printDesigner.lineHeightAdjust')); // 修改悬浮提示
      }

      // const toolbar = editor.getToolbar();
      // const justifyMenu = toolbar.getMenuInstance('justify');
      // if (justifyMenu) {
      //   justifyMenu.showDropPanel = false; // 禁用自动显示
      //   justifyMenu.onClick = () => {
      //     justifyMenu.showDropPanel = !justifyMenu.showDropPanel;
      //   };
      // }
    }, 100); // 适当延长延迟时间
    emit('created');
  };

  const getContent = () => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.getHtml();
  };

  const handleChange = () => {
    emit('change', getContent());
  };

  const handleBlur = () => {
    emit('blur', getContent());
  };

  const handleFocus = (e) => {
    emit('focus', e);
  };

  const getText = () => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.getText();
  };

  const setHtml = (node) => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.setHtml(node);
  };

  const dangerouslyInsertHtml = (node) => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.dangerouslyInsertHtml(node);
  };

  const restoreSelection = () => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.restoreSelection();
  };

  const isFocused = () => {
    const editor = editorRef.value;
    if (editor == null) return;
    return editor.isFocused();
  };

  defineExpose({
    getText,
    getContent,
    setHtml,
    dangerouslyInsertHtml,
    restoreSelection,
    isFocused,
  });
</script>
<style>
  /* .w-e-bar-item.active {
    background-color: #f0f0f0;
    box-shadow: inset 0 0 3px #ccc;
  } */

  /* 格式刷模式下的鼠标样式 */
  .w-e-text-container.format-brush-mode {
    cursor:
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23000" d="M20 9v2h-7l-2 2h-2v2h2l2 2h7v2h-7l-2 2h-2v2H9v-2H7l-2-2H2v-2h5l2-2h2v-2H9l-2-2H2V9h5l2-2h2V5h2v2h2l2 2h7z"/></svg>')
        8 8,
      auto;
  }

  /* 禁用所有菜单的悬停展开 */
  .w-e-toolbar .w-e-menu:hover .w-e-drop-panel {
    display: none !important;
  }

  /* 仅允许点击后展开 */
  .w-e-toolbar .w-e-menu.w-e-active .w-e-drop-panel {
    display: block !important;
  }

  /* 修复点击区域样式 */
  .w-e-toolbar .w-e-menu {
    pointer-events: auto !important;
  }
</style>
