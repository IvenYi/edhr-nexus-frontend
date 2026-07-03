<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('sys.component.cropper.modalTitle')"
    width="600px"
    min-height="570"
    :canFullscreen="false"
    @ok="handleOk"
    :okText="t('sys.okText')"
  >
    <div :class="prefixCls">
      <div :class="`${prefixCls}-left`">
        <div :class="`${prefixCls}-cropper`">
          <CropperImage
            v-if="src"
            :src="src"
            height="360px"
            width="360px"
            :circled="circled"
            @cropend="handleCropend"
            @ready="handleReady"
          />

          <div v-if="!sourceUrlValue && src === '/404.png'" class="empty">
            <Upload
              list-type="picture-card"
              :fileList="[]"
              accept="image/*"
              :beforeUpload="handleBeforeUpload"
            >
              <div class="flex flex-col justify-center items-center">
                <PlusOutlined />
                <div class="mt12px">{{ t('sys.pageDesigner.clickOrDragToUpload') }} </div>
                <div class="color-[#8B8B8B] mt8px">{{ t('sys.org.uploadType') }} </div>
              </div>
            </Upload>
          </div>
        </div>

        <div v-if="sourceUrlValue || src !== '/404.png'" :class="`${prefixCls}-toolbar`">
          <Upload :fileList="[]" accept="image/*" :beforeUpload="handleBeforeUpload">
            <a :title="t('sys.reUpload')" placement="bottom">
              {{ t('sys.reUpload') }}
            </a>
          </Upload>
          <Space>
            <Tooltip :title="t('sys.component.cropper.btn_zoom_in')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('zoom', 0.1)"
              >
                <template #icon> <i class="iconfont icon-fangda_zoom-in"></i> </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('sys.component.cropper.btn_zoom_out')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('zoom', -0.1)"
              >
                <template #icon> <i class="iconfont icon-a-suoxiao_zoom-out1"></i> </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('sys.component.cropper.btn_rotate_left')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('rotate', -45)"
              >
                <template #icon> <i class="iconfont icon-xuanzhuan_rotate"></i> </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('sys.component.cropper.btn_rotate_right')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('rotate', 45)"
              >
                <template #icon> <i class="iconfont icon-xuanzhuan_2"></i> </template>
              </a-button>
            </Tooltip>

            <Tooltip :title="t('sys.component.cropper.btn_scale_x')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('scaleX')"
              >
                <template #icon>
                  <i class="iconfont icon-shuipingfanzhuan_flip-horizontally"></i>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('sys.component.cropper.btn_scale_y')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('scaleY')"
              >
                <template #icon>
                  <i class="iconfont icon-chuizhifanzhuan_flip-vertically"></i>
                </template>
              </a-button>
            </Tooltip>

            <Tooltip :title="t('sys.component.cropper.btn_reset')" placement="bottom">
              <a-button
                size="small"
                :disabled="!src"
                @mousedown.prevent
                @click="handlerToolbar('reset')"
              >
                <template #icon> <reload-outlined /> </template>
              </a-button>
            </Tooltip>
          </Space>
        </div>
      </div>
      <div :class="`${prefixCls}-right`" class="text-center">
        {{ t('sys.preview') }}
        <div :class="`${prefixCls}-group`">
          <div class="flex-col">
            <Avatar :src="previewSource" :size="102" />
            <!-- <div class="mt-1 text-zinc-500">102*102</div> -->
          </div>
          <div class="flex-col">
            <Avatar :src="previewSource" :size="78" />
            <!-- <div class="mt-1 text-zinc-500">78*78</div> -->
          </div>
          <div class="flex-col text-center">
            <Avatar :src="previewSource" :size="28" />
            <!-- <div class="mt-1 text-zinc-500">28*28</div> -->
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute z-10 top-0 left-2/3 w-0 h-full"
      style="border-left: 1px solid #e0e3ea"
    ></div>
  </BasicModal>
