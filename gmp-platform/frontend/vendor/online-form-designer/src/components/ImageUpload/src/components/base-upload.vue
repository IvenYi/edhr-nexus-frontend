<template>
  <a-upload-dragger
    v-show="showUpload && !readonly"
    :class="disabled ? 'upload-disabled' : ''"
    style="margin: 4px 0"
    :disabled="disabled"
    :customRequest="beforeUpload"
    :multiple="isMultiple"
    :fileList="[]"
    :accept="fileaccept"
  >
    <div>
      <i class="iconfont icon-tupian-shili"></i>
    </div>
    <p class="ant-upload-text" style="font-size: 14px">{{
      t('sys.pageDesigner.clickOrDragToUpload')
    }}</p>
  </a-upload-dragger>
  <div class="img-box" v-if="fileList.length">
    <a-image-preview-group
      :preview="{
        getContainer: getPopContainer,
      }"
    >
      <div
        class="img-item float-left mr-8px my-4px"
        :class="{ 'material-table-field': materialType === MaterialEnum.MaterialTableField }"
        v-for="(item, index) in fileList"
        :key="index"
      >
        <a-progress
          v-if="item.status"
          :strokeWidth="4"
          :show-info="false"
          :percent="item.percentNum"
        />
        <a-image
          width="100px"
          height="100px"
          :src="item.path"
          :preview="{
            maskClassName: 'custom-image-preview',
          }"
        >
          <template #previewMask>
            <!-- <zoom-in-outlined :class="readonly ? '' : 'mr10px'" />
            <delete-outlined @click.stop="deleteFile(index)" v-if="!disabled && !readonly" /> -->
          </template>
        </a-image>
        <div
          v-if="!item.status && !disabled && !readonly"
          class="delete-icon-box"
          @click.stop="deleteFile(index)"
        >
          <close-circle-filled class="delete-icon" />
        </div>
      </div>
    </a-image-preview-group>
  </div>
</template>

<script name="baseUpload" setup lang="ts">
  import { computed, ref, nextTick, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { Uploader } from '@/utils/uploader';
  import { cloneDeep } from 'lodash-es';
  // import { downloadByUrl } from '/@/utils/file/download';
  import { statusEnum, type FileItemType } from '../types';
  import { uuid2 } from '/@/utils/uuid';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';

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
    materialType?: MaterialEnum;
    getContainer?: Function;
  }>();

  const getPopContainer = props.getContainer || document.body;

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
          fileSize: 0,
          percentNum: 0,
        };
      });
      fileList.value = await Promise.all(P);
    },
    { immediate: true },
  );

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

  const fileaccept = computed(() => {
    return acceptList.value + '' || 'image/*';
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
    const localPath = URL.createObjectURL(file);
    console.log(file, localPath);
    fileList.value = [
      ...fileList.value,
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: localPath,
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
          findItem['percentNum'] = findItem['percentNum'] + 7;
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

  // async function downFile(item) {
  //   downloadByUrl({ url: item.path });
  // }
</script>

<style lang="less" scoped>
  // :deep(.ant-image-preview-mask) {
  //   background-color: none;
  // }
  .icon-tupian-shili {
    color: var(--ant-primary-color);
    font-size: 56px;
    line-height: 56px;
  }

  :deep(.ant-image-mask) {
    border-radius: 4px;
    font-size: 18px;
  }

  :deep(.ant-image .ant-image-img) {
    border-radius: 4px;
    object-fit: contain;
  }

  .img-box {
    max-height: 268px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }

    .img-item {
      position: relative;
      width: 102px;
      height: 102px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      background-color: #f7f8fa;

      .ant-progress {
        display: flex;
        position: absolute;
        z-index: 1;
        align-items: center;
        height: 100%;
        padding: 10px;
        border-radius: 4px;
        background-color: rgb(0 0 0 / 50%);
      }

      &.material-table-field:nth-child(4n + 4) {
        margin-right: 0;
      }

      .delete-icon-box {
        position: absolute;
        top: 0;
        right: 0;
        // padding: 6px;
        cursor: pointer;

        .delete-icon {
          color: rgb(0 0 0 / 56%);
          font-size: 24px;

          &:hover {
            color: rgb(0 0 0 / 65%);
          }
        }
      }
    }
  }

  :deep(.ant-upload.ant-upload-drag) {
    background: #f7f8fa;

    &.ant-upload-disabled {
      opacity: 1;
    }

    .ant-upload {
      padding: 40px 0;
    }
  }

  .upload-disabled {
    .icon-tupian-shili {
      color: #c3c3c3;
    }
  }

  :deep(.ant-upload.ant-upload-drag.upload-disabled p.ant-upload-text) {
    color: #c3c3c3;
  }

  :deep(.custom-image-preview.ant-image-mask) {
    background: transparent;
    // .ant-image-mask-info {
    //   visibility: hidden;
    // }
  }
</style>
<style lang="less">
  .ant-image-preview-mask {
    z-index: 1031;
  }
</style>
