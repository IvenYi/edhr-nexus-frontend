<template>
  <a-modal
    v-model:visible="visible"
    :title="modalInfo?.props?.modalTitle"
    :width="modalInfo?.props?.modalWidth"
    @ok="handleOk"
  >
    <form-render
      v-if="visible"
      ref="formRef"
      :widget="modalInfo?.children[0].children[0] as Form"
      v-slot="{ formState, children }"
    >
      <Widget :widgetlist="widgetList!" :formData="formState" />

      <a-form-item v-if="preNodeField">
        <template #label>
          <span :title="preNodeField.props.label" class="pl1px">
            {{ preNodeField?.alias || preNodeField?.props?.label }}
          </span>
          <a-tooltip v-if="!!preNodeField.props.showExplain">
            <template #title> {{ preNodeField.props.explain }}</template>
            <info-circle-outlined class="explain-icon ml5px" />
          </a-tooltip>
        </template>
        <a-select
          v-model:value="preNodeValue"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择"
          :options="nodeOptions"
        />
      </a-form-item>
    </form-render>
  </a-modal>
</template>
<script setup lang="ts" name="nodes-modal">
  import { ref, reactive, computed } from 'vue';
  import Widget from '/@web-render/render/widget/index.vue';
  import FormRender from '../../../basic/form/form-render.vue';
  import { Form } from '/@page-designer/types/web';
  import { LowCodeModal } from '/@/projects/page-designer/src/types/modal-types';
  import { reject } from 'lodash-es';
  import { WorkflowNodeTypeEnum } from '../component/types';

  const emit = defineEmits(['ok']);
  const props = defineProps<{
    nodeInfo: any;
    modalInfo: LowCodeModal.Modal | undefined;
  }>();

  const widgetList = computed(() => {
    const formFields = props.modalInfo?.children[0]?.children[0]?.children ?? [];
    return getShowFields(formFields);
  });

  const preNodeField = computed(() => {
    const formFields = props.modalInfo?.children[0]?.children[0]?.children ?? [];
    return formFields.find((it) => it.props.field === 'pre_node_ids_');
  });
  // const preNodeVisible = computed(() => {
  //   const formValue = formRef.value.getValue();
  //   const { early_exec_: earlyExec } = formValue;
  //   return preNodeField.value && earlyExec;
  // });

  const visible = ref(false);
  const formRef = ref();
  const options: {
    validator?: (any) => boolean;
  } = reactive({
    validator: undefined,
  });
  const modelProps = reactive<{
    nodeData: object | null;
    modelData: Array<any>;
  }>({
    nodeData: null,
    modelData: [],
  });
  const nodeOptions = computed(() => {
    const nodeSpecData = (modelProps.modelData ?? []).filter(
      (it) =>
        it.type_ === WorkflowNodeTypeEnum.NODE_SPEC &&
        it.node_id_ !== modelProps?.nodeData?.node_id_ &&
        !it.deleted_,
    );
    return nodeSpecData.map((op) => {
      return {
        label: op.name_,
        value: op.node_id_,
        id: op.id_,
      };
    });
  });
  const preNodeValue = computed({
    get() {
      const formValue = formRef.value.getValue();
      let value = formValue?.pre_node_ids_;
      return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
    },
    set(v) {
      formRef.value.addValue({
        pre_node_ids_: v.join(',') ?? null,
      });
    },
  });

  const open = async (data?, modelValue?, opts = {}) => {
    visible.value = true;
    Object.assign(options, opts);
    modelProps.nodeData = data;
    modelProps.modelData = modelValue;
    await formRef.value?.reset();
    if (data) {
      await formRef.value.setValue({ ...data, node_config_: null });
    }
  };

  const getShowFields = (list) => {
    // 前置节点需自定义
    const allFields = list.filter((f) => f.props.field !== 'pre_node_ids_');
    const linkInfo = props.nodeInfo?.link_;
    /**
     * 并行工艺不允许设置[early_exec_：提前执行]; [optional_exec_：可选执行]; [re_exec_：重新执行]; [pre_node_ids_: 前置节点]
     * TODO: 这里应该最后能设置显隐规则控制字段
     * */
    if (linkInfo) {
      const _linkInfo = JSON.parse(linkInfo);
      const isParallelism = _linkInfo?.nextParallels || false;
      const isMain = _linkInfo?.next && _linkInfo?.prev;

      if (isMain) {
        return reject(allFields, (field) =>
          ['early_exec_', 'optional_exec_'].includes(field.props.field),
        );
      }

      return isParallelism
        ? allFields
        : reject(allFields, (field) =>
            ['early_exec_', 'optional_exec_', 're_exec_'].includes(field.props.field),
          );
    }
    return allFields;
  };

  const handleOk = async () => {
    await formRef.value.validate();
    const formValue = formRef.value.getValue();
    if (options.validator && typeof options.validator === 'function') {
      const isValid = await options.validator(formValue);
      if (!isValid) return;
    }
    visible.value = false;
    emit('ok', formValue);
  };

  defineExpose({ open });
</script>
<style lang="less" scoped>
  .explain-icon {
    color: var(--ant-primary-color) !important;
  }
</style>
