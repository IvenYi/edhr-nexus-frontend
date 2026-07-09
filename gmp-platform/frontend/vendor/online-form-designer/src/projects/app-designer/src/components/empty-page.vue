<template>
  <div class="box-full select-none pointer-events-none">
    <a-empty
      :image="props.module === 'pageDesigner' ? pageModelEmpty : modelEmpty"
      :image-style="{
        height: '184px',
      }"
    >
      <template #description>
        <p class="description">{{ props.description }}</p>
        <p class="sub-description">{{ props.subDescription }}</p>
      </template>
    </a-empty>
  </div>
</template>

<script setup lang="ts">
  import pageModelEmpty from '/@app-designer/assets/image/pic_quesheng.svg';
  import modelEmpty from '/@app-designer/assets/image/model-empty.png';

  const props = defineProps({
    description: { type: String, default: '' },
    subDescription: { type: String, default: '' },
    module: { type: String, default: '' },
  });
</script>

<style lang="less" scoped>
  .box-full {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;

    .description {
      font-size: 16px;
      font-family:
        Source Han Sans SC-Regular,
        Source Han Sans SC;
      font-weight: 400;
      color: #333333;
      margin: 10px 0 4px 0;
    }

    .sub-description {
      font-size: 14px;
      font-family:
        Source Han Sans SC-Regular,
        Source Han Sans SC;
      font-weight: 400;
      color: #5a5f6b;
      max-width: 336px;
    }
  }
</style>