</template>
<script lang="ts">
  import type { CropendResult, Cropper } from './typing';

  import { defineComponent, ref, PropType } from 'vue';
  import CropperImage from './Cropper.vue';
  import { Space, Upload, Avatar, Tooltip, message } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { dataURLtoBlob } from '/@/utils/file/base64Conver';
  import { isFunction } from '/@/utils/is';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    UploadOutlined,
    ReloadOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SwapOutlined,
    VerticalAlignMiddleOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
  } from '@ant-design/icons-vue';

  type apiFunParams = { file: Blob; name: string; filename: string };

  const props = {
    circled: { type: Boolean, default: true },
    uploadApi: {
      type: Function as PropType<(params: apiFunParams) => Promise<any>>,
    },
    src: { type: String },
    sourceUrlValue: { type: String },
  };

  export default defineComponent({
    name: 'CropperModal',
    components: {
      BasicModal,
      Space,
      CropperImage,
      Upload,
      Avatar,
      Tooltip,
      UploadOutlined,
      ReloadOutlined,
      RotateLeftOutlined,
      RotateRightOutlined,
      SwapOutlined,
      VerticalAlignMiddleOutlined,
      ZoomInOutlined,
      ZoomOutOutlined,
    },
    props,
    emits: ['uploadSuccess', 'register'],
    setup(props, { emit }) {
      let filename = '';
      const src = ref(props.src || '');
      const previewSource = ref('');
      const cropper = ref<Cropper>();
      let scaleX = 1;
      let scaleY = 1;

      const { prefixCls } = useDesign('cropper-am');
      const [register, { closeModal, setModalProps }] = useModalInner();
      const { t } = useI18n();

      // Block upload
      function handleBeforeUpload(file: File) {
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > 4) {
          message.warn(`【${file.name}】${t('sys.pageDesigner.fileSizeTooLarge', [4])}`);
          return false;
        }
        console.log(file.type);

        if (!['image/jpg', 'image/jpeg', 'image/png', 'image/bmp'].includes(file.type)) {
          message.warning(`【${file.name}】${t('sys.component.cropper.acceptAvatarTypeTip')}`);
          return false;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        src.value = '';
        previewSource.value = '';
        reader.onload = function (e) {
          src.value = (e.target?.result as string) ?? '';
          filename = file.name;
        };
        return false;
      }

      function handleCropend({ imgBase64 }: CropendResult) {
        previewSource.value = imgBase64;
      }

      function handleReady(cropperInstance: Cropper) {
        cropper.value = cropperInstance;
      }

      function handlerToolbar(event: string, arg?: number) {
        if (event === 'scaleX') {
          scaleX = arg = scaleX === -1 ? 1 : -1;
        }
        if (event === 'scaleY') {
          scaleY = arg = scaleY === -1 ? 1 : -1;
        }
        cropper?.value?.[event]?.(arg);
      }

      async function handleOk() {
        const uploadApi = props.uploadApi;
        if (uploadApi && isFunction(uploadApi)) {
          const blob = dataURLtoBlob(previewSource.value);
          try {
            setModalProps({ confirmLoading: true });
            const result = await uploadApi({ name: 'file', file: blob, filename });
            emit('uploadSuccess', { source: previewSource.value, data: result.data.data });
            closeModal();
          } finally {
            setModalProps({ confirmLoading: false });
          }
        }
      }

      return {
        t,
        prefixCls,
        src,
        register,
        previewSource,
        handleBeforeUpload,
        handleCropend,
        handleReady,
        handlerToolbar,
        handleOk,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-cropper-am';

  .@{prefix-cls} {
    display: flex;

    &-left,
    &-right {
      height: 340px;
    }

    &-left {
      width: 400px;
    }

    &-right {
      width: 150px;
    }

    &-cropper {
      position: relative;
      width: 360px;
      height: 360px;
      background: #eee;
      background-image:
        linear-gradient(
          45deg,
          rgb(0 0 0 / 25%) 25%,
          transparent 0,
          transparent 75%,
          rgb(0 0 0 / 25%) 0
        ),
        linear-gradient(
          45deg,
          rgb(0 0 0 / 25%) 25%,
          transparent 0,
          transparent 75%,
          rgb(0 0 0 / 25%) 0
        );
      background-position:
        0 0,
        12px 12px;
      background-size: 24px 24px;
    }

    &-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 360px;
      margin-top: 10px;
    }

    &-preview {
      width: 220px;
      height: 220px;
      margin: 0 auto;
      overflow: hidden;
      border: 1px solid @border-color-base;
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      height: 100%;
      margin-top: 8px;
      padding-top: 8px;
    }
  }

  .empty {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    span {
      display: inline-block;
      width: 100%;
      height: 100%;

      :deep(.ant-upload-list) {
        width: 100%;
        height: 100%;

        .ant-upload-select-picture-card {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>
