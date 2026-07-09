<template>
  <div class="p24px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="$t('sys.edhr.controlFileName')">
        <!-- {{ data.docName }} -->
        <a-input :value="data.docName" disabled />
      </a-form-item>
      <a-form-item :label="$t('sys.pageDesigner.originalHandler')">
        <!-- {{ data.assigneeName }} -->
        <a-input :value="data.assigneeName" disabled />
      </a-form-item>
      <a-form-item
        :label="$t('sys.pageDesigner.handler')"
        name="toUserId"
        :rules="[
          {
            required: true,
            message: $t('sys.chooseTextTip', { name: $t('sys.pageDesigner.handler') }),
            trigger: ['change'],
          },
        ]"
      >
        <GrantUserSelect
          v-model:value="formState.toUserId"
          :is-granted="true"
          :placeholder="$t('sys.chooseTextTip', { name: $t('sys.pageDesigner.handler') })"
          @select="formRef.validate('toUserId')"
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { IModal, useModal } from '@gct/runtime';
  import { ref } from 'vue';
  import GrantUserSelect from '/@web-render/views/edhr-application/render/user-granted/components/grant-user-select.vue';

  const props = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const formRef = ref();
  const formState = ref<{
    toUserId?: string;
    tmplId?: string;
  }>({});

  const onSave = async () => {
    await formRef.value?.validate();
    const { taskId, docBaseId, docVersionId } = props.data;
    return {
      ok: true,
      params: {
        ...formState.value,
        tmplId: `${docBaseId}:${docVersionId}`,
        taskId,
      },
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
