<template>
  <div class="esop-preview-wrapper">
    <div class="esop-preview-container" v-if="sopList && sopList.length">
      <div :class="['esop-preview-left', isCollapse && 'is-collapse']">
        <div class="esop-preview-left--open" v-if="!props.hiddenBlank" @click="openNewTab">
          <icon-next :size="16" :value="'icon-park:add-web'" />
          <span>{{ t('sys.tooltip.openInNewTab') }}</span>
        </div>
        <Scrollbar class="card-list">
          <div
            v-for="(item, index) of sopList"
            :key="index"
            class="card-list-item"
            :class="{ 'is-selected': item.sopDocument.id === selectInfo.id }"
            @click.stop="handleClick(item)"
          >
            <icon-next
              class="card-list-item-svg"
              :size="32"
              :value="docTypeIconParser(item).icon"
              :color="docTypeIconParser(item).color"
            />
            <div class="card-list-item-name">
              <a-tooltip>
                <template #title>{{ item.sopDocument.name }}</template>
                <span>{{ item.sopDocument.name }}</span>
              </a-tooltip>
            </div>
          </div>
        </Scrollbar>
        <CollapseIcon v-model:isCollapse="isCollapse" />
      </div>
      <div class="esop-preview-right">
        <div v-if="selectInfo.fileType" class="esop-preview-content">
          <TouchImg
            v-if="selectInfo.fileType === fileTypeEnum.PICTURE"
            :src="imageSource"
            class="w-full"
          />
          <PDFViewer
            :key="selectInfo.id"
            v-if="selectInfo.fileType === fileTypeEnum.PDF"
            ref="PDFViewerRef"
            :source="selectInfo.sourceUrl"
            :showToolbar="true"
            :scale="1.0"
            @loaded="onPdfLoaded"
          />
          <VideoPlayer
            :key="selectInfo.id"
            v-if="selectInfo.fileType === fileTypeEnum.VIDEO"
            :src="selectInfo.sourceUrl"
            :loop="false"
            :volume="0.6"
          />
          <div
            class="loading-box"
            v-show="selectInfo.sourceUrl"
            v-loading="selectInfo.loading"
          ></div>
        </div>
        <div class="esop-preview-empty-area" v-else>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </div>
    </div>
    <div class="esop-preview-empty-area" v-else>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script lang="ts" setup name="esop-preview">
  import { computed, toRefs, ref, watch, toRef, nextTick, onUnmounted, onBeforeMount } from 'vue';
  import { fileTypeEnum, getFileType, ISopDocument, ISelectedDocument } from './type';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { IconNamespaceEnum } from '/@/components/Icon/types';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';
  import PDFViewer from '/@/projects/web-render/src/views/edhr-application/components/pdf-viewer/pdf-viewer.vue';
  import { debounce } from 'lodash-es';
  import CollapseIcon from './collapse-icon.vue';
  import TouchImg from './touch-img.vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      sopList?: { sopDocument: ISopDocument }[];
      /** 默认选中的文件,没有选中第一个 */
      defaultSelectedFile?: any;
      /** 隐藏新标签页打开 */
      hiddenBlank?: boolean;
    }>(),
    {},
  );

  const isCollapse = ref(false);

  const PDFViewerRef = ref();
  /** 当前选中的文件信息 */
  const selectInfo = ref<ISelectedDocument>({} as ISelectedDocument);

  /** 单张图片的地址 */
  const imageSource = computed<string>(() => {
    if (selectInfo.value.fileType === fileTypeEnum.PICTURE) {
      return typeof selectInfo.value.sourceUrl === 'string' ? selectInfo.value.sourceUrl : '';
    }
    return '';
  });

  const getSource = (url, fileType) => {
    const minio = import.meta.env.VITE_MINIO_PATH;
    const path = /^https?:\/\//.test(url)
      ? url
      : /^\/w/.test(url!)
        ? `${minio}${url}`
        : `${minio}/${url}`;
    if (fileType === fileTypeEnum.PDF) {
      return {
        url: path,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  async function handleClick(item) {
    const { id, file, type, url, pageNumber } = item.sopDocument || {};
    const fileType = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    selectInfo.value = {
      id,
      fileType,
      sourceUrl: getSource(file ?? url, fileType),
      loading: !!(fileType === fileTypeEnum.PDF),
    };
    await nextTick();
    if (pageNumber) {
      PDFViewerRef.value?.jumpToPage(pageNumber);
    }
  }

  function docTypeIconParser(item) {
    if (item.sopDocument.type === 'external') {
      return {
        icon: IconNamespaceEnum.Preset + ':link',
        color: '#FFFFFF',
      };
    }
    const fileType = getFileType(item.sopDocument.file);
    switch (fileType) {
      case fileTypeEnum.PDF:
        return {
          icon: IconNamespaceEnum.Preset + ':edhr-pdf',
          color: '#FBAEB1',
        };
      case fileTypeEnum.PICTURE:
        return {
          icon: IconNamespaceEnum.Preset + ':edhr-img',
          color: '#87CCFF',
        };
      case fileTypeEnum.VIDEO:
        return {
          icon: IconNamespaceEnum.Preset + ':edhr-mp4',
          color: '#FFC87A',
        };
      default:
        return {
          icon: IconNamespaceEnum.Preset + ':link',
          color: '#FFFFFF',
        };
    }
  }

  function onPdfLoaded() {
    selectInfo.value.loading = false;
  }

  function openNewTab() {
    const params = {
      target: selectInfo.value,
      documentList: props.sopList,
      blank: true,
    };
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      queryParams.append(key, JSON.stringify(params[key]));
    });

    window.open(
      `${location.origin}${location.pathname}#/standalone/edhr-sop-view?${queryParams.toString()}`,
      '_blank',
      'noreferrer',
    );
  }
  async function resizeHandler() {
    await nextTick();
    if (selectInfo.value.fileType !== fileTypeEnum.PDF) return;

    PDFViewerRef.value?.reload();
  }

  onBeforeMount(() => {
    props.defaultSelectedFile && (selectInfo.value = props.defaultSelectedFile);
    window.addEventListener('resize', debounce(resizeHandler, 200));
  });

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });

  watch(
    () => props.sopList,
    (newTreeData) => {
      if (newTreeData && newTreeData.length !== 0 && !props.defaultSelectedFile) {
        if (!selectInfo.value.sourceUrl) {
          handleClick(newTreeData?.[0]);
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  defineExpose({
    reset: () => {
      selectInfo.value = {} as ISelectedDocument;
    },
  });
</script>

<style scoped lang="less">
  .esop-preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .esop-preview-container {
      width: 100%;
      height: 100%;
      display: flex;

      .esop-preview-left {
        width: 130px;
        height: 100%;
        border-right: 1px solid #e8ecf0;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        overflow: visible;

        :deep(.collapse-icon) {
          position: absolute;
          top: 12px;
          right: -12px;
          z-index: 2;
        }

        &.is-collapse {
          width: 32px;
          .esop-preview-left--open,
          .card-list {
            display: none;
          }
        }

        &--open {
          cursor: pointer;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 14px;

          .icon-next {
            color: rgba(0, 0, 0, 0.8);
            margin-right: 4px;
          }
          &:hover {
            color: var(--ant-primary-color);
            .icon-next {
              color: var(--ant-primary-color);
            }
          }
        }

        .card-list {
          padding-left: 14px;
          padding-right: 14px;
          padding-top: 14px;

          &-item {
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 12px;
            margin-bottom: 12px;
            border: 1px solid #e8ebf0;
            border-radius: 4px;
            background: #fff;

            &-svg {
              margin: 8px auto 0;
            }

            &-name {
              cursor: pointer;
              width: 100%;
              height: 22px;
              line-height: 22px;
              margin: 8px auto 4px;

              span {
                display: inline-block;
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                -webkit-line-clamp: 2; /* 这里是超出几行省略 */
              }
            }

            &.is-selected {
              background-color: rgb(2 106 200 / 10%);
              border: 1px solid var(--ant-primary-color);
            }

            &:hover {
              border: 1px solid var(--ant-primary-color);
              cursor: pointer;
            }
          }
        }
      }

      .esop-preview-right {
        position: relative;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .esop-preview-content {
          height: 100%;
          overflow: auto;
          padding: 14px;
          padding-top: 0;
          background-color: #ffffff;
        }
      }
    }

    .esop-preview-empty-area {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      height: 100%;
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
</style>
