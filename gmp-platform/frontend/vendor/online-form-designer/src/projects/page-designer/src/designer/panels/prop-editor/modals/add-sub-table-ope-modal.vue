<template>
  <basic-modal
    v-bind="$attrs"
    :title="t('sys.pageDesigner.button')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="register"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.pageDesigner.title')"
        name="label"
        :rules="[
          {
            required: true,
            message: t('sys.pageDesigner.title') + t('sys.pageDesigner.cannotBeEmpty'),
          },
        ]"
      >
        <a-input v-model:value="formState.label" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item
        :label="t('sys.pageDesigner.buttonType')"
        name="buttonType"
        :rules="[
          {
            required: true,
            message: t('sys.pageDesigner.buttonType') + t('sys.pageDesigner.cannotBeEmpty'),
          },
        ]"
      >
        <a-radio-group v-model:value="formState.buttonType" button-style="solid">
          <a-radio-button :value="i" v-for="i in ButtonColorType" :key="i">{{
            t('sys.pageDesigner.' + i)
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <!-- innerEvent -->
      <a-form-item
        :label="t('sys.pageDesigner.buttonTheme')"
        name="buttonTheme"
        :rules="[
          {
            required: true,
            message: t('sys.pageDesigner.buttonTheme') + t('sys.pageDesigner.cannotBeEmpty'),
          },
        ]"
      >
        <a-select
          v-model:value="formState.buttonTheme"
          style="width: 100%"
          :placeholder="t('sys.chooseText')"
        >
          <a-select-option :value="i" v-for="i in ButtonColorTheme" :key="i">{{
            t('sys.pageDesigner.' + i)
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.pageDesigner.eventType')" name="subTableEventType">
        <a-select v-model:value="formState.subTableEventType">
          <!-- <a-select-option :value="SUB_TABLE_OPE_EVENT_TYPE.ADD">{{
            t('sys.insert')
          }}</a-select-option> -->
          <a-select-option
            v-if="w?.props.editMode !== SUB_TABLE_EDIT_MODE.INLINE"
            :value="SUB_TABLE_OPE_EVENT_TYPE.EDIT"
            >{{ t('sys.edit') }}</a-select-option
          >
          <a-select-option
            v-if="w?.props.editMode !== SUB_TABLE_EDIT_MODE.INLINE && w?.props.isDynamicFormMode"
            :value="SUB_TABLE_OPE_EVENT_TYPE.COPY"
            >{{ t('sys.copy') }}</a-select-option
          >
          <a-select-option :value="SUB_TABLE_OPE_EVENT_TYPE.DELETE">{{
            t('sys.delete')
          }}</a-select-option>
          <a-select-option :value="SUB_TABLE_OPE_EVENT_TYPE.CUSTOM">{{
            t('sys.customize')
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-show="formState.subTableEventType === SUB_TABLE_OPE_EVENT_TYPE.CUSTOM"
        :label="t('sys.pageDesigner.eventName')"
        name="eventName"
        :rules="[
          {
            required:
              formState.subTableEventType === SUB_TABLE_OPE_EVENT_TYPE.CUSTOM ? true : false,
            message: t('sys.pageDesigner.eventName') + t('sys.pageDesigner.cannotBeEmpty'),
          },
        ]"
      >
        <a-input v-model:value="formState.eventName" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item :label="t('sys.pageDesigner.confirm')" name="confirm">
        <a-switch v-model:checked="formState.confirm" />
      </a-form-item>
      <a-form-item
        v-if="formState.confirm"
        :label="t('sys.pageDesigner.confirmText')"
        name="confirmText"
        :rules="[
          {
            required: true,
            message: t('sys.pageDesigner.confirmText') + t('sys.pageDesigner.cannotBeEmpty'),
          },
        ]"
      >
        <a-input v-model:value="formState.confirmText" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item :label="t('sys.pageDesigner.displayRule')">
        <a-button @click="handleOpenExpr" :type="!!formState.displayRule ? 'primary' : 'default'">
          <template #icon>
            <setting-outlined />
          </template>
          {{ t('sys.edit') + t('sys.pageDesigner.displayRule') }}
        </a-button>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts" name="add-sub-table-ope-modal">
  import { type FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    ButtonColorTheme,
    ButtonColorType,
    SUB_TABLE_OPE_EVENT_TYPE,
    SUB_TABLE_EDIT_MODE,
  } from '/@page-designer/enum';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { cloneDeep } from 'lodash-es';
  import { OperateButton, SubTable } from '/@page-designer/types/web/widget-types';
  import { OperateButtonProps } from '/@page-designer/types/web/props-types';

  const { allFormWidget } = useDesigner();

  const emit = defineEmits(['register', 'ok']);
  const { t } = useI18n();
  const { openModal } = useExpression();
  const formRef = ref<FormInstance>();
  const formState = ref<Partial<OperateButtonProps>>({
    buttonTheme: ButtonColorTheme.DEFAULT,
    buttonType: ButtonColorType.LINK,
    icon: '',
    label: '',
    /**二次确认 */
    confirm: false,
    confirmText: '',
    /**显示条件 */
    displayRule: '',
    eventName: '',
    subTableEventType: SUB_TABLE_OPE_EVENT_TYPE.DELETE,
  });
  //子表
  const w = ref<SubTable>();
  //子表对应字段绑定的表
  const modelKey = ref('');
  const buttonSchema = ref<OperateButton>();
  const [register, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = async ({ button, widget, bindModelKey }) => {
    buttonSchema.value = button;
    formState.value = button.props;
    w.value = widget;
    modelKey.value = bindModelKey;
  };

  const handleOk = () => {
    formRef.value?.validate().then((res) => {
      buttonSchema.value!.props = cloneDeep(formState.value) as OperateButtonProps;
      emit('ok', { ...buttonSchema.value });
      closeModal();
    });
  };
  const handleClose = () => {
    w.value = undefined;
    modelKey.value = '';
    formRef.value?.resetFields();
  };
  const handleOpenExpr = async () => {
    openModal({
      expr: formState.value.displayRule,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        formState.value.displayRule = expr;
      },
    });
  };
  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P = [
      { id: w.value!.id, props: { name: $t('sys.pageDesigner.currTableRow'), model: modelKey.value } },
      ...allFormWidget.value,
    ]
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
        const children =
          fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: form.props.name || form.id,
          children,
        };
      });
    const formlist = await Promise.all(P);
    return formlist;
  };
</script>

<style lang="less" scoped></style>
