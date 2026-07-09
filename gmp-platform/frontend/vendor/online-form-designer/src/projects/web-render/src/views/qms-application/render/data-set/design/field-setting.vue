<template>
  <div class="field-setting">
    <a-table
      ref="fieldTableRef"
      v-if="dataSource?.length > 0"
      :dataSource="dataSource"
      :columns="columns"
      class="gct-edhr-table h-full"
      size="middle"
      :pagination="false"
      bordered
      :scroll="{
        y: 600,
      }"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'index'">
          <div>{{ index + 1 }}</div>
        </template>
        <template v-if="column.dataIndex === 'name'">
          <a-input v-model:value="record.name" />
        </template>
        <template v-else-if="column.dataIndex === 'bizMeaning'">
          <a-select
            v-model:value="record.bizMeaning"
            style="width: 100%"
            :options="getBizMeaningOptions(record)"
          />
        </template>
      </template>
    </a-table>
    <a-empty style="margin-top: 50px" v-else />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onBeforeMount } from 'vue';

  const defProps = defineProps<{
    fieldsData: any[];
  }>();

  console.log(defProps.fieldsData, 'columns');

  export interface IFieldSetting {
    key: string;
    type: string;
    name: string;
    bizMeaning: string;
  }

  /**
   * 字段含义枚举，用于标识字段的业务含义。
   */
  enum EFieldMeaning {
    PRODUCT = 'product',
    SPEC = 'spec',
    SHOPFLOOR = 'shopfloor',
    PRODUCT_LINE = 'productLine',
    SHIFT = 'shift',
    DEVICE = 'device',
    SUPPLIER = 'supplier',
    MONITORING_PARAM = 'monitoring_param',
    MFG_ORDER = 'mfg_order',
    CONTAINER = 'container',
    CONTAINER_QTY = 'container_qty',
    START_TIME = 'start_time',
    END_TIME = 'end_time',
    MODIFY_TIME = 'modify_time',
    SAMPLE_NUM = 'sample_num',
    SAMPLE_TIME = 'sample_time',
    NOT_GOOD_CODE = 'not_good_code',
    NOT_GOOD_QTY = 'not_good_qty',
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
    },
    {
      title: '字段Key',
      dataIndex: 'key',
    },
    {
      title: '显示名称',
      dataIndex: 'name',
    },
    {
      title: '字段类型',
      dataIndex: 'type',
    },
    {
      title: '字段含义定义',
      dataIndex: 'bizMeaning',
    },
  ];

  const uniqBizFields = [EFieldMeaning.DEVICE, EFieldMeaning.SPEC];
  function getBizMeaningOptions(record: IFieldSetting) {
    // 获取除当前字段外已使用的 bizMeaning 值
    const usedBizMeanings = dataSource.value
      .filter((item) => item.key !== record.key) // 排除当前字段
      .map((item) => item.bizMeaning)
      .filter(Boolean);

    return Object.values(EFieldMeaning)
      .filter((value) => {
        // 对于 uniqBizFields 中的值
        if (uniqBizFields.includes(value)) {
          // 如果该值是当前字段的值，或者尚未被其他字段使用，则保留
          return value === record.bizMeaning || !usedBizMeanings.includes(value);
        }
        // 对于非 uniqBizFields 中的值，始终保留
        return true;
      })
      .map((value) => ({
        value,
        label: $t(`sys.kit.qms.fieldMeaning.${value}`),
      }));
  }

  const dataSource = ref<IFieldSetting[]>([]);

  onBeforeMount(() => {
    dataSource.value = (defProps.fieldsData ?? []).map((it) => {
      return {
        ...it,
        key: it.dataIndex,
        type: $t(`sys.kit.qms.fieldType.${it.columnType}`) || it.columnType,
        name: it.name || it.title,
        bizMeaningLabel: it.bizMeaning ? $t(`sys.kit.qms.fieldMeaning.${it.bizMeaning}`) : null,
      };
    });
  });

  defineExpose({
    getDataSource: () => dataSource.value,
  });
</script>

<style scoped lang="less">
  .field-setting {
    margin: 24px 16px;
  }
</style>
