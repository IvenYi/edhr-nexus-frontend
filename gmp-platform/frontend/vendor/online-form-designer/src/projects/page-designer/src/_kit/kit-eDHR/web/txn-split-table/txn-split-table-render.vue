<template>
  <div class="txn-split-table-render">
    <a-form ref="formRef" :model="formState">
      <div class="flex justify-end mb-2">
        <RenderTableButtons
          :buttons="headerOperateButtons.children"
          :visibleButtons="headerOperateButtons.visibleButtons"
        />
        <template v-if="!isSnSpit">
          <a-button
            type="default"
            class="ml-2"
            @click="handleContainerImport"
            :aria-label="$t('sys.edhr.importSth', { sth: $t('sys.edhr.materialStatus.LOT') })"
          >
            <template #icon> <DownloadOutlined /> </template>
            {{ $t('sys.import') }}
          </a-button>
          <a-button type="primary" class="ml-2" @click="handleBatchAdd">{{
            $t('sys.add')
          }}</a-button>
        </template>

        <a-button
          v-if="isSnSpit"
          type="primary"
          class="ml-2"
          @click="handleSnImport"
          :aria-label="$t('sys.edhr.importSth', { sth: 'sn' })"
        >
          <template #icon> <DownloadOutlined /> </template>
          {{ $t('sys.import') }}
        </a-button>
      </div>

      <vxeRefTable
        ref="vxeTable"
        v-model="tableData"
        :tableFieldId="tableWidget.id"
        :tableColumns="tableColumns"
        :operateColumn="operateColumn"
        :serialNumber="true"
        :validateRule="validateRule"
        :subTableShowPagination="false"
        :headerSort="false"
      >
        <template #header>
          <span>{{ t('pageDesigner.txnSplitTable.title') }}</span>
        </template>
        <template #field="{ widget, row, rowIndex }">
          <a-form-item
            v-if="widget.props.fieldId === 'em_container$name_'"
            :name="[tableWidget.id, rowIndex, widget.props.field]"
            :rules="[
              {
                required: true,
                message: `${widget.alias || widget.props.label}${$t(
                  'sys.pageDesigner.cannotBeEmpty',
                )}`,
              },
            ]"
          >
            <a-input
              class="ell w100%"
              v-model:value="row[widget.props.field]"
              :placeholder="$t('sys.pleaseInputSth')"
            />
          </a-form-item>
        </template>
        <template #operate="{ row, rowIndex, operateColumn }">
          <RenderTableColunmButtons
            :tableForm="row"
            :rowIndex="rowIndex"
            :buttons="operateColumn.children"
            :visibleButtons="operateColumn.props.visibleButtons"
            isRow
          />
        </template>
      </vxeRefTable>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep, isObject } from 'lodash-es';
  import { computed, reactive, ref, provide, toRef } from 'vue';
  import {
    vxeRefTable,
    RenderTableColunmButtons,
    RenderTableButtons,
    // @ts-ignore
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';

  import { ITxnSplitTable } from './schema';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';
  import BatchAddModal from './modal/batch-add.vue';
  import UploadModal from './modal/upload.vue';

  const { t } = useI18n();

  const props = defineProps<{
    widget: ITxnSplitTable;
  }>();

  const { splitType, refTxnForm } = reactive(props.widget.props);

  const isSnSpit = computed(() => splitType === 'sn');

  const tableWidget = computed(() => {
    const children = props.widget.children;
    return children?.[0];
  });

  const validateRule = computed(() => {
    const { validateRule } = tableWidget.value.props;
    return validateRule || {};
  });

  const tableColumns = computed(() => {
    return tableWidget.value.children?.[1]?.children || [];
  });

  const operateColumn = computed(() => {
    return tableWidget.value.children?.[0] || [];
  });

  const headerOperateButtons = computed(() => {
    return tableWidget.value.children?.[2] || [];
  });

  console.log(
    tableWidget.value,
    headerOperateButtons.value,
    'tableWidget.value:===============================================================================',
  );

  const formRef = ref();
  const formState = computed(() => {
    return { [tableWidget.value.id]: dataSource.value };
  });

  const txnFormData = toRef(() => {
    return formMap.value?.[refTxnForm];
  });

  const vxeTable = ref();

  const dataSource = ref<any[]>([]);

  const tableData = computed(() => {
    return dataSource.value?.filter((d) => !d.deleted_) || [];
  });

  async function handleSnImport() {
    const res = await gct.openUtil.modal<any>(
      UploadModal,
      {
        data: {
          splitType,
          bindModelKey: 'em_sn',
          templateKey: 'import_sn_mryi',
          actionUrl: 'gct-apaas/api/edhr/upload/excel',
        },
      },
      {
        title: $t('sys.edhr.importSth', { sth: 'SN' }),
        width: 600,
        showFooter: false,
      },
    );
    if (res && res.ok) {
      const { data } = res;
      if (data && isObject(data)) {
        const { fileName, number, importTime, minPlanStartTime, maxPlanEndTime, entries } =
          data as any;
        dataSource.value.push({
          ...data,
          import_file_name_: fileName,
          qty_: number,
          import_date_: importTime,
          min_plan_start_time_: minPlanStartTime || txnFormData.value.planned_start_date_,
          max_plan_end_time_: maxPlanEndTime || txnFormData.value.planned_completion_date_,
          entries: entries.map((e) => {
            return {
              ...e,
              planned_start_date_: e.planned_start_date_ || txnFormData.value.planned_start_date_,
              planned_completion_date_:
                e.planned_completion_date_ || txnFormData.value.planned_completion_date_,
            };
          }),
        });
      }
    }
  }

  async function handleContainerImport() {
    const res = await gct.openUtil.modal<any>(
      UploadModal,
      {
        data: {
          splitType,
          bindModelKey: 'em_container',
          templateKey: 'import_pLkkAT_mryi',
          actionUrl: 'gct-apaas/api/edhr/upload/containerExcel',
        },
      },
      {
        title: $t('sys.edhr.importSth', { sth: $t('sys.edhr.materialStatus.LOT') }),
        width: 600,
        showFooter: false,
      },
    );
    if (res && res.ok) {
      const entries = res?.data?.entries ?? [];
      for (let k of entries) {
        if (k && isObject(k)) {
          const { name_, number, planned_start_date_, planned_completion_date_ } = k as any;
          dataSource.value.push({
            ...k,
            name_: name_,
            qty_: number,
            //feat: [1022458]计划开始时间和计划结束时间默认取自于工单上
            planned_start_date_: planned_start_date_ || txnFormData.value.planned_start_date_,
            planned_completion_date_:
              planned_completion_date_ || txnFormData.value.planned_completion_date_,
          });
        }
      }
    }
  }

  async function handleBatchAdd() {
    const res = await gct.openUtil.modal<any>(
      BatchAddModal,
      {
        data: {
          unProducedCount: txnFormData.value?.unproduced_count_ || 0,
        },
      },
      {
        title: $t('sys.edhr.batchAdd'),
        width: 500,
        showFooter: false,
      },
    );
    if (res.ok) {
      const { type, container_num_, container_qty_ } = res.data;
      const rows = generateSplitRows({
        type,
        num: container_num_,
        qty: container_qty_,
      });
      for (const row of rows) {
        dataSource.value.push({
          qty_: row.qty_,
          //feat: [1022458]计划开始时间和计划结束时间默认取自于工单上
          planned_start_date_: txnFormData.value.planned_start_date_,
          planned_completion_date_: txnFormData.value.planned_completion_date_,
        });
      }
    }
  }

  /**
   * 生成拆分批次
   * @param {Object} params - 参数对象
   * @param {'container_qty_'|'container_num_'} params.type - 拆分类型
   * @param {number} [params.num] - 批次数（仅type='container_num_'时使用）
   * @param {number} [params.qty] - 每批数量（仅type='container_qty_'时使用）
   * @returns {Array<{no_: number, qty_: number}>} 拆分结果数组
   * @throws {Error} 当参数无效时抛出错误
   */
  function generateSplitRows({ type, num, qty }) {
    const total = txnFormData.value?.unproduced_count_ || 0;

    if (total <= 0) {
      throw new Error('总数量必须大于0');
    }

    if (type === 'container_qty_') {
      if (qty <= 0 || qty > total) {
        throw new Error('每批数量必须大于0且不超过总数量');
      }
      return splitByQuantity(total, qty);
    } else if (type === 'container_num_') {
      if (num <= 0 || num > total) {
        throw new Error('批次数必须大于0且不超过总数量');
      }
      return splitByBatchCount(total, num);
    } else {
      throw new Error('无效的拆分类型');
    }
  }
  // 按数量拆分实现
  function splitByQuantity(totalQty, batchQty) {
    const batches: any[] = [];
    let remaining = totalQty;
    let no_ = 1;

    while (remaining > 0) {
      const qty_ = Math.min(batchQty, remaining);
      batches.push({ no_, qty_ });
      remaining -= qty_;
      no_++;
    }

    return batches;
  }
  // 按批次数拆分实现
  function splitByBatchCount(totalQty, batchCount) {
    const batches: any[] = [];
    const baseQty = Math.floor(totalQty / batchCount);
    let remaining = totalQty - baseQty * (batchCount - 1);
    let no_ = 1;

    for (let i = 0; i < batchCount; i++) {
      batches.push({ no_, qty_: baseQty });
      no_++;
    }

    if (remaining > 0) {
      batches[batchCount - 1] = {
        no_: batchCount - 1,
        qty_: remaining,
      };
    }

    return batches;
  }

  function validateNameDuplicated() {
    const names = dataSource.value.map((item) => item.name_);
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      return Promise.reject(new Error($t('sys.edhr.valueHasExistedTip')));
    }
    return Promise.resolve();
  }

  provide('tableEvent', {
    delete: (rowData) => {
      if (rowData.id_) {
        rowData.deleted_ = true;
      } else {
        const idx = dataSource.value.findIndex((i) => i._X_ROW_KEY === rowData._X_ROW_KEY)!;
        dataSource.value?.splice(idx, 1);
      }
    },
  });

  defineExpose({
    getDataSource() {
      return cloneDeep(dataSource.value);
    },
    async fullValidate() {
      await formRef.value.validate();
    },
    validateNameDuplicated,
  });
</script>

<style lang="less" scoped></style>
