<template>
  <basic-popup
    v-model:show="show"
    class="edit-name-popup"
    :popupProps="{
      position: 'right',
    }"
    :extra-style="{
      top: 0,
      margin: 0,
      transform: 'none',
      width: '480px',
    }"
  >
    <template #header>
      <div class="header">
        <van-icon name="arrow-left" class="back-icon" @click="onCancel" />
        <div class="ks-col font-500 color-[#000000]" id="fill-in-modal-header-title">
          编辑名称
        </div>
      </div>
    </template>
    <div class="edit-name-popup-container">
      <van-form ref="formRef">
        <van-field
          label="名称"
          name="ext2"
          label-width="200px"
          input-align="right"
          placeholder="请输入"
          required
          :rules="[{ required: true, message: '字段为必填项' }]"
          v-model="ext2"
        />
      </van-form>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts" name="edit-name-popup">
  import { ref } from 'vue';
  import BasicPopup from '../../base/basic-popup.vue';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      data?: any; // 传入数据
      popupProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  const show = ref(true);
  const formRef = ref();
  const ext2 = ref(props.data?.ext2 || '');

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    await formRef.value?.validate();
    const data = {
      name: ext2.value,
    };
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .edit-name-popup {
    .header {
      font-weight: 600;
      font-size: 17px;
      color: #1a1d23;
      line-height: 24px;
      display: flex;
      height: 64px;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e3eb;

      .back-icon {
        width: 24px;
        height: 24px;
        color: #1a1d23;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
        margin-right: 12px;
      }
    }

    .edit-name-popup-container {
      position: relative;
      padding: 16px;
      height: 100%;

      :deep(.van-field) {
        border-radius: 8px;
        padding: 16px;
      }
      :deep(.van-field__error-message) {
        text-align: right;
      }
    }

    .tips {
      color: #5a5f6b;
      background: rgba(0, 153, 255, 0.08);
      border-radius: 8px 8px 8px 8px;
      border: 1px dashed rgba(0, 153, 255, 0.3);
      font-size: 14px;
      padding: 12px;
      display: flex;
      margin-top: 12px;
      .tips-text {
        line-height: 22px;
      }
      .tips-icon {
        color: #0099ff;
        width: 16px;
        height: 16px;
        font-size: 16px;
        margin-right: 8px;
      }
    }
  }
</style>
