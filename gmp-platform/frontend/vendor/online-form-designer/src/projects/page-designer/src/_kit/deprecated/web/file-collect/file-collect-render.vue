<template>
  <div class="file-collect-wrapper" ref="fileCollectRef">
    <a-table
      v-show="!source"
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
    <div v-show="source">
      <div class="gct-vue-pdf__header" v-if="fileType !== fileTypeEnum.PDF">
        <div style="cursor: pointer" @click="closePdf">
          <CloseOutlined />
        </div>
      </div>
      <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
      <VuePdf
        ref="VuePdfRef"
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
        :width="clientWidth"
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
  import {
    computed,
    toRefs,
    ref,
    watch,
    toRef,
    unref,
    nextTick,
    onMounted,
    onBeforeUnmount,
  } from 'vue';
  import type { IFileCollect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { columns, fileTypeEnum, getFileType } from './type';
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

  const { refForm, refSearchForm, refFormField, refSearchField, modelKey, openNew } = toRefs(
    props.widget?.props,
  );

  const source = ref();
  const fileType = ref();
  const fileName = ref();
  const tableData = ref<any[]>([]);
  const getContainer = ref(() => document.body);
  const frameRef = ref();
  const fileCollectRef = ref<any>(null);
  const clientWidth = ref();

  let resizeObserver: ResizeObserver | null = null;

  const refFormData = toRef(() => {
    const data: any = {};
    if (!props.widget.props.noNeedAutoQuery) {
      refFormField.value.forEach((i) => {
        data[i] = refForm?.value && formMap.value[refForm.value]?.[i];
      });
      refSearchField.value.forEach((i) => {
        data[i] = refSearchForm?.value && formMap.value[refSearchForm.value]?.[i];
      });
    }
    return data;
  });

  watch(
    () => refFormData.value,
    async () => {
      if (props.widget.props.noNeedAutoQuery) return;
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[refSearchForm.value]?.[i]) {
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
          // spec_id_: 'KviJpvgjlIwizeeO',
          // product_id_: 'gRZKGx8CR2vIray1',
          // device_ids_: 'iF7i22QH9iI63GWn,lwSjILHHJcFq37JJ',
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
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceVal = type === 'external' ? url : (file ?? url);
    source.value = getSource(sourceVal);
    await nextTick();
    if (openNew?.value) {
      window.open(source.value);
    }
  };

  function reset() {
    tableData.value = [];
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  }

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

  onMounted(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        clientWidth.value = newWidth;
      }
    });

    resizeObserver.observe(fileCollectRef.value);
  });

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  defineExpose({
    reset,
    async reload(queryParam) {
      tableData.value = await getTableData(queryParam);
    },
    getValue() {
      return tableData.value;
    },
  });
</script>

<style scoped lang="less">
  .file-collect-wrapper {
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
</style>
