<template>
  <a-form
    :class="ns.b()"
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item :label="'原处理人'">
      <a-input :disabled="true" :value="data.assigneeName" :placeholder="t('sys.inputText')" />
    </a-form-item>
    <a-form-item
      required
      :label="'现处理人'"
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

<script setup lang="ts" name="medpro-configure-drawer">
  import { reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from 'vue-i18n';
  import GrantUserSelect from '/@web-render/views/edhr-application/render/user-granted/components/grant-user-select.vue';

  const { t } = useI18n();

  const ns = useNamespace('medpro-outline-modal');

  const props = defineProps<{
    data: ProcessTaskTodoResponse;
    callback: Function;
  }>();

  const formData = reactive<{
    reassignUser?: string;
  }>({
    reassignUser: undefined,
  });

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value?.validate();

    if (props.callback && typeof props.callback === 'function') {
      await props.callback({
        toUserId: formData.reassignUser!,
      });
    }

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
