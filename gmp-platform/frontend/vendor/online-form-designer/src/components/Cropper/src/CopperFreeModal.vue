<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="title"
    width="640px"
    min-height="510"
    :canFullscreen="false"
    @ok="handleOk"
    @cancel="handleCancel"
    :okText="t('sys.okText')"
  >
    <div :class="prefixCls">
      <div :class="`${prefixCls}-left`">
        <div :class="`${prefixCls}-cropper`">
          <CropperImage
            v-if="src"
            :src="src"
            height="304px"
            width="538px"
            @cropend="handleCropend"
            @ready="handleReady"
            :options="{
              aspectRatio: aspectRatio ?? 200 / 120,
            }"
          />
          <div v-else class="empty">
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

        <div v-if="src" :class="`${prefixCls}-toolbar`">
          <Upload :fileList="[]" :accept="fileAccept" :beforeUpload="handleBeforeUpload">
            <a-button v-if="uploadText" type="link" size="small" style="padding: 0">{{
              uploadText
            }}</a-button>
            <a v-else :title="t('sys.reUpload')" placement="bottom">
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
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import type { CropendResult, Cropper } from './typing';

  import { defineComponent, ref, PropType, watch, computed } from 'vue';
  import CropperImage from './Cropper.vue';
  import { Space, Upload, Avatar, Tooltip } from 'ant-design-vue';
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
  import { useMessage } from '/@/hooks/web/useMessage';

  type apiFunParams = { file: Blob; name: string; filename: string };

  const props = {
    title: { type: String, default: $t('sys.platform.imageUpload') },
    circled: { type: Boolean, default: true },
    uploadApi: {
      type: Function as PropType<(params: apiFunParams) => Promise<any>>,
    },
    src: { type: String },
    aspectRatio: { type: Number },
    accept: {
      type: Array<string>,
      default: ['jpg', 'jpeg', 'png', 'bmp'],
    },
    beforeUpload: {
      type: Function,
    },
    uploadText: {
      type: String, //上传图片按钮的文本
    },
  };

  // const ACCEPT = 'image/jpg,image/jpeg,image/png';

  export default defineComponent({
    name: 'CropperModal',
    components: {
      BasicModal,
      Space,
      CropperImage,
      Upload,
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
      const originalSrc = ref(props.src || '');
      const previewSource = ref('');
      const cropper = ref<Cropper>();
      let scaleX = 1;
      let scaleY = 1;

      const fileAccept = computed(() => {
        return props.accept.map((e) => `image/${e}`).join(',');
      });

      const { prefixCls } = useDesign('cropper-free');
      const [register, { closeModal, setModalProps }] = useModalInner((data) => {
        if (data?.file) {
          handleBeforeUpload(data.file);
        }
      });
      const { t } = useI18n();
      const { createMessage } = useMessage();

      watch(
        () => props.src,
        (value) => {
          src.value = value || '';
          originalSrc.value = value || '';
        },
      );

      // Block upload
      async function handleBeforeUpload(file: File) {
        props.beforeUpload && (await props.beforeUpload(file));
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > 4) {
          createMessage.warn(`【${file.name}】${t('sys.pageDesigner.fileSizeTooLarge', [4])}`);
          return false;
        }
        if (!fileAccept.value.includes(file.type)) {
          createMessage.warning(
            `【${file.name}】${t('sys.component.cropper.acceptAvatarTypeTip')}`,
          );
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

      function handleCancel() {
        src.value = '';
        setTimeout(() => {
          src.value = originalSrc.value || '';
        });
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
        handleCancel,
        fileAccept,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-cropper-free';

  .@{prefix-cls} {
    display: flex;
    padding: 0 35px;

    &-left,
    &-right {
      height: 304px;
    }

    &-left {
      width: 100%;
    }

    // &-right {
    //   width: 45%;
    // }

    &-cropper {
      position: relative;
      width: 538px;
      height: 304px;
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
      width: 538px;
      margin-top: 10px;
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
