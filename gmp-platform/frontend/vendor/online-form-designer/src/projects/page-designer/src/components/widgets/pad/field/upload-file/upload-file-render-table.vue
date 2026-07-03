<template>
  <div>
    <van-popover
      v-if="value.length"
      v-model:show="popupRef"
      :show-arrow="false"
      class="image-pop"
      :offset="[0, 0]"
    >
      <div class="px16px my16px ks-col overflow-y-auto w400px file-list">
        <div v-for="(item, index) in fileList" :key="index" class="file-wrap mb8px">
          <div class="progress-wrap mb8px p12px pr0">
            <div class="svg-cate w40px h40px flex items-center justify-center">
              <SvgIcon :size="item.status ? 32 : 24" :name="fileTypeParser(item.name)" />
            </div>
            <div class="progress-box ml12px mr12px gct-text-overflow">
              <div class="file-name w-full text-[#1A1D23] text-[15px]">
                <div class="gct-text-overflow">{{ getFileName(item.name).filename }}</div>
                <div>{{ getFileName(item.name).extensionPart }}</div>
              </div>
              <van-progress
                v-if="item.status"
                :percentage="item.percentNum"
                :color="`var(--van-primary-color)`"
                :show-pivot="false"
                track-color="E6E9EF"
              />
              <div v-else class="text-[13px] text-[#A6A6A6]" style="word-break: keep-all">
                {{ fileSizeParser(item.size) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #reference>
        <div
          class="ell file-list-table"
          @touchstart.stop="onOpen"
          @touchend="endContextMenu"
          @click.stop="openPreview"
        >
          <i class="iconfont icon-PaperClip fujian"></i>
          {{ $t('sys.pageDesigner.xFiles', { text: value.length }) }}
        </div>
      </template>
    </van-popover>
  </div>
  <!-- <FilesPopup ref="popupRef" :title="label || fieldName" @click.stop /> -->
</template>

<script name="gct-upload-file" setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { UploadFile } from '/@page-designer/types/mobile';
  import { sizeParser, typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { postFileResourceList } from '@mobile/apis/gct-apaas/FileResourceController';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import SvgIcon from '/@/components/Icon/src/SvgIcon.vue';

  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: Object }>();

  const { label, fieldName } = reactive(props.widget.props);
  const popupRef = ref();
  const timeout = ref();
  const fileList = ref();

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            const val = props.modelValue ? props.modelValue.split(',') : [];
            getFileSize(val);
            return val;
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

  const getFileSize = async (files) => {
    if (!files || !files.length) return;
    const ids = files.map((i) => {
      return i.split('/')[2];
    });
    const list = (await postFileResourceList({ ids })) || [];
    fileList.value = list.map((item) => {
      const path = MOBILE_MINIO_PATH.value + item.url;
      return {
        path: path,
        name: item.name,
        size: item.size,
      };
    });
  };
  const openPreview = () => {
    document.querySelectorAll('.van-popover').forEach((popover) => {
      const style = window.getComputedStyle(popover);
      if (style.display !== 'none') {
        // 触发关闭逻辑，具体取决于 Vant 的实现
        popover.style.display = 'none';
      }
    });
    popupRef.value = true;
  };
  const onOpen = (e) => {
    popupRef.value = false;
    clearTimeout(timeout.value); // 清除之前的任何长按超时
    // 清除一打开弹窗
    document.querySelectorAll('.van-popover').forEach((popover) => {
      const style = window.getComputedStyle(popover);
      if (style.display !== 'none') {
        // 触发关闭逻辑，具体取决于 Vant 的实现
        popover.style.display = 'none';
      }
    });
    timeout.value = setTimeout(function () {
      popupRef.value = true;
    }, 500); // 设置长按的最小时间为500毫秒
  };

  const endContextMenu = () => {
    clearTimeout(timeout.value); // 清除之前的任何长按超时
  };
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

  const getFileName = (name) => {
    // 分离文件名和扩展名
    const lastDotIndex = name.lastIndexOf('.');
    let filename, extension;
    if (lastDotIndex === -1) {
      // 没有扩展名
      filename = name;
      extension = '';
    } else {
      filename = name.substring(0, lastDotIndex - 1);
      extension = name.substring(lastDotIndex - 1); // 包含点，如 ".pdf"
    }
    return {
      extensionPart: extension,
      filename: filename,
    };
  };
  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style lang="less" scoped>
  .file-list-table {
    display: block;
    margin: 0 -10px;
    padding: 13px 10px;
  }

  .fujian {
    opacity: 0.7;
    color: var(--van-primary-color);
  }

  .progress-wrap {
    display: flex;
    flex: 1;
    border-radius: 4px;
    background: #f9fafb;

    .svg-cate {
      border: 1px solid #e0e3eb;
      border-radius: 4px;
      background: #fff;
    }

    .file-name {
      display: flex;
      justify-content: flex-start;
    }

    .progress-box {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-self: center;
      line-height: 22px;

      .file-item-title {
        overflow: hidden;
        white-space: break-spaces;
      }
    }

    .icon {
      margin-left: 24px;
      color: #212528 !important;
      font-size: 16px;
    }
  }

  .preview-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    cursor: pointer;

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #a6a6a6;

      .van-icon {
        color: #fff;
        font-size: 8px;
      }
    }
  }

  .gct-text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }

  .file-list {
    max-height: 280px;
    overflow-y: auto;
  }
</style>
