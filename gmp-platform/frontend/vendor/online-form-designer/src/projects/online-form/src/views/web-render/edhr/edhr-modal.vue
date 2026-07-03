<template>
  <div :class="ns.b()">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.category')"
        name="categoryId"
        :rules="[
          {
            required: true,
            message: t('sys.chooseTextTip', {
              name: t('sys.category'),
            }),
          },
        ]"
      >
        <CategorySelect
          :disabled="disabledFields.includes('categoryId')"
          v-model:value="formData.categoryId"
          :module="categoryModule"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.name')"
        name="name"
        :rules="[
          {
            required: true,
            validator: validateVersion,
          },
        ]"
      >
        <div class="ks-row">
          <a-input-group compact class="ks-col">
            <a-form-item style="width: calc(100% - 120px)" name="name">
              <a-input
                v-model:value="formData.name"
                :disabled="disabledFields.includes('name')"
                style="height: 32px"
                @change="onChange"
                :placeholder="t('sys.inputTextTip')"
                :maxlength="64"
              />
            </a-form-item>
            <a-form-item name="version" style="width: 120px">
              <a-input
                :disabled="disabledFields.includes('version')"
                :placeholder="t('sys.appDesigner.version')"
                v-model:value="formData.version"
                @change="onChange"
                style="height: 32px"
                :maxlength="20"
              />
            </a-form-item>
          </a-input-group>
          <div class="checkbox-wrap">
            <a-checkbox v-model:checked="defaultValue" />
            <span class="ml6px">{{ t('sys.default') }}</span>
          </div>
        </div>
      </a-form-item>
      <a-form-item
        :label="t('sys.platform.code')"
        name="code"
        :rules="[
          { pattern: /^[a-zA-Z0-9_\\.-]+$/, message: t('sys.edhr.codeFormat') },
          { validator: validateCodeLength },
        ]"
      >
        <a-input
          v-model:value="formData.code"
          :disabled="disabledFields.includes('code')"
          :placeholder="t('sys.pleaseInputSth')"
          :show-count="true"
          :maxlength="64"
        />
      </a-form-item>
      <a-form-item :label="t('sys.edhr.offlineVersion')" name="offlineVersion">
        <a-input
          v-model:value="formData.offlineVersion"
          :disabled="disabledFields.includes('offlineVersion')"
          :placeholder="t('sys.inputTextTip')"
          :show-count="true"
          :maxlength="20"
        />
      </a-form-item>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          :disabled="disabledFields.includes('description')"
          v-model:value="formData.description"
          show-count
          :maxlength="120"
          :rows="5"
          :placeholder="t('sys.inputTextTip')"
        />
      </a-form-item>
    </a-form>
  </div>
  <div class="p16px text-right selected-row-modal__footer">
    <a-button class="mr16px" @click="handleClose">{{ t('sys.cancel') }}</a-button>
    <a-button class="mr16px" type="primary" @click="handleOk(false)">{{ t('sys.ok2') }}</a-button>
    <a-button v-if="showOk2Open" type="primary" @click="handleOk(true)">{{
      $t('sys.onlineForm.confirmAndDesign')
    }}</a-button>
  </div>
</template>

<script setup lang="ts" name="form-modal">
  import { computed, reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, useNamespace, IModal } from '@gct/runtime';
  import { merge, pickBy } from 'lodash-es';
  import { CategoryModuleEnum } from '../constant';
  import { CategorySelect } from '../category';
  import { OnlineFormTmplRequest } from '/@/apis/gct-apaas/model';

  const ns = useNamespace('form-modal');

  const { t } = useI18n();

  const validateCodeLength = (_, value, callback) => {
    if (value && value.length > 64) {
      callback(t('sys.onlineForm.codeLengthValidateTip'));
    }
    callback();
  };

  const props = withDefaults(
    defineProps<{
      modal: IModal;
      categoryModule: CategoryModuleEnum;
      data?: IData;
      disabledFields?: Array<keyof OnlineFormTmplRequest>;
      /** 是否显示确认并打开按钮 */
      showOk2Open?: boolean;
      shouldClose?: (data, isOk2Open?: boolean) => Promise<boolean>;
    }>(),
    {
      data: () => ({}),
      disabledFields: () => [],
      showOk2Open: false,
      categoryModule: CategoryModuleEnum.EDHR,
    },
  );

  const _module = computed(() => {
    const moduleMap = {
      [CategoryModuleEnum.EDHR]: 'dhr',
      [CategoryModuleEnum.INSPECTION]: 'inspection',
      [CategoryModuleEnum.RELEASE]: 'release',
    };
    return moduleMap[props.categoryModule];
  });

  const formData = reactive(
    merge(
      {
        id: '',
        categoryId: '',
        default: 0,
        description: '',
        modelKey: '',
        name: '',
        code: '',
        version: '',
        module: _module.value,
      },
      props.data || {},
    ),
  );

  /** 默认复选框的值（boolean） */
  const defaultValue = computed({
    get() {
      return formData.default === 1;
    },
    set(v) {
      formData.default = v ? 1 : 0;
    },
  });

  const validateVersion = async (_rule, _value) => {
    const { name, version } = formData;

    if (!version && !name) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterNameVersionNumber'));
    } else if (!name) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterName'));
    } else if (!version) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterVersionNumber'));
      // } else if (!/\d+/.test(value[0]) || !/\d+/.test(value[1])) {
      //   return Promise.reject('请输入正确的版本号');
    } else if (version.length > 20) {
      return Promise.reject($t('sys.onlineForm.fieldVersionValidateTip'));
    } else if (name.length > 64) {
      return Promise.reject($t('sys.onlineForm.fieldNameValidateTip'));
    } else {
      return Promise.resolve();
    }
  };

  const onChange = () => {
    formRef.value?.validateFields('name');
  };

  const formRef = ref<FormInstance>();

  useModal(async (isOk2Open) => {
    await formRef.value!.validate();
    const editedData = pickBy(formData, (v) => v !== undefined);
    let isClose = true;
    if (props.shouldClose) {
      isClose = await props.shouldClose(editedData, isOk2Open);
    }
    return {
      ok: isClose,
      data: [editedData],
    };
  });

  function handleClose() {
    props.modal.dismiss();
  }

  async function handleOk(isOk2Open = false) {
    try {
      if (props.modal && typeof props.modal.ok === 'function') {
        const result = await props.modal.ok(isOk2Open);
        if (result && result.ok) {
          props.modal.dismiss(result!);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
</script>

<style lang="less">
  .edhr-custom-modal {
    .ant-modal.gct-modal:not(.is-full-screen) {
      min-width: 640px;
      max-width: 1120px;

      .ant-modal-body {
        margin-bottom: 64px;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @include b(form-modal) {
    padding-top: 12px;
  }

  .ant-input-group {
    :deep(.ant-form-item) {
      margin-bottom: 0;

      &:first-child {
        .ant-input-affix-wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      &:last-child {
        .ant-input-affix-wrapper {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }
  .checkbox-wrap {
    height: 32px;
    margin-left: 8px;
    color: #3d3d3e;
    line-height: 32px;
  }

  .selected-row-modal__footer {
    border-top: 1px solid #e0e3ea;
    position: absolute;
    bottom: 0;
    width: 100%;
    background: #fff;
  }
</style>
