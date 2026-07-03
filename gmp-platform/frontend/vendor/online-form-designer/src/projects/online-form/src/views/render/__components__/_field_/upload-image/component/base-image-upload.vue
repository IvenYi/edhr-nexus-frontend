<template>
  <div class="base-upload-modal">
    <div class="upload-dragger">
      <a-upload-dragger
        v-show="showUpload && !readonly"
        :class="disabled ? 'upload-disabled' : ''"
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
    </div>

    <div class="img-box" v-if="fileList.length">
      <a-image-preview-group
        :preview="{
          getContainer: getContainer,
        }"
      >
        <div class="img-item material-table-field" v-for="(item, index) in fileList" :key="index">
          <a-progress
            v-if="item.status"
            :strokeWidth="4"
            :show-info="false"
            :percent="item.percentNum"
          />
          <a-image width="80px" height="80px" :src="transfer(item.path ?? '')">
            <template #previewMask>
              <zoom-in-outlined :class="readonly ? '' : 'mr10px'" />
              <delete-outlined @click.stop="deleteFile(index)" v-if="!disabled && !readonly" />
            </template>
          </a-image>
        </div>
      </a-image-preview-group>
    </div>
  </div>
</template>

<script name="baseUpload" setup lang="ts">
  import { computed, ref, nextTick, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { Uploader } from '@/utils/uploader';
  import { cloneDeep, isNil } from 'lodash-es';
  import { useModal, useNamespace } from '@gct/runtime';
  import { statusEnum, type FileItemType } from '../types/image-upload';
  import { uuid2 } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWebUpload } from '@gct/nocode-web-render';

  const { t } = useI18n();

  const fileLen = ref(0);
  const fileList = ref<FileItemType[]>([]);

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

  const { upload, transfer } = useWebUpload();

  watch(
    () => props.modelValue,
    async () => {
      const fileValues = props.modelValue ? props.modelValue.split(',') : [];
      const P = fileValues.map(async (path) => {
        return {
          uid: uuid2(16, 16),
          path: path,
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

  const acceptList = computed(() => {
    const _accept = cloneDeep(props.accept || []);
    return [
      ...new Set(
        _accept.some((i) => i === 'jpg' || i === 'jpeg')
          ? _accept.concat(['jpg', 'jpeg'])
          : _accept,
      ),
    ].map((i) => '.' + i);
  });

  const fileaccept = computed(() => {
    return acceptList.value + '' || '.gct,image/*';
  });

  const showUpload = computed(() => {
    if (isNil(props.maxCount)) {
      return true;
    }
    return fileList.value.length < props.maxCount;
  });

  const isMultiple = computed(() => {
    if (isNil(props.maxCount)) {
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
        acceptList: acceptList.value,
      });
      const timer = setInterval(() => {
        if (findItem['percentNum'] < 95) {
          findItem['percentNum'] = findItem['percentNum'] + 7;
        }
      }, 100);
      try {
        const path = await upload(file, { type: 'image', modelKey: props.modelKey });

        findItem = Object.assign(findItem, {
          percentNum: 100,
          status: undefined,
          path: path,
        });
        clearInterval(timer);
        await nextTick();
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
    await nextTick();
  }

  useModal(async () => {
    const paths = fileList.value.map((item) => item.path);
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
      data: [paths],
      params: paths,
    };
  });
</script>

<style lang="less" scoped>
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
    display: flex;
    flex-wrap: wrap;
    max-height: 320px;
    overflow-y: auto;
    gap: 8px;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }

    .img-item {
      position: relative;
      width: 80px;
      height: 80px;
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
</style>
<style lang="less">
  .ant-image-preview-mask {
    z-index: 1031;
  }

  .base-upload-modal {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 24px;
    gap: 8px;
  }
</style>
