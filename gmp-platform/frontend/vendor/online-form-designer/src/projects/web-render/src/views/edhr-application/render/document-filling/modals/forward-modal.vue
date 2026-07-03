<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item :label="$t('sys.appDesigner.printDesign.form.name2')" name="name">
      {{ task.tmplName }}
    </a-form-item>

    <a-form-item :label="$t('sys.onlineForm.formRemarkName')" name="name">
      {{ task.title }}
    </a-form-item>

    <a-form-item
      :label="$t('sys.webRender.edhrApplication.informant')"
      name="operatorId"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.informant') }),
        },
      ]"
    >
      <GrantUserSelect
        class="w-full"
        :hidden-keys="[info.userId!]"
        :value="formState.operatorId"
        :is-granted="true"
        @select="handleOperatorChange"
        :placeholder="
          t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.informant') })
        "
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject, reactive } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import type { UserResponse } from '/@/apis/gct-platform/model';
  import { getAppGrantedUserPageList } from '/@/apis/gct-apaas/AppGrantedUserController';
  import GrantUserSelect from '/@web-render/views/edhr-application/render/user-granted/components/grant-user-select.vue';
  import { useUserStore } from '/@/store/modules/user';

  defineProps<{
    task: OnlineFormInstanceResponse;
  }>();

  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const userStore = useUserStore();
  const info = userStore.getUserInfo;

  const formState: {
    operatorId?: string;
    operator?: string;
  } = reactive({
    operatorId: undefined,
    operator: undefined,
  });

  const handleOperatorChange = (selectArr) => {
    const value = selectArr?.[0];
    formState.operatorId = value?.id;
    formState.operator = value?.name;
  };

  const grantedUserList = ref<UserResponse[]>([]);

  (async () => {
    const res = await getAppGrantedUserPageList({
      pageNo: 1,
      pageSize: 9999,
    });
    grantedUserList.value = res?.data ?? [];
  })();

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
