<template>
  <div class="release-filling-container">
    <div class="release-filling-area" v-if="materialNo">
      <ReleaseFillBuilder :materialNo="materialNo" />
    </div>
    <div class="release-filling-empty-area" v-else>
      <a-empty
        description=""
        :image="releaseFillingEmpty"
        :image-style="{
          height: '40vh',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="release-filling-container">
  import ReleaseFillBuilder from './release-filling-builder.vue';
  import releaseFillingEmpty from '/@web-render/assets/image/release-filling-empty.png';

  defineProps<{
    materialNo: string;
    loading: boolean;
  }>();
</script>

<style scoped lang="less">
  .release-filling-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-top: 1px solid #e0e3ea;
    overflow: hidden;
  }
  .release-filling-area {
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #fff;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .release-filling-empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    height: 100%;
  }
  .release-filling-loading-area {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }
</style>
