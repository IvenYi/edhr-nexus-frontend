<template>
  <a-form
    :class="ns.b()"
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item :label="t('sys.edhr.lotOrSn')">
      <a-input :disabled="true" :value="data.materialNo" :placeholder="t('sys.inputText')" />
    </a-form-item>
    <a-form-item :label="$t('sys.onlineForm.formName')">
      <a-input :disabled="true" :value="data.ofTmplName" :placeholder="t('sys.inputText')" />
    </a-form-item>
    <a-form-item :label="$t('sys.pageDesigner.originalHandler')">
      <a-input :disabled="true" :value="data.assigneeName" :placeholder="t('sys.inputText')" />
    </a-form-item>
    <a-form-item
      required
      :label="$t('sys.pageDesigner.handler')"
      name="reassignUser"
      :rules="[
        {
          required: true,
          message: t('sys.chooseTextTip', { name: t('sys.pageDesigner.handler') }),
        },
      ]"
    >
      <GrantUserSelect
        :placeholder="t('sys.chooseTextTip', { name: t('sys.pageDesigner.handler') })"
        v-model:value="formData.reassignUser"
        :is-granted="true"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from 'vue-i18n';
  import { postOnlineFormProcessInterfereReassign } from '/@/apis/gct-apaas/OnlineFormProcessController';
  import GrantUserSelect from '/@web-render/views/edhr-application/render/user-granted/components/grant-user-select.vue';

  const { t } = useI18n();

  const ns = useNamespace('edhr-outline-modal');

  const props = defineProps<{
    data: ProcessTaskTodoResponse;
  }>();

  const formData = reactive<{
    reassignUser?: string;
  }>({
    reassignUser: undefined,
  });

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value?.validate();
    await postOnlineFormProcessInterfereReassign({
      ofInstId: props.data.ofInstanceId!,
      taskId: props.data.taskId!,
      toUserId: formData.reassignUser!,
    });

    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
    };
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-modal) {
    padding-top: 12px;
  }
</style>
