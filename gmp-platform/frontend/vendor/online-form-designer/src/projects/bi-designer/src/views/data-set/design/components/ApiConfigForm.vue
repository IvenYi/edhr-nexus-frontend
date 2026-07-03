<template>
  <div :class="ns.b()">
    <a-button
      :class="[ns.e('run-btn'), connType ? 'top32' : '']"
      :loading="isLoading"
      type="primary"
      @click="handleRun"
    >
      <template #default>{{ $t('sys.bi.call') }}</template>
      <template #icon><RetweetOutlined /></template>
    </a-button>

    <a-form
      ref="formRef"
      v-if="!connType"
      :model="formState"
      autocomplete="off"
      style="height: 100%"
    >
      <a-form-item :label="$t('sys.bi.dataSyncCycle')" name="syncType">
        <a-radio-group v-model:value="formState.syncType" name="radioGroup">
          <a-radio :value="0">{{ $t('sys.bi.manualUpdate') }}</a-radio>
          <a-radio :value="1">{{ $t('sys.bi.scheduledUpdate') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <div class="flex" v-if="formState.syncType == 1">
        <a-form-item :label="$t('sys.bi.taskFrequency')" name="taskFreqValue">
          <a-input-number v-model:value="formState.taskFreqValue" style="width: 210px !important" />
        </a-form-item>
        <a-form-item label="" name="taskFreqUnit" class="ml-20px">
          <a-radio-group v-model:value="formState.taskFreqUnit" name="radioGroup">
            <a-radio value="day">{{ $t('sys.component.time.days') }}</a-radio>
            <a-radio value="hour">{{ $t('sys.component.time.hour') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>

      <a-form-item
        v-if="formState.syncType == 1"
        :label="$t('sys.bi.startTime')"
        name="beginTime"
        :rules="[
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.bi.startTime') }),
          },
        ]"
      >
        <a-date-picker
          :placeholder="$t('sys.appDesigner.pleaseSelect')"
          v-model:value="formState.beginTime"
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          show-time
          style="width: 210px !important"
          :disabledDate="
            (currentDate) => {
              // 单次定时任务今天之前的不能选，选择之前时间无意义
              return currentDate && currentDate < dayjs().startOf('day');
            }
          "
        />
      </a-form-item>

      <div class="flex">
        <a-form-item :label="$t('sys.bi.extractType')" name="extrType">
          <a-radio-group
            v-model:value="formState.extrType"
            name="radioGroup"
            :options="extrTypeOpts"
          />
        </a-form-item>

        <a-form-item label="" v-if="formState.extrType == 2" name="extrColumns" class="ml-20px">
          <span class="ant-form-text">{{ $t('sys.bi.accordingToField') }}</span>
          <a-select
            v-model:value="formState.extrColumns"
            mode="multiple"
            :options="colOptions"
            :placeholder="$t('sys.appDesigner.pleaseSelect')"
            style="width: 200px"
          />
          <span class="ant-form-text ml-8px">{{ $t('sys.bi.doIncrementExtract') }}</span>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';

  const { t } = useI18n();
  const ns = useNamespace('api-config-form');
  const emit = defineEmits(['handleDeploy', 'updateChange']);

  const props = defineProps<{
    connType?: 0 | 1;
    configData?: any[];
    modelConfig?: string;
  }>();

  const formRef = ref<FormInstance>();
  const isLoading = ref<boolean>(false);

  const formState = reactive({
    syncType: 0,
    taskFreqValue: 1,
    taskFreqUnit: 'day',
    beginTime: undefined,
    extrType: 0,
    extrColumns: undefined,
  });

  const colOptions = computed(() => {
    return props.configData?.map((i) => ({ label: i.originKey, value: i.fieldName }));
  });

  const extrTypeOpts = [
    { value: 0, label: t('sys.bi.fullCoverage') },
    { value: 1, label: t('sys.bi.fullAppend') },
    { value: 2, label: t('sys.bi.incrementExtract') },
  ];

  const handleRun = () => {
    emit('handleDeploy');
  };

  async function validate(): Promise<[]> {
    try {
      const result = await formRef.value?.validate();
      console.log('Table validation result:', result);
      return [];
    } catch (err) {
      console.error('Table validation failed:', err);
      return err?.errorFields || [];
    }
  }

  watch(
    () => formState,
    () => {
      const config = JSON.parse(props.modelConfig);
      config.extrColumns = config.extrColumns?.split(',');
      if (JSON.stringify(formState) !== JSON.stringify(config) && config.syncType) {
        emit('updateChange');
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.modelConfig,
    (v) => {
      if (v) {
        const config = JSON.parse(props.modelConfig);
        config.extrColumns = config.extrColumns?.split(',');
        Object.assign(formState, config);
      }
    },
    {
      immediate: true,
    },
  );

  function reset() {
    Object.assign(formState, {
      syncType: 0,
      taskFreqValue: 1,
      taskFreqUnit: 'day',
      beginTime: undefined,
      extrType: 0,
      extrColumns: undefined,
    });
  }

  defineExpose({
    formState,
    validate,
    reset,
  });
</script>

<style lang="scss" scoped>
  @include b(api-config-form) {
    padding: 16px;
    padding-bottom: 0;
    background: #fff;
    position: relative;
    @include e(run-btn) {
      position: absolute;
      z-index: 1;
      right: 12px;
      top: 16px;
      &.top32 {
        top: 24px;
      }
    }
  }
</style>
