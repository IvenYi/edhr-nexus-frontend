<template>
  <div class="upload-file-wrap">
    <div
      v-if="!readonly && showUpload"
      class="file-add"
      :class="[disabled && 'disabled']"
      @click="!disabled && onUpload()"
    >
      <i class="iconfont icon-chuangjian text-[14px] text-center"></i>
      <div class="text-[14px] ml-4px text-center">上传附件</div>
    </div>
    <div class="overflow-y-auto">
      <div
        v-for="(item, index) in fileList"
        :key="index"
        class="progress-wrap ks-row"
        :class="item.status ? 'my12px' : 'my8px'"
      >
        <div>
          <SvgIcon :size="item.status ? 32 : 24" :name="fileTypeParser(item.name)" />
        </div>
        <div class="progress-box text-[14px] ml8px">
          <div class="w-full ks-row overflow-hidden">
            <div class="label">{{ item.name }}</div>
            <div v-if="item.fileSize" class="ml-16px text-[#C3C3C3]" style="word-break: keep-all">
              {{ fileSizeParser(item.fileSize) }}
            </div>
          </div>
          <van-progress
            v-if="item.status"
            :percentage="item.percentNum"
            :color="`var(--van-primary-color)`"
            :show-pivot="false"
            track-color="E6E9EF"
          />
        </div>
        <van-icon
          v-if="!readonly && !item.status"
          name="cross"
          class="icon"
          @click="deleteFile(index)"
        />
      </div>
    </div>
  </div>
</template>

<script name="file-upload" setup lang="ts">
  import { computed, ref, nextTick, watch } from 'vue';
  import { cloneDeep, isNil } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { showDialog } from 'vant';
  import { useMobileUpload } from '../../../hooks';
  import { FileItemType, getFileSize, sizeParser, typeParser } from './types/file-upload';

  const emit = defineEmits(['update:modelValue', 'onBeforeUpload', 'saveTableRow']);

  const props = defineProps<{
    modelValue?: string;
    readonly: boolean;
    disabled: boolean;
    maxCount?: number;
    maxSize?: number;
    accept?: string[];
    modelKey: string;
  }>();

  const { transfer } = useMobileUpload();

  const fileLen = ref(0);
  const fileList = ref<FileItemType[]>([]);

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const fileTypeParser = computed(() => {
    return (fileName) => {
      return typeParser(fileName);
    };
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
    console.log('acceptList', acceptList.value);
    JSSDK.run(
      'Uploader',
      {
        maxCount: (props.maxCount || 50) - fileList.value.length,
        acceptList: acceptList.value,
        maxSize: props.maxSize,
        modelKey: props.modelKey,
        success(res) {
          const files = res.map((e) => e.url) || [];
          value.value = value.value.concat(files);
        },
        error(message) {
          if (!message.length) return;
          showDialog({
            message: message.join('；'),
          });
        },
      },
      'file',
    );
  };

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
        const path = transfer(url);
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

  const showUpload = computed(() => {
    if (props.readonly) {
      return false;
    }
    if (isNil(props.maxCount)) {
      return true;
    }
    return fileList.value.length < props.maxCount;
  });

  async function deleteFile(index) {
    fileLen.value--;
    fileList.value.splice(index, 1);
    value.value.splice(index, 1);
    value.value = [...value.value];
    await nextTick();
  }
</script>

<style lang="less" scoped>
  .upload-file-wrap {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    column-gap: 8px;
    row-gap: 8px;
    width: 100%;

    .file-add {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 42px;
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

  .progress-wrap {
    display: flex;
    align-items: center;
    .progress-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      line-height: 22px;
      align-self: center;
      .file-item-title {
        overflow: hidden;
        white-space: break-spaces;
      }
    }
    .icon {
      margin-left: 24px;
      font-size: 16px;
      color: #212528 !important;
    }
  }
  .moreBtn {
    color: var(--van-primary-color);
  }
</style>
