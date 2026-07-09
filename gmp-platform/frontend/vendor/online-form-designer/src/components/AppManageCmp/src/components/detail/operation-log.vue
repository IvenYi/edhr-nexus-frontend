<template>
  <a-empty :image="simpleImage" description="尽请期待" />
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Empty } from 'ant-design-vue';

  export default defineComponent({
    setup() {
      return {
        simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      };
    },
  });
</script>
