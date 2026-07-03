<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse
      :title="t('sys.process.approvalPage')"
      :tooltip="t('sys.process.approvalPageTip')"
    >
      <NodeBindingPage :data="node.data!" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.process.approvalOperation')">
      <form-item :label="t('sys.process.approvalMethod')" :inline="false" is-first>
        <a-select
          v-model:value="formState.approveWay"
          :options="approvalOptions"
          :disabled="paasBpmnReadonly"
          :placeholder="t('sys.chooseText')"
          size="small"
          style="width: 100%"
        />
      </form-item>
      <form-item
        v-if="isFrontPage"
        :label="t('sys.process.approver')"
        :inline="false"
        :rules="[{ required: true }]"
      >
        <ApprovalUserSelectConfig v-model:modelValue="formState.targetUserConfig" />
      </form-item>
      <form-item :label="t('sys.process.approvalBtn')" :inline="false">
        <NodeBtns :node="node" />
      </form-item>
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.appDesigner.approval.opinion')">
      <form-item :label="t('sys.appDesigner.approval.opinion')" :colon="false" is-first>
        <div class="text-right">
          <a-switch
            v-model:checked="formState.opinionConfig!.enabled"
            size="small"
            :disabled="paasBpmnReadonly"
          />
        </div>
      </form-item>
      <form-item v-if="formState.opinionConfig!.enabled">
        <a-select
          v-model:value="formState.opinionConfig!.opinionType"
          :options="opinionTypeOptions"
          :disabled="paasBpmnReadonly"
          :placeholder="t('sys.chooseText')"
          :showSearch="false"
          :get-popup-container="
            (trigger) => trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
          "
          mode="multiple"
          :maxTagCount="5"
          :maxTagTextLength="6"
          size="small"
          style="width: 100%"
          @change="handleOpinionTypeChange"
        />
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { computed, inject, provide, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import NodeBindingPage from '../../components/node-binding-page.vue';
  import NodeBtns from '../../components/node-btns.vue';
  import ApprovalUserSelectConfig from '../../../online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import FormItem from '../../components/form-item.vue';
  import { ApproveWayEnum, OpinionTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import { useProcess } from '../../hook/useProcess';

  const props = defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const { processInfo, validNodeData } = useProcess();
  provide('bpmnMainModelKey', processInfo.value.modelKey);
  const { t } = useI18n();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const isFrontPage = inject('isFrontPage', false);
  const formState = computed({
    get() {
      return props.node.data!;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const approvalOptions = computed(() => {
    return Object.values(ApproveWayEnum).map((e) => {
      return {
        label: t(`sys.process.approveWay.${e}`),
        value: e,
      };
    });
  });

  const opinionTypeOptions = computed(() => {
    return Object.values(OpinionTypeEnum).map((e) => {
      return {
        label: t(`sys.process.opinionType.${e}`),
        value: e,
      };
    });
  });

  watch(
    () => formState.value.targetUserConfig,
    () => {
      validNodeData(formState.value.key);
    },
  );

  const handleOpinionTypeChange = (value) => {
    let changeVal: OpinionTypeEnum[] = [];
    // 取消勾选所有选项设置都不必填
    if (value.length === 0) {
      changeVal = [OpinionTypeEnum.Optional];
    } else {
      const clickValue = value[value.length - 1];
      if ([OpinionTypeEnum.Required, OpinionTypeEnum.Optional].includes(clickValue)) {
        changeVal = [clickValue];
      } else {
        changeVal = value.filter(
          (item) => ![OpinionTypeEnum.Required, OpinionTypeEnum.Optional].includes(item),
        );
      }
    }
    if (formState.value.opinionConfig) {
      formState.value.opinionConfig.opinionType = changeVal;
    }
  };
</script>
<style lang="less" scoped></style>
