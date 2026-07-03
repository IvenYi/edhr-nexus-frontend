<template>
  <div v-show="!readonly">
    <a-upload-dragger
      v-show="showUpload"
      style="margin-bottom: 16px"
      :disabled="disabled"
      :customRequest="beforeUpload"
      :multiple="isMultiple"
      :fileList="[]"
      :accept="acceptList + ''"
    >
      <div>
        <SvgIcon size="56" name="folder" />
      </div>
      <p class="ant-upload-text" style="font-size: 14px">点击或将文件拖拽到这里上传</p>
      <!-- <p class="ant-upload-hint" v-if="acceptStr">
        支持拖拽的文件格式：{{ acceptStr }}
      </p> -->
    </a-upload-dragger>
    <div class="progress-box">
      <div class="progress-item mb-8px w-full" v-for="(item, index) in fileList" :key="index">
        <SvgIcon class="svg-icon" :size="item.status ? 32 : 24" :name="fileTypeParser(item.name)" />
        <div class="progress-item__box pl-10px">
          <div class="progress-item__name">
            <a-tooltip>
              <template #title>{{ item.name }}</template>
              <span class="label" @click.stop="downFile(item)">{{ item.name }}</span>
            </a-tooltip>
            <span v-if="item.fileSize" :class="['size', { 'mr-40px': item.status }]">{{
              fileSizeParser(item.fileSize)
            }}</span>
          </div>
          <a-progress v-show="item.status" :strokeWidth="4" :percent="item.percentNum">
            <template #format="percent">
              <span class="error" v-if="item.status === statusEnum.EXCEPTION" style="color: red"
                >{{ t('sys.component.upload.uploadError') }}！</span
              >
              <span v-else style="color: var(--ant-primary-color)">{{ percent + '%' }}</span>
            </template>
          </a-progress>
        </div>
        <close-outlined v-if="!disabled" class="mt-3px icon" @click.stop="deleteFile(index)" />
      </div>
    </div>
  </div>
</template>

<script name="baseUpload" setup lang="ts">
  import { computed, ref, nextTick, watch } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Uploader } from '@/utils/uploader';
  import { cloneDeep } from 'lodash-es';
  import { downloadByUrl } from '/@/utils/file/download';
  import { statusEnum, type FileItemType } from '../types';
  import { uuid2 } from '/@/utils/uuid';
  import { getFileSize, sizeParser, typeParser } from '../hooks/hooks';

  const { t } = useI18n();
  const fileLen = ref(0);
  const fileList = ref<FileItemType[]>([]);

  const emit = defineEmits(['update:modelValue', 'onBeforeUpload', 'saveTableRow']);

  const props = defineProps<{
    modelKey?: string;
    modelValue?: string;
    readonly: boolean;
    disabled: boolean;
    maxCount?: number;
    maxSize?: number;
    accept?: string[];
    isTable?: boolean;
    beforeUpload?: Function;
  }>();

  const fileTypeParser = computed(() => {
    return (fileName) => {
      return typeParser(fileName);
    };
  });

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
      const P = fileValues.map(async (url) => {
        const path = import.meta.env.VITE_MINIO_PATH + url;
        return {
          uid: uuid2(16, 16),
          path: path,
          name: url.split('/').at(-1),
          status: undefined,
          fileSize: await getFileSize(path),
          percentNum: 0,
        };
      });
      fileList.value = await Promise.all(P);
    },
    { immediate: true },
  );

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const acceptList = computed(() => {
    const _accept = cloneDeep(props.accept || []);
    const handleAccept = [...new Set(_accept)];
    const allAccepts = [] as string[];

    handleAccept.forEach((ext: string) => {
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
  });

  const showUpload = computed(() => {
    if (props.maxCount === null || props.maxCount === undefined) {
      return true;
    }
    return fileList.value.length < props.maxCount;
  });

  const isMultiple = computed(() => {
    if (props.maxCount === null || props.maxCount === undefined) {
      return true;
    }
    return props.maxCount > 1;
  });

  async function beforeUpload({ file }) {
    fileLen.value++;
    if (fileLen.value > props.maxCount!) {
      fileLen.value--;
      return;
    }
    fileList.value = [
      ...fileList.value,
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: '',
        percentNum: 0,
        status: statusEnum.ACTIVE,
      },
    ];
    await uploadFile(file);
  }

  async function uploadFile(file: File) {
    let findItem = fileList.value.find((item) => item.uid === file.uid) || {};
    try {
      await Uploader.beforeUploadFun(file, {
        maxSize: props.maxSize || 5,
        acceptList: (props.accept || []).map((i) => '.' + i),
        beforeUpload: (file) => {
          if (
            props.beforeUpload &&
            Object.prototype.toString.call(props.beforeUpload) === '[object Function]'
          ) {
            return props.beforeUpload(file);
          }
        },
      });
      const timer = setInterval(() => {
        if (findItem['percentNum'] < 95) {
          findItem['percentNum']++;
        }
      }, 100);
      try {
        const path = await Uploader.uploadByFile(file, true, props.modelKey);
        value.value = [...value.value, path];
        findItem = Object.assign(findItem, {
          path: import.meta.env.VITE_MINIO_PATH + path,
          percentNum: 100,
          status: undefined,
        });
        clearInterval(timer);
        await nextTick();
        /**列字段时候触发保存 */
        props.isTable && emit('saveTableRow');
      } catch (err) {
        fileLen.value--;
        console.warn(err);
        findItem['status'] = statusEnum.EXCEPTION;
        clearInterval(timer);
      }
    } catch (error) {
      fileLen.value--;
      message.warn(error);
      fileList.value.splice(fileList.value.length - 1, 1);
    }
  }

  async function deleteFile(index) {
    fileLen.value--;
    fileList.value.splice(index, 1);
    value.value.splice(index, 1);
    value.value = [...value.value];
    await nextTick();
  }

  async function downFile(item) {
    downloadByUrl({ url: item.path });
  }
</script>

<style lang="less" scoped>
  .progress-box {
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 4px;
    }
  }

  .progress-item {
    display: flex;
    justify-content: flex-start;

    .svg-icon {
      width: 32px;
      height: 32px;
    }

    &__box {
      display: flex;
      flex-direction: column;
      align-self: center;
      width: calc(100% - 72px);
      line-height: 22px;

      :deep(.ant-progress) {
        line-height: 0.4;

        .ant-progress-text {
          position: absolute;
          top: -14px;
          right: 0;
          color: #797a7d;
          line-height: 0.6;

          &:has(.error) {
            right: 30px;
          }
        }
      }

      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;

        .ant-progress-inner {
          background: #e6e9ef;
        }
      }
    }

    &__name {
      display: flex;
      width: 100%;

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      .size {
        margin-left: 16px;
        color: #c3c3c3;
      }
    }

    .icon {
      align-self: center;
      margin-left: 24px;
      color: #212528;
      font-size: 16px;
      justify-items: flex-end;
    }
  }

  :deep(.ant-upload.ant-upload-drag) {
    background: #f7f8fa;

    &.ant-upload-disabled {
      opacity: 0.5;
    }

    .ant-upload {
      padding: 40px 0;
    }
  }
</style>
