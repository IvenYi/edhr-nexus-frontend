<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="handle" />
</template>

<script setup lang="ts" name="gct-process-approve-button">
  import vantButton from '../../__components__/vantButton.vue';
  import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import { ref, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { showToast } from 'vant';
  import type { approveButton } from '/@page-designer/types/mobile';
  import { openProcessPopup } from './process-popup';
  import { ExamineAndApproveStateEnum } from '@gct/runtime';
  import { useRouter, useRoute } from 'vue-router';

  const props = defineProps<{ widget: approveButton }>();
  const router = useRouter();
  const route = useRoute();
  const { action, refForm, processId: formProcessId } = props.widget.props;
  const Event = getPageEvent();
  const loading = ref(false);
  interface ProcessOperateRequest {
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
      await Event.runEventByName('beforeClick', props.widget.events, formData);
      const actionTitle = await approveSubmit();
      await Event.processHandle(formData, processOperateData);
      await Event.runEventByName('afterClick', props.widget.events, formData);
      showToast(actionTitle);
      if (Event.ProcessAppRoved?.examineAndApproveState === ExamineAndApproveStateEnum.MY_AGENT) {
        await router.replace({
          name: route.name,
          params: { linkPage: Event.ProcessAppRoved?.isAPPviewPage || route.params.linkPage },
          query: { ...route.query, state: ExamineAndApproveStateEnum.MY_DONE, refreshKey: true },
        });
      } else {
        await router.replace({
          name: route.name,
          params: route.params,
          query: { ...route.query, refreshKey: true },
        });
      }
    } catch (error) {
      console.warn(error);
    } finally {
      loading.value = false;
    }
  }
  async function approveSubmit() {
    await Event.checkedProcess(formProcessId).catch((error) => {
      showToast(error);
      return Promise.reject();
    });
    const { buttonConfig } = Event.ProcessAppRoved!;
    const config = buttonConfig[action!];
    const { title, signature, opinion, user, showModel, success } = config!;
    if (showModel) {
      const data: any = await openProcessPopup({
        title,
        signature,
        opinion,
        user,
      });
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
