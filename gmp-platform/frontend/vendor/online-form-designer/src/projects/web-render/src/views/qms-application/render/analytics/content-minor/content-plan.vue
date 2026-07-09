<template>
  <div :class="ns.be('content', 'table')">
    <a-row :gutter="12">
      <a-col :span="18">
        <div :class="ns.be('content', 'table-left')">
          <a-table
            ref="tableContainerRef"
            :columns="sampleColumns"
            :dataSource="sampleData"
            size="middle"
            bordered
            :scroll="{ y: scrollHeight }"
          >
            <template #bodyCell="{ column, text, record, index }">
              <template v-if="column.dataIndex === 'sort'">
                <div>{{ index + 1 }}</div>
              </template>
              <template v-if="column.dataIndex === 'sample_data_'">
                <div v-html="formateSampleData(record)"></div>
              </template>
              <template v-if="column.dataIndex === 'containers_'">
                <div>{{ record.containers_ || '--' }}</div>
              </template>
              <template v-if="column.dataIndex === 'status_'">
                <div
                  :style="{
                    color:
                      text === 'normal'
                        ? '#52c41a'
                        : text === 'handled'
                        ? 'var(--ant-primary-color)'
                        : '#f5222d',
                  }"
                >
                  {{ formatStatus(text) }}
                </div>
              </template>
              <template v-if="column.dataIndex === 'out_of_control_rule_'">
                <div v-html="computedRuleDict(record)"> </div>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
      <a-col :span="6">
        <div :class="ns.be('content', 'table-right')">
          <a-table
            :columns="keyIndicatorColumns"
            :dataSource="keyIndicatorData"
            :pagination="false"
            size="middle"
            bordered
          />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onBeforeMount } from 'vue';
  import { useNamespace, useAntTableScrollHeight } from '@gct/runtime';
  import {
    sampleColumns,
    keyIndicatorColumns,
    keyIndicatorFields,
  } from '../../../constants/measureColumns';
  import { getOutOfRuleEnums } from '../../../utils';

  const defProps = defineProps<{
    analyticsData: any;
  }>();

  const ns = useNamespace('analytics-view');
  const scrollHeight = 500;

  const tableContainerRef = ref();
  const rulesData = ref<any[]>([]);

  const sampleData = computed(() => {
    return defProps.analyticsData?.measureGroup;
  });

  const keyIndicatorData = computed(() => {
    return keyIndicatorFields.map((it) => {
      return {
        name: it.replace('_', '').replace(/^\w/, (c) => c.toUpperCase()),
        value: defProps.analyticsData?.computeResult?.[it],
      };
    });
  });

  const computedRuleDict = computed(() => (row) => {
    if (!row['out_of_control_rule_']) return '--';

    const rules = rulesData.value.filter((it) => row['out_of_control_rule_'].includes(it.value));
    const rulesNValues = row.n_?.split?.(',');
    const ruleDict = (rules ?? []).map((it, idx) => {
      return `${idx + 1}. ${it.label}`.replace('N', rulesNValues?.[idx] ?? 'N');
    });
    return ruleDict.join('<br />');
  });

  async function getOutRulesMaps() {
    try {
      rulesData.value = await getOutOfRuleEnums();
    } catch (error) {
      rulesData.value = [];
    }
  }

  function formatStatus(status) {
    return status === 'normal' ? '正常' : status === 'handled' ? '已处理' : '失控';
  }

  function formateSampleData(row) {
    const sampleData = row.sample_data_?.split?.(',');
    const outOfControlIndex = row.out_of_control_index_ ?? '';
    let temp = '';
    sampleData.forEach((it, idx) => {
      const connector = idx === sampleData.length - 1 ? '' : ',';
      if (outOfControlIndex.includes(idx + 1)) {
        temp += `<span style="color: red; white-space: nowrap">${it}</span>${connector}`;
      } else {
        temp += `<span style='white-space: nowrap'>${it + connector}</span>`;
      }
    });
    return temp;
  }

  onBeforeMount(() => {
    getOutRulesMaps();
  });
</script>
