<template>
  <div>
    <van-popover v-model:show="popupRef" :show-arrow="false" class="image-pop" :offset="[0, 0]">
      <van-grid
        square
        :border="false"
        column-num="4"
        style="width: 400px; max-height: 280px; overflow-y: auto"
        class="px16px my16px"
      >
        <van-grid-item v-for="(item, index) in fileList" :key="index">
          <van-image
            width="86"
            height="86"
            :src="item.url"
            :error-icon="imageError"
            fit="contain"
            @click="onPreview(index)"
          />
        </van-grid-item>
      </van-grid>
      <template #reference>
        <div
          v-if="fileList.length"
          class="upload-image-wrap"
          @touchstart.stop="onOpen"
          @touchend="endContextMenu"
          @click.stop="openPreview"
        >
          <div class="w100% ks-row ks-col img-list overflow-hidden">
            <div
              v-for="(item, index) in fileList.filter((e, i) => i < displayMaxNum)"
              :key="index"
              class="img-item"
            >
              <van-image :src="item.url" :error-icon="imageError" fit="contain" />
            </div>
          </div>
          <div v-if="displayMaxNum < fileList.length" class="more text-[14px] ml8px">{{
            $t('sys.pageDesigner.more')
          }}</div>
        </div>
      </template>
    </van-popover>
  </div>
</template>
<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { UploadFile } from '/@page-designer/types/mobile';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { showImagePreview } from 'vant';

  const rootEl = document.getElementById('app');
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: any }>();

  const { displayMaxNum, label, fieldName } = reactive(props.widget.props);

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            return props.modelValue ? props.modelValue.split(',') : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', value ? value.join(',') : '');
          } else {
            emit('update:modelValue', '');
          }
        },
      })
    : ref([]);

  const onPreview = (index) => {
    showImagePreview({
      images: fileList.value?.map((e) => e.url),
      startPosition: index,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  const fileList = computed(() =>
    value.value.map((i) => ({
      url: MOBILE_MINIO_PATH.value + i,
      name: i.split('/').at(-1),
    })),
  );

  const popupRef = ref();
  const timeout = ref();
  const openPreview = () => {
    document.querySelectorAll('.van-popover').forEach((popover) => {
      const style = window.getComputedStyle(popover);
      if (style.display !== 'none') {
        // 触发关闭逻辑，具体取决于 Vant 的实现
        popover.style.display = 'none';
      }
    });
    popupRef.value = true;
  };
  const onOpen = (e) => {
    popupRef.value = false;
    clearTimeout(timeout.value); // 清除之前的任何长按超时
    // 清除一打开弹窗
    document.querySelectorAll('.van-popover').forEach((popover) => {
      const style = window.getComputedStyle(popover);
      if (style.display !== 'none') {
        // 触发关闭逻辑，具体取决于 Vant 的实现
        popover.style.display = 'none';
      }
    });
    // 定时器长按打开弹窗
    timeout.value = setTimeout(function () {
      popupRef.value = true;
    }, 500); // 设置长按的最小时间为500毫秒
  };

  const endContextMenu = () => {
    clearTimeout(timeout.value); // 清除之前的任何长按超时
  };
</script>
<style lang="less" scoped>
  .upload-image-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 -10px;
    padding: 13px 10px;
  }

  .img-list {
    display: flex;
    overflow: hidden;
    overflow-x: auto;
  }

  .img-item {
    position: relative;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
    scroll-behavior: smooth; /* 平滑滚动效果 */

    /* 隐藏滚动条 */
    scrollbar-width: none;
    -ms-overflow-style: none;
    touch-action: pan-x; /* 只允许垂直滑动 */
    user-select: none; /* 防止文本选择 */
    -webkit-user-drag: none; /* 防止拖动 */

    :deep(.van-image) {
      width: 18px;
      height: 18px;
      border: 1px dashed #d9d9d9;
      border-radius: 2px;
      background-color: #f7f8fa;

      .van-icon__image {
        width: 19px;
        height: 19px;
      }
    }
  }

  .more {
    color: var(--van-primary-color);
  }

  .img-list::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
  // :deep(.van-popover__wrapper) {
  //   display: block;
  //   width: 100% !important;
  // }
</style>
<!-- <style lang="less">
  .van-popover__wrapper {
    width: 100% !important;
  }
</style> -->
