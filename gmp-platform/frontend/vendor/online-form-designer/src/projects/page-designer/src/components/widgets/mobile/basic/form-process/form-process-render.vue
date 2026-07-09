<template>
  <form-render ref="refForm" :widget="widget">
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </form-render>
</template>

<script setup lang="ts" name="gct-form-process">
  import { ref, onMounted, reactive, provide } from 'vue';
  import { FormProcess } from '/@page-designer/types/mobile';
  import { postPmProcessEngineStartProcInst } from '@mobile/apis/gct-apaas/PmProcessEngineController';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import formRender from '../form/form-render.vue';
  import { showToast } from 'vant';
  interface ProcessOperateRequest {
    bizServiceKey?: string; // 业务服务
    button?: string; // 流程按钮
    data: object; // 提交的数据
    procDefId: string; // 流程定义id
  }
  const Event = getPageEvent();
  const props = defineProps<{ widget: FormProcess }>();
  const refForm = ref<InstanceType<typeof formRender>>();
  const { processId, dataId } = Event.ProcessAppRoved || {};
  const { processId: formProcessId = '' } = props.widget.props;
  const processData = reactive<ProcessOperateRequest>({
    bizServiceKey: '', // 仅脚本服务或编排服务 其他不传
    data: {}, // 提交的数据
    procDefId: formProcessId, // 流程定义id
  });
  onMounted(() => {
    for (let i in refForm.value) {
      exposedMethods[i] = refForm.value[i];
    }
    initProcessInfo();
  });
  function initProcessInfo() {
    if (formProcessId === processId && dataId && refForm.value) {
      const data = refForm.value.getValue();
      //表单内部不存在id的时候需要填充流程信息
      !data.id_ && reload(dataId);
    }
  }
  async function reload(dataId) {
    const formData = await refForm.value!.reload(dataId);
    Event.runTableBySearch(props.widget.id, formData?.process_instance_id_);
    return formData;
  }
  const exposedMethods = {
    async startProcess({ bizServiceKey }) {
      processData.bizServiceKey = bizServiceKey;
      processData.data = refForm.value?.getValue() || {};
      await postPmProcessEngineStartProcInst(processData);
    },
    reload,
  };
  if (formProcessId === processId) {
    //流程节点依赖注入
    provide('useProcessFieldEvent', Event.ProcessAppRoved);
  }
  defineExpose(exposedMethods);
</script>
<style scoped lang="less"></style>
