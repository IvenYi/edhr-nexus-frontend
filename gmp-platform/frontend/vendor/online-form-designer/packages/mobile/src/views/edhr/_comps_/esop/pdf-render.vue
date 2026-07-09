<template>
  <VuePdf v-if="pdfBase64" ref="VuePDFRef" pdfkey="view" :source="pdfBase64" />
  <div v-else>loading...</div>
</template>

<script setup lang="ts">
  import { watch, ref } from 'vue';
  import { VuePdf } from '/@/components/VuePdf';

  const props = defineProps<{
    sourceFileUrl?: any;
  }>();

  const pdfBase64 = ref<string>('');

  watch(
    () => props.sourceFileUrl?.url,
    async (value) => {
      pdfBase64.value = '';
      if (!value) return;
      const data = await convertToBase64(value);
      console.log('Base64 编码:', data);
      pdfBase64.value = data;
    },
    {
      immediate: true,
    },
  );

  async function convertToBase64(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
          reader.onerror = () => {
            reject(new Error('Error reading the file'));
          };
        });
      });
  }

  // const fileUrl = 'http://10.10.10.131:7777/minio///edhral3/bNDQ9kWufQLAOIY4/大疆_1_3.pdf';
  // convertToBase64(fileUrl)
  //   .then((base64) => {
  //     console.log('Base64 编码:', base64);
  //   })
  //   .catch((error) => {
  //     console.error('转换出错:', error);
  //   });
</script>

<style scoped lang="less"></style>
