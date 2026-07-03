<template>
  <div v-show="!readonly">
    <div class="progress-wrap pb-10px" v-if="showProgress">
      <div
        :class="['left-icon', 'w-22px', 'h-26px', fileType]"
        :style="{
          '--bg-image': iconBgImage,
        }"
      ></div>
      <div class="progress-box text-sm">
        <div class="flex flex-row justify-start">
          <span class="label" @click.stop="goView">{{ fileName }}</span>
          <span class="size ml-auto mr-10px text-[#999999]">{{ fileSize }}</span>
          <close-outlined class="mt-3px icon" @click.stop="deleteFile" />
        </div>
        <a-progress v-show="status" :strokeWidth="2" :status="status" :percent="percentNum">
          <template #format="percent">
            <span v-if="status === statusEnum.EXCEPTION" style="color: red"
              >{{ t('sys.component.upload.uploadError') }}！</span
            >
            <span v-else style="color: var(--ant-primary-color)">{{ percent + '%' }}</span>
          </template>
        </a-progress>
      </div>
    </div>
    <a-upload-dragger
      :disabled="disabled"
      :customRequest="beforeUpload"
      :fileList="[]"
      :accept="acceptList + ''"
    >
      <p class="esop-ico-box">
        <i class="iconfont icon-shangchuanwenjian esop-icon"></i>
      </p>
      <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
      <p class="ant-upload-hint" v-if="attrObj.acceptStr">
        支持拖拽的文件格式：{{ attrObj.acceptStr }}
      </p>
      <p class="esop-tip" v-if="acceptList.includes('.mp4') || acceptList.includes('.MP4')">
        MP4视频当前只支持播放编码为H.264格式的视频，上传前请先将视频转码至该编码格式
      </p>
    </a-upload-dragger>
  </div>
  <div v-show="readonly && widgetInScope !== WidgetInScopeEnum.GCT_SUB_TABLE_MODAL">
    <!-- <img
      v-if="fileType === fileTypeEnum.PICTURE"
      :src="source"
      @click.stop="goView"
      alt=""
      class="w-full"
    /> -->
    <a-image v-if="fileType === fileTypeEnum.PICTURE" class="w-full" :src="source" />
    <VuePdf
      class="vue-pdf-embed-box"
      ref="VuePdfRef"
      v-if="fileType === fileTypeEnum.PDF"
      :source="source"
      :downloadFileName="fileName"
      :isDownload="true"
      :isFull="true"
      @fullscreen="openModal"
      pdfkey="esop"
    />
    <VideoPlayer
      class="video-player"
      v-if="fileType === fileTypeEnum.VIDEO"
      :src="source"
      :loop="false"
      :volume="0.6"
    />
  </div>
  <ViewModal
    ref="viewModal"
    @register="register"
    :source="source"
    :fileType="fileType"
    :fileName="fileName"
  />
</template>

