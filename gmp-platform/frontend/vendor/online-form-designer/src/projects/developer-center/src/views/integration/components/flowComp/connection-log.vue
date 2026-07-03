<template>
  <div class="h-full flex flex-col p24px">
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
      <div class="w-full">
        <a-row :gutter="[20, 12]">
          <a-col :span="8">
            <a-form-item
              :label="`${t('sys.nameOfSth', { sth: t('sys.integration.dataSource') })}/KEY`"
              name="keyOrName"
            >
              <a-input v-model:value="formState.keyOrName" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.status')" name="status">
              <a-select
                v-model:value="formState.status"
                allow-clear
                :placeholder="t('sys.chooseText')"
              >
                <a-select-option value="">{{ t('sys.all') }}</a-select-option>
                <a-select-option value="2">成功</a-select-option>
                <a-select-option value="3">失败</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.executionTime')" name="rangeTime">
              <a-range-picker
                v-model:value="formState.rangeTime"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24" class="text-right">
            <a-button class="mr-10px" @click="() => formRef?.resetFields()">
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="onSearch">
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <LogTable ref="LogTableRef" :params="queryParams" class="mt-16px" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import LogTable from './comps/log-table.vue';
  import { FlowLogSearchReq } from '/@/apis/gct-ipaas/model';
  import { pick } from 'lodash-es';

  const formRef = ref<FormInstance>();
  const LogTableRef = ref();

  const { t } = useI18n();

  const formState = reactive({
    keyOrName: '',
    status: '',
    rangeTime: [],
  });

  const queryParams = computed((): FlowLogSearchReq => {
    return {
      ...pick(formState, ['keyOrName', 'status']),
      triggerTimeStart: formState.rangeTime ? formState.rangeTime[0] : '',
      triggerTimeEnd: formState.rangeTime ? formState.rangeTime[1] : '',
    };
  });

  const onSearch = () => {
    console.log(LogTableRef.value);
    LogTableRef.value?.getTableData(1);
  };
</script>

<style></style>
