<template>
  <div class="tenant-table-header">
    <a-form
      class="search-form"
      :model="condition"
      layout="inline"
      :labelCol="{ span: 8 }"
      autocomplete="off"
    >
      <a-row :gutter="24" style="width: 100%">
        <a-col :span="6">
          <a-form-item :label="t('sys.tenantName')" name="name">
            <a-input
              type="primary"
              v-model:value="condition.name"
              :placeholder="t('sys.tenantNamePlaceholder')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item :label="t('sys.status')" name="enabled">
            <a-select v-model:value="condition.enabled">
              <a-select-option :value="StatusEnum.ALL">{{ t('sys.all') }}</a-select-option>
              <a-select-option :value="StatusEnum.NORMAL">{{ t('sys.enable') }}</a-select-option>
              <a-select-option :value="StatusEnum.DISABLED">{{
                t('sys.disabled')
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item :label="t('sys.createTime')" name="createTime">
            <a-range-picker
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              v-model:value="condition.createTime"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <div class="actions" style="text-align: right">
            <a-button class="mr-8px" @click="handleReset">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="onSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.query') }}
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { UndoOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { StatusEnum } from '../constant/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface ConditionType {
    /** 租户名称 */
    name: string;
    /** 状态 */
    enabled: number;
    /** 创建时间 */
    createTime: Array<string>;
  }

  const { t } = useI18n();

  const emit = defineEmits(['search']);

  // 查询条件
  const condition = reactive<ConditionType>({
    enabled: StatusEnum.ALL,
    createTime: [],
    name: '',
  });

  const handleReset = () => {
    condition.enabled = StatusEnum.ALL;
    condition.name = '';
    condition.createTime = [];
  };

  const onSearch = () => {
    emit('search');
  };

  defineExpose({ condition });
</script>

<style lang="less" scoped>
  @primary-button-color: rgba(13, 170, 156, 1);

  .tenant-table-header {
    margin: 0 16px;
  }
</style>
