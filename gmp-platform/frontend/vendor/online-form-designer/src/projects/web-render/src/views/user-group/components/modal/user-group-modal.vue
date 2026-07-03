<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.appDesigner.parentUserGroup')" name="parentId">
        <span>{{ formState.parentName ?? '-' }}</span>
      </a-form-item>
      <a-form-item
        :label="t('sys.appDesigner.userGroupName')"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" :maxlength="32" show-count />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script setup lang="ts" name="user-group-modal">
  import { ref, computed, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModalTypeEnum } from '../../constant/interface';

  import type { FormInstance } from 'ant-design-vue';

  const { t } = useI18n();

  const emit = defineEmits(['ok', 'register']);

  const formRef = ref<FormInstance>();

  const modalType = ref<ModalTypeEnum.Create | ModalTypeEnum.Edit>();

  interface FormState {
    /** id */
    id: number | undefined;
    /** 父节点id */
    parentId: number | undefined;
    /** 父节点名称 */
    parentName?: string;
    /** 名称 */
    name?: string;
  }

  const formState = reactive<FormState>({
    id: undefined,
    parentId: undefined,
    parentName: undefined,
    name: undefined,
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      modalType.value = data.modalType;
      if (data.info) {
        formState.id = data.info.id;
        formState.parentId = data.info.parentId;
        formState.parentName = data.info.parentName;
        formState.name = data.info.name;
      }
    }
  });

  const title = computed<string>(() => {
    if (modalType.value === ModalTypeEnum.Create) {
      return t('sys.appDesigner.createUserGroup');
    }
    if (modalType.value === ModalTypeEnum.Edit) {
      return t('sys.appDesigner.editUserGroup');
    }
    return '';
  });

  // 弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    console.warn('visible', visible);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = undefined;
    formState.parentName = undefined;
  };

  const handleOk = () => {
    formRef.value?.validate().then(() => {
      emit('ok', {
        info: { ...toRaw(formState) },
        isEdit: modalType.value === ModalTypeEnum.Edit,
        callback: closeModal,
      });
    });
  };
</script>
<style scoped lang="less"></style>
