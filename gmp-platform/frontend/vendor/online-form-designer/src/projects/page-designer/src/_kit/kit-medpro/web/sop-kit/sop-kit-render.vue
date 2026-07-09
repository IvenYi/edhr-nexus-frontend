<template>
  <div class="sop-kit-wrapper">
    <template v-if="source">
      <div
        class="gct-vue-pdf__header"
        v-if="fileType !== fileTypeEnum.PDF && showTableData.length > 1"
      >
        <div style="cursor: pointer" @click="closePdf">
          <CloseOutlined />
        </div>
      </div>
      <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
      <div class="loading-box" v-show="source" v-loading="loading"></div>
      <VuePdf
        ref="VuePDFRef"
        v-if="fileType === fileTypeEnum.PDF"
        pdfkey="view"
        :source="source"
        :isClose="showTableData.length > 1"
        @close="closePdf"
      />
      <VideoPlayer
        v-if="fileType === fileTypeEnum.VIDEO"
        :src="source"
        :loop="false"
        :volume="0.6"
      />
      <iframe
        v-if="fileType === fileTypeEnum.IFRAME"
        :src="source"
        class="iframe__main"
        ref="frameRef"
        @load="hideLoading"
      ></iframe>
    </template>
    <SopDocument
      v-else
      :isDesign="false"
      :fileList="showTableData"
      :showType="showType"
      :nameClick="handleItemClick"
      @update:showType="updateType"
    />
  </div>
</template>

