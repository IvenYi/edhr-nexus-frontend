<template>
  <div class="sop-kit-wrapper">
    <template v-if="source">
      <div
        class="gct-vue-pdf__header"
        v-if="fileType !== fileTypeEnum.PDF && showTableData.length > 1"
      >
        <div style="cursor: pointer; padding: 0 16px" @click="closePdf">
          <van-icon name="cross" />
        </div>
      </div>
      <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
      <VuePdfMobile
        ref="VuePdfRef"
        v-if="fileType === fileTypeEnum.PDF"
        :source="source"
        :isClose="showTableData.length > 1"
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
    </template>
    <SopDocument
      v-else
      :isDesign="false"
      :fileList="showTableData"
      :showType="showType"
      :nameClick="handleItemClick"
    />
  </div>
</template>

<script setup lang="ts" name="gct-sop-kit">
  import { computed, toRefs, ref, watch, toRef, nextTick, onUnmounted, unref } from 'vue';
  import type { ISopKit } from './schema';
  import { fileTypeEnum, getFileType } from './type';
  import SopDocument from './components/sop-document.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { VuePdfMobile } from '@mobile/components/vue-pdf/vue-pdf-mobile';
  import VideoRender from '../../component/pad/video-render.vue';
  import { serverAddress } from '@mobile/stores/sessionHooks';

  interface sopFileType {
    name: string;
    file: string;
    type: string;
    url: string;
    pageNumber?: number;
  }

  const Event = getPageEvent();
  const props = defineProps<{ widget: ISopKit }>();
  const { modelKey, openNew } = toRefs(props.widget?.props);
  const showType = ref<'Card' | 'List'>('List');
  const source = ref();
  const fileType = ref();
  const fileName = ref();
  const VuePdfRef = ref();
  const frameRef = ref();
  // const iframeLoading = ref<boolean>(false);

  const tableData = ref<any[]>([]);
  const dict = ref<object>({});

  const handleSingleData = async (data: sopFileType) => {
    const { name, file, type, url, pageNumber } = data;
    fileName.value = name;
    fileType.value = type === 'external' ? fileTypeEnum.IFRAME : getFileType(file);
    const sourceVal = type === 'external' ? url : file ?? url;
    source.value = getSource(sourceVal);
    if (pageNumber) {
      await nextTick();
      VuePdfRef.value?.jumpToPage(pageNumber);
    }
  };

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
          key: modelKey.value,
          action: 'biz_get_sop',
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
      : `${serverAddress.value || import.meta.env.VITE_GLOBAL_HOST}/${minio}/${url}`;
    if (!openNew?.value && fileType.value === fileTypeEnum.PDF) {
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
    if (pageNumber) {
      VuePdfRef.value?.jumpToPage(pageNumber);
    }
  };

  function calcHeight() {
    const iframe = unref(frameRef);
    if (!iframe) return;
    iframe.style.height = `800px`;
  }

  function hideLoading() {
    calcHeight();
  }

  const closePdf = () => {
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  };

  function reset() {
    tableData.value = [];
    dict.value = [];
    fileName.value = undefined;
    source.value = undefined;
    fileType.value = undefined;
  }
  defineExpose({
    async reload(queryParam) {
      const sopData = (await getTableData(queryParam)) || { data: [], dict: {} };
      if (!sopData?.data?.length) {
        reset();
        return;
      }
      tableData.value = sopData.data;
      dict.value = sopData.dict;
      if (tableData.value?.length == 1) {
        const data: sopFileType = {
          ...tableData.value[0].sopDocument,
          pageNumber: tableData.value[0].page_number_,
        };
        handleSingleData(data);
      }
    },
    getValue() {
      return tableData.value;
    },
    reset,
  });
</script>

<style scoped lang="less">
  .sop-kit-wrapper {
    :deep(.video-js) {
      width: 100%;
    }
    .iframe__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
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
  }
</style>
