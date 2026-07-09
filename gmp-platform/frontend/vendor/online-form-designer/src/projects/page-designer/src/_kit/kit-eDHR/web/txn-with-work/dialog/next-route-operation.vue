<template>
  <a-modal
    v-model:visible="visible"
    title="选择下一步操作"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" ref="formRef">
      <a-form-item
        label="下一工序"
        name="next_routing_operation_id_"
        :rules="[{ required: true, message: '请选择下一工序' }]"
      >
        <a-select
          v-model:value="formState.next_routing_operation_id_"
          :options="options"
          placeholder="请选择"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts" name="next-route-operation">
  import { ref } from 'vue';

  const emits = defineEmits<{
    (e: 'ok', data: any): void;
  }>();

  const formRef = ref();
  const visible = ref(false);
  const formState = ref({
    next_routing_operation_id_: undefined,
  });
  const options = ref<any>([]);

  async function onOpen(optionList: Array<any>) {
    visible.value = true;
    formState.value.next_routing_operation_id_ = undefined;
    options.value = (optionList ?? []).map((op) => {
      return {
        label: op.name_,
        value: op.id_,
      };
    });
  }

  function handleCancel() {
    visible.value = false;
  }

  async function handleOk() {
    await formRef.value.validate();
    visible.value = false;
    emits('ok', formState.value);
  }

  defineExpose({
    open: onOpen,
    confirm: handleOk,
  });
</script>