<script setup lang="ts" name="gct-sop-kit">
  import { computed, toRefs, ref, watch, toRef, nextTick, onUnmounted, unref } from 'vue';
  import { watchDebounced } from '@vueuse/core';
  import type { ISopKit } from './schema';
  import { fileTypeEnum, getFileType } from '../file-collect/type';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import SopDocument from './components/sop-document.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { VuePdf } from '/@/components/VuePdf';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';
  import { debounce } from 'lodash-es';

  interface sopFileType {
    name: string;
    file: string;
    type: string;
    url: string;
    pageNumber?: number;
  }

  const Event = getPageEvent();
  const props = defineProps<{ widget: ISopKit }>();
  const {
    deviceRefForm,
    batchRefForm,
    refFormField,
    refSearchField,
    modelKey,
    openNew,
    collation,
  } = toRefs(props.widget?.props);
  const showType = ref<'Card' | 'List'>('List');
  const source = ref();
  const fileType = ref();
  const fileName = ref();
  const VuePDFRef = ref();
  const frameRef = ref();
  const hasResetted = ref(false);
  const loading = ref<boolean>(false);

  // const iframeLoading = ref<boolean>(false);
  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });
  const refFormData = toRef(() => {
    const data: any = {};
    if (deviceRefForm?.value) {
      refFormField.value?.forEach((i) => {
        data[i] = formMap.value[deviceRefForm?.value]?.[i];
      });
      data['workflow_step_id_'] = formMap.value[deviceRefForm?.value]?.workflow_step_id_;
    }
    refSearchField.value.forEach((i) => {
      data[i] = formMap.value[batchRefForm?.value]?.[i];
    });
    return data;
  });

  // 批次ID
  const containerId = toRef(() => {
    return formMap.value[batchRefForm?.value]?.id_;
  });

  const updateType = (value) => {
    showType.value = value;
  };

  const tableData = ref<any[]>([]);
  const dict = ref<object>({});

  const pageCount = toRef(() => {
    return VuePDFRef.value?.pageCount || 1;
  });

  watch(
    () => pageCount.value,
    () => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    },
    {
      deep: true,
    },
  );

  watch(
    () => containerId.value,
    () => {
      if (
        deviceRefForm?.value &&
        formMap.value[deviceRefForm.value]?.hasOwnProperty('workflow_step_id_')
      ) {
        formMap.value[deviceRefForm.value].workflow_step_id_ = undefined;
      }
    },
    {
      immediate: true,
    },
  );

  watchDebounced(
    () => refFormData.value,
    async () => {
      console.log(refFormData.value, 'refFormData');
      if (props.widget.props.noNeedAutoQuery) return;
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm?.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      // 如果关联设备表单工艺步骤或批次为空 则不用查询
      if (!refFormData.value?.workflow_step_id_ || !containerId?.value) {
        needQueryFlag = false;
      }

      if (needQueryFlag) {
        hasResetted.value = false;
        fileType.value = '';
        const sopData = (await getTableData()) || { data: [], dict: {} };
        tableData.value = sopData.data.filter((d) => {
          return d.sopDocument.file || d.sopDocument.url;
        });
        dict.value = sopData.dict;
        if (tableData.value?.length == 1) {
          const data: sopFileType = {
            ...tableData.value[0].sopDocument,
            pageNumber: tableData.value[0].page_number_,
          };
          handleSingleData(data);
        }
      } else {
        reset();
      }
    },
    {
      deep: true,
      debounce: 200,
    },
  );

  const handleSingleData = async (data: sopFileType) => {
    const { name, file, type, url, pageNumber } = data;
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceVal = type === 'external' ? url : file ?? url;
    source.value = getSource(sourceVal);
    if (fileType.value === fileTypeEnum.PDF) {
      loading.value = true;
    }
    if (pageNumber) {
      await nextTick();
      VuePDFRef.value?.jumpToPage(pageNumber);
    }
  };

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
          key: modelKey.value,
          action: 'biz_get_sop',
        },
        {
          query: { ...param },
          sorts: [...querySort],
        },
      )) as any;
      if (hasResetted.value) {
        throw new Error('已执行重置操作，不需要设置为接口数据!!!');
      }
      return data;
    } catch (error) {
      console.error(error);
      hasResetted.value = false;
      return null;
    }
  }

  const showTableData = computed(() => {
    return tableData.value?.map((i) => ({
      ...i,
      product: i?.product_id_ ? dict.value['product_id_'][i?.product_id_] : '',
      device: i?.device_id_ ? dict.value['device_id_'][i?.device_id_] : '',
      spec: i?.spec_id_ ? dict.value['spec_id_'][i?.spec_id_] : '',
    }));
  });

  const getSource = (url) => {
    const minio = import.meta.env.VITE_MINIO_PATH;
    const path = /^https?:\/\//.test(url)
      ? url
      : /^\/w/.test(url!)
      ? `${minio}${url}`
      : `${minio}/${url}`;
    if (!openNew?.value && fileType.value === fileTypeEnum.PDF) {
      return {
        url: path,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  const handleItemClick = async (val) => {
    const { name, file, type, url, pageNumber } = val;
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceUrl = getSource(file ?? url);
    await nextTick();
    if (openNew?.value) {
      window.open(sourceUrl);
      return;
    }
    source.value = sourceUrl;
    if (fileType.value === fileTypeEnum.PDF) {
      loading.value = true;
    }
    if (pageNumber) {
      VuePDFRef.value?.jumpToPage(pageNumber);
    }
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

  const closePdf = () => {
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  };

  window.addEventListener('resize', debounce(resizeHandler, 200));

  async function resizeHandler() {
    await nextTick();
    if (fileType.value !== fileTypeEnum.PDF) return;
    VuePDFRef.value?.reload();
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });
  function reset() {
    hasResetted.value = true;
    tableData.value = [];
    dict.value = [];
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  }
  defineExpose({
    async reload(queryParam) {
      const sopData = (await getTableData(queryParam)) || { data: [], dict: {} };
      tableData.value = sopData.data;
      dict.value = sopData.dict;
      if (!tableData.value?.length) {
        reset();
        return;
      }
      if (tableData.value?.length == 1) {
        const data: sopFileType = tableData.value[0].sopDocument;
        handleSingleData(data);
      }
    },
    reset,
    getValue() {
      return tableData.value;
    },
  });
</script>

<style scoped lang="less">
  .sop-kit-wrapper {
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
    .iframe__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
    }

    :deep(.video-js) {
      width: 100%;
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
