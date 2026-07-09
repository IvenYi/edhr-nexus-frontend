<template>
  <a-form-item
    ref="workflowStepRef"
    v-if="!(widget.props.usage == 'em_txn_move&&next' && dataSource.length == 0)"
    :name="field"
    :label="labelName"
    :rules="{
      required: required,
      message: labelName + t('sys.pageDesigner.cannotBeEmpty'),
    }"
  >
    <a-select v-if="!readonly" :disabled="disabled" v-model:value="value" @change="changeStep">
      <a-select-option v-for="item in dataSource" :value="item.id_" :item="item">{{
        item.name_
      }}</a-select-option>
    </a-select>
    <span v-else>{{ dataSource.find((d) => d.id_ === value)?.name_ }}</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-workflow-step-select">
  import { computed, nextTick, onMounted, ref, toRef, toRefs, watch } from 'vue';
  import { IWorkflowStepSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const workflowStepRef = ref();
  //
  const props = defineProps<{
    modelValue?: string;
    widget: IWorkflowStepSelect;
    formData: Object;
  }>();
  const {
    refSearch,
    refSearchField,
    readonly,
    disabled,
    refForm,
    refFormField,
    refSearchForm,
    required,
    field,
  } = toRefs(props.widget?.props);
  const refFormData = toRef(() => {
    const data: any = {};
    data[refFormField.value] = formMap.value[refForm.value]?.[refFormField.value];
    return data;
  });
  const labelName = computed(() => {
    const map = {
      'em_txn_move&&next': t('sys.kit.nextStep'),
      'em_txn_rework&&next': t('sys.kit.reworkStep'),
    };
    return map[props.widget.props.usage!]
      ? map[props.widget.props.usage!]
      : t('sys.kit.currentStep');
  });
  const value = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
      workflowStepRef.value?.onFieldChange();
    },
  });
  const dataSource = ref<any[]>([]);
  const changeStep = async (val, opt) => {
    const { item } = opt;
    if (props.widget.props.usage.indexOf('next') === -1) {
      const changeData = {};
      refSearchField.value.forEach((key) => {
        changeData[key] = item[key];
      });

      const { data: operationData } = await loadOperationBySpec(item?.spec_id_);
      const searchFormValue = Event.getComponent(refSearch.value)?.getValue();
      (Event.getComponent(refSearch.value) as any).addValue({
        ...changeData,
        workflow_step_id_: val,
        operation_id_: operationData?.operation_id_ || searchFormValue?.operation_id_,
      });
    }
    Event.runEventByName('onChange', props.widget.events, val, item);
  };

  async function loadOperationBySpec(specId) {
    try {
      const res = await Event.context.$customBizService.get(
        {
          action: 'rdoGetVersionById',
          key: 'em_spec',
        },
        {
          id: specId,
        },
      );
      return res;
    } catch (err) {
      return {}
    }
  }
  onMounted(async () => {
    await nextTick();
    getBodyBySearchComponent(refSearch.value);
  });
  async function getBodyBySearchComponent(key: string) {
    /**注册事件到批次搜索组件 */
    // Event.resetSearchs(key);
    Event.initSearchs(key, queryStep, props.widget.id);
  }
  async function queryStep({ id_ }) {
    const useArr = props.widget.props.usage!.split('&&');
    if (useArr[1] === 'next' && !refFormData.value[refFormField.value]) {
      return;
    }
    Event.context.$customBizService
      .get(
        {
          action: `biz_${useArr[1]}_workflow_steps`,
          key: useArr[0],
        },
        {
          txn_subject_id_: id_,
          ...refFormData.value,
        },
      )
      .then((res) => {
        dataSource.value = res;
        if (useArr[1] === 'current' && dataSource.value.length) {
          //会去和当前批次上的工艺/工步匹配 匹配上的话就会选中 匹配不上就默认选中第一个
          const defaultStep =
            dataSource.value.find((d) => {
              return (
                d.spec_id_ === (Event.getComponent(refSearch.value) as any).getValue().spec_id_
              );
            }) || dataSource.value[0];
          value.value = defaultStep?.id_;
          changeStep(defaultStep?.id_, { item: defaultStep });
        }
        Event.runEventByName('onMounted', props.widget.events, 'success');
      })
      .catch((err) => {
        Event.runEventByName('onMounted', props.widget.events, 'error');
      });
  }

  watch(
    () => refFormData.value,
    () => {
      console.log(refFormData.value, refFormData.value[refForm.value], 'refFormData.value');
      formMap.value[refSearchForm.value] && queryStep(formMap.value[refSearchForm.value]);
    },
    { deep: true },
  );
  defineExpose({
    reload({ id_ }) {
      queryStep({
        id_,
      });
    },
  });
</script>

<style scoped></style>
