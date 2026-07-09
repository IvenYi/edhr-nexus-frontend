<!--
  @description: 返工配置页
  @author: Jayson
  @date: 2025-07-25
-->
<template>
  <div :class="ns.b()">
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="formData">
        <div :class="ns.e('title')">{{ formConfig.common.title }}</div>
        <a-row :gutter="16">
          <a-col
            :span="item.colProps.span"
            v-for="(item, index) in formConfig.common.fields"
            :key="index"
          >
            <a-form-item
              :label="item.label"
              :name="item.field"
              :rules="item.required ? [{ required: true }] : []"
            >
              <!-- 组件动态渲染: common 区域只做只读展示 -->
              <span>{{ getFieldDict(item.field) }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <div :class="ns.e('title')">{{ formConfig.task.title }}</div>
        <a-row :gutter="16">
          <a-col
            :span="item.colProps.span"
            v-for="(item, index) in formConfig.task.fields"
            :key="index"
          >
            <a-form-item
              v-if="shouldShowField(item)"
              :label="item.label"
              :name="item.field"
              :rules="item.required ? [{ required: true }] : []"
            >
              <span v-if="isDetail">{{ getFieldDict(item.field) }}</span>
              <!-- 组件动态渲染 -->
              <component
                v-else
                class="w-100%"
                :is="dynamicComp(item.component)"
                :ref="(el) => loadCompRef(el, item)"
                v-model:value="formData[item.field]"
                v-model:checked="formData[item.field]"
                v-bind="item.componentProps"
                :options="item.componentProps.options"
                :disabled="item.componentProps.disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <WorkflowNodesRender
          ref="workflowNodesRef"
          v-model:model-value="workflowModelValue"
          :widget="_workflowSchema"
          :form-data="{ id_: operationsId }"
          @selected="handleSelectedEvent"
          @graphMounted="handleGraphMountedEvent"
        />

        <OperationSetting
          v-if="currentNode"
          ref="operationSettingRef"
          :opeType="defProps.opeType"
          :workflowData="workflowModelValue"
          :nodeConfig="nodeConfig"
          :isRework="true"
          @update:nodeConfig="handleUpdateCurrentNodeConfig"
        />
      </a-form>
    </a-spin>
  </div>

  <div
    v-if="modal && !isDetail"
    class="absolute bottom-0px left-0px w-full text-right"
    :class="ns.e('footer')"
  >
    <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
    <a-button type="primary" :loading="confirmLoading" @click="onSubmit">{{
      $t('sys.okText')
    }}</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { cloneDeep } from 'lodash-es';
  import { computed, ComputedRef, nextTick, onBeforeMount, onMounted, reactive, ref } from 'vue';
  import {
    Input as AInput,
    Select as ASelect,
    InputNumber as AInputNumber,
    Textarea as ATextArea,
    message as Message,
  } from 'ant-design-vue/es';
  import { IModal, useNamespace } from '@gct/runtime';
  import WorkflowNodesRender from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import {
    IReworkConfiguration,
    IOperationNodeConfig,
    IOperationNode,
    EOpeType,
    EReworkTaskType,
  } from '../types/index';
  import { formFieldsConfigs, workflowSchema } from './config';
  import OperationSetting from './OperationSetting.vue';
  import {
    getBizServiceByModelKeyByBsKey,
    postBizServiceByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/BsServiceController';
  import { WorkflowNodeTypeEnum } from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/component/types';
  import { validateFullMainPath } from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/component/utils/validate';

  const defProps = withDefaults(
    defineProps<{
      modal: IModal;
      taskData: any;
      opeType: EOpeType;
      /** 是否进行单个返工任务 */
      single?: boolean;
    }>(),
    {
      opeType: EOpeType.ADD,
    },
  );

  const ns = useNamespace('rework-process-config');

  // 动态组件映射表（可扩展）
  const componentMap = {
    Input: AInput,
    InputNumber: AInputNumber,
    Select: ASelect,
    TextArea: ATextArea,
  };
  const dynamicComp = (c) => {
    return componentMap[c];
  };
  const formConfig = computed(() => {
    // cloneDeep避免不同的逻辑影响配置数据产生改动
    const fieldsConfig = cloneDeep(formFieldsConfigs);
    return fieldsConfig[defProps.taskData!.taskType];
  });

  const spinning = ref(false);
  const confirmLoading = ref(false);
  const formData = ref<IReworkConfiguration>({
    taskType: EReworkTaskType.CONTAINER,
    routing_id_: '',
    status_: defProps.taskData.status_,
    qty_: null,
  });

  const _workflowSchema = computed(() => {
    if (isDetail.value) {
      return {
        ...workflowSchema,
        props: {
          ...workflowSchema.props,
          readonly: true,
        },
      };
    }
    return workflowSchema;
  });
  const workflowModelValue = ref();
  const operationsId = computed(() => {
    return defProps.taskData?.routing_id_ || formData.value?.routing_id_;
  });

  const nodesConfigFormData: Record<string, IOperationNodeConfig> = reactive({});
  const routingOperationConfigs = ref([]);

  const currentNode = ref<IOperationNode>();
  const nodeConfig: ComputedRef<any> = computed(() => {
    if (!currentNode.value) return null;

    const { node_id_ } = currentNode.value;
    if (node_id_) {
      return nodesConfigFormData[node_id_];
    }

    return null;
  });
  const formRef = ref();
  const workflowNodesRef = ref();
  const operationSettingRef = ref();

  /** 返工任务ID */
  const taskId = computed(() => {
    return defProps.taskData?.id_ || defProps.taskData?.task_id_;
  });

  const isAdd = computed(() => {
    return defProps.opeType === EOpeType.ADD;
  });
  const isDetail = computed(() => {
    return defProps.opeType === EOpeType.DETAIL;
  });
  const isEdit = computed(() => {
    return defProps.opeType === EOpeType.EDIT;
  });

  const isSn = computed(() => {
    return defProps.taskData.taskType === EReworkTaskType.SN;
  });

  /** 获取可共同返工的sn数据 */
  async function loadSnData() {
    try {
      const res: any = await postBizServiceByModelKeyByBsKey(
        {
          bsKey: 'biz_list_search',
          modelKey: 'em_sn',
        },
        {
          product_id_: defProps.taskData.product_id_,
        },
      );

      return (res ?? [])
        .map((item) => {
          return {
            label: item.name_,
            value: item.id_,
            ...item,
          };
        })
        ?.filter((it) => it.id_ !== defProps.taskData.sn_id_);
    } catch (error) {
      return [];
    }
  }

  const loadedRefs = new Set();
  const componentVisibility = ref<Record<string, boolean>>({});
  async function loadCompRef(el, w) {
    if (!el || loadedRefs.has(w.field)) return;

    if (w?.componentProps?.getOptions && typeof w?.componentProps?.getOptions === 'function') {
      if (w.field === 'sn_ids_') {
        w.componentProps.getOptions(w, formData.value, async () => await loadSnData());
      } else {
        w.componentProps.getOptions(w, formData.value);
      }
    }
    if (w.setDynamicProps && typeof w.setDynamicProps === 'function') {
      if (w.field === 'sn_ids_') {
        const visible = !isEdit.value && isSn.value;
        componentVisibility.value[w.field] = visible;
        w.setDynamicProps(w, 'visible', visible);
      }
    }
    loadedRefs.add(w.field);
  }

  function shouldShowField(item) {
    if (componentVisibility.value?.[item.field]) {
      return componentVisibility.value[item.field];
    }
    return Object.hasOwn(item.componentProps, 'visible') ? item.componentProps?.visible : true;
  }

  async function handleSelectedEvent(nodeData) {
    console.log('handleSelectedEvent', nodeData, workflowModelValue.value);
    const { id, label: name_, shape: type_ } = nodeData;

    if (!id || type_ !== WorkflowNodeTypeEnum.NODE_SPEC) return;

    currentNode.value = {
      ...nodeData,
      node_id_: id,
      type_,
      name_,
    };

    await nextTick();
    workflowNodesRef.value.setNodeHighlight(id);
    const cacheConfig = nodesConfigFormData[id]
      ? nodesConfigFormData[id]
      : ({} as IOperationNodeConfig);
    // 如果是点击新增的节点，则需要初始化清空表单子表数据
    operationSettingRef.value.setFormData({
      // routing_operation_id_: data?.id_,
      node_id_: id,
      operation_before_txn_check_enabled_:
        cacheConfig?.operation_before_txn_check_enabled_ ?? false,
      operation_advance_execution_enabled_:
        cacheConfig?.operation_advance_execution_enabled_ ?? false,
      form_entries_: cacheConfig?.form_entries_ ?? [],
      document_entries_: (cacheConfig?.document_entries_ ?? []).map((r) => {
        const getFileType = (fileName: string) => {
          if (!fileName) return undefined;
          const arr = fileName.split('.');
          const type: any = arr[arr.length - 1] || 'png';
          return type;
        };
        const file = r?.file_;
        const fileType = getFileType(file);
        const pageDisabled = !file || fileType !== 'pdf';
        return {
          ...r,
          page_no_disabled_: Object.hasOwn(r, 'page_no_disabled_')
            ? r.page_no_disabled_
            : !!pageDisabled,
        };
      }),
      before_txn_check_entries_: cacheConfig?.before_txn_check_entries_ ?? [],
      operation_advance_execution_entries_: cacheConfig?.operation_advance_execution_entries_ ?? [],
      form_entries_dict_: cacheConfig?.form_entries_dict_ ?? {},
      document_entries_dict_: cacheConfig?.document_entries_dict_ ?? {},
      before_txn_check_entries_dict_: cacheConfig?.before_txn_check_entries_dict_ ?? {},
      operation_advance_execution_entries_dict_:
        cacheConfig?.operation_advance_execution_entries_dict_ ?? {},
    });
  }

  function handleGraphMountedEvent() {
    const workflowNodes = workflowNodesRef.value?.getJson()?.cells;
    const nodeSpecList = workflowNodes?.filter((d) => d.shape === WorkflowNodeTypeEnum.NODE_SPEC);
    if (nodeSpecList?.length) {
      initNodesConfigFormData(routingOperationConfigs.value);
      handleSelectedEvent(nodeSpecList[0]);
    }
  }

  function handleUpdateCurrentNodeConfig(data) {
    if (currentNode.value?.node_id_) {
      nodesConfigFormData[currentNode.value.node_id_] = cloneDeep(data);
    }
  }

  // 获取节点配置数据
  async function loadConfigsData() {
    /**
     * @param {string} id_
     * @description sn 为返工任务ID
     * @description container 为创建后的返工批次ID
     */
    if (!taskId.value) return;

    await getBizServiceByModelKeyByBsKey(
      {
        bsKey: 'biz_rework_get',
        modelKey: isSn.value ? 'em_sn' : 'em_container',
      },
      { id_: taskId.value } as any,
    ).then(async (res) => {
      const {
        routing_operation_configs_: configs,
        routing_id_,
        description_,
        rework_routing_id_,
        rework_name_,
        rework_description_,
        sn_ids_,
      } = res as any;
      routingOperationConfigs.value = configs?.data ?? [];
      Object.assign(formData.value, {
        rework_name_: rework_name_,
        /**
         * !批次返工时，描述使用 description_/routing_id_ 字段， sn则使用 rework_routing_id_/rework_description_ 字段 */
        routing_id_: isSn.value ? rework_routing_id_ : routing_id_,
        description_: isSn.value ? rework_description_ : description_,
        sn_ids_,
      });
    });
  }

  /**获取批次数据，回显批次/SN和产品的基础信息数据 */
  async function loadTxnSubjectData() {
    try {
      spinning.value = true;
      const res: any = await getBizServiceByModelKeyByBsKey(
        {
          bsKey: 'getById',
          modelKey: isSn.value ? 'em_sn' : 'em_container',
        },
        { id: isSn.value ? defProps.taskData?.sn_id_ : defProps.taskData?.container_id_ } as any,
      );
      if (res && res.data) {
        let proRes = {} as any;
        try {
          proRes = await getBizServiceByModelKeyByBsKey(
            {
              bsKey: 'rdoGetVersionById',
              modelKey: 'em_product',
            },
            { id: res.data.product_id_ } as any,
          );
        } catch (error) {
          console.error('获取产品信息失败', error);
        }

        Object.assign(formData.value, {
          product_id_: res?.data?.product_id_,
          code_: proRes?.data?.code_,
          spec_: proRes?.data?.spec_,
          _DICT: {
            ...res.dict,
            ...proRes?.dict,
            container_id_: {
              [res.data.id_]: res.data.name_,
            },
            sn_id_: {
              [res.data.id_]: res.data.name_,
            },
            product_id_: res.dict?.product_id_,
          },
        });
      }
    } catch (error) {
      console.error(error, 'error at: 获取批次/sn数据报错');
    } finally {
      spinning.value = false;
    }
  }

  function getFieldDict(fieldKey: string) {
    const dictValue = formData.value?._DICT?.[fieldKey]?.[formData.value[fieldKey]] ?? '';
    return (dictValue || formData.value[fieldKey]) ?? '--';
  }

  function getSubmitFormData() {
    return {
      id_: taskId.value ?? undefined, // 任务id（批次ID/SN返工任务ID）
      txn_inst_id_: defProps.taskData?.txn_inst_id_, // 事务实例id
      sn_id_: defProps.taskData?.sn_id_ ?? undefined,
      container_id_: defProps.taskData?.container_id_ ?? undefined,
      product_id_: defProps.taskData?.product_id_ ?? undefined,
      routing_id_: isAdd.value ? undefined : (defProps.taskData?.routing_id_ ?? undefined), // 工艺路线id
      qty_: formData.value?.qty_,
      description_: formData.value?.description_,
      rework_name_: formData.value?.rework_name_ ?? undefined,
      sn_ids_: formData.value?.sn_ids_?.toString() ?? undefined,
      status_: formData.value?.status_ ?? undefined,
      routing_type_: 'custom',
      operations_: workflowModelValue.value,
      routing_operation_configs_: Object.values(nodesConfigFormData),
    };
  }

  async function onSubmit() {
    try {
      if (isDetail.value) {
        defProps.modal.dismiss();
        return;
      }
      operationSettingRef.value && (await operationSettingRef.value.fullValidate());
      await fullValidate();
      await validateWorkflowHasFullPath();
      const submitData = getSubmitFormData();
      confirmLoading.value = true;
      if (defProps.single) {
        await executeSingleSubmit(submitData);
      } else {
        defProps.modal.dismiss({ ok: true, data: submitData } as any);
      }
    } catch (error) {
      typeof error === 'string' && Message.error(error);
    }
    confirmLoading.value = false;
  }

  /** 2025-08-01 单个 返工配置提交逻辑*/
  async function executeSingleSubmit(params) {
    const postData = {
      ...params,
      operation_type_: params?.id_ ? EOpeType.EDIT : EOpeType.ADD,
    };
    const res = await postBizServiceByModelKeyByBsKey(
      {
        bsKey: 'biz_rework',
        modelKey: isSn.value ? 'em_sn' : 'em_container',
      },
      isSn.value ? postData : [postData],
    );
    Message.success($t('sys.saveSuccess'));
    defProps.modal.dismiss({ ok: true, data: res } as any);
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  function initNodesConfigFormData(configs?: any[]) {
    const nodes = workflowModelValue.value?.filter(
      (d) => d.type_ === WorkflowNodeTypeEnum.NODE_SPEC,
    );
    if (nodes?.length) {
      const defaultNodeConfig = {
        // routing_operation_id_: node.id_,
        // node_id_: node.node_id_,
        operation_before_txn_check_enabled_: false,
        operation_advance_execution_enabled_: false,
        form_entries_: [],
        document_entries_: [],
        before_txn_check_entries_: [],
        operation_advance_execution_entries_: [],
      };
      nodes.forEach((node) => {
        if (configs?.length) {
          /**
           * !工艺路线当未经过后端存储时没有生成routing_operation_id_，所以需要根据node_id_来匹配 */
          const config = configs.find(
            (d) =>
              d.node_id_ === node.node_id_ ||
              (d.routing_operation_id_ && node.id_ && d.routing_operation_id_ === node.id_),
          );
          if (config) {
            nodesConfigFormData[node.node_id_] = cloneDeep(
              Object.assign(config, {
                node_id_: node.node_id_,
                form_entries_: config.form_entries_ ?? [],
                before_txn_check_entries_: config.before_txn_check_entries_ ?? [],
                operation_advance_execution_entries_:
                  config.operation_advance_execution_entries_ ?? [],
              }),
            );
          } else {
            nodesConfigFormData[node.node_id_] = cloneDeep({
              ...defaultNodeConfig,
              node_id_: node.node_id_,
            });
          }
        } else {
          // 节点配置不存在，给定默认格式数据
          nodesConfigFormData[node.node_id_] = cloneDeep({
            ...defaultNodeConfig,
            node_id_: node.node_id_,
          });
        }
      });
    }
  }

  async function fullValidate() {
    await formRef.value.validate();
  }

  /** 校验工流是否存在完整主路经 */
  async function validateWorkflowHasFullPath() {
    const nodes = cloneDeep(workflowModelValue.value ?? []);
    const valid = await validateFullMainPath(nodes);
    return valid;
  }

  onBeforeMount(() => {
    // 初始化表单数据
    formData.value = Object.assign({}, defProps.taskData);

    loadTxnSubjectData();

    // 详情|编辑模式已提交后端
    /**
     * 在详情或编辑模式下，如果任务数据存在id，则加载配置数据。
     * ??? 如果是提交过，再次编辑，是否需要重新加载后端保存的配置数据
     */
    if (isDetail.value || (isEdit.value && taskId.value)) {
      loadConfigsData();
    }
  });

  onMounted(async () => {
    await nextTick();
    // 初始新增的数据刚插入到父级行数据中并未提交 此时的编辑模式数据并未提交后端需要回显前端的数据
    if (isEdit.value && !taskId.value) {
      workflowModelValue.value = defProps.taskData?.operations_;
      routingOperationConfigs.value = defProps.taskData?.routing_operation_configs_ ?? [];
    }
  });
</script>

<style lang="scss">
  .rework-process-drawer {
    .ant-drawer-body {
      padding: 0;
      & > .scroll-container {
        padding: 24px;
        overflow-x: hidden;

        .scrollbar__bar.is-horizontal {
          display: none;
        }
      }
    }
  }

  @include b(rework-process-config) {
    padding-bottom: 48px;
    .x6-port-PATH_REWORK {
      display: none;
    }
    .x6-port-PATH_OPTIONAL {
      display: none;
    }

    @include e(title) {
      position: relative;
      margin-bottom: 12px;
      font-weight: bold;
      padding-left: 12px;

      &::before {
        content: '';
        background-color: var(--ant-primary-color);
        width: 3px;
        height: 16px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
      }
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: end;
      min-height: 60px;
      padding: 0 16px 6px;
      background-color: #ffffff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);
      z-index: 999;
    }
  }
</style>
