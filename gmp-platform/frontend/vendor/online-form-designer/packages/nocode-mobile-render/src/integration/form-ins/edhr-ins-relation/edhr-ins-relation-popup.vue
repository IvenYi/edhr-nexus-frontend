<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    title="DHR关联列表"
    :showFooter="false"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="flex flex-col h-full w-full edhr-ins-relation-popup">
      <EdhrInsRelationTree
        v-if="treeData.length"
        :treeData="treeData"
        idProp="uuid"
        @view="(e) => openEdhr(e)"
      />
      <Empty v-else class="h-full" description="暂无数据" />
    </div>
  </BasicPopup>
</template>

<script lang="ts" setup name="edhr-ins-relation-popup">
  import { i18n } from '@mobile/locales/setupI18n';
  import { onMounted, ref } from 'vue';
  import { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import MobileEdhrFillModal from '../../mobile-edhr-fill-modal.vue';
  import EdhrInsRelationTree from './edhr-ins-relation-tree.vue';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const { t } = i18n.global;

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      edhrInsId: string;
      popupProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  const loading = ref<boolean>(false);
  const treeData = ref<EdhrInstanceResponse[]>([]);

  function uniqueKey() {
    var time = new Date().getTime();
    var random = Math.random().toString().substring(2, 12);
    return time + random;
  }
  function formatTree(list) {
    list.forEach((e) => {
      e.uuid = uniqueKey();
      if (e.children && !e.children.length) {
        e.children = null;
      } else if (e.children) {
        formatTree(e.children);
      }
    });
  }

  async function getTableData() {
    loading.value = true;
    const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'gct_edhr_instance',
        bsKey: 'relationTreeById',
      },
      { id: props.edhrInsId },
      {},
    ).finally(() => {
      loading.value = false;
    });
    console.log('res', res);
    treeData.value = res ?? [];
    formatTree(treeData.value);
  }

  onMounted(() => {
    getTableData();
  });

  const openEdhr = (record) => {
    GctPopup.open(MobileEdhrFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        materialNo: record.materialNo,
        ofTmplId: record.docOutlineId,
        ofInstanceId: record.ofInstanceId,
        viewPageLimit: false,
        isViewPage: true,
        needAutoSave: false,
        pageType: 'document-task-audit',
      },
    });
  };
</script>

<style lang="less" scoped>
  .edhr-ins-relation-popup {
    padding: 16px;
  }
</style>