<script name="gct-e-sop" setup lang="ts">
  import {
    reactive,
    computed,
    ref,
    nextTick,
    onBeforeMount,
    inject,
    toRefs,
    onUnmounted,
  } from 'vue';
  import { ESOP } from '/@page-designer/types/web';
  import { cloneDeep, debounce } from 'lodash-es';
  import { Uploader } from '@/utils/uploader';
  import { Form, message } from 'ant-design-vue';
  import { postFileResourceList } from '/@/apis/gct-apaas/FileResourceController';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { VuePdf } from '/@/components/VuePdf';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { WidgetInScopeEnum } from '/@page-designer/enum';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import ViewModal from './modal/view-modal.vue';
  import { useModal } from '/@/components/Modal';

  const enum UploadTypeEnum {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    PDF = 'pdf',
    MP4 = 'mp4',
  }

  const enum fileTypeEnum {
    PICTURE = 'picture',
    PDF = 'pdf',
    VIDEO = 'video',
  }

  const enum statusEnum {
    EXCEPTION = 'exception',
    ACTIVE = 'active',
  }

  const widgetInScope = inject('widgetInScope');
  const { t } = useI18n();
  const formItemContext = Form.useInjectFormItemContext();
  const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: ESOP; formData: Object }>();
  const formData = ref(props.formData);
  const { field, modelKey, enableAutofill, autofillRules } = reactive(props.widget.props);
  const percentNum = ref<number>(0);
  const status = ref<statusEnum>();
  const uploadName = ref<string>();
  const fileSize = ref<any>();
  const viewModal = ref<InstanceType<typeof ViewModal> | null>(null);
  const { readonly, disabled } = toRefs(props.widget.props);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();

  const [register, { openModal }] = useModal();

  const VuePdfRef = ref();

  const showProgress = computed(() => {
    return !!(fileName.value || value.value[0]?.split('/').at(-1));
  });

  const source = computed(() => {
    const path = value.value[0]
      ? /^https?:\/\//.test(value.value[0])
        ? value.value[0]
        : import.meta.env.VITE_MINIO_PATH + value.value[0]
      : '';
    if (fileType.value === fileTypeEnum.PDF) {
      return {
        url: path,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  });

  const fileTypeParser = (fileName) => {
    const arr = fileName.split('.');
    const type = (arr[arr.length - 1] || 'png').toLowerCase();
    if ([UploadTypeEnum.PNG, UploadTypeEnum.JPG, UploadTypeEnum.JPEG].includes(type))
      return fileTypeEnum.PICTURE;
    if ([UploadTypeEnum.PDF].includes(type)) return fileTypeEnum.PDF;
    if ([UploadTypeEnum.MP4].includes(type)) return fileTypeEnum.VIDEO;
  };

  const fileName = computed(() => {
    return uploadName.value ?? value.value[0]?.split('/').at(-1);
  });

  const fileType = computed(() => {
    return fileName.value ? fileTypeParser(fileName.value) : undefined;
  });

  const iconBgImage = computed(() => {
    return `url('/@page-designer/assets/${fileType.value}.png')`;
  });

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });

  async function beforeUpload({ file }) {
    const size = file.size / 1024 / 1024;
    const isImage = file.type.startsWith('image/');
    if (isImage && size > 60) {
      message.error(t('图片类型最大支持60MB'));
      return Promise.reject();
    }
    uploadName.value = file.name;
    fileSize.value = size.toFixed(2) + 'M';
    percentNum.value = 0;
    status.value = statusEnum.ACTIVE;
    await uploadFile(file);
  }

  const value = props.widget.props.field
    ? computed({
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
          formItemContext.onFieldChange();
        },
      })
    : ref([]);

  const getFileDataById = async (id) => {
    const item = (await postFileResourceList({ ids: [id] }))?.[0] || {};
    return {
      name: item.name,
      size: sizeParser(item.size) || item.size?.toString(),
      type: item.type,
      uploader: item.createUserId,
      uploadTime: item.createTime,
    };
  };
  /**自动填充 */
  async function setFillByRules(path: string) {
    if (!enableAutofill || !autofillRules?.length) return;
    const id = path.split('/')[2];
    if (!id) return;
    const data = await getFileDataById(id);
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = data[fromField];
    });
  }
  const acceptList = computed(() => {
    // 获取原始 accept 属性并处理大小写
    const _accept = attrObj.value?.accept?.length
      ? cloneDeep(attrObj.value?.accept)
      : ['jpg', 'jpeg', 'png', 'mp4', 'pdf'];
    const allAccepts = [] as string[];

    _accept.forEach((ext: string) => {
      // 添加原始扩展名
      allAccepts.push(ext);

      // 如果是小写，添加大写版本
      if (ext === ext.toLowerCase()) {
        allAccepts.push(ext.toUpperCase());
      }

      // 如果是大写，添加小写版本
      if (ext === ext.toUpperCase()) {
        allAccepts.push(ext.toLowerCase());
      }
    });

    // 去重
    const uniqueAccepts = [...new Set(allAccepts)];

    return uniqueAccepts.map((i) => '.' + i);
    // return [
    //   ...new Set(
    //     _accept.some((i) => i === 'jpg' || i === 'jpeg')
    //       ? _accept.concat(['jpg', 'jpeg'])
    //       : _accept,
    //   ),
    // ].map((i) => '.' + i);
  });

  async function uploadFile(file: File) {
    try {
      await Uploader.beforeUploadFun(file, {
        maxSize: attrObj.value?.maxSize || 5,
        acceptList: attrObj.value?.accept?.length
          ? cloneDeep(attrObj.value?.accept.map((i) => '.' + i))
          : ['jpg', 'jpeg', 'png', 'mp4', 'pdf'].map((i) => '.' + i),
        beforeUpload() {
          return Event.runEventByName('onValidator', props.widget.events, file, formData.value);
        },
      });
      const timer = setInterval(() => {
        if (percentNum.value < 95) {
          percentNum.value++;
        }
      }, 100);
      try {
        const path = await Uploader.uploadByFile(file, true);
        setFillByRules(path);
        value.value = [path];
        percentNum.value = 100;
        status.value = undefined;
        uploadName.value = undefined;
        clearInterval(timer);
        await nextTick();
        Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
      } catch (err) {
        console.warn(err);
        value.value = [];
        status.value = statusEnum.EXCEPTION;
        clearInterval(timer);
      }
    } catch (error) {
      message.warn(error);
      value.value = [];
      percentNum.value = 0;
      fileSize.value = '';
      status.value = undefined;
      uploadName.value = undefined;
    }
  }

  async function deleteFile() {
    fileSize.value = '';
    value.value = [];
    uploadName.value = undefined;
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, [], formData.value);
  }

  function goView() {
    if (status.value === statusEnum.EXCEPTION || !value.value.length) return;
    // viewModal.value?.open();
    openModal();
  }

  // function openPage() {
  //   const url = value.value[0] ? import.meta.env.VITE_MINIO_PATH + value.value[0] : '';
  //   let newWindow = window.open();
  //   newWindow?.document.write(`<!DOCTYPE html><html><body><img src='${url}'/></body></html>`);
  //   newWindow?.document.write(
  //     `<!DOCTYPE html><html><body><video controls width="700"><source src='${url}' type="video/mp4" /></video></body></html>`,
  //   );
  //   newWindow?.document.write(
  //     `<!DOCTYPE html><html><body>
  //       <embed src='${url}' type="application/pdf" width="700px" />
  //     </body></html>`,
  //   );
  // }

  window.addEventListener('resize', debounce(resizeHandler, 200));

  async function resizeHandler() {
    await nextTick();
    if (fileType.value !== fileTypeEnum.PDF) return;
    VuePdfRef.value?.reload();
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });
</script>

