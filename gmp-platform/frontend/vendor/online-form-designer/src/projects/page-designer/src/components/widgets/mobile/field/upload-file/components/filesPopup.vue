<template>
  <div>
    <van-popup
      v-model:show="show"
      :style="{ width: '100%', height: '53%', '--van-padding-md': 0 }"
      :closeable="true"
      position="bottom"
    >
      <div class="ks-column h100%">
        <div class="text-[16px] p12px pb16px font-bold title">
          {{ title }}
        </div>
        <div class="px12px py16px ks-col overflow-y-auto">
          <div v-for="(item, index) in fileList" :key="index" class="file-wrap my8px">
            <div>
              <SvgIcon :size="24" :name="fileTypeParser(item.name)" />
            </div>
            <div class="file-box text-sm ml8px ks-col overflow-hidden">
              <div class="ks-row overflow-hidden">
                <div class="file-item-title">{{ item.name }}</div>
                <div class="ml-16px text-[#C3C3C3]">
                  {{ fileSizeParser(item.size) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { sizeParser, typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { postFileResourceList } from '@mobile/apis/gct-apaas/FileResourceController';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  defineProps<{
    title: string;
  }>();

  const show = ref(false);
  const fileList = ref<object[]>([]);
  const open = (files, hasSize?: boolean) => {
    show.value = true;
    // fileList.value = files;
    if (hasSize) {
      fileList.value = files;
    } else {
      files.length && getFileSize(files);
    }
  };

  const getFileSize = async (files) => {
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

  defineExpose({ open });
</script>
<style lang="less" scoped>
  :deep(.van-popup__close-icon) {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
  .title {
    border-bottom: 1px solid #e0e3ea;
  }

  .file-wrap {
    display: flex;
    overflow: hidden;
    .file-box {
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
  }
</style>
