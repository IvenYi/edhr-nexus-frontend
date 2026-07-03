<template>
  <div>
    <div v-for="(btn, i) in buttonConfig" :key="i" class="btn-item mb8px">
      <div class="ks-row-middle">
        <div class="ks-col ks-row-middle overflow-hidden">
          <div class="ell" :title="t(`sys.process.paasBpmnButtonEvent.${btn.type}`)">
            {{ t(`sys.process.paasBpmnButtonEvent.${btn.type}`) }}
          </div>
          <a-tooltip>
            <template #title>
              {{ t(`sys.process.paasBpmnButtonEvent.${btn.type}_tip`) }}
            </template>
            <i class="iconfont icon-assist text-[#C3C3C3] cursor-pointer mx4px relative"></i>
          </a-tooltip>
        </div>
        <a-switch v-model:checked="btn.enable" size="small" :disabled="paasBpmnReadonly" />
      </div>
      <div v-if="btn.enable" class="bg-[#FFFFFF] rounded-4px mt4px">
        <div
          class="p8px ks-row-middle"
          :class="[node?.type === BpmnNodeTypeEnum.BpmnApproval && 'b-b']"
        >
          <div>{{ t('sys.pageDesigner.buttonName') }}</div>
          <div class="ks-col ml8px">
            <i18n-select-input
              attr="name"
              :i18nConfig="btn.i18nConfig"
              :disabled="paasBpmnReadonly"
              size="small"
              @on-i18n-select="handleI18nSelect"
            >
              <template #i18n-input>
                <a-input
                  style="width: calc(100% - 28px); height: 28px"
                  v-model:value="btn.alias"
                  :placeholder="t('sys.inputText')"
                  :maxlength="32"
                  :disabled="paasBpmnReadonly"
                  show-count
                  size="small"
                  @blur="onAliasBlur(btn, i)"
                />
              </template>
            </i18n-select-input>
          </div>
        </div>
        <div
          v-if="btn.enable && node?.type === BpmnNodeTypeEnum.BpmnApproval"
          class="py4px px8px mt4px ks-row-middle"
        >
          <div class="ks-col">{{ t('sys.process.needSign') }}</div>
          <a-switch v-model:checked="btn.signature" size="small" :disabled="paasBpmnReadonly" />
        </div>
        <template
          v-if="node?.type === BpmnNodeTypeEnum.BpmnApproval && btn.type === ButtonTypeEnum.Reject"
        >
          <div class="py4px px8px">
            <div class="mb2px">{{ t('sys.process.rejectToNode') }}</div>
            <a-select
              v-model:value="btn.dismissTo"
              :options="dismissToOptions"
              :placeholder="t('sys.chooseText')"
              :disabled="paasBpmnReadonly"
              :get-popup-container="(trigger) => trigger.parentNode"
              size="small"
              style="width: 100%"
            />
          </div>
          <div class="pt4px pb8px px8px">
            <div class="mb2px">
              {{ t('sys.process.rejectAndApprovalType') }}
              <a-tooltip>
                <template #title>
                  <div>{{ t('sys.process.rollbackRuleRuleStep') }}</div>
                  <div>{{ t('sys.process.rollbackRuleRuleSkip') }}</div>
                </template>
                <i class="iconfont icon-assist text-[#C3C3C3] cursor-pointer relative top-1px"></i>
              </a-tooltip>
            </div>
            <a-select
              v-model:value="btn.dismissRule"
              :options="dismissRuleOptions"
              :placeholder="t('sys.chooseText')"
              :disabled="paasBpmnReadonly"
              :get-popup-container="(trigger) => trigger.parentNode"
              size="small"
              style="width: 100%"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    BpmnNodeTypeEnum,
    ButtonTypeEnum,
    DismissRuleEnum,
    DismissToEnum,
  } from '@gct/flow/src/plugins/paas-bpmn/enums';

  const props = defineProps<{
    node?: GctBpmnNode.BpmnSubmit | GctBpmnNode.BpmnApproval;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const { t } = useI18n();

  const buttonConfig = computed({
    get() {
      return props.node?.data?.buttonConfig;
    },
    set(val) {
      Object.assign(props.node?.data?.buttonConfig ?? {}, val);
    },
  });

  const dismissToOptions = computed(() => {
    return Object.values(DismissToEnum).map((e) => {
      return {
        value: e,
        label: t(`sys.process.dismissTo.${e}`),
      };
    });
  });

  const dismissRuleOptions = computed(() => {
    return Object.values(DismissRuleEnum).map((e) => {
      return {
        value: e,
        label: t(`sys.process.dismissRule.${e}`),
      };
    });
  });

  const handleI18nSelect = (params) => {};

  const onAliasBlur = (btn, index) => {
    if (!btn.alias || !btn.alias.trim()) {
      buttonConfig.value?.splice(index, 1, {
        ...btn,
        alias: t(`sys.process.paasBpmnButtonEvent.${btn.type}`),
      });
    }
  };
</script>
<style lang="less" scoped>
  .b-b {
    border-bottom: 1px solid #f0f0f0;
  }
  .btn-item {
    background-color: #f2f4f7;
    border-radius: 4px;
    padding: 8px;
  }
</style>
