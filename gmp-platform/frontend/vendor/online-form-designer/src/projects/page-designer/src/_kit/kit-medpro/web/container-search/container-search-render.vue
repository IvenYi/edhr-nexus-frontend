<template>
  <div class="bg-[#fff] px-4 py-3 border-rd">
    <a-form ref="containerSearchRef" :model="searchFormState" class="w-full flex items-center">
      <a-form-item
        :label="widget.props.title"
        name="selectedVal"
        :required="defProps.widget.props.required"
        :rules="[{ required: defProps.widget.props.required, trigger: 'change' }]"
        :style="
          computedShowWorkflow && computedWorkflowId ? 'width:95%;margin-right:10px' : 'width:100%'
        "
      >
        <SelectSearch
          class="flex-1"
          ref="selectSearch"
          v-model:modelValue="searchFormState.selectedVal"
          :widget="widget"
          :extra="{
            dropdownMatchSelectWidth: true,
            maxHeight: webRenderHeight,
          }"
          @update:modelValue="updateSelectVal"
          @selected="selectRow"
          @clear="handleClear"
          @afterQuery="handleAfterQuery"
          @beforeQuery="handleBeforeQuery"
        />
      </a-form-item>
      <a-button
        type="link"
        ghost
        :title="t('sys.kit.medPro.showWorkflow')"
        v-if="computedShowWorkflow && computedWorkflowId"
        @click="showWorkflow"
      >
        <template #icon>
          <SvgIcon name="WORKFLOW-view" size="24" />
        </template>
      </a-button>
    </a-form>

    <div class="results-field-container px-2">
      <form-render
        :id="containerId"
        class="results-field-form"
        ref="formRef"
        :widget="widget.children[1]"
        v-slot="{ formState }"
      >
        <div class="grid" :style="{ 'grid-template-columns': `repeat(${rowLength ?? 5}, 1fr)` }">
          <widgetItem
            v-for="widget in showFields"
            :key="widget.id"
            :widget="widget"
            :formData="formState"
          >
            <div class="flex results-field__custom">
              <span class="mr-2">{{ widget.alias }}：</span>
              <a-tooltip>
                <template #title> {{ formateFiled(formState, widget) }}</template>
                <div class="max-w-full">{{ formateFiled(formState, widget) }}</div>
              </a-tooltip>
            </div>
          </widgetItem>
        </div>
      </form-render>

      <div
        class="results-field__trigger cursor-pointer"
        v-if="showTrigger"
        @click="showMore = !showMore"
      >
        <span class="mr-1">{{ showMore ? t('sys.collapse') : t('sys.unfold') }}</span>
        <up-outlined v-if="showMore" />
        <down-outlined v-else />
      </div>
    </div>

    <a-modal v-model:visible="workflowModalOpen" title="查看工作流" width="80%" :footer="null">
      <WorkflowNodesRender
        v-if="computedWorkflowId"
        ref="WorkflowNodesRef"
        v-model:model-value="workflowModelValue"
        :widget="workflowWidget"
        :form-data="{ id_: computedWorkflowId }"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="gct-container-search">
  import { uniqueId } from 'lodash-es';
  import { ref, reactive, nextTick, computed, onMounted, toRaw } from 'vue';
  import { IContainerSearch } from './schema';
  // @ts-ignore
  import SelectSearch from './component/select-search.vue';
  import widgetItem from '../../component/web/container-form-item.vue';
  // @ts-ignore
  import FormRender from '/@page-designer/components/widgets/web/basic/form/form-render.vue';
  // @ts-ignore
  import WorkflowNodesRender from '/@page-designer/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';
  import { insetDep } from '/@/projects/web-render/src/render/Event/Dependency/controller';
  import { ReturnTypeEnum } from '/@/components/Expression/types';
  import { FormComponents } from '@gct/runtime';
  import { SvgIcon } from '/@/components/Icon';

  const { t } = useI18n();
  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IContainerSearch }>();
  const formRef = ref();
  const selectSearch = ref();
  const containerSearchRef = ref();
  const searchFormState = reactive<{ [key: string]: any }>({
    selectedVal: undefined,
  });
  const showMore = ref<boolean>(false);
  const containerId = uniqueId('results-field-form');
  const webRenderHeight = ref<number>(400);

  const { maxLength, rowLength, txnType } = toRaw(defProps.widget.props);

  const fieldWidgets = computed(() => {
    return defProps.widget.children![1]?.children ?? [];
  });

  const workflowWidget = ref();
  const workflowModelValue = ref();
  const workflowModalOpen = ref<boolean>(false);

  const showTrigger = computed(() => {
    return (
      Number(fieldWidgets.value?.length > rowLength) ||
      Number(fieldWidgets.value?.length) > maxLength
    );
  });

  const showFields = computed(() => {
    const maxNum = Math.min(rowLength, maxLength);
    return showTrigger.value && !showMore.value
      ? fieldWidgets.value.slice(0, maxNum)
      : fieldWidgets.value.slice();
  });

  const computedShowWorkflow = computed(() => {
    return ['em_txn_move', 'em_txn_move_in'].includes(txnType);
  });

  const computedWorkflowId = computed(() => {
    return formRef.value?.getValue()?.workflow_id__ri_ ?? '';
  });

  function formateFiled(formState, field) {
    const fieldKey = field?.props.field;
    const fieldId = formState[fieldKey];
    if (field.type === FormComponents.DataTableFormula) {
      insetDep({ expression: field?.props?.formula, rowData: formState }, (res) => {
        if (res === undefined || res === null) {
          res = '';
        }
        if (field.props.fieldType === ReturnTypeEnum.Boolen) {
          res = res ? defProps.widget.props?.truelabel : defProps.widget.props?.falselabel;
        }
        formState[fieldKey] = res + '';
      });
    }
    const fieldValue = formState?._DICT?.[fieldKey]?.[fieldId] || fieldId;
    return fieldValue?.toString() || '';
  }

  function updateSelectVal(value) {
    searchFormState.selectedVal = value;
  }

  function selectRow(record) {
    formRef.value?.setValue({});
    formRef.value?.setValue({ ...record }, record?._DICT);
    Event.runEventByName('afterSelect', defProps.widget.events, record);
    /** 其他组件可以通过注册时间来相应批次信息变动触发组件查询逻辑 */
    Event.runTableBySearch(defProps.widget.id, record);
  }

  function handleClear() {
    formRef.value?.setValue({});
    selectSearch.value?.reload();
    Event.runEventByName('afterClear', defProps.widget.events);
  }

  function handleAfterQuery(data, query) {
    if (data && data.length === 1 && query) {
      selectSearch.value.selectRow(data[0]);
    }
  }

  function handleBeforeQuery(data) {
    Event.runEventByName('beforeSearch', defProps.widget.events, data);
  }

  async function showWorkflow() {
    workflowModalOpen.value = true;
    await nextTick();
    if (highlightWorkflowNode.value) {
      WorkflowNodesRef.value.setNodeHighlight(highlightWorkflowNode.value);
    } else {
      WorkflowNodesRef.value.restNodesHighlight();
    }
  }

  onMounted(async () => {
    await nextTick();
    const renderContent = document.querySelector('.web-render-content');
    const renderHeight = (renderContent?.getBoundingClientRect?.()?.height as number) || 300;
    webRenderHeight.value = renderHeight - 120 > 300 ? 300 : renderHeight - 120;
    if (formRef.value) {
      const formWidget = defProps.widget.children![1];
      const { id, type } = formWidget;
      Event.initNode(id, { elRef: formRef.value, type });
    }
    if (defProps.widget.children?.[2] && computedShowWorkflow.value) {
      workflowWidget.value = defProps.widget.children?.[2];
      workflowWidget.value.props.readonly = true;
      workflowWidget.value.props.bindModelKey = 'em_workflow_step';
      workflowWidget.value.props.modelKey = 'em_workflow';
    }
  });

  const WorkflowNodesRef = ref();

  const highlightWorkflowNode = ref();

  defineExpose({
    getValue: () => {
      return formRef.value?.getValue();
    },
    setValue: (value = {}) => {
      return formRef.value?.setValue?.(value);
    },
    addValue: (value = {}) => {
      return formRef.value?.addValue?.(value);
    },
    reset: () => {
      formRef.value?.setValue({});
      formRef.value?.reset();
      selectSearch.value?.reload();
    },
    restNodesHighlight: async () => {
      highlightWorkflowNode.value = null;
    },
    async setNodeHighlight(nodeId) {
      highlightWorkflowNode.value = nodeId;
    },
  });
</script>

<style lang="less" scoped>
  .results-field-container {
    background: #f7f8fa;
    border-radius: 4px;
    position: relative;
    overflow: hidden;

    :deep(.ant-form .readonly-field-item.ant-form-item) {
      box-sizing: border-box !important;
      padding: 6px 4px;
      height: 34px !important;
      overflow: hidden;
      .ant-form-item-control-input {
        min-height: auto !important;
      }
    }
    :deep(.ant-form-item-control-input-content) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :deep(.tag-text) {
      display: inline-block;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    .results-field {
      &__custom {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &__trigger {
        position: absolute;
        right: 10px;
        top: 8px;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
