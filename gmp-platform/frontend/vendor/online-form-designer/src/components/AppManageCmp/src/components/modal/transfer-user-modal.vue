<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="t('sys.developer.appCenter.transfer')"
    centered
    width="640px"
    :minHeight="30"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      :model="formState"
      autocomplete="off"
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 12 }"
    >
      <a-form-item
        :label="t('sys.developer.appCenter.handoverTo')"
        name="targetUserId"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.targetUserId"
          style="width: 100%"
          :placeholder="
            t('sys.pleaseSelectSth', {
              sth: t('sys.developer.appCenter.user'),
            })
          "
        >
          <a-select-option v-for="user in filterUserList" :value="user.userId" :key="user.userId">{{
            user.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="transfer-user-modal">
  import { reactive, ref, toRaw, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getTenantDeveloperList } from '/@/apis/gct-platform/TenantDeveloperController';
  import type { TenantDeveloperDTO } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();

  interface FormState {
    id?: string;
    userId?: string;
    /** 成员 */
    targetUserId?: string;
  }

  interface ModalInfo {
    id: string;
    userId: string;
  }

  interface Props {
    appId?: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['ok']);

  const userList = ref<Array<TenantDeveloperDTO>>([]);

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    id: undefined,
    userId: undefined,
    targetUserId: undefined,
  });

  const [registerInner, { closeModal }] = useModalInner((data: ModalInfo) => {
    if (data) {
      formState.id = data.id;
      formState.userId = data.userId;
    }
  });

  const filterUserList = computed(() => {
    return userList.value.filter((item) => item.userId !== formState.userId);
  });

  const handleShow = async (visible: boolean) => {
    if (visible) {
      // 初始化
      userList.value = (await getTenantDeveloperList()) ?? [];
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    userList.value = [];
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      emit('ok', { ...toRaw(formState) });
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
