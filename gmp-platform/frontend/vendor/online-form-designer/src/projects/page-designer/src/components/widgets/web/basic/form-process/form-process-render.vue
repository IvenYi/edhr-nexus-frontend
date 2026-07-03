<template>
  <component :is="formRender" :widget="widget" :ref="loadForm">
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
</template>

<script setup lang="ts" name="gct-form-process">
  import { toRef, watch, ref, onMounted, reactive, provide, defineAsyncComponent } from 'vue';
  import { FormProcess } from '/@page-designer/types/web';
  import { postPmProcessEngineStartProcInst } from '/@/apis/gct-apaas/PmProcessEngineController';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import RdoForm from '/@page-designer/_kit/kit-medpro/web/rdo-form/rdo-form-render.vue';
  import NdoForm from '../form/form-render.vue';
  const props = defineProps<{ widget: FormProcess }>();
  const { processId: formProcessId, modeldata } = props.widget.props;
  const isRdo = modeldata?.modelType === EntityModelTypeEnum.RDO;
  const formRender = isRdo ? RdoForm : NdoForm;

  interface ProcessOperateRequest {
    bizServiceKey?: string; // 业务服务
    button?: string; // 流程按钮
    data: object; // 提交的数据
    procDefId: string; // 流程定义id
  }

  const Event = getPageEvent();
  const { processId, dataId } = Event.ProcessAppRoved || {};
  const refFormMethods: any = {};

  const processData = reactive<ProcessOperateRequest>({
    bizServiceKey: '', // 仅脚本服务或编排服务 其他不传
    data: {}, // 提交的数据
    procDefId: formProcessId, // 流程定义id
  });
  function initProcessInfo() {
    if (formProcessId === processId && dataId && refFormMethods.getValue) {
      const formData = refFormMethods.getValue();
      //表单内部不存在id的时候需要填充流程信息
      !formData.id_ && reload(dataId);
    }
  }
  async function reload(dataId) {
    const formData = await refFormMethods.reload(dataId);
    Event.runTableBySearch(props.widget.id, formData?.process_instance_id_);
    return formData;
  }
  /**根據表單内容选择rdo服务 */
  function getServiceKey(formState): string {
    const { base_id_, id_ } = formState || {};
    if (id_) {
      return 'rdoUpdateVersionById';
    } else if (base_id_) {
      return 'rdoSaveVersion';
    } else {
      return 'rdoSave';
    }
  }
  const exposedMethods = {
    async startProcess({ bizServiceKey }) {
      processData.bizServiceKey = bizServiceKey;
      processData.data = refFormMethods?.getValue() || {};
      if (isRdo && !processData.bizServiceKey) {
        processData.bizServiceKey = getServiceKey(processData.data);
      }
      await postPmProcessEngineStartProcInst(processData);
    },
    reload,
  };
  function loadForm(refForm) {
    for (let i in refForm) {
      refFormMethods[i] = refForm[i];
    }
    for (let i in refForm) {
      if (!exposedMethods[i]) {
        exposedMethods[i] = refForm[i];
      }
    }
    initProcessInfo();
  }
  if (formProcessId === processId) {
    //流程节点依赖注入
    provide('useProcessFieldEvent', Event.ProcessAppRoved);
  }
  defineExpose(exposedMethods);
</script>
<style scoped lang="less"></style>
