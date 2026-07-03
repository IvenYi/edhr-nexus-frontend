<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="modalTitle"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.name')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="64"
          :placeholder="`${t('sys.inputText')}`"
        />
      </a-form-item>
      <a-form-item
        v-if="formState.type === RuleTypeEnum.RULE_EXP"
        :label="t('sys.appDesigner.expression')"
        name="ruleContent"
        :rules="[{ required: true }]"
      >
        <a-input
          readonly
          @click="addFormula"
          :placeholder="t('sys.inputText')"
          :value="formState.ruleContent"
        />
      </a-form-item>

      <a-form-item
        v-if="formState.type === RuleTypeEnum.RULE_SCRIPT"
        :label="t('sys.model.serviceScript')"
        name="ruleContent"
        :rules="[{ required: true }]"
      >
        <a-select v-model:value="formState.ruleContent" style="width: 84%" :options="options" />
        <a-button class="h-32px" type="link" @click="handleCreateScript">{{
          t('sys.new')
        }}</a-button>
      </a-form-item>

      <a-form-item :label="t('sys.appDesigner.abnormalRexInfo')" name="exception">
        <a-textarea
          v-model:value="formState.exception"
          :maxlength="120"
          show-count
          class="i18n-textarea"
        />
        <i18n-select-btn
          :buttonExtraProps="{ type: 'link', class: 'custom-i18n-btn reg-i18n' }"
          :i18nValue="formState.i18nConfig"
          @on-select-i18n="handleSelectI18n"
        />
      </a-form-item>
    </a-form>
    <script-modal
      @register="scriptRegister"
      :scriptCategory="options"
      @create-success="handleCreateScriptSuccess"
    />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, toRaw } from 'vue';
  import { FormInstance, SelectProps } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { I18nSelectBtn } from '/@/components/I18nSelect';
  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { RuleTypeEnum } from '../constant/index';
  import { isEmpty } from 'lodash-es';
  import { formulaFilter } from '@gct/runtime';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

  import type { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const { openModal, identify } = useExpression();

  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const props = defineProps<{
    modelKey: string;
  }>();

  const emit = defineEmits(['getValue']);

  interface FormState {
    id?: string;
    /** 规则名称 */
    name?: string;
    /** 表达式 */
    ruleContent?: string;
    specificConfig?: any;
    /** 异常信息 */
    exception?: string;
    i18nConfig?: string;
    /** 类型 */
    type?: string;
  }

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    id: undefined,
    name: undefined,
    ruleContent: undefined,
    specificConfig: {},
    exception: undefined,
    i18nConfig: '',
    type: undefined,
  });

  const isEdit = ref(false);

  const options = ref<SelectProps['options']>();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;

    isEdit.value = data.isEdit;

    if (!isEdit.value) {
      formState.id = data.uuid;
      formState.type = data.type;
    }

    if (data.isEdit && data.info) {
      onDataReceive(data.info);
    }

    if (formState.type === RuleTypeEnum.RULE_SCRIPT) {
      getScriptData();
    }
  });

  const onDataReceive = (node) => {
    formState.id = node.id ?? '';
    formState.name = node.name;
    formState.ruleContent = node.ruleContent;
    formState.specificConfig = node.specificConfig;
    formState.exception = node.exception;
    formState.i18nConfig = node.i18nConfig;
    formState.type = node.type;
  };

  const modalTitle = computed(() => {
    if (formState.type === RuleTypeEnum.RULE_EXP) {
      return isEdit.value
        ? t('sys.appDesigner.addExpressionRules')
        : t('sys.appDesigner.editExpressionRules');
    }
    if (formState.type === RuleTypeEnum.RULE_SCRIPT) {
      return isEdit.value
        ? t('sys.appDesigner.addScriptRules')
        : t('sys.appDesigner.editScriptRules');
    }
    return '';
  });

  const formatData = (data: CategoryCompleteResponse[]) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          id: folder.id,
          name: folder.name,
          label: folder.name,
          options: [],
        };
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              id: i.id,
              label: i.name,
              value: i.key,
            };
            item.options.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value = formatData(data);
  };

  const _getIdentifiers = async () => {
    const fieldList = await getFieldMetaList({ modelKey: props.modelKey! });
    const children =
      fieldList
        ?.filter(formulaFilter)
        ?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
    return children;
  };

  const addFormula = async () => {
    openModal({
      expr: formState.specificConfig.exp,
      mode: ExpressionModeEnum.FIELD_DISPLAY,
      modalTitle: isEdit.value
        ? t('sys.appDesigner.editExpression')
        : t('sys.appDesigner.addExpression'),
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },

      callback: (expr, _, form) => {
        formState.specificConfig.relationColumns = identify(expr);
        formState.specificConfig.exp = expr;
        formState.specificConfig.expression = form?.exprEcho || '';
        formState.ruleContent = form?.exprEcho || '';
        formRef.value?.validateFields(['ruleContent']);
      },
    });
  };

  const handleCreateScript = () => {
    openScriptModal(true, {
      uuid: randomUUID(),
    });
  };

  const handleCreateScriptSuccess = async (id) => {
    await getScriptData();
    const service = options.value
      ?.reduce((arr, item) => {
        arr.push(...item.options!);
        return arr;
      }, [])
      .find((item) => item.id === id);
    console.log(service);
    formState.ruleContent = service.value;
  };

  const handleSelectI18n = (params: { i18nKey: string; i18nTitle: string }) => {
    if (isEmpty(formState.exception) && !isEmpty(params)) {
      formState.exception = params.i18nTitle;
    }

    if (isEmpty(params)) {
      formState.i18nConfig = undefined;
    } else {
      formState.i18nConfig = params.i18nKey;
    }
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    formState.id = undefined;
    formState.i18nConfig = '';
    formState.ruleContent = undefined;
    formState.specificConfig = {};
    formState.type = undefined;
    options.value = [];
  };

  const handleOk = async () => {
    emit('getValue', { ...toRaw(formState) }, isEdit.value);
    closeModal();
  };
</script>

<style lang="less" scoped>
  .i18n-textarea {
    position: relative;
    z-index: 2;
  }
</style>