<style lang="less" scoped>
  .progress-wrap {
    display: flex;

    .left-icon {
      margin-right: 8px;
      // background-image: var(--bg-image);
      background-repeat: no-repeat;
      background-size: 100% 100%;

      &.picture {
        background-image: url('/@page-designer/assets/picture.png');
      }

      &.pdf {
        background-image: url('/@page-designer/assets/pdf.png');
      }

      &.video {
        background-image: url('/@page-designer/assets/video.png');
      }
    }

    .progress-box {
      flex: 1;

      .label {
        cursor: pointer;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      :deep(.icon.anticon-close) {
        color: #999;
        cursor: pointer;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      :deep(.ant-progress) {
        line-height: 0.6;

        .ant-progress-text {
          margin-left: 0;
          color: var(--ant-primary-color);
          line-height: 1.5;
        }
      }

      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;

        .ant-progress-inner {
          background: #d9d9d9;
        }
      }
    }
  }

  :deep(.ant-upload.ant-upload-drag.ant-upload-disabled) {
    opacity: 0.5;
  }

  .esop-icon {
    color: var(--ant-primary-color);
    font-size: 45px;
  }

  .esop-tip {
    // color: var(--ant-primary-color);
  }

  .vue-pdf-embed-box {
    width: 100%;
  }

  .video-player {
    // width: 100%;
  }
</style>
