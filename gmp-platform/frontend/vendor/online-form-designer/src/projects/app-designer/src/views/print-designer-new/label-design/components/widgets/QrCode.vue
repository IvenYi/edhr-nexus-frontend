<template>
  <div class="p-qrcode">
    <img
      v-if="type.value == 'QR_CODE'"
      src="./images/qrcode.png"
      alt="qrcode"
      class="p-img-element"
      :style="style"
    />
    <img
      v-else
      src="./images/gs1datamatrix.png"
      alt="gs1datamatrix"
      class="p-img-element"
      :style="style"
    />
    <!--<p v-text="text"></p>-->
  </div>
</template>

<script lang="ts" setup name="QR_CODE">
  import { ref } from 'vue';

  defineProps({
    magnification: {
      type: Object,
      default: () => ({
        val: 4,
      }),
    },
    type: {
      type: Object,
      default: () => ({
        value: 'QR_CODE',
      }),
    },
  });
  const style = ref();
</script>

<style scoped lang="css">
  .p-qrcode {
    position: absolute;
    overflow: hidden;
    text-align: center;
  }

  .p-qrcode img {
    width: 100%;
    height: 100%;
  }
</style>
