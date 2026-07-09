<template>
  <div class="file-list">
    <div class="file-list__header">
      <div
        v-for="tab of switchIcons"
        :key="tab.key"
        class="switch-item"
        :class="[showType === tab.name && 'selected']"
        @click.stop="() => onChangeTypeTab(tab)"
      >
        <i class="iconfont" :class="tab.icon"></i>
      </div>
    </div>
    <div :class="['file-list__list', showType === 'Card' ? 'flex-card' : 'flex-list']">
      <div
        v-for="(file, index) of filesList"
        :key="index"
        :class="[
          'file-list__item',
          isDesign ? 'is-design' : '',
          { 'material-table-field': materialType === MaterialEnum.MaterialTableField },
        ]"
      >
        <SvgIcon
          :class="['file-list__item-svg', !hasSize ? 'no-size' : '']"
          :size="showType === 'Card' ? 32 : 24"
          :name="fileTypeParser(file)"
        />

        <div class="file-list__item-name">
          <span v-if="isDesign" @click.stop="downFile(file)">{{ file.name }}</span>
          <a-tooltip v-else>
            <template #title>{{ file.name }}</template>
            <span @click.stop="downFile(file)">{{ file.name }}</span>
          </a-tooltip>
        </div>

        <span class="file-list__item-size" :class="[isDesign ? 'is-design' : '']">{{
          hasSize ? fileSizeParser(file.size) : ''
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="fileList">
  import { ref, computed, watch } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { downloadByUrl } from '/@/utils/file/download';
  import { MaterialEnum } from '/@/enums/appEnum';

  interface IProps {
    fileList: any[];
    isDesign: boolean;
    materialType: MaterialEnum;
    hasSize: boolean;
    nameClick?: Function;
  }
  const showType = ref('List');
  const props = defineProps<IProps>();
  const filesList = ref<any[]>([]);

  const switchIcons = [
    {
      icon: 'icon-liebiaozhanshi',
      name: 'List',
      key: 'switch_icon_list',
    },
    {
      icon: 'icon-kapianzhanshi',
      name: 'Card',
      key: 'switch_icon_card',
    },
  ];
  const getFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };
  watch(
    () => props.fileList,
    async (val) => {
      filesList.value = val.map((item) => {
        return typeof item === 'string' ? { name: getFileName(item), path: item } : item;
      });
    },
    { immediate: true },
  );

  const fileTypeParser = computed(() => {
    return (item) => {
      if (item?.type === 'external') {
        return 'link';
      }
      return typeParser(item?.name ?? item);
    };
  });

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const onChangeTypeTab = (data) => {
    showType.value = data.name;
  };

  async function downFile(item) {
    downloadByUrl({ url: item.path });
  }

  const sizeParser = (size) => {
    if (size / 1024 < 1) return (size / 1024).toFixed(2) + 'K';
    if (size / 1024 / 10 < 1) return (size / 1024).toFixed(1) + 'K';
    if (size / 1024 / 1024 < 1) return (size / 1024).toFixed(0) + 'K';
    if (size / 1024 / 1024 / 10 < 1) return (size / 1024 / 1024).toFixed(2) + 'M';
    return (size / 1024 / 1024).toFixed(2) + 'M';
  };

  const typeParser = (fileName) => {
    const arr = fileName?.split('.') ?? [];
    let type = arr[arr.length - 1] || 'png';
    type = type.toLowerCase();
    if (
      [
        UploadTypeEnum.PNG,
        UploadTypeEnum.JPG,
        UploadTypeEnum.JPEG,
        UploadTypeEnum.BMP,
        UploadTypeEnum.GIF,
      ].includes(type)
    )
      return 'img';
    if ([UploadTypeEnum.DOCX, UploadTypeEnum.DOC].includes(type)) return UploadTypeEnum.DOC;
    if ([UploadTypeEnum.MP4, UploadTypeEnum.AVI].includes(type)) return 'MP4';
    if (type === UploadTypeEnum.PDF) return 'PDF';
    if (Object.values(UploadTypeEnum).includes(type)) return type;
    return 'attachment';
  };
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
</script>

<style lang="less" scoped>
  .file-list {
    &__header {
      width: 64px;
      height: 32px;
      padding: 4px;
      border-radius: 4px;
      background: #f3f5f9;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .switch-item {
        position: relative;
        display: flex;
        align-items: center;
        width: 24px;
        height: 24px;
        color: #c9cede;
        border-radius: 2px;
        cursor: pointer;
        .iconfont {
          width: 24px;
          height: 24px;
          font-size: 16px;
          display: flex;
          justify-content: center;
        }
        &.selected {
          background-color: #fff;
          color: #384356;
        }
      }
    }
    &__list {
      margin-top: 12px;
      display: flex;

      &.hide-switch {
        margin-top: 0;
      }
      &::-webkit-scrollbar {
        display: block;
        width: 4px;
      }
      &.flex-card {
        flex-direction: row;
        flex-wrap: wrap;
        max-height: 372px;
        overflow-y: auto;
        .file-list__item {
          flex-direction: column;
          text-align: center;
          width: 115px;
          background: #fff;
          margin-right: 10px;
          padding: 16px 10px;
          border: 1px solid #e8ebf0;
          border-radius: 4px 4px 4px 4px;
          &.material-table-field:nth-child(3n + 3) {
            margin-right: 0;
          }
          &-svg {
            margin: 0 auto;
            &.no-size {
              margin-top: 6px;
            }
          }
          &-name {
            width: 100%;
            height: 22px;
            line-height: 22px;
            margin: 8px auto 0;
          }
          &-size {
            line-height: 18px;
            margin-top: 2px;
            font-size: 12px;
            color: #c3c3c3;
          }
          &:hover {
            box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.08);
            border-color: #fff;
            .file-list__item-size {
              // color: var(--ant-primary-color);
              &.is-design {
                color: #c3c3c3;
              }
            }
          }
        }
      }
      &.flex-list {
        flex-direction: column;
        max-height: 320px;
        overflow-y: auto;
        .file-list__item {
          line-height: 24px;
          &-name {
            height: 24px;
            width: calc(100% - 26px);
            margin-left: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          &-size {
            margin-left: 16px;
            margin-right: 3px;
          }
        }
      }
    }
    &__item {
      display: flex;
      margin-top: 2px;
      margin-bottom: 6px;
      &-name {
        span {
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &-size {
        color: #c3c3c3;
        // color: #797a7d;
      }
      &:hover {
        cursor: pointer;
        color: var(--ant-primary-color);
      }
      &.is-design {
        cursor: default;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
</style>
