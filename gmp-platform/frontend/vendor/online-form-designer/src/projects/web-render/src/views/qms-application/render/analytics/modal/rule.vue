<template>
  <div class="font-bold px-4 pt-4">异常规则配置</div>
  <a-table
    class="p-4"
    :columns="tableColumns"
    :pagination="false"
    :dataSource="tableData"
    :row-selection="{
      onChange: onSelectChange,
      selectedRowKeys: selectedRowKeys,
    }"
    size="middle"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'out_of_control_rule_'">
        <div>{{ getRuleName(record[column.dataIndex]) }}</div>
      </template>
      <template v-if="column.dataIndex === 'n_'">
        <a-input-number v-model:value="record[column.dataIndex]" :min="1" />
      </template>
    </template>
  </a-table>
  <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
    <a-button style="margin-right: 8px" @click="onCancel">取消</a-button>
    <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确认</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { message as Message } from 'ant-design-vue';
  import { IModal } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { cloneDeep } from 'lodash-es';

  type Key = string | number;

  const { t } = useI18n();

  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const tableColumns = [
    {
      dataIndex: 'out_of_control_rule_',
      title: '名称',
      desc: '异常规则',
    },
    {
      dataIndex: 'n_',
      title: 'N值',
      desc: '判异规则编码',
      width: 200,
    },
  ];
  const ruleOptions = [
    {
      label: '连续N个点在中心线两侧且无一个在C区内',
      value: 'consecutive_points_outside_±1σ_zone_either_side',
    },
    {
      label: '连续N个点在C区中心线两侧的C区内',
      value: 'consecutive_points_within_±1σ_zone_around_cl',
    },
    {
      label: '连续N个点有4个点落在中心线同一侧的C区以外',
      value: 'consecutive_points_beyond_the_1σ_limit_same_side',
    },
    {
      label: '连续N个点有2个点落在中心线同一侧的B区以外',
      value: 'consecutive_points_beyond_the_2σ_limit_same_side',
    },
    {
      label: '连续N个点中相邻点上下交替',
      value: 'consecutive_points_alternating_up_and_down',
    },
    {
      label: '连续N个点递增/减',
      value: 'consecutive_points_increasing_or_decreasing',
    },
    {
      label: '连续N个点落在中心线（CL）同一侧',
      value: 'consecutive_points_on_one_side_of_cl',
    },
    {
      label: 'N个点落在A区（规格线）以外且连续',
      value: 'consecutive_points_outside_the_3σ_control_limits',
    },
  ];

  const confirmLoading = ref(false);
  const tableData = ref([
    {
      out_of_control_rule_: 'consecutive_points_outside_±1σ_zone_either_side',
      n_: '',
      key: 'consecutive_points_outside_±1σ_zone_either_side',
    },
    {
      out_of_control_rule_: 'consecutive_points_within_±1σ_zone_around_cl',
      n_: '',
      key: 'consecutive_points_within_±1σ_zone_around_cl',
    },
    {
      out_of_control_rule_: 'consecutive_points_beyond_the_1σ_limit_same_side',
      n_: '',
      key: 'consecutive_points_beyond_the_1σ_limit_same_side',
    },
    {
      out_of_control_rule_: 'consecutive_points_beyond_the_2σ_limit_same_side',
      n_: '',
      key: 'consecutive_points_beyond_the_2σ_limit_same_side',
    },
    {
      out_of_control_rule_: 'consecutive_points_alternating_up_and_down',
      n_: '',
      key: 'consecutive_points_alternating_up_and_down',
    },
    {
      out_of_control_rule_: 'consecutive_points_increasing_or_decreasing',
      n_: '',
      key: 'consecutive_points_increasing_or_decreasing',
    },
    {
      out_of_control_rule_: 'consecutive_points_on_one_side_of_cl',
      n_: '',
      key: 'consecutive_points_on_one_side_of_cl',
    },
    {
      out_of_control_rule_: 'consecutive_points_outside_the_3σ_control_limits',
      n_: '',
      key: 'consecutive_points_outside_the_3σ_control_limits',
    },
  ]);

  function getRuleName(key) {
    const rule = ruleOptions.find((item) => item.value === key);
    return rule ? rule.label : '';
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  const selectedRowKeys = ref<Key[]>();
  function onSelectChange(rowKeys: Key[]) {
    selectedRowKeys.value = rowKeys;
  }

  async function onSubmit() {
    const submitData = tableData.value.filter(
      (f) => selectedRowKeys.value?.includes(f.out_of_control_rule_) || f?.id_,
    );
    const isNEmpty = submitData.find((i) => !i.n_);
    if (isNEmpty) {
      Message.warn('字段N值不能为空');
      return;
    }
    const _data = submitData.map((i) => {
      return {
        ...i,
        ref_master_id_: defProps.data.masterId,
        ref_model_key_: 'em_plan',
        ref_field_key_: 'out_of_control_rule_entries_',
        deleted_: !!(i.id_ && !selectedRowKeys.value?.includes(i.out_of_control_rule_)),
      };
    });
    try {
      confirmLoading.value = true;
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_plan',
          bsKey: 'submit',
        },
        {
          id_: defProps.data.id_,
          out_of_control_rule_entries_: _data,
        },
      );
      confirmLoading.value = false;
      Message.success('提交成功');
      defProps.modal.dismiss({ ok: true });
    } catch (error) {}
    confirmLoading.value = false;
  }

  async function loadData() {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_out_of_control_rule_entry',
        bsKey: 'listAll',
      },
      {
        query: {
          'ref_master_id_.eq': defProps.data.masterId,
        },
      },
    );
    console.log(res, 'loadData: rule  entry');
    tableData.value = transformData(res?.data);
    selectedRowKeys.value = tableData.value
      .filter((item) => item.id_ && item.out_of_control_rule_)
      .map((item) => item.out_of_control_rule_);
  }

  function transformData(data: any[]) {
    if (!data?.length) return tableData.value;
    const _data = cloneDeep(tableData.value);
    return _data.map((item) => {
      const current = data.find((it) => it.out_of_control_rule_ === item.out_of_control_rule_);
      if (current) {
        return {
          ...item,
          id_: current.id_,
          ref_master_id_: current.ref_master_id_,
          ...current,
        };
      }
      return item;
    });
  }

  onMounted(() => {
    loadData();
  });
</script>
