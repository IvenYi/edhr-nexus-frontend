<!-- 工单拆分 -->
<template>
  <a-drawer
    v-model:visible="visible"
    title="工单拆分"
    placement="right"
    :width="640"
    :body-style="{ padding: '15px' }"
    :footer-style="{ textAlign: 'right' }"
    destroyOnClose
    :closable="false"
    @close="onClose"
  >
    <template #extra>
      <close-outlined
        style="font-size: 16px; color: rgba(0, 0, 0, 0.45)"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <!-- 工单信息 -->
    <h5 class="title-info">基本信息</h5>
    <div class="order-info bg-gray-50 px16px py8px rounded-md mb-16px">
      <div class="grid grid-cols-3 gap-16px mb16px info-item-wrap">
        <div>
          <label>属性类型：</label>
          <span :title="orderFormData.DICT?.attr_status_?.[orderFormData.attr_status_]">
            {{ orderFormData.DICT?.attr_status_?.[orderFormData.attr_status_] }}
          </span>
        </div>
        <div>
          <label>工单编号：</label>
          <span :title="orderFormData.code_">{{ orderFormData.code_ }}</span>
        </div>
        <div>
          <label>订单编号：</label>
          <span :title="orderFormData.order_code_">{{ orderFormData.order_code_ }}</span>
        </div>
        <div>
          <label>物料：</label>
          <span :title="orderFormData.DICT?.product_id_?.[orderFormData.product_id_]">
            {{ orderFormData.DICT?.product_id_?.[orderFormData.product_id_] }}
          </span>
        </div>
        <div>
          <label>生产数量：</label>
          <span :title="orderFormData.qty_">{{ orderFormData.qty_ }}</span>
        </div>
        <div>
          <label>剩余数量：</label>
          <span :title="orderFormData.unproduced_count_">{{
            orderFormData.unproduced_count_
          }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 mb16px info-item-wrap">
        <div>
          <label>计划开始时间：</label>
          <span :title="orderFormData.planned_start_date_">
            {{ orderFormData.planned_start_date_ }}
          </span>
        </div>
        <div>
          <label>计划结束时间：</label>
          <span>
            {{ orderFormData.planned_completion_date_ }}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div>
          <label>描述：</label>
          <span>{{ orderFormData.description_ }}</span>
        </div>
      </div>
    </div>

    <!-- 批次创建  -->
    <h5 class="title-info mt-16px">工单拆批</h5>
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-row class="mt-4" :gutter="16">
        <a-col :span="12">
          <a-form-item label="生产批次" name="name_">
            <a-input v-model:value="formData.name_" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="拆分数量" name="qty_">
            <a-input-number v-model:value="formData.qty_" :precision="4" min="0.0000" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-button
            class="float-right mb16px"
            type="primary"
            size="small"
            ghost
            @click="onSplitLotClick"
          >
            拆分批次</a-button
          >
        </a-col>
      </a-row>
    </a-form>
    <!-- <div class="font-bold">批次列表</div> -->
    <a-table :columns="TABLE_COLUMNS" :data-source="lotTableData" size="middle" :pagination="false">
      <template #bodyCell="{ column, record, index, text }">
        <template v-if="column.key === 'action'">
          <span class="error-gct cursor-pointer inline-block" @click="onDeleteItem(index)">
            {{ $t('sys.delete') }}
          </span>
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button style="margin-right: 8px" @click="onReset">取消</a-button>
      <a-button type="primary" @click="onSubmit">提交</a-button>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import type { Rule } from 'ant-design-vue/es/form';
  import { message } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const TABLE_COLUMNS = [
    {
      title: '生产批次',
      dataIndex: 'name_',
      key: 'name_',
    },
    {
      title: '数量',
      dataIndex: 'qty_',
      key: 'qty_',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 70,
    },
  ];

  defineProps<{
    widgetList: Array<any>;
  }>();

  const emits = defineEmits<{
    (e: 'submitted'): void;
  }>();

  const Event = getPageEvent();
  const formRef = ref();
  const visible = ref<boolean>(false);
  const formData: any = ref({});
  const orderFormData = ref();
  const lotTableData = ref<any[]>([]);

  // const batchCount = ref();
  const batch = ref(true);

  const rules: Record<string, Rule[]> = {
    name_: [{ required: true, message: '请输入' }],
    qty_: [{ required: true, message: '请输入' }],
  };

  const onClose = () => {
    visible.value = false;
    formData.value = {};
    orderFormData.value = {};
    lotTableData.value = [];
  };

  const onOpen = (rowValue) => {
    orderFormData.value = rowValue;
    visible.value = true;
  };

  const onSplitLotClick = async () => {
    await formRef.value.validate();
    const isDuplicate = lotTableData.value.find((it) => it.name_ === formData.value.name_);
    if (isDuplicate) {
      message.warning('当前批次已存在');
      return;
    }
    const total = lotTableData.value.reduce((sum, item) => {
      sum += item.qty_;
      return sum;
    }, 0);
    if (total + formData.value.qty_ > orderFormData.value?.unproduced_count_) {
      message.warning('剩余数量不足，无法拆分批次');
      return;
    }
    lotTableData.value.push(cloneDeep(formData.value));

    formRef.value.resetFields();
  };

  const onSubmit = async () => {
    if (!lotTableData.value || !lotTableData.value.length) {
      message.warning('批次列表不能为空');
      return;
    }

    const actionKey = batch.value ? 'biz_batch_create' : 'biz_create';
    await Event.context.$customBizService.post(
      {
        key: 'em_container',
        // @ts-ignore
        action: actionKey,
      },
      lotTableData.value.map((it) => {
        return {
          ...it,
          mfg_order_id_: orderFormData.value.id_,
          product_id_: orderFormData.value.product_id_,
        };
      }),
    );
    message.success('创建成功');
    emits('submitted');
    onClose();
  };

  const onReset = (rowValue) => {
    visible.value = false;
  };

  const onDeleteItem = (index) => {
    lotTableData.value.splice(index, 1);
  };

  defineExpose({
    onOpen,
    onClose,
  });
</script>

<style lang="less" scoped>
  .order-info {
    justify-content: space-between;
  }

  .title-info {
    color: #000000;
    padding-left: 8px;
    // margin: 12px 0;
    margin-bottom: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 16px;
    font-weight: bold;
    border-left: 3px solid var(--ant-primary-color);
  }

  .info-item-wrap {
    & > div {
      display: flex;
      color: #737e87;
      & > span {
        color: #252525;
        display: block;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
</style>
