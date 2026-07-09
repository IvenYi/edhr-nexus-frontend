<template>
  <div class="p-img">
    <img :src="src ? totalSrc : defaultImg" alt="" class="p-img-element" />
  </div>
</template>

<!-- <script lang="ts" setup name="p-img">
  import { computed } from 'vue';
  import defaultImg from './images/img.png';
  computed(() => {
    const HOST =
      process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOBAL_HOST : location.origin;
  });
</script> -->
<script lang="ts">
  // import config from '../../config';
  import defaultImg from './images/img.png';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  export default {
    name: 'IMAGE',
    props: {
      src: {},
    },
    data() {
      return {
        defaultImg,
        host: '',
      };
    },
    computed: {
      totalSrc() {
        return `${transformUrl(this.src)}`;
      },
    },
  };
</script>

<style scoped>
  .p-img {
    overflow: hidden;
  }

  .p-img img {
    width: 100%;
    height: 100%;
  }
</style>
