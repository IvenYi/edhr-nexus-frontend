<template>
  <icon>
    <template #component>
      <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
        <path
          d="M128 128h768a64 64 0 0 1 64 64v640a64 64 0 0 1-64 64H128a64 64 0 0 1-64-64V192a64 64 0 0 1 64-64z m32 64a32 32 0 0 0-32 32v576a32 32 0 0 0 32 32h704a32 32 0 0 0 32-32V224a32 32 0 0 0-32-32H160z m448 320h192a32 32 0 0 1 32 32v192a32 32 0 0 1-32 32h-192a32 32 0 0 1-32-32v-192a32 32 0 0 1 32-32z"
          fill="#000000"
          p-id="4921"
        />
      </svg>
    </template>
  </icon>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Icon from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'DownrightIcon',
    components: {
      Icon,
    },
  });
</script>

<style lang="less" scoped></style>
