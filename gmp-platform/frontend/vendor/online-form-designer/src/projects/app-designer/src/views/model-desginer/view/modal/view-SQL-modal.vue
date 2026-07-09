<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.view') + 'SQL'"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="markdown">
      <div v-if="markdownStr" class="code-panel markdown-body">
        <div class="markdown-title">
          <span>SQL语句</span>
          <i class="iconfont icon-fuzhi" title="拷贝" @click.stop="handleClipboardKey"></i>
        </div>
        <div class="markdown-content" v-highlight v-html="markdownContent"></div>
      </div>
      <div v-else class="markdown-empty">
        <a-empty :image="simpleImage" />
      </div>
    </div>
    <template #footer></template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, unref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getViewModelSql } from '/@/apis/gct-apaas/ViewModelController';
  import { marked } from 'marked';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const emit = defineEmits(['register']);

  const markdownContent = ref();
  const markdownStr = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      // const content = await getViewModelSql({ id: data.model });
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
    // emit('refresh');
  };

  function handleClipboardKey() {
    const { isSuccessRef } = useCopyToClipboard(markdownStr.value);
    unref(isSuccessRef) && createMessage.success(t('sys.copySuccess'));
  }
</script>

<style lang="less" scoped>
  .markdown-body {
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #e8ebf0;
    .markdown-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f6f8fa;
      border-bottom: 1px solid #eaedf1;
      .iconfont {
        cursor: pointer;
        color: #666;
      }
    }
    .markdown-content {
      padding: 12px 16px;
    }
  }
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
