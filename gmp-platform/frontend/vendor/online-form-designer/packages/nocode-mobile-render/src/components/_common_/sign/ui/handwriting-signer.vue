<template>
  <div class="handwriting-signer">
    <van-field
      :label="t('sys.pageDesigner.drawSignature')"
      name="type"
      style="margin-bottom: 4px"
    />
    <div class="wacom-wrap">
      <Wacom
        :widget="{ style: { width: '537', height: '304', backgroundColor: '#FFFFFF' } }"
        :resetText="t('sys.reset')"
        ref="wacomRef"
      />
    </div>
  </div>
</template>
<script setup lang="ts" name="HandwritingSigner">
  import { ref } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import type { SignerExpose, UploadSignFile } from '../types';
  import { completeSignInfo, uploadSignFile as defaultFn } from '../logic';
  import { showFailToast } from 'vant';
  import Wacom from './wacom.vue';

  const { t } = i18n.global;
  const wacomRef = ref();

  const props = withDefaults(
    defineProps<{
      uploadSignFile?: UploadSignFile;
    }>(),
    {
      uploadSignFile: defaultFn,
    },
  );

  function base64ToFile(base64Data: any, filename: string) {
    // 将base64的数据部分提取出来
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);

    // 将原始数据转换为Uint8Array
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    // 使用Blob对象创建File对象
    const blob = new Blob([uInt8Array], { type: contentType });
    const date = new Date();

    return {
      file: new File([blob], `${filename}_${date.getTime()}`, {
        type: contentType,
        lastModified: new Date().getTime(),
      }),
      time: date.getTime(),
    };
  }

  defineExpose<SignerExpose>({
    submit: async () => {
      const value = wacomRef.value?.getValue();
      if (!value) {
        showFailToast(t('sys.inputTextTip', { name: t('sys.model.sign') }));
        throw new Error('签名为空');
      }
      const file = base64ToFile(value, t('sys.pageDesigner.handwrittenSignature'));
      const img = await props.uploadSignFile(file.file);
      const info = await completeSignInfo(img);
      return info;
    },
  });
</script>
<style lang="less" scoped>
  .handwriting-signer {
    width: 560px;
    .wacom-wrap {
      width: 539px;
      height: 306px;
      border: 1px dashed #d9d9d9;
      background-color: #fcfcfc;
      margin: 10px 16px;
      border-radius: 2px;
      position: relative;

      &::before {
        color: #cccccc;
        content: attr(data-placeholder);
        font-size: 24px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
</style>
