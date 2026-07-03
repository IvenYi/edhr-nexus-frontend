<template>
  <div v-if="fileList.length" class="upload-image-wrap" @click.stop="onOpen">
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

  <imgsPopup ref="popupRef" :title="label || fieldName" @click.stop />
</template>
<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { UploadFile } from '/@page-designer/types/mobile';
  import imageError from '/@page-designer/assets/img-error.svg';
  import imgsPopup from './components/imgsPopup.vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

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

  const fileList = computed(() =>
    value.value.map((i) => ({
      url: MOBILE_MINIO_PATH.value + i,
      name: i.split('/').at(-1),
    })),
  );

  const popupRef = ref();
  const onOpen = () => {
    popupRef.value?.open(fileList.value);
  };
</script>
<style lang="less" scoped>
  .upload-image-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 -10px;
    padding: 13px 10px;
  }
  .img-list {
    display: flex;
    overflow: hidden;
  }
  .img-item {
    position: relative;
    width: 18px;
    height: 18px;
    margin-right: 8px;

    :deep(.van-image) {
      border-radius: 2px;
      border: 1px dashed #d9d9d9;
      background-color: #f7f8fa;
      width: 18px;
      height: 18px;

      .van-icon__image {
        width: 19px;
        height: 19px;
      }
    }
  }
  .more {
    color: var(--van-primary-color);
  }
</style>
