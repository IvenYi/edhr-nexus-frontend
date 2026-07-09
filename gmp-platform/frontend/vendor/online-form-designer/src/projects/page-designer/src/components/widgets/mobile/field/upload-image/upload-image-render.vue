<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :widget-type="widget.type"
    :formData="formData"
  >
    <template #input>
      <div
        class="ks-row upload-image-wrap"
        :class="[
          widget.style.height && `h${widget.style.height}px`,
          !widget.style.height && 'maxH325',
        ]"
      >
        <div
          v-if="
            !showReadonly &&
            ((attrObj.maxCount && attrObj.maxCount > fileList.length) || !attrObj.maxCount)
          "
          class="img-add ks-column justify-center"
          :class="[showDisabled && 'disbaled']"
          @click="!showDisabled && onUpload()"
        >
          <i class="iconfont icon-chuangjian font-[12px] text-center"></i>
          <div class="mt8px font-[14px] text-center">{{ $t('sys.pageDesigner.uploadImage') }}</div>
        </div>
        <div v-for="(item, index) in fileList" :key="index" class="img-item">
          <!-- <div v-if="item.status" class="progress-line">
            <van-progress
              :percentage="item.percentNum"
              :color="`var(--van-primary-color)`"
              :show-pivot="false"
              track-color="E6E9EF"
            />
          </div> -->
          <van-image
            :src="item.url"
            :error-icon="imageError"
            fit="contain"
            @click="onPreview(item.url, index)"
          />
          <div v-if="!showReadonly" class="preview-delete" @click="deleteImg(index)">
            <div class="h16px w16px icon-wrap">
              <van-icon name="cross" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </vantField>
</template>

<script name="gct-upload-image" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount, toRefs, inject } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { UploadFile } from '/@page-designer/types/mobile';
  import { showImagePreview, showDialog } from 'vant';
  import vantField from '../../__components__/vantField.vue';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { IMobUploadImageComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: any }>();
  const { field, modelKey } = reactive(props.widget.props);

  const { formData } = toRefs(props);
  const layout = inject('form-layout', {});

  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

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

  const validateField = computed(() => {
    return fileList.value.length ? JSON.stringify(fileList.value) : '';
  });

  const acceptList = computed(() => {
    const _accept = cloneDeep(attrObj.value?.accept || []);
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
        maxCount: (attrObj.value?.maxCount || 50) - fileList.value.length,
        acceptList: attrObj.value?.accept || [],
        maxSize: attrObj.value?.maxSize,
        success(res) {
          const files = res.map((e) => e.url) || [];
          value.value = value.value.concat(files);
          Event.runEventByName('onChange', props.widget.events, value.value, formData.value);
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
      images: showReadonly.value ? fileList.value?.map((e) => e.url) : [url],
      startPosition: showReadonly.value ? index : 0,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  const deleteImg = async (index) => {
    value.value = value.value.filter((e, i) => i !== index);
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
  };

  defineExpose<IMobUploadImageComponentExpose>({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style lang="less" scoped>
  :deep(.van-uploader) {
    .van-uploader__preview {
      .van-image {
        border: 1px dashed #d9d9d9;
        border-radius: 2px;
      }
      .van-uploader__preview-delete {
        top: -10px;
        right: -10px;
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
      .van-uploader__preview-delete--shadow {
        background-color: transparent;
      }
    }
  }
  .app-upload-image {
    :deep(.van-uploader__upload) {
      width: 100px;
      height: 100px;
      margin: 0;
      border: 1px dashed #d9d9d9;
      border-radius: 2px;

      .van-icon-plus {
        font-size: 16px;
        color: var(--van-primary-color);
      }
      .van-uploader__upload-text {
        font-size: 14px;
      }
    }
  }
  .upload-image-wrap {
    // row-gap: 8px;
    // column-gap: 8px;
    flex-wrap: wrap;
    // max-height: 322px;
    overflow-y: auto;
    overflow-x: hidden;
    justify-content: v-bind("layout.inputAlign === 'right' ? 'flex-end': 'flex-start'");

    .img-add {
      width: 100px;
      height: 100px;
      border: 1px dashed #d9d9d9;
      border-radius: 2px;
      color: var(--van-primary-color);
      background-color: #f7f8fa;
      cursor: pointer;
      margin-bottom: 8px;
      margin-right: 8px;
      box-sizing: border-box;

      &.disbaled {
        color: #c3c3c3;
      }
    }
  }
  .img-item {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: 8px;
    margin-right: 8px;

    :deep(.van-image) {
      border-radius: 2px;
      border: 1px dashed #d9d9d9;
      background-color: #f7f8fa;
      height: 100px;
      width: 100px;

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
  .maxH325 {
    max-height: 325px;
  }
</style>
