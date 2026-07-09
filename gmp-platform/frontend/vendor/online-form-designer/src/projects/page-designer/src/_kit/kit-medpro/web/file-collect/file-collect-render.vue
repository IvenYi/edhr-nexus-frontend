<template>
  <div class="file-collect-wrapper">
    <div v-show="!source">
      <div class="file-list__header p-4px mb-8px">
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
      <div v-show="showType === 'Card'" class="file-list__list flex-card">
        <div
          v-for="(file, index) of cardListData"
          :key="index"
          :class="['file-list__item']"
          @click.stop="handleItemClick(file)"
        >
          <SvgIcon class="file-list__item-svg" :size="32" :name="fileTypeParser(file)" />
          <div class="file-list__item-name">
            <a-tooltip>
              <template #title>{{ file.name }}</template>
              <span>{{ file.name }}</span>
            </a-tooltip>
          </div>
        </div>
      </div>
      <a-table
        v-show="showType === 'List'"
        row-key="id"
        :columns="columns"
        :data-source="showTableData"
        size="middle"
        :pagination="false"
        ref="tableContainerRef"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'documentSetEntries'">
            <template v-for="(item, ind) in record.documentSetEntries" :key="ind">
              <a-tooltip>
                <template #title>{{ item.name }}</template>
                <SvgIcon
                  :class="ind >= 3 ? 'icon-hide' : ''"
                  :size="item.type === 'external' ? 19 : 20"
                  :title="item.name"
                  :name="fileTypeParser(item)"
                  @click.stop="handleItemClick(item)"
                />
              </a-tooltip>
            </template>
            <!-- <div class="masking" v-show="poppverVisible" @click.stop></div> -->
            <a-popover
              trigger="click"
              :overlayStyle="{ width: record.documentSetEntries.length > 6 ? '405px' : '402px' }"
              :overlayClassName="record.className"
              :getPopupContainer="PopupContainer"
              @visibleChange="handleVisibleChange($event, record)"
            >
              <template #content>
                <FieldUpload
                  :modelValue="record.documentSetEntries"
                  :isDesign="false"
                  :isTable="true"
                  :readonly="true"
                  :disabled="false"
                  :materialType="MaterialEnum.MaterialTableField"
                  :nameClick="handleItemClick"
                />
              </template>
              <span class="more" v-if="record.documentSetEntries.length > 3">{{
                t('sys.pageDesigner.more')
              }}</span>
            </a-popover>
          </template>
        </template>
      </a-table>
    </div>
    <div class="loading-box" v-show="source" v-loading="loading"></div>
    <div v-show="source" class="gct-file-collect-view">
      <div class="gct-vue-pdf__header" v-if="fileType !== fileTypeEnum.PDF">
        <div style="cursor: pointer" @click="closePdf">
          <CloseOutlined />
        </div>
      </div>
      <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
      <VuePdf
        ref="VuePDFRef"
        v-if="fileType === fileTypeEnum.PDF"
        pdfkey="view"
        :source="source"
        isClose
        @close="closePdf"
      />
      <VideoPlayer
        v-if="fileType === fileTypeEnum.VIDEO"
        :src="source"
        :loop="false"
        :volume="0.6"
        style="width: 100%"
      />
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
  import { computed, toRefs, ref, watch, toRef, unref, nextTick } from 'vue';
  import type { IFileCollect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { columns, fileTypeEnum, getFileType, switchIcons } from './type';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { uuid2 } from '/@/utils/uuid';
  import { VuePdf } from '/@/components/VuePdf';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';

  const { t } = useI18n();
  const Event = getPageEvent();
  const tableContainerRef = ref();
  const props = withDefaults(
    defineProps<{
      widget: IFileCollect;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {},
  );
  const PopupContainer = getParentPopupContainer(props);

  const { deviceRefForm, batchRefForm, refFormField, refSearchField, modelKey, openNew } = toRefs(
    props.widget?.props,
  );

  const showType = ref<'Card' | 'List'>('List');
  const source = ref();
  const fileType = ref();
  const fileName = ref();
  const tableData = ref<any[]>([]);
  const getContainer = ref(() => document.body);
  const frameRef = ref();
  const loading = ref<boolean>(false);
  const VuePDFRef = ref();

  const refFormData = toRef(() => {
    const data: any = {};
    if (!props.widget.props.noNeedAutoQuery) {
      if (deviceRefForm?.value) {
        refFormField.value?.forEach((i) => {
          data[i] = formMap.value[deviceRefForm.value]?.[i];
        });
      }
      refSearchField.value.forEach((i) => {
        data[i] = formMap.value[batchRefForm.value]?.[i];
      });
    }
    return data;
  });

  const pageCount = toRef(() => {
    return VuePDFRef.value?.pageCount || 1;
  });

  watch(
    () => refFormData.value,
    async () => {
      if (props.widget.props.noNeedAutoQuery) return;
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      if (needQueryFlag) {
        tableData.value = (await getTableData()) || [];
      } else {
        tableData.value = [];
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => pageCount.value,
    () => {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    },
    {
      deep: true,
    },
  );

  async function getTableData(queryParam = {}) {
    const param = Object.assign(
      {
        ...refFormData.value,
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

  const showTableData = computed(() => {
    return tableData.value.map((i) => ({
      ...i,
      className: 'file-collect-pop-con' + uuid2(16, 16),
    }));
  });

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
        : `${minio}/${url}`;
    if (fileType.value === fileTypeEnum.PDF) {
      return {
        url: path,
        cMapUrl:'/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  const handleVisibleChange = (val, record) => {
    if (val) {
      getContainer.value = () =>
        document.body.querySelector(`.${record.className}`) || document.body;
    } else {
      getContainer.value = () => document.body;
    }
  };

  const handleItemClick = async (val) => {
    const { name, file, type, url } = val;
    console.log(val);
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceVal = type === 'external' ? url : (file ?? url);
    source.value = getSource(sourceVal);
    if (fileType.value === fileTypeEnum.PDF) {
      loading.value = true;
    }
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
    // iframeLoading.value = false;
    calcHeight();
  }

  const onChangeTypeTab = (data) => {
    showType.value = data.name;
  };

  defineExpose({
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
</style>
