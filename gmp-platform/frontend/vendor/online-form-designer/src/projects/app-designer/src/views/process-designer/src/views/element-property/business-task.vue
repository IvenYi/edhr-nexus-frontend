<template>
  <a-form-item :label="t('业务处理')" :rules="[{ required: true }]">
    <!-- <a-input v-model:value="formState.service" /> -->
    <a-button block type="primary" :ghost="!formState.service" @click="handleOpenModal">{{
      formState.service ? t('修改服务') : t('添加服务')
    }}</a-button>
  </a-form-item>
  <!-- <service-modal /> -->
</template>

<script lang="ts" setup>
  import { computed, watch, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useWidgetPicker } from '../../hooks/useWidgetPicker';
  // import { widgetActions } from '../../schema/widgetActions';
  // import { FormComponents } from '/@page-designer/enum';
  import { UserType, TaskMode, BpmnNode, RollbackRule } from '../../types';
  import { JUEL_PRESET } from '../../constants';
  // import ControlProperty from '../control-property/index.vue';
  import { useBpmn } from '../../hooks/useBpmn';

  const { t } = useI18n();
  const { setProperties } = useBpmn();
  const openServiceModal = inject('openServiceModal') as Function;

  const props = defineProps<{
    id: string;
    formState: BpmnNode.BusinessTask;
  }>();

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
    },
  });

  watch(
    () => props.formState,
    (value) => {
      console.log(value);
      setProperties(props.id, value);
    },
    {
      deep: true,
    },
  );

  const handleOpenModal = () => {
    openServiceModal(true, {
      data: props.formState.service,
      callback: (value) => {
        console.log(value);
        formState.value.service = value;
      },
    });
  };
</script>

<style lang="less" scoped></style>
../../hooks/useBpmnDesigner
