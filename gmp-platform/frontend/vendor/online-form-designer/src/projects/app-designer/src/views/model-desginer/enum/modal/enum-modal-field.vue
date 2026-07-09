<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.model.editField') : t('sys.model.newField')"
    centered
    :min-height="200"
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="enumFormRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <I18nSelectInputForm
            :formRef="enumFormRef"
            formItemName="text"
            :fromItemExtraProps="{ label: t('sys.model.fieldName'), rules: [{ required: true }] }"
            :inputExtraProps="{ showCount: true, maxlength: 32 }"
            v-model:text="formState.text"
            v-model:i18nConfig="formState.i18nConfig"
          />
          <a-form-item
            :label="t('sys.model.enumValue')"
            name="value"
            :rules="[
              { required: true },
              {
                validator: validateSpecialCharacters,
              },
            ]"
          >
            <a-input
              v-model:value="formState.value"
              show-count
             
              :maxlength="32"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel
          v-show="!(!showColor && !showIcon)"
          key="2"
          :header="t('sys.model.configOpt')"
        >
          <a-form-item label=" " :colon="false">
            <div class="preview-form-item gct-text-overflow">
              <IconNext
                v-show="showIcon"
                :size="22"
                :value="formState.icon"
                :color="formState.iconColor"
                style="vertical-align: middle"
              />
              <span
                v-show="showColor"
                :style="`color:${formState.textColor};margin-left:5px;vertical-align: middle`"
                :title="formState.text || t('sys.text')"
                >{{ formState.text || t('sys.text') }}</span
              >
            </div>
          </a-form-item>
          <a-form-item v-show="showColor" :label="t('sys.model.nameColor')">
            <ColorPicker
              :color="formState.textColor"
              :preset="presetColor"
              :width="240"
              @update:color="handleUpdateColor"
            >
              <template #icon>
                <div
                  :style="{
                    width: '22px',
                    height: '22px',
                    backgroundColor: formState.textColor,
                  }"
                ></div>
              </template>
            </ColorPicker>
          </a-form-item>
          <a-form-item v-show="showIcon" :label="t('sys.model.fieldIcon')">
            <IconNextPicker
              v-model:value="formState.icon"
              v-model:color="formState.iconColor"
              :size="22"
              background="#ffffff"
              show-color
              :style="{
                '--box-size': '28px',
              }"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <template v-if="!isEdit" #centerFooter>
      <a-button type="primary" @click="handleSave">{{ t('sys.confirmAndContinue') }}</a-button>
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance, message } from 'ant-design-vue';
  import { EnumModelInfo, ColorPreset } from '../types/enum-modal';
  import {
    postEnumModelField,
    putEnumModelFieldById,
  } from '/@/apis/gct-apaas/EnumModelFieldController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import ColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { IconNextPicker, IconNext } from '/@/components/Icon';
  import { resetReactiveState } from '/@/utils';
  import { useTheme } from '/@/hooks/web/useTheme';

  type EnumModel = Omit<EnumModelInfo, 'sortNum'>;

  const { themeVars } = useTheme();

  const props = defineProps<{
    id: string;
    showColor: boolean;
    showIcon: boolean;
  }>();

  const emit = defineEmits(['refresh']);
  const { t } = useI18n();

  const enumFormRef = ref<FormInstance>();
  const isEdit = ref<boolean>(false);
  const enumModeId = ref('');
  const activeKey = ref(['1', '2']);

  const formState = reactive<Partial<EnumModel>>({
    text: '',
    value: '',
    i18nConfig: '',
    textColor: '#000000',
    icon: 'icon-park:all-application',
    iconColor: themeVars.primaryColor,
  });

  const presetColor = ColorPreset;

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = (data) => {
    isEdit.value = data.isEdit;
    enumModeId.value = data.id ?? '';
    formState.enumModelId = data.enumModelId ?? '';
    formState.text = data.text;
    formState.value = data.value;
    formState.i18nConfig = data.i18nConfig;
    formState.icon = data.icon;
    formState.iconColor = data.iconColor;
    formState.textColor = data.textColor;
  };

  const handleClose = () => {
    isEdit.value = false;
    enumFormRef.value?.resetFields();
    closeModal();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z0-9_]*$/;
    if (!reg.test(value)) {
      callback(t('sys.model.validateEnumFieldErrorMsg'));
    }
    callback();
  };

  // 保存并继续
  const handleSave = async () => {
    await enumFormRef.value?.validate();
    await postEnumModelField({ ...toRaw(formState), enumModelId: props.id });
    message.success('枚举字段保存成功');
    enumFormRef.value?.resetFields();
    resetReactiveState(formState, {
      modelKey: formState.enumModelId,
      text: '',
      value: '',
      icon: 'icon-park:all-application',
      iconColor: themeVars.primaryColor,
      i18nConfig: '',
      textColor: '#000000',
    });
    emit('refresh');
  };

  const handleOk = () => {
    enumFormRef.value?.validate().then(async () => {
      if (isEdit.value) {
        await putEnumModelFieldById({ id: enumModeId.value }, { ...toRaw(formState) });
      } else {
        await postEnumModelField({ ...toRaw(formState), enumModelId: props.id });
      }
      isEdit.value = false;
      emit('refresh');
      closeModal();
    });
  };

  const handleUpdateColor = (e, h) => {
    formState.textColor = h;
  };
</script>

<style lang="less" scoped>
  .series {
    :deep(.ant-form-item-label) {
      label {
        display: none;
      }
    }
  }
  .preview-form-item {
    height: 60px;
    line-height: 60px;
    text-align: center;
    padding-left: 5px;
    padding-right: 5px;
    background-color: #f5f5f5;
  }

  :deep {
    .ant-form-item-control-input-content {
      .box {
        height: 32px;
        width: 32px;
        border: 1px solid #d9d9d9;
        box-sizing: border-box;
        padding: 4px;
        border-radius: 4px;
      }
    }
  }
  :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
    padding: 0 16px;
    margin-top: 12px;
    margin-bottom: 12px;
  }
</style>
