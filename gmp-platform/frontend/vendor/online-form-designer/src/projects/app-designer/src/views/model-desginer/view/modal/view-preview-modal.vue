<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.dataPreview')"
    centered
    :min-height="200"
    width="1040px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="markdown">
      <vxeRefTable
        ref="xtable"
        v-model="datasource"
        :loading="loading"
        :headerSort="false"
        :tableColumns="tableColumns"
        maxHeight="536"
      />
      <div class="text-right mt10px" v-if="datasource.length">
        <a-pagination
          v-bind="paginationAttr"
          class="pagination-total-left"
          @change="showSizeChange"
        />
      </div>
    </div>
    <template #footer></template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import vxeRefTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable/index.vue';
  import { beginDrag } from '/@page-designer/schema/utils';
  import { uuid2 } from '/@/utils/uuid';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { QueryDataOptions } from '/@page-designer/components/widgets/web/data/data-table/type';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { t } = useI18n();

  const emit = defineEmits(['register']);
  const loading = ref<boolean>(false);
  const datasource = ref<any>([]);
  const fieldMetaList = ref([]);
  const dataTableId = ref();
  const modelKey = ref();
  const total = ref(0);

  const pagination = reactive<Required<QueryDataOptions>>({
    pageSize: 10,
    pageNo: 1,
    query: {},
    exp: '',
  });

  const pageSizeOptions = reactive([10, 20, 30, 40, 50]);

  const lastQueryData = ref<Partial<QueryDataOptions>>({});

  const paginationAttr = computed(() => {
    return {
      current: pagination.pageNo,
      pageSize: pagination.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  /**分页 */
  function showSizeChange(current, pageSize) {
    getDataSource({ pageNo: current, pageSize });
  }

  const tableColumns = computed(() => {
    return fieldMetaList.value.map((i) => createField(i));
  });

  async function getDataSource(queryData?: QueryDataOptions) {
    let { pageNo, pageSize, query, exp } = Object.assign({}, pagination, queryData);
    lastQueryData.value = {
      pageNo,
      pageSize,
      query,
      exp,
    };
    loading.value = true;
    try {
      const data: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'listByPage',
          modelKey: modelKey.value,
          modelCategory: EntityModelCategoryEnum.VIEW,
        },
        lastQueryData.value,
      );
      pagination.pageNo = data?.pageNo;
      pagination.pageSize = data?.pageSize;
      total.value = data?.totalCount;
      datasource.value = transformSourceData(data?.data, data?.dict ?? {});
    } catch (error) {
      console.warn(error);
    }
    loading.value = false;
  }

  function createField(item) {
    const fieldWidget = beginDrag(item, {
      materialType: MaterialEnum.MaterialTableField,
      preLocation: dataTableId.value,
    });
    fieldWidget.props['label'] = fieldWidget.props?.fieldName;
    return fieldWidget;
  }

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (data) {
      modelKey.value = data.model;
      const res = (await getModelMetaDetail({ modelKey: data.model })) || {};
      dataTableId.value = 'datatable_' + uuid2(10, 10);
      fieldMetaList.value = res?.fieldMetaList || [];
      await nextTick();
      getDataSource();
    }
  });

  const handleClose = () => {};

  const handleOk = async () => {
    closeModal();
  };
</script>

<style lang="less" scoped></style>
