<template>
  <a-form-item
    :label="$t('sys.pageDesigner.drawSignature')"
    name="type"
    style="margin-bottom: 4px"
  />
  <div class="wacom-wrap">
    <wacomRender
      :widget="{ style: { width: 537, height: 304, backgroundColor: '#FFFFFF' } }"
      :resetText="$t('sys.developer.appCenter.clear')"
      ref="wacomRef"
    />
    <!-- <div class="text-right">{{ $t('sys.pageDesigner.drawSignature') }}</div> -->
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import wacomRender from '../../../other/wacom/wacom-render.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const wacomRef = ref();

  function base64ToFile(base64Data, filename) {
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
    blob.lastModifiedDate = date;
    blob.name = `${filename}_${date.getTime()}`;

    return {
      file: new File([blob], `${filename}_${date.getTime()}`, { type: contentType }),
      time: date.getTime(),
    };
  }

  const getValue = () => {
    return base64ToFile(wacomRef.value?.getValue(), t('sys.pageDesigner.handwrittenSignature'));
  };

  defineExpose({
    getValue,
  });
</script>
<style lang="less" scoped>
  .wacom-wrap {
    position: relative;
    width: 539px;
    height: 306px;
    margin: 0 auto;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    background-color: #fcfcfc;

    &::before {
      content: attr(data-placeholder);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ccc;
      font-size: 24px;
    }
  }
</style>
