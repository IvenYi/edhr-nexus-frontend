<template>
  <dHeaderLayout :modelValue="step" @update:modelValue="updateValue">
    <template #left>
      <div>
        <left-outlined @click="out" class="primary-gct-hover" />
        <span class="inline-block ml16px">数据迁移</span>
      </div>
    </template>
    <template #right>
      <div>
        <a-button type="primary" @click="next" v-if="step === StateEnum.Tab1">下一步</a-button>
        <a-button type="primary" @click="submit" v-else>确认迁移</a-button>
      </div>
    </template>
    <template #tab1>
      <div class="bg-[#fff] ml120px mr120px h100% pt40px">
        <a-form
          ref="refForm"
          :model="formState"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 8 }"
          autocomplete="off"
        >
          <a-form-item
            label="应用选择"
            name="appId"
            :rules="[{ required: true, message: '请选择应用' }]"
          >
            <a-select
              showSearch
              optionFilterProp="label"
              placeholder="请选择"
              ref="select"
              v-model:value="formState.appId"
              @change="changeApp"
              :options="appOptions"
            />
          </a-form-item>
          <a-form-item
            label="源环境"
            name="sourceEnv"
            :rules="[{ required: true, message: '请选择源环境' }]"
          >
            <a-select
              showSearch
              optionFilterProp="label"
              placeholder="请选择"
              v-model:value="formState.sourceEnv"
              @change="changeEnv"
              :options="sourceOption"
            />
          </a-form-item>
          <a-form-item
            label="目标环境"
            name="destEnv"
            :rules="[{ required: true, message: '请选择目标环境' }]"
          >
            <a-select
              showSearch
              optionFilterProp="label"
              placeholder="请选择"
              v-model:value="formState.destEnv"
              :options="desOption"
            />
          </a-form-item>
        </a-form>
      </div>
    </template>
    <template #tab2>
      <dSelectData
        :appId="formState.appId!"
        :suiteKey="formState.suiteKey"
        ref="refSelect"
        v-if="formState.appId && formState.sourceEnv"
        :key="formState.appId + formState.sourceEnv"
      />
    </template>
  </dHeaderLayout>
</template>
<script setup lang="ts">
  import { StateEnum } from './const';
  import { IModal } from '@gct/runtime';
  import dHeaderLayout from './component/d-header-layout.vue';
  import dSelectData from './component/dSelectData/index.vue';
  import { ref, reactive, onMounted, provide } from 'vue';
  import { getAppDatamoveApps, getAppListBranchByAppId } from '/@/apis/gct-platform/AppController';
  import { postDatasourceMoveMove } from '/@/apis/gct-platform/DatasourceMoveController';
  import { message } from 'ant-design-vue';

  const step = ref<StateEnum>(StateEnum.Tab1);
  const refForm = ref();
  const refSelect = ref();
  const defProps = defineProps<{
    modal: IModal;
  }>();

  const appOptions = ref([]);
  const branchId = ref();

  const sourceOption = [
    {
      value: 'dev',
      label: $t('sys.integration.env.dev'),
    },
    {
      value: 'test',
      label: $t('sys.integration.env.test'),
    },
  ];
  const desOption = [
    {
      value: 'test',
      label: $t('sys.integration.env.test'),
    },
    {
      value: 'prod',
      label: $t('sys.integration.env.prod'),
    },
  ];
  const formState = reactive({
    appId: undefined,
    suiteKey: undefined,
    destEnv: undefined,
    sourceEnv: undefined,
    branchId: '',
  });

  provide('sourceEnv', formState);
  provide('branchId', branchId);
  async function next() {
    await refForm.value.validate();
    if (formState.destEnv === formState.sourceEnv) {
      message.info('源环境和目标环境不能相同');
      return;
    }
    step.value = StateEnum.Tab2;
  }
  async function submit() {
    const detailList = refSelect.value.getSelectData();
    const data = {
      appId: formState.appId,
      branchId: formState.sourceEnv === 'dev' ? branchId.value : '',
      sourceEnv: formState.sourceEnv,
      destEnv: formState.destEnv,
      detailList,
    };
    if (!detailList.length) {
      message.info('请选择要迁移的数据');
      return;
    }
    await postDatasourceMoveMove(data);
    message.success('新建迁移任务成功');
    out();
  }
  function out() {
    defProps.modal.dismiss({ ok: true });
  }
  function updateValue(v) {
    if (!formState.appId) return;
    step.value = v;
  }

  function changeApp(value, option) {
    branchId.value = '';
    getAppListBranchByAppId({ appId: value }).then((res) => {
      branchId.value = res.find((i) => i.head).id;
    });

    formState.sourceEnv = undefined;
    formState.destEnv = undefined;
    formState.suiteKey = option.suiteKey;
  }

  onMounted(async () => {
    const data = await getAppDatamoveApps();
    appOptions.value = data.map((i) => {
      return { value: i.id, label: i.name, suiteKey: i.suiteKey };
    });
  });
</script>
