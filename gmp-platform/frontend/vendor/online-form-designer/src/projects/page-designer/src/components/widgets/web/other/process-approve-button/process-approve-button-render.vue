<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="handle" />
</template>

<script setup lang="ts" name="gct-process-approve-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import { ref, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { message as Message } from 'ant-design-vue';
  import type { approveButton } from '/@page-designer/types/web';
  import { openProcessModal } from './processModal';
  import { useRouter, useRoute } from 'vue-router';
  import { ExamineAndApproveStateEnum } from '@gct/runtime';
  import { getPmProcessEngineProcInstExtension } from '/@/apis/gct-apaas/PmProcessEngineController';
  const props = defineProps<{ widget: approveButton }>();
  const { action, refForm, processId: formProcessId } = props.widget.props;
  const Event = getPageEvent();
  const loading = ref(false);
  const router = useRouter();
  const route = useRoute();
  interface ProcessOperateRequest {
    bizServiceKey?: string; // 业务服务
    button: ButtonTypeEnum; // 流程按钮
    countersignUserIds: Array<string>; // 加签用户集合
    opinion: string; // 意见
    reassignId: string; // 转交用户Id
    signature: string; // 签名数据
  }
  const processOperateData = reactive<ProcessOperateRequest>({
    button: action!,
    countersignUserIds: [],
    opinion: '',
    reassignId: '',
    signature: '',
  });
  async function handle() {
    try {
      const form = await Event.getSyncComponent(refForm);
      const formData = form.getValue!();
      loading.value = true;
      await Event.runEventByName(`before${action}`, props.widget.events, formData);
      const actionTitle = await approveSubmit();
      await Event.processHandle(formData, processOperateData);
      await Event.runEventByName(`after${action}`, props.widget.events, formData);
      Message.success(actionTitle);
      if (Event.ProcessAppRoved?.examineAndApproveState === ExamineAndApproveStateEnum.MY_AGENT) {
        await router.replace({
          name: route.name,
          params: { linkPage: Event.ProcessAppRoved?.viewPageKey || route.params.linkPage },
          query: { ...route.query, state: ExamineAndApproveStateEnum.MY_DONE },
        });
      }
      if (Event.ProcessAppRoved?.examineAndApproveState === ExamineAndApproveStateEnum.MY_CUSTOM) {
        const data =
          (await getPmProcessEngineProcInstExtension({
            procInstId: Event.ProcessAppRoved.processInstanceId,
          })) || {};
        const { taskId, node, webPageKey, webViewPageKey, btnList } = data;
        const btnkeys = btnList || [];
        if (!node || !btnkeys.length || (node.key === '__initiator__' && !taskId)) {
          await router.replace({
            name: route.name,
            params: { linkPage: node?.webViewPageKey || webViewPageKey },
            query: { ...route.query, taskId },
          });
        } else {
          await router.replace({
            name: route.name,
            params: { linkPage: node?.webPageKey || webPageKey },
            query: { ...route.query, taskId },
          });
        }
      }
      if (
        Event.ProcessAppRoved?.examineAndApproveState !== ExamineAndApproveStateEnum.MY_CUSTOM_Modal
      ) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      loading.value = false;
    }
  }
  async function approveSubmit() {
    await Event.checkedProcess(formProcessId).catch((error) => {
      Message.warning(error);
      return Promise.reject();
    });
    const { buttonConfig } = Event.ProcessAppRoved!;
    const config = buttonConfig[action!];
    const { title, signature, opinion, user, showModel, success } = config!;
    if (showModel) {
      loading.value = false;
      const data = await openProcessModal({ title, signature, opinion, user });
      processOperateData.opinion = data.opinion;
      processOperateData.signature = data.signature;
      if (action === ButtonTypeEnum.Countersign) {
        processOperateData.countersignUserIds = data.user;
      } else if (action === ButtonTypeEnum.Reassign) {
        processOperateData.reassignId = data.user;
      }
    }
    return success;
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
