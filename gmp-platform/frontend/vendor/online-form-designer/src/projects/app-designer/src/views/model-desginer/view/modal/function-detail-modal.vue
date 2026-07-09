<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.detail')"
    centered
    width="1200px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div v-if="markdownStr" class="code-panel markdown-body">
      <div v-highlight v-html="markdownContent"></div>
    </div>
    <div v-else class="markdown-empty">
      <a-empty :image="simpleImage" />
    </div>
    <template #footer></template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { marked } from 'marked';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const { t } = useI18n();

  interface Props {
    /** 模型定义表key */
    modelKey: string;
  }

  const emit = defineEmits(['refresh', 'register']);

  defineProps<Props>();

  const markdownContent = ref();
  const markdownStr = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      markdownStr.value = data.content;
      markdownContent.value = marked(data.content);
    }
  });

  const handleClose = () => {
    markdownStr.value = null;
    markdownContent.value = null;
  };

  const handleOk = async () => {
    closeModal();
    emit('refresh');
  };
</script>

<style lang="less" scoped>
  .markdown-empty {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    flex: 1;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
