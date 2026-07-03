<template>
  <basic-popup
    v-model:show="show"
    title="选择SOP作业指导书"
    class="esop-selector-popup"
    :popup-props="{ ...popupProps }"
    :extraStyle="{ width: '480px' }"
  >
    <van-search
      class="search-bar flex-grow-1"
      shape="round"
      v-model:modelValue="_searchVal"
      placeholder="请输入文件名称查询"
      @search="handleSearch"
    />
    <div class="p-16px h-[calc(100%_-_52px)]">
      <div v-if="esops.length > 0" class="h-full overflow-auto">
        <van-radio-group :modelValue="checked">
          <van-cell-group inset>
            <van-cell
              v-for="i in esops"
              :key="i.id"
              :title="i.name"
              clickable
              @click="checked = i.id"
              class="item bg-white mb-10px overflow-hidden"
              :class="checked === i.id ? 'selected' : ''"
            >
              <template #title>
                <img class="type-icon" :src="iconBgImage(i.file)" alt="" />
                <span class="name">
                  <Highlight :text="i.name" :keyword="searchKey" />
                </span>
              </template>
              <template #right-icon>
                <van-radio :name="i.id" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
      <Empty class="h-full" v-else description="暂无搜索结果" />
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleOk">确认切换</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import PictureImage from '@mobile/assets/svg/edhr/sopicon_img.svg';
  import PDFImage from '@mobile/assets/svg/edhr/sopicon_pdf.svg';
  import VideoImage from '@mobile/assets/svg/edhr/sopicon_mp4.svg';

  enum UploadTypeEnum {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    BMP = 'bmp',
    DOCX = 'docx',
    PDF = 'pdf',
    XLSX = 'xlsx',
    DOC = 'doc',
    MP4 = 'mp4',
    AVI = 'avi',
    PPT = 'ppt',
    GIF = 'gif',
  }

  const iconBgImage = (fileName) => {
    const arr = fileName.split('.');
    let type = arr[arr.length - 1] || 'png';
    type = type.toLowerCase();
    if ([UploadTypeEnum.JPG, UploadTypeEnum.JPEG, UploadTypeEnum.PNG].includes(type)) {
      return PictureImage;
    }
    if (UploadTypeEnum.PDF === type) {
      return PDFImage;
    }
    if (UploadTypeEnum.MP4 === type) {
      return VideoImage;
    }
    return '';
  };

  interface IContainerOperationEsop {
    file: string;
    id: string;
    name: string;
    pageNumber: number;
    type: string;
    url: string;
  }

  const props = defineProps<{
    popupProps: any;
    context: {
      esops: IContainerOperationEsop[];
      esopId: string;
    };
    onOk?: Function;
  }>();

  const show = ref<boolean>(true);
  const checked = ref<string>(props.context.esopId);
  const searchKey = ref<string>('');
  const _searchVal = ref<string>('');
  const handleSearch = () => {
    searchKey.value = _searchVal.value;
  };

  const esops = computed(() => {
    const key = _searchVal.value.trim();
    if (!key) {
      return props.context.esops;
    }

    return props.context.esops.filter((item) =>
      item.name.toLowerCase().includes(key.toLowerCase()),
    );
  });

  const handleOk = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(checked.value);
    }
    show.value = false;
  };
</script>

<style scoped lang="less">
  :deep(.van-cell-group) {
    background: transparent;
  }
  :deep(.van-cell-group--inset) {
    margin: 0;
  }
  :deep(.van-cell__title) {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item {
    &.van-cell {
      padding: 12px 16px;
      border-radius: 8px;
    }
  }

  .type-icon {
    display: inline-block;
  }

  .name {
    display: inline-block;
    font-weight: 400;
    font-size: 16px;
    color: #1a1d23;
    word-break: break-all;
  }

  .page {
    font-weight: 400;
    font-size: 14px;
    color: #8b8b8b;
  }

  .selected {
    background: #0099ff14;
    border: 1px solid #0099ff4d;
    .name {
      font-weight: 600;
    }
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;
    padding: 0 16px 16px 16px;
    background: #fff;
    box-shadow: -4px 0px 24px 0px rgba(0, 0, 0, 0.16);
  }
</style>

<style lang="less">
  .esop-selector-popup {
    .popup__header {
      box-shadow: none;
    }
  }
</style>
