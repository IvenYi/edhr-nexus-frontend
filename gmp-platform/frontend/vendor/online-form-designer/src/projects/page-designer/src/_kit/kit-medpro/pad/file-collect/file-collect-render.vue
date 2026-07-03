<template>
  <div class="file-collect-wrapper">
    <div v-show="!source">
      <div class="file-list__list flex-card">
        <div
          v-for="(file, index) of cardListData"
          :key="index"
          :class="['file-list__item']"
          @click.stop="handleItemClick(file)"
        >
          <IconNext
            class="file-list__item-svg"
            :size="32"
            :value="'icon-preset:' + fileTypeParser(file)"
          />
          <div class="file-list__item-name">
            <span>{{ file.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-show="source" class="gct-file-collect-view">
      <div
        class="gct-vue-pdf__header"
        v-if="fileType !== fileTypeEnum.PDF && cardListData.length > 1"
      >
        <div style="cursor: pointer; padding: 0 16px" @click="closePdf">
          <van-icon name="cross" />
        </div>
      </div>
      <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
      <VuePdfMobile
        ref="VuePDFRef"
        v-if="fileType === fileTypeEnum.PDF"
        :source="source"
        isClose
        @close="closePdf"
      />

      <VideoRender class="w-full" v-else-if="fileType === fileTypeEnum.VIDEO" :src="source" />
      <iframe
        v-if="fileType === fileTypeEnum.IFRAME"
        :src="source"
        class="iframe__main"
        ref="frameRef"
        @load="hideLoading"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-file-collect">
  import { computed, toRefs, ref, unref, nextTick } from 'vue';
  import type { IFileCollect } from './schema';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { fileTypeEnum, getFileType } from './type';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { VuePdfMobile } from '@mobile/components/vue-pdf/vue-pdf-mobile';
  import VideoRender from '../../component/pad/video-render.vue';
  import { serverAddress } from '@mobile/stores/sessionHooks';
  import { IFileCollectComponentExpose } from '/@/projects/page-designer/src/interface/_kit/pad';

  const Event = getPageEvent();
  const props = withDefaults(
    defineProps<{
      widget: IFileCollect;
    }>(),
    {},
  );

  const { modelKey, openNew } = toRefs(props.widget?.props);

  const source = ref();
  const fileType = ref();
  const fileName = ref();
  const frameRef = ref();
  const tableData = ref<any[]>([]);

  async function getTableData(queryParam = {}) {
    const param = Object.assign(
      {
        // ...refFormData.value,
      },
      queryParam,
    );
    try {
      let data = (await Event.context.$customBizService.post(
        {
          key: modelKey?.value,
          action: 'biz_get_document_set',
        },
        {
          ...param,
        },
      )) as any;
      return data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  const cardListData = computed(() => {
    const list = [];
    tableData.value.forEach((i) => {
      i.documentSetEntries.forEach((docItem) => {
        list.push({
          name: docItem.name,
          type: docItem.type,
          file: docItem.type == 'internal' ? docItem.file : docItem.url,
        });
      });
    });
    return list;
  });

  const fileTypeParser = computed(() => {
    return (item) => {
      if (item.type === 'external') {
        return 'link';
      }
      return typeParser(item.file);
    };
  });

  const getSource = (url) => {
    const minio = import.meta.env.VITE_MINIO_PATH;
    const path = /^https?:\/\//.test(url)
      ? url
      : /^\/w/.test(url!)
      ? `${minio}${url}`
      : `${serverAddress.value || import.meta.env.VITE_GLOBAL_HOST}/${minio}/${url}`;
    if (fileType.value === fileTypeEnum.PDF) {
      return {
        url: path,
        _url: url,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  const handleItemClick = async (val) => {
    const { name, file, type, url } = val;
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceVal = type === 'external' ? url : file ?? url;
    source.value = getSource(sourceVal);
    await nextTick();
    if (openNew?.value) {
      window.open(source.value);
    }
  };

  const closePdf = () => {
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  };

  function calcHeight() {
    const iframe = unref(frameRef);
    if (!iframe) return;
    iframe.style.height = `800px`;
  }

  function hideLoading() {
    calcHeight();
  }

  defineExpose<IFileCollectComponentExpose>({
    async reload(queryParam) {
      tableData.value = await getTableData(queryParam);
    },
    getValue() {
      return tableData.value;
    },
    reset() {
      tableData.value = [];
      fileName.value = undefined;
      source.value = undefined;
      fileType.value = undefined;
    },
  });
</script>

<style scoped lang="less">
  .file-collect-wrapper {
    .file-list {
      &__header {
        width: 64px;
        height: 32px;
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
        display: flex;
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
            margin: 3px 9px 3px 0;
            padding: 16px 10px;
            border: 1px solid #e8ebf0;
            border-radius: 4px;
            background: #fff;
            &.material-table-field:nth-child(3n + 3) {
              margin-right: 0;
            }
            &-svg {
              margin: 8px auto 0;
            }
            &-name {
              cursor: pointer;
              width: 100%;
              height: 22px;
              line-height: 22px;
              margin: 8px auto 4px;
            }
            &-size {
              line-height: 18px;
              font-size: 12px;
              color: #c3c3c3;
            }
            &:hover {
              box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
              border-color: #fff;
              .file-list__item-size {
                &.is-design {
                  color: #c3c3c3;
                }
              }
            }
          }
        }
      }
      &__item {
        display: flex;
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
    :deep(.ant-table.ant-table-middle) {
      .ant-table-tbody > tr > td,
      .ant-table-thead > tr > th {
        padding: 10px;
      }
      .ant-table-thead > tr > th {
        &::before {
          width: 1px;
          background: var(--vxe-table-resizable-line-color);
        }
      }
      .svg-icon {
        cursor: pointer;
      }
      .icon-hide {
        display: none;
      }
      .more {
        padding: 0 4px;
        cursor: pointer;
        color: var(--ant-primary-color);
        &:hover {
          opacity: 0.8;
        }
      }
      .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td,
      .ant-table-row-hover,
      .ant-table-row-hover > td {
        background: var(--vxe-table-row-hover-background-color) !important;
      }
    }
    [class|='file-collect-pop-con'] {
      .ant-popover-inner-content {
        padding: 16px;
      }
    }
    .masking {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 1000;
    }
    .iframe__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
    }
  }
  .loading-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
  .gct-vue-pdf__header {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 36px;
    background-color: #f7f8fa;
    font-size: 14px;
  }
</style>
