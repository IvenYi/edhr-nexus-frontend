<template>
  <a-form class="query-select-form" ref="formRef" :model="formState" autocomplete="off">
    <a-row :gutter="24">
      <a-col :span="8">
        <a-form-item name="fullname" :label="t('sys.fullname')">
          <a-input
            v-model:value="formState.fullname"
            :placeholder="t('sys.inputText')"
            @pressEnter="handleSearch"
          />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item name="username" :label="t('sys.userName')">
          <a-input
            v-model:value="formState.username"
            :placeholder="t('sys.inputText')"
            @pressEnter="handleSearch"
          />
        </a-form-item>
      </a-col>

      <a-col v-if="!isIndependentApp" :span="8" :hidden="hideKeys?.includes('enabled')">
        <a-form-item name="enabled" :label="t('sys.status')">
          <a-select v-model:value="formState.enabled" :placeholder="t('sys.chooseText')">
            <a-select-option :value="UserEnabledEnum.ALL">{{ t('sys.all') }}</a-select-option>
            <a-select-option :value="UserEnabledEnum.UN_ENABLE">
              {{ t('sys.developer.appCenter.notEnabled') }}
            </a-select-option>
            <a-select-option :value="UserEnabledEnum.ENABLE">
              {{ t('sys.developer.appCenter.enabled') }}
            </a-select-option>
            <a-select-option :value="UserEnabledEnum.UN_ACTIVE">
              {{ t('sys.app.status.INACTIVE') }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item name="mobile" :label="t('sys.mobile')" :rules="[{ type: 'number' }]">
          <a-input-number
            style="width: 100%"
            v-model:value="formState.mobile"
            :placeholder="t('sys.inputText')"
            @pressEnter="handleSearch"
            :controls="false"
          />
        </a-form-item>
      </a-col>
      <a-col :span="8" :hidden="hideKeys?.includes('createTime')">
        <a-form-item name="createTime" :label="t('sys.createTime')">
          <a-range-picker
            style="width: 100%"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="[t('sys.startTime'), t('sys.endTime')]"
            v-model:value="formState.createTime"
          />
        </a-form-item>
      </a-col>
      <a-col :span="8" :hidden="hideKeys?.includes('email')">
        <a-form-item name="email" :label="t('sys.email')">
          <a-input v-model:value="formState.email" :placeholder="t('sys.inputText')" />
        </a-form-item>
      </a-col>
      <a-col :span="spanOffset" style="text-align: right">
        <a-button @click="resetFields">
          <template #icon>
            <undo-outlined />
          </template>
          {{ t('sys.reset') }}
        </a-button>
        <a-button style="margin: 0 0 0 8px" type="primary" @click="handleSearch">
          <template #icon>
            <search-outlined />
          </template>
          {{ t('sys.query') }}
        </a-button>
      </a-col>
    </a-row>
  </a-form>
</template>
<script setup lang="ts" name="query-select">
  import { ref, reactive, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UserEnabledEnum } from '../constant/interface';
  import { QueryDto } from '../types/index.d';
  import { useDeploySetting } from '@/hooks/platform/useDeploySetting';

  const { t } = useI18n();
  const { isIndependentApp } = useDeploySetting();

  const props = defineProps<{
    /** 是否隐藏选项 */
    hideKeys?: string[];
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<QueryDto>({
    fullname: '',
    username: '',
    createTime: [],
    enabled: UserEnabledEnum.ALL,
    email: '',
    mobile: '',
  });

  const emit = defineEmits(['on-notify']);

  const spanOffset = computed(() => {
    return (Number(props.hideKeys?.length || 0) + Number(isIndependentApp.value)) * 8;
  });

  const resetFields = () => {
    formRef?.value?.resetFields();
    emit('on-notify', { key: 'request-data', status: 'search-data' });
  };

  const handleSearch = () => {
    formRef.value?.validate().then(() => {
      emit('on-notify', { key: 'request-data', status: 'search-data' });
    });
  };

  defineExpose({ formState });
</script>

<style lang="less" scoped>
  .query-select-form.ant-form {
    :deep(.ant-form-item) {
      margin-bottom: 16px;
    }
  }
</style>
