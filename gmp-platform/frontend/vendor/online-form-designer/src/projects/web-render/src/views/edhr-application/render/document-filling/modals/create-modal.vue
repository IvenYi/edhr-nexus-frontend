<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item
      :label="$t('sys.edhr.printTypeEnum.FORM')"
      name="tmplId"
      :rules="[
        {
          required: true,
          message: t('sys.chooseTextTip', { name: t('sys.expression.form') }),
        },
      ]"
    >
      <VersionSelect
        :type="FormDesignEnum.ONLINE_FORM"
        :value="formState.tmplId"
        :disabled="disabledTmplId"
        @select="onFormVersionSelect"
        :query-params="queryParams"
        :enable-control="true"
        :placeholder="t('sys.chooseText')"
      />
    </a-form-item>

    <a-form-item
      :label="$t('sys.onlineForm.remarkName')"
      name="title"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseInputSth', { sth: $t('sys.onlineForm.formRemarkName') }),
          whitespace: true,
        },
      ]"
    >
      <a-input
        v-model:value="formState.title"
        show-count
        :maxlength="64"
        :placeholder="t('sys.inputText')"
      />
    </a-form-item>

    <a-form-item
      :label="$t('sys.webRender.edhrApplication.informant')"
      name="operatorRange"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.informant') }),
        },
      ]"
    >
      <ApprovalUserSelectConfig
        :placeholder="t('sys.chooseText')"
        v-model:model-value="formState.operatorRange"
        :showTabs="['User', 'Org', 'Role', 'UserGroup']"
      />
    </a-form-item>
    <a-form-item :label="$t('sys.edhr.relateMaterialNo')" name="relatedMaterialNos">
      <lot-table-select
        v-model:value="formState.relatedMaterialNos"
        :placeholder="t('sys.chooseText')"
        ignoreArchived
        variant="select"
        :disabled="disabledMaterialNo"
        rowSelectionMode="multiple"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject, reactive, onMounted } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { OnlineFormInsTaskRequest } from '/@/apis/gct-apaas/model';
  import { useUserStore } from '/@/store/modules/user';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import ApprovalUserSelectConfig from '/@app-designer/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import LotTableSelect from '../../../components/lot-table-select/lot-table-select.vue';

  const props = defineProps<{
    form?: OnlineFormInsTaskRequest;
    disabledMaterialNo?: boolean;
    disabledTmplId?: boolean;
  }>();

  const { t } = useI18n();
  const userStore = useUserStore();

  const formRef = ref<FormInstance>();
  const formState = reactive<OnlineFormInsTaskRequest>({
    formType: undefined,
    title: undefined,
    tmplId: undefined,
    tmplName: undefined,
    operatorRange: '',
    relatedMaterialNos: undefined,
  });

  onMounted(() => {
    if (props.form) {
      Object.assign(formState, props.form);
    }
    formState.operatorRange = props?.form?.operatorRange || `USER:${userStore.getUserInfo.userId}`;
  });

  const queryParams = {
    formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].join(','),
  };

  const onFormVersionSelect = (v) => {
    formState.tmplId = `${v.baseId}:${v.id}`;
    formState.tmplName = `${v.name}:${v.version}`;
    formState.formType = v.formType;
  };

  const modal = inject<any>('modal');
  modal.ok = async () => {
    try {
      await formRef.value?.validate();
      const result = {
        ok: true,
        data: {
          ...formState,
        },
      };
      return result;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style></style>
