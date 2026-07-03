<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    width="700px"
    :minHeight="isShowIdentifier ? 100 : 40"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
    :okText="t('sys.saveText')"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        v-if="isShowIdentifier"
        :label="labelName['identifier']"
        name="identifier"
        :extra="identifierHelp ? undefined : $t('sys.org.orgNumTip')"
        :help="identifierHelp"
        :rules="[{ validator: validateValue }, { validator: validateIdentifier }]"
      >
        <a-input
          v-model:value="formState.identifier"
          :placeholder="t('sys.inputText')"
          @change="(e) => !e?.target?.value?.trim() && (identifierHelp = undefined)"
        />
        <!-- <div class="text-[12px] text-[#8F8F8F] mt4px">{{ $t('sys.org.orgNumTip') }}</div> -->
      </a-form-item>
      <a-form-item
        :label="labelName['name']"
        name="name"
        :rules="[
          { required: true, whitespace: true },
          { validator: validateValue },
          { validator: validateName },
        ]"
      >
        <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script setup lang="ts" name="org-modal">
  import { ref, computed, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import {
    TypeEnum,
    ModalTypeEnum,
    ModalTypeNameMap,
    TypeNameMap,
  } from '../../constant/treeInterface';

  import type { FormInstance } from 'ant-design-vue';
  import { hasEmojiAndSpecStr } from '/@/utils/validate';
  import { postOrgInputCheck } from '/@/apis/gct-platform/OrgController';
  import { pick } from 'lodash-es';

  const { t } = useI18n();

  /** 是否支持部门编号 */
  const { getOrgIdentifier } = useRootSetting();

  const emit = defineEmits(['ok', 'register']);

  const type = ref<TypeEnum.Bloc | TypeEnum.Company | TypeEnum.Department>();
  const modalType = ref<ModalTypeEnum.Create | ModalTypeEnum.Edit>();
  const formRef = ref<FormInstance>();

  interface FormState {
    /** id */
    id: string | undefined;
    /** 父节点 */
    parentId: string | undefined;
    /** 编号 */
    identifier: string;
    /** 名称 */
    name: string;
  }

  const formState = reactive<FormState>({
    id: undefined,
    parentId: undefined,
    identifier: '',
    name: '',
  });

  const title = ref();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      type.value = data.type;
      modalType.value = data.modalType;
      formState.id = data.id;
      formState.parentId = data.parentId;
      formState.identifier = data.identifier;
      formState.name = data.name;
      title.value = data.title;
    }
  });

  const isShowIdentifier = computed(() => {
    return !(type.value === TypeEnum.Department && !getOrgIdentifier.value);
  });

  // const title = computed(() => {
  //   return `${ModalTypeNameMap[modalType.value ?? '']}${TypeNameMap[type.value ?? '']}`;
  // });

  const labelName = computed(() => {
    return {
      identifier: `${TypeNameMap[type.value ?? '']}${t('sys.no')}`,
      name: `${TypeNameMap[type.value ?? '']}${t('sys.name')}`,
    };
  });

  // 弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    console.warn('visible', visible);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = undefined;
    formState.parentId = undefined;
    identifierHelp.value = undefined;
  };

  const handleOk = () => {
    formRef.value?.validate().then(() => {
      emit('ok', {
        info: { ...toRaw(formState) },
        type: type.value,
        isEdit: modalType.value === ModalTypeEnum.Edit,
      });
      closeModal();
    });
  };

  const identifierHelp = ref();
  const validateValue = async (rule, value, isName) => {
    if (!isName) identifierHelp.value = undefined;
    const val = value?.trim();
    if (val?.length > 100) {
      if (!isName) identifierHelp.value = $t('sys.designView.title.errorMsg');
      return Promise.reject(isName ? $t('sys.designView.title.errorMsg') : undefined);
    }
    if (hasEmojiAndSpecStr(value)) {
      if (!isName) identifierHelp.value = $t('sys.model.modelNameError');
      return Promise.reject(isName ? $t('sys.model.modelNameError') : undefined);
    }
    return Promise.resolve();
  };

  const validateIdentifier = async (rule, value) => {
    identifierHelp.value = undefined;
    try {
      await postOrgInputCheck(pick(formState, ['parentId', 'identifier', 'id']), {
        errorMessageMode: 'none',
      });
    } catch (error) {
      identifierHelp.value = $t('sys.org.duplicateNoTip');
      return Promise.reject();
    }
    return Promise.resolve();
  };

  const validateName = async (rule, value) => {
    try {
      await postOrgInputCheck(pick(formState, ['parentId', 'name', 'id']), {
        errorMessageMode: 'none',
      });
    } catch (error) {
      return Promise.reject($t('sys.org.duplicateNameTip', { name: formState.name }));
    }
    return Promise.resolve();
  };
</script>
<style scoped lang="less"></style>
