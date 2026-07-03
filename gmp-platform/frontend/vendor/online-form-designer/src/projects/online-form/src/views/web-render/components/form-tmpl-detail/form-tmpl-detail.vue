<template>
  <div :class="[ns.b()]" v-loading="isLoading">
    <a-tabs v-if="!isLoading" :class="[ns.e('tab')]">
      <a-tab-pane key="1" :tab="$t('sys.onlineForm.formStyle')">
        <word-design v-if="isWord" :id="tmplId" :model-key="modelKey" is-preview />
        <ApaasCollectSheetView
          v-else
          :class="[ns.e('form-preview')]"
          :dataId="tmplId"
          :isRecord="isRecord"
        >
          <template #logbookFormConfig>
            <slot name="logbookFormConfig"></slot>
          </template>
        </ApaasCollectSheetView>
      </a-tab-pane>
      <a-tab-pane v-if="showFlow" key="2" :tab="$t('sys.edhr.approvalTab.form')">
        <FormBpmnRuntime :of-tmpl-id="tmplVersionId" :model-key="modelKey" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup name="form-tmpl-detail">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ApaasCollectSheetView } from '/@online-form/views/integration/apaas_si/index';
  import FormBpmnRuntime from '/@/components/BpmnRuntime/form-tmpl/index.vue';
  import WordDesign from '/@online-form/word-render/components/word-design.vue';
  import { ref, watch } from 'vue';
  import { FormTypeEnum, OfficeTypeEnum } from '@gct/nocode-base';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  const { t } = useI18n();
  const ns = useNamespace('form-tmpl-detail');
  /** 是否显示流程 */
  const showFlow = ref(false);
  /** 所属模型key */
  const modelKey = ref('');
  /** 具体模板版本的id */
  const tmplVersionId = ref('');
  const isLoading = ref(false);
  const isWord = ref(false);

  const props = withDefaults(
    defineProps<{
      tmplId: string;
      isRecord?: number; // 是否是记录本
    }>(),
    {},
  );

  const init = async (id: string) => {
    isLoading.value = true;
    try {
      const res = await getOnlineFormTmplGetVersionById({
        id,
      });
      if (res) {
        tmplVersionId.value = res.id!;
        showFlow.value = res.formType === FormTypeEnum.PROCESS;
        modelKey.value = res.modelKey!;
        isWord.value = res.officeType === OfficeTypeEnum.WORD;
      }
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    () => props.tmplId,
    async (value) => {
      if (!value) return;
      await init(value);
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  $form-tmpl-detail: ();

  @include b(form-tmpl-detail) {
    @include set-component-css-var(form-tmpl-detail, $form-tmpl-detail);

    @include e(form-preview) {
      background-color: #e6e9ef;
    }

    @include e(tab) {
      height: 100%;

      :deep(.ant-tabs-nav) {
        margin: 0;
      }

      :deep(.ant-tabs-nav-wrap) {
        margin-left: 16px;
      }

      :deep(.ant-tabs-tab) {
        padding: 7px 0;
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }
    }

    position: relative;
    padding: 0 16px 16px;
  }
</style>
