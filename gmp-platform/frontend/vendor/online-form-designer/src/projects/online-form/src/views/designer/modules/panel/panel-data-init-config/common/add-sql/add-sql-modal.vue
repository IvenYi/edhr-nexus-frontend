<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    width="800px"
    wrapClassName="add-sql-modal-wrapper"
    :mask-closable="false"
    destroyOnClose
    :keyboard="false"
    title="SQL语句"
    :cancelText="t('sys.cancel')"
    :okText="t('sys.ok')"
    @cancel="handleClose"
    @ok="handleOk"
  >
    <div class="add-sql-modal-container">
      <a-textarea
        :placeholder="$t('sys.onlineForm.pleaseEnterSQLStatement')"
        style="height: 100%"
        v-model:value="currentValue"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts" name="add-sql-modal">
  import { ref, onMounted, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    value: string;
    dataSource: any;
    callback?: any;
    options?: object;
  }>();

  const visible = ref<boolean>(true);

  onMounted(() => {
    nextTick(() => {
      if (props.value) {
        currentValue.value = props.value;
      }
    });
  });

  const currentValue = ref();

  function handleOk() {
    if (!currentValue.value) {
      message.warn($t('sys.onlineForm.pleaseEnterSQLStatement'));
      return;
    }
    props.callback({
      value: currentValue.value,
    });
    handleClose();
  }

  function handleClose() {
    visible.value = false;
    currentValue.value = undefined;
  }
</script>

<style lang="less">
  .add-sql-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 80vh;

      > .ant-modal-close {
        > .ant-modal-close-x {
          width: auto;
          height: auto;
          padding: 16px;
          color: #212528;
          line-height: 1;
          line-height: 22px;
        }
      }

      > .ant-modal-header,
      > .ant-modal-footer {
        flex-shrink: 0;
        padding: 16px;
      }

      > .ant-modal-header {
        border-bottom: 1px solid #e0e3ea;
      }

      > .ant-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid #e0e3ea;
        background-color: #fff;
      }

      > .ant-modal-header .ant-modal-title {
        color: #000;
        font-weight: 600;
      }

      > .ant-modal-body {
        display: flex;
        flex-grow: 1;
        min-height: 600px;
        padding: 0;
        overflow: auto;
        background-color: #fff;

        .add-sql-modal-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 16px 24px;
          overflow: hidden;
        }
      }
    }
  }
</style>
