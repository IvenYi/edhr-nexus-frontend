<template>
  <div :class="[ns.b()]">
    <a-form
      ref="formRef"
      :model="data"
      :class="[ns.b()]"
      :label-col="{ style: { width: '150px' } }"
    >
      <a-tabs class="h-full" v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.model.basicInfo')">
          <BasicInfo :data="props.appData" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.integration.authSetting')">
          <div class="h-full flex flex-col">
            <BasicForm :data="props.data" :disabled="activeStep === 1" />
            <template v-if="data.authMode === AuthModeEnum.ACCESS_TOKEN">
              <StepIndicator :value="activeStep" />
              <AuthFieldsForm
                :class="ns.e('step-form')"
                v-if="activeStep === 3"
                :data="data"
                @prev="onPrev"
                @next="onNext"
              />
              <AuthParamsForm
                :class="ns.e('step-form')"
                v-if="activeStep === 0"
                :data="data"
                @prev="onPrev"
                @next="onNext"
              />
              <AuthDebugForm
                :class="ns.e('step-form')"
                v-if="activeStep === 1"
                :data="data"
                @prev="onPrev"
                @close="onClose"
              />
            </template>
            <template v-else-if="data.authMode === AuthModeEnum.AD">
              <div>
                <a-divider style="border-color: #f0f0f0">{{
                  t('sys.integration.adDomainConfig')
                }}</a-divider>
              </div>
              <AdFieldsForm :data="data" @save="onSaveAndExit" />
            </template>
            <template v-else-if="data.authMode === AuthModeEnum.SAP_RFC">
              <div>
                <a-divider style="border-color: #f0f0f0">{{
                  t('sys.integration.rfcConnConfig')
                }}</a-divider>
              </div>
              <RfcFieldsForm :data="data" @save="onSaveAndExit" />
            </template>
            <template v-else>
              <div :class="[ns.e('footer')]">
                <a-button type="primary" @click="onSaveAndExit">
                  {{ t('sys.saveText') }}
                </a-button>
              </div>
            </template>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="connector-designer">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref } from 'vue';
  import BasicInfo from './basic-info.vue';
  import BasicForm from './basic-form.vue';
  import StepIndicator from './step-indicator.vue';
  import AuthFieldsForm from './auth-fields-form.vue';
  import { FlowAppResponse } from '/@/apis/gct-ipaas2/model';
  import AuthParamsForm from './auth-params-form.vue';
  import { FormInstance } from 'ant-design-vue';
  import { IConnectorDesignerData } from './type';
  import AuthDebugForm from './auth-debug-form.vue';
  import { AuthModeEnum } from '../../../../enums';
  import { getController } from './logic';
  import AdFieldsForm from './ad-fields-form.vue';
  import RfcFieldsForm from './rfc-fields-form.vue';

  const { t } = useI18n();
  const ns = useNamespace('connector-designer');
  const activeKey = ref<'1' | '2'>('2');
  const activeStep = ref<number>(0);
  const formRef = ref<FormInstance>();
  const c = getController();

  const props = withDefaults(
    defineProps<{
      appData: FlowAppResponse;
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const onPrev = () => {
    console.log('onPrev');
    activeStep.value -= 1;
  };

  const onNext = () => {
    console.log('onNext');
    activeStep.value += 1;
  };

  const onClose = () => {
    emit('close');
  };

  const validate = async () => {
    await formRef.value?.validate();
  };

  const onSaveAndExit = async () => {
    await c.createOrUpdate(props.data);
    onClose();
  };

  defineExpose({
    validate,
  });
</script>

<style lang="scss" scoped>
  $connector-designer: ();

  @include b(connector-designer) {
    @include set-component-css-var(connector-designer, $connector-designer);

    @include e(header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    @include e(step-form) {
      flex: 1;
      height: 1px;
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      margin-top: auto;
      gap: 16px;
    }

    width: 100%;
    height: 100%;
    background: #fff;

    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
</style>
