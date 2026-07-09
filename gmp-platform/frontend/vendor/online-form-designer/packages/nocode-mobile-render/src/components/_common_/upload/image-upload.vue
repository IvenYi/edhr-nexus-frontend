<template>
  <div class="upload-image-wrap">
    <div v-for="(item, index) in fileList" :key="index" class="img-item">
      <div v-if="item.status" class="progress-line">
        <van-progress
          :percentage="item.percentNum"
          :color="`var(--van-primary-color)`"
          :show-pivot="false"
          track-color="E6E9EF"
        />
      </div>
      <van-image
        :src="item.url"
        :error-icon="imageError"
        fit="contain"
        @click.stop="onPreview(item.url, index)"
      />
      <div v-if="!readonly" class="preview-delete" @click="deleteFile(index)">
        <div class="h16px w16px icon-wrap">
          <van-icon name="cross" />
        </div>
      </div>
    </div>
    <div
      v-if="!readonly && showUpload"
      class="img-add ks-column justify-center"
      :class="[disabled && 'disabled']"
      @click="!disabled && onUpload()"
    >
      <i class="iconfont icon-chuangjian text-[14px] text-center"></i>
      <div class="mt4px text-[14px] text-center">{{ t('sys.pageDesigner.uploadImage') }}</div>
    </div>
  </div>
</template>

<script name="image-upload" setup lang="ts">
  import { computed, ref, nextTick, watch } from 'vue';
  import { cloneDeep, isNil } from 'lodash-es';
  import { statusEnum, type FileItemType } from './types/image-upload';
  import { uuid2 } from '/@/utils/uuid';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { showDialog, showImagePreview } from 'vant';
  import { useMobileUpload } from '../../../hooks';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const fileLen = ref(0);
  const fileList = ref<FileItemType[]>([]);
  const emit = defineEmits(['update:modelValue', 'onBeforeUpload', 'saveTableRow']);

  const props = defineProps<{
    modelValue?: string;
    readonly: boolean;
    disabled: boolean;
    maxCount?: number;
    maxSize?: number;
    accept?: string[];
    modelKey: string;
    getContainer?: Function;
  }>();

  const { transfer } = useMobileUpload();

  const value = computed({
    get() {
      try {
        return props.modelValue ? props.modelValue.split(',') : [];
      } catch (error) {
        return [];
      }
    },
    set(value) {
      if (value?.length > 0) {
        emit('update:modelValue', value);
      } else {
        emit('update:modelValue', []);
      }
    },
  });

  watch(
    () => props.modelValue,
    async () => {
      const fileValues = props.modelValue ? props.modelValue.split(',') : [];
      const P = fileValues.map(async (path) => {
        return {
          uid: uuid2(16, 16),
          path: path,
          url: transfer(path),
          name: path.split('/').at(-1),
          status: undefined,
          fileSize: 0,
          percentNum: 0,
        };
      });
      fileList.value = await Promise.all(P);
    },
    { immediate: true },
  );

  const showUpload = computed(() => {
    if (isNil(props.maxCount)) {
      return true;
    }
    return fileList.value.length < props.maxCount;
  });

  const acceptList = computed(() => {
    const _accept = cloneDeep(props.accept || []);
    return [
      ...new Set(
        _accept.some((i) => i === 'jpg' || i === 'jpeg')
          ? _accept.concat(['jpg', 'jpeg'])
          : _accept,
      ),
    ];
  });

  const onUpload = () => {
    JSSDK.run(
      'Uploader',
      {
        maxCount: (props?.maxCount || 50) - fileList.value.length,
        acceptList: acceptList.value,
        maxSize: props?.maxSize,
        modelKey: props.modelKey,
        success(res) {
          const files = res.map((e) => e.url) || [];
          console.log('files', files);
          value.value = value.value.concat(files);
        },
        error(message) {
          if (!message.length) return;
          showDialog({
            message: message.join('；'),
          });
        },
      },
      'image',
    );
  };

  const onPreview = (url, index) => {
    showImagePreview({
      images: fileList.value?.map((e) => e.url),
      startPosition: index,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  async function deleteFile(index) {
    fileLen.value--;
    fileList.value.splice(index, 1);
    value.value.splice(index, 1);
    value.value = [...value.value];
    await nextTick();
  }
</script>

<style lang="less" scoped>
  .upload-image-wrap {
    display: flex;
    flex-wrap: wrap;
    column-gap: 8px;
    row-gap: 8px;

    .img-add {
      width: 103px;
      height: 103px;
      border: 1px dashed rgba(0, 0, 0, 0.15);
      border-radius: 2px;
      color: var(--van-primary-color);
      background-color: #f7f8fa;
      cursor: pointer;
      box-sizing: border-box;

      &.disabled {
        cursor: not-allowed;
        color: rgba(0, 0, 0, 0.15);
        border-color: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .img-item {
    position: relative;
    width: 103px;
    height: 103px;

    :deep(.van-image) {
      border-radius: 2px;
      background-color: #f7f8fa;
      border: 1px dashed rgba(0, 0, 0, 0.15);
      height: 100%;
      width: 100%;

      .van-icon__image {
        width: 28px;
        height: 26px;
      }
    }

    .progress-line {
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 9;
      display: flex;
      justify-content: center;
      align-items: center;

      :deep(.van-progress) {
        width: 90px;
      }
    }

    .preview-delete {
      position: absolute;
      top: -2px;
      right: -3px;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon-wrap {
        background-color: rgba(0, 0, 0, 0.65);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        .van-icon {
          font-size: 12px;
          color: #fff;
        }
      }
    }
  }
</style>
