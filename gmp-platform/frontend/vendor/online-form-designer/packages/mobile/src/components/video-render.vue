<template>
  <div>
    <video class="h-full w-full" :src="src" controls ref="VideoRef" :poster="poster"></video>
  </div>
</template>

<script setup lang="ts">
  import { watch, ref } from 'vue';

  const props = defineProps<{
    src: string;
  }>();

  const poster = ref<string>();

  watch(
    () => props.src,
    async (value) => {
      if (!value) return;
      const data = await captureFrame(value, 0.1);
      poster.value = data;
    },
    {
      immediate: true,
    },
  );

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  function captureFrame(src: string, time: number): Promise<string> {
    return new Promise((resolve) => {
      const vInst = document.createElement('video');
      vInst.autoplay = true;
      vInst.muted = true;
      vInst.currentTime = time;
      vInst.src = src;
      vInst.oncanplay = () => {
        const cInst = document.createElement('canvas');
        const ctx = cInst.getContext('2d');
        cInst.width = vInst.videoWidth;
        cInst.height = vInst.videoHeight;
        ctx.drawImage(vInst, 0, 0, cInst.width, cInst.height);
        cInst.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          console.log('video render', url);
          blobToBase64(blob).then((res) => {
            console.log('video render 2', res);
          });
          resolve(url);
        });
      };
    });
  }
</script>

<style scoped lang="less"></style>
