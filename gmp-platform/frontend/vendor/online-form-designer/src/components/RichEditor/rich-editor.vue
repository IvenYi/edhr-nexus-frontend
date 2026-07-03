<template>
  <div style="border: 1px solid #e8ebf0; border-bottom: none">
    <Toolbar
      style="border-bottom: 1px solid #e8ebf0"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      v-model="valueHtml"
      style="height: 150px"
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

  const toolbarConfig = {
    toolbarKeys: [
      'fontSize',
      'fontFamily',
      'bold',
      'italic',
      'through',
      'underline',
      'color',
      'bgColor',
      {
        key: 'group-justify',
        title: '对齐',
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
        menuKeys: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyJustify'],
      },
      '|',
      'blockquote',
      'insertLink',
      {
        key: 'group-image',
        title: '图片',
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
        menuKeys: ['insertImage'],
      },
    ],
  };
  const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      fontFamily: {
        fontFamilyList: [
          {
            name: '宋体',
            value: 'SimSun, 宋体, 华文宋体, STSong, STSongti-SC-Light, serif',
          },
          { name: '楷体', value: 'Kai, STKai, 楷体, KaiTi, 华文楷体, sans-serif' },
          { name: '黑体', value: 'SimHei, 黑体, 华文黑体, STHeiti, sans-serif' },
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

  const handleCreated = (editor) => {
    editorRef.value = editor; // 记录 editor 实例，重要！
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
