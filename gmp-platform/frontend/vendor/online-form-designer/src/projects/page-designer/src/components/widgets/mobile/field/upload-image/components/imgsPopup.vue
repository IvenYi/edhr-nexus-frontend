<template>
  <div>
    <van-popup
      v-model:show="show"
      :style="{ width: '100%', height: '53%', '--van-padding-md': 0 }"
      :closeable="true"
      position="bottom"
    >
      <div class="ks-column h100%">
        <div class="text-[16px] p12px pb16px font-bold title">
          {{ title }}
        </div>
        <div class="px12px py16px ks-row img-list ks-col">
          <div v-for="(item, index) in imgList" :key="index" class="img-item">
            <van-image
              width="100"
              height="100"
              :src="item.url"
              :error-icon="imageError"
              fit="contain"
              @click="onPreview(index)"
            />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { showImagePreview } from 'vant';
  import imageError from '/@page-designer/assets/img-error.svg';

  defineProps<{
    title: string;
  }>();

  const show = ref(false);
  const imgList = ref<object[]>([]);
  const open = (imgs) => {
    show.value = true;
    imgList.value = imgs;
  };

  const onPreview = (index) => {
    showImagePreview({
      images: imgList.value?.map((e) => e.url),
      startPosition: index,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  defineExpose({ open });
</script>
<style lang="less" scoped>
  :deep(.van-popup__close-icon) {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
  .title {
    border-bottom: 1px solid #e0e3ea;
  }
  .img-list {
    flex-wrap: wrap;
    align-content: flex-start;
    overflow: auto;
  }
  .img-item {
    position: relative;
    width: 102px;
    height: 102px;
    margin-bottom: 12px;
    margin-right: 12px;

    :deep(.van-image) {
      border-radius: 2px;
      border: 1px dashed #d9d9d9;
      background-color: #f7f8fa;
      .van-icon__image {
        width: 28px;
        height: 26px;
      }
    }
  }
</style>
