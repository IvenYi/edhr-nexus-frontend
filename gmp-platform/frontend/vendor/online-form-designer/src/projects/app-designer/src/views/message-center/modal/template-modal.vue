<template>
  <basic-modal
    v-bind="$attrs"
    centered
    width="800px"
    :title="computedTitle"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="registerInner"
  >
    <template v-if="!isEdit" #footer> </template>
    <a-form
      ref="formRef"
      class="template-form"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 22 }"
    >
      <div
        :class="{ 'template-tag': true, 'template-tag-open': formState.opened }"
        v-if="renderOpenedTag"
      >
        {{ formState.opened ? t('sys.message.openTemplate') : t('sys.message.notOpenTemplate') }}
      </div>
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="$t('sys.model.basicInfo')">
          <a-form-item
            :label="t('sys.message.templateName')"
            name="name"
            :rules="[{ required: true }]"
          >
            <i18n-select-input v-if="isEdit" attr="name" @on-i18n-select="handleI18nSelect">
              <template #i18n-input>
                <a-input
                  v-model:value="formState.name"
                  show-count
                  :maxlength="32"
                  autocomplete="off"
                  style="width: calc(100% - 32px); height: 32px"
                />
              </template>
            </i18n-select-input>
            <div v-else>
              {{ formState.name }}
            </div>
          </a-form-item>

          <a-form-item
            :label="t('sys.message.templateKey')"
            name="key"
            :rules="[
              { required: true },
              isAdd
                ? {
                    pattern: /^[A-Za-z_]+$/,
                    message: t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                      sth: t('sys.model.message_tmpl'),
                    }),
                  }
                : {},
            ]"
          >
            <a-input
              v-model:value="formState.key"
              v-if="isEdit"
              :disabled="!isAdd"
              :addon-before="keyPrefix"
              :addon-after="getEnv() === 'prod' ? null : keySuffix"
              show-count
              :maxlength="64"
            />
            <div v-else>
              {{ keyPad(formState.key) }}
            </div>
          </a-form-item>
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea
              v-if="isEdit"
              v-model:value="formState.description"
              show-count
              style="height: 90px"
              :maxlength="120"
            />
            <div v-else>
              {{ formState.description }}
            </div>
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="$t('sys.model.configOpt')">
          <SettingConfig
            ref="settingConfig"
            :isEdit="isEdit"
            :isAdd="isAdd"
            :data="settingConfigData"
            @change="changeConfigData"
            @changeConfigValidate="changeConfigValidate"
          />
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { cloneDeep, isEmpty } from 'lodash-es';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { TemplateType } from '../types/template';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { FormInstance } from 'ant-design-vue';
  import SettingConfig from '../components/setting-config.vue';
  import { useUUid } from '@/hooks/web/useUUid';
  import { getEnv } from '/@/utils';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';

  const { getCurrentProject } = usePermissionStoreWithOut();
  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const { getUuid } = useUUid([], '');

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  let settingConfigData = reactive<any>({});
  const settingConfig = ref<any>(null);

  const onDataReceive = (data) => {
    if (!isEmpty(data)) {
      const { info } = data;
      isAdd.value = !info?.id;
      isEdit.value = !!data?.isEdit;
      Object.assign(formState, info);
      formState.key = keyClip(info.key!);
      settingConfigData = cloneDeep(info);
    } else {
      formState.key = getUuid();
      settingConfigData = {};
    }
    settingConfig.value.isShow = true;
  };

  const renderOpenedTag = computed(() => {
    return getCurrentProject !== ProjectName.WEB_RENDER && getEnv() !== 'prod';
  });

  const computedTitle = computed(() => {
    let title = t('sys.menu.MessageTemplate');
    if (!isEdit.value) {
      title = t('sys.view') + title;
    } else if (isAdd.value) {
      title = t('sys.insert') + title;
    } else {
      title = t('sys.edit') + title;
    }
    return title;
  });
  const formRef = ref<FormInstance>();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('ms_');

  const isEdit = ref(true);
  const isAdd = ref(true);
  const isError = ref({
    form: false,
    pushType: false,
    content: '',
  });

  // 折叠面板激活面板
  const activeKey = ref(['1', '2']);
  //表单数据
  const formState = reactive<TemplateType>({
    key: '',
    name: '',
    description: '',
    modelKey: '',
    modelCategory: 'entity',
    pushType: '',
    pushObjectKey: '',
    messageInfo: [],
    opened: 0,
  });

  const resetModel = () => {
    settingConfig.value.resetConfig();
    settingConfig.value.isShow = false;
    isError.value.form = false;
    isError.value.pushType = false;
    isError.value.content = '';
    isAdd.value = true;
    isEdit.value = true;
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    resetModel();
    keyReset();
    closeModal();
  };

  const handleOk = () => {
    settingConfig.value.validateForm();
    settingConfig.value.validatePushType();
    settingConfig.value.validateContent();
    formRef.value?.validate().then(async () => {
      if (isError.value.form || isError.value.pushType) return;
      if (isError.value.content) {
        settingConfig.value.activeTabKey = isError.value.content;
        return;
      }
      let data = cloneDeep(formState);
      data.key = keyPad(data.key!) || '';
      emit('ok', { ...data }, !isAdd.value, handleClose);
    });
  };

  const handleI18nSelect = (params) => {
    if (isEmpty(formState.name) && !isEmpty(params)) {
      formState.name = params.i18nTitle;
    }
  };

  const changeConfigData = (data) => {
    Object.assign(formState, data);
  };

  const changeConfigValidate = (errorObj) => {
    const { form, content, pushType } = errorObj;
    isError.value.form = form;
    isError.value.pushType = pushType;
    isError.value.content = content;
  };
</script>

<style lang="less" scoped>
  .template-form {
    position: relative;
    .template-tag {
      position: absolute;
      right: 16px;
      top: 12px;
      background: #f7f8fa;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      padding: 2px 8px;
      font-weight: 400;
      font-size: 12px;
      color: #797a7d;
      display: flex;
      align-items: center;
      z-index: 1000;

      &::before {
        content: '';
        display: block;
        width: 4px;
        height: 4px;
        margin-right: 4px;
        background: #797a7d;
        box-shadow: 0px 0px 0px 1px rgba(121, 122, 125, 0.24);
        border-radius: 50%;
      }

      &-open {
        background: rgba(72, 198, 92, 0.12);
        border: 1px solid #48c65c;
        color: #48c65c;

        &::before {
          background: #48c65c;
          box-shadow: 0px 0px 0px 1px rgba(72, 198, 92, 0.24);
        }
      }
    }
  }
</style>
