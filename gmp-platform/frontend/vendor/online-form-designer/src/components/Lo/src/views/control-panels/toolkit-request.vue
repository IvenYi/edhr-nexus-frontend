<template>
  <a-form-item :label="t('服务模型')" name="model">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('服务模型') })"
      v-model:value="formState.model"
    >
      <a-select-opt-group v-for="mc in categoryModels" :key="mc.id" :label="mc.name">
        <a-select-option v-for="m in mc.children" :value="m.key" :key="m.key">{{
          m.name
        }}</a-select-option>
      </a-select-opt-group>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('业务服务')" name="service">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('业务服务') })"
      v-model:value="formState.service"
    >
      <a-select-option v-for="m in modelServices" :value="m.key" :key="m.key">{{
        m.name
      }}</a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('参数设置')" name="inputType">
    <a-radio-group v-model:value="formState.inputType" name="inputType">
      <a-radio value="variable">变量</a-radio>
      <a-radio value="custom">自定义</a-radio>
    </a-radio-group>
  </a-form-item>

  <control-property
    v-show="formState.inputType === 'variable'"
    name="inputVariable"
    :form-state="formState"
  />

  <a-form-item
    v-show="formState.inputType === 'custom'"
    :label="t('自定义参数')"
    name="inputParameter"
  >
    <a-button type="primary" block @click="handleEditJson">点击配置参数</a-button>
  </a-form-item>

  <a-form-item :label="t('响应设置')" name="resType">
    <a-radio-group v-model:value="formState.resType" name="resType">
      <a-radio :value="null">无</a-radio>
      <a-radio value="output">输出</a-radio>
    </a-radio-group>
  </a-form-item>

  <control-property
    v-show="formState.resType === 'output'"
    name="outputToVariable"
    :form-state="formState"
  />

  <request-json-modal @register="register" />
</template>

<script lang="ts" setup>
  import { computed, PropType, watch, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Control } from '../../types';
  import ControlProperty from '../control-property/index.vue';
  import { useModelFields } from '../../hooks/useModelFields';
  import type { BizServiceResponse } from '/@/apis/gct-apaas/model';
  import RequestJsonModal from '../modals/request-json-modal.vue';
  import { useModal } from '/@/components/Modal';

  const { t } = useI18n();
  const { categoryModels, getModelServices } = useModelFields();
  const [register, { openModal }] = useModal();

  const props = defineProps({
    formState: {
      type: Object as PropType<Control.ToolkitRequest>,
      default: () => ({}),
    },
  });

  const modelServices = ref<BizServiceResponse[]>([]);

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      Object.assign(props.formState, value);
    },
  });

  watch(
    () => props.formState.model,
    async (value) => {
      if (!value) return;
      modelServices.value = (await getModelServices(value)) as BizServiceResponse[];
      if (modelServices.value.find((item) => item.key === props.formState.service) === undefined) {
        // 切换模型的时候如果不存在当前服务 则清空
        Object.assign(props.formState, { service: undefined });
      }
    },
    {
      immediate: true,
    },
  );

  const handleEditJson = () => {
    openModal(true, {
      data: props.formState.inputParameter,
      callback: (inputParameter) => {
        Object.assign(props.formState, {
          inputParameter,
        });
      },
    });
  };
</script>

<style lang="less" scoped></style>
