<template>
  <vantField
    v-if="isNextShow"
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    readonly
    clearable
    :isLink="!fieldValue"
    @clearValue="handleClear"
    @click="openView"
  >
    <template #input v-if="fieldValue">
      <FieldSelect v-bind="separatorAttr" v-model:value="fieldValue" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-workflow-step-select">
  import { ref, computed, toRef, reactive, toRaw, watch } from 'vue';
  import type { IWorkflowStepSelect } from './schema';
  import { getPageEvent, type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import vantField from '/@page-designer/components/widgets/mobile/__components__/vantField.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';

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

  const { label, field, currentField, txnType, refSearchForm, refContainerField, defaultSelected } =
    reactive(props.widget.props);

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

  const checkeOpts = ref<RetrunList[]>([]);

  const dataSource = ref([]);

  const emit = defineEmits(['update:modelValue']);

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue || undefined;
          return value;
        },
        set(value: string[]) {
          emit('update:modelValue', value);
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

  watch(
    () => dataSource.value,
    (val) => {
      if (val?.length) {
        if (defaultSelected) {
          let data =
            dataSource.value.find((d) => {
              return d.spec_id_ === formMap.value[refSearchForm]?.spec_id_;
            }) || dataSource.value[0];
          checkeOpts.value = [
            {
              label: data.name_,
              value: data.id_,
              _item: data,
            },
          ];
          fieldValue.value = data.id_;
          Event.runEventByName('onChange', props.widget.events, data.id_, checkeOpts.value);
          handleChange();
        }
      }
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
      })
      .catch(() => {
        dataSource.value = [];
        Event.runEventByName('onMounted', props.widget.events, 'error');
      });
  }

  async function openView() {
    const { openListPopup } = createListPopup({
      api: undefined,
      options: dataSource.value.map((n) => {
        return {
          label: n.name_,
          value: n.id_,
          _item: n,
        };
      }),
      title: label,
      fieldKey: field,
    });
    openListPopup({
      ids: fieldValue.value,
      callback({ a, checkOptions }) {
        fieldValue.value = a;
        checkeOpts.value = checkOptions;
        Event.runEventByName('onChange', props.widget.events, a, checkeOpts.value);
        handleChange();
      },
    });
  }

  const separatorAttr = computed(() => {
    return {
      disabled: false,
      fieldType: 'ref',
      isLinkageMode: false,
      multiple: false,
      readonly: true,
      refModelType: 'NDO',
      options: dataSource.value.map((n) => {
        return {
          label: n.name_,
          value: n.id_,
          _item: n,
        };
      }),
    };
  });

  async function handleClear() {
    emit('update:modelValue', null);
    fieldValue.value = '';
    Event.runEventByName('onChange', props.widget.events, '');
    Event.runEventByName('afterClear', props.widget.events);
  }

  // 当工步使用场景为非下一站时，更新工步的值的同时，需要同步更新批次查询的展示信息
  async function handleChange() {
    const currentValue = checkeOpts.value?.[0]?._item as any;
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
  }

  const isNextShow = computed(() => {
    return !currentField || (currentField && dataSource.value?.length);
  });
</script>

<style scoped></style>
