<template>
  <a-form-item
    ref="workflowStepRef"
    :name="field"
    :label="label"
    :rules="{
      required: required,
      message: label + t('sys.pageDesigner.cannotBeEmpty'),
    }"
  >
    <a-select v-if="!readonly" :disabled="disabled" v-model:value="fieldValue" @change="changeStep">
      <a-select-option v-for="item in dataSource" :value="item.id_" :item="item" :key="item.id_">
        {{ item.name_ }}
      </a-select-option>
    </a-select>
    <span v-else>{{ dataSource.find((d) => d.id_ === fieldValue)?.name_ }}</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-workflow-step-select">
  import { ref, computed, toRef, reactive, watch } from 'vue';
  import type { IWorkflowStepSelect } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: IWorkflowStepSelect;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );
  const {
    required,
    disabled,
    readonly,
    label,
    field,
    currentField,
    txnType,
    refSearchForm,
    refContainerField,
  } = reactive(props.widget.props);

  const refFormData = toRef(() => {
    const data: any = {};
    if (refSearchForm) {
      data.txn_subject_id_ = formMap.value[refSearchForm]?.[refContainerField];
      if (currentField) {
        data.workflow_step_id_ = formMap.value[refSearchForm]?.[currentField];
      }
    }
    return data;
  });

  const dataSource = ref([]);

  const emit = defineEmits(['update:modelValue']);

  const workflowStepRef = ref();

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue || undefined;
          return value;
        },
        set(value: string[]) {
          emit('update:modelValue', value);
          workflowStepRef.value?.onFieldChange();
        },
      })
    : ref();

  watch(
    () => refFormData.value,
    async () => {
      let needQueryFlag = true;
      //如果关联的值为空 则不用查询
      if (
        !formMap.value[refSearchForm]?.[refContainerField] ||
        (currentField && !formMap.value[refSearchForm]?.[currentField])
      ) {
        needQueryFlag = false;
      }
      if (needQueryFlag) {
        await getTableData();
      } else {
        dataSource.value = [];
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  async function getTableData(queryParam = {}) {
    const step = currentField ? 'next' : 'current';
    const param = Object.assign(
      {
        ...refFormData.value,
      },
      queryParam,
    );
    Event.context.$customBizService
      .get(
        {
          action: `biz_${step}_workflow_steps`,
          key: txnType,
        },
        {
          ...param,
        },
      )
      .then((res) => {
        dataSource.value = res ?? [];
        Event.runEventByName('onMounted', props.widget.events, 'success');
        //当前工步：会去和当前批次上的工艺/工步匹配 匹配上的话就会选中 匹配不上就默认选中第一个
        if (currentField || !dataSource.value?.length) return;

        const defaultStep: any =
          dataSource.value.find((d: any) => {
            return d.spec_id_ === (Event.getComponent(refSearchForm) as any).getValue().spec_id_;
          }) || dataSource.value[0];
        fieldValue.value = defaultStep?.id_;
        changeStep(defaultStep?.id_, { item: defaultStep });
      })
      .catch(() => {
        dataSource.value = [];
        Event.runEventByName('onMounted', props.widget.events, 'error');
      });
  }

  // 当工步使用场景为非下一站时，更新工步的值的同时，需要同步更新批次查询的展示信息
  async function changeStep(val, opt) {
    const currentValue = opt?.item as any;
    if (!currentField) {
      try {
        const { id_: workflow_step_id_, name_: workflow_step_name_, spec_id_ } = currentValue;
        const { data: specData, dict } = await Event.context.$customBizService.get(
          {
            action: 'rdoGetVersionById',
            key: 'em_spec',
          },
          {
            id: spec_id_,
          },
        );
        const originData = {
          workflow_step_id_,
          spec_id_,
          operation_id_: specData?.operation_id_,
        };
        const dictData = {
          workflow_step_id_: {
            [workflow_step_id_]: workflow_step_name_,
          },
          spec_id_: {
            [spec_id_]: specData.name_ + ':' + specData.version_,
          },
          ...dict,
        };
        const searchForm: any = await Event.getSyncComponent(refSearchForm);
        searchForm?.addValue?.(originData, dictData);
      } catch (err) {
        console.error(err, '工步切换报错！！！');
      }
    }
    const { item } = opt;
    Event.runEventByName('onChange', props.widget.events, val, item);
  }

  defineExpose({
    getValue() {
      return fieldValue.value;
    },
    setValue(value) {
      fieldValue.value = value;
    },
    reload(params?) {
      getTableData(params);
    },
  });
</script>

<style scoped></style>
