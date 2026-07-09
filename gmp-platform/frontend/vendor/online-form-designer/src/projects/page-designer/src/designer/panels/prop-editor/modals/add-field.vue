<template>
  <a-modal v-model:visible="visible" title="新增字段" @ok="handleOk">
    <div class="pt-20px">
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          label="字段"
          name="field"
          :rules="[{ required: true, message: '字段不能为空' }, { validator }]"
        >
          <a-select
            v-model:value="formState.field"
            mode="multiple"
            style="width: 100%"
            :maxTagCount="5"
            :maxTagTextLength="6"
            placeholder="请选择字段"
            :filter-option="(input: string, option: any) => {
              return option.title.indexOf(input.toLowerCase()) >= 0;
            }"
          >
            <a-select-option :value="i.id" v-for="i in options" :key="i.id" :title="i.name">{{
              i.name
            }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, toRaw } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import type { FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const formRef = ref<FormInstance>();
  const formState = reactive<{ field: string[] }>({ field: [] });
  const resolveCallback = ref();
  const options = ref<FieldMetaDTO[]>([]);
  const visible = ref(false);
  const maxField = ref();
  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    const values = toRaw(options.value).filter((i) => i.id && formState.field.indexOf(i.id) > -1);
    resolveCallback.value(values);
  };

  const open = async ({
    modelKey,
    disabledIds,
    maxlength,
    filterCallback,
  }: {
    maxlength?: number;
    modelKey?: string;
    disabledIds?: string[];
    filterCallback?: (any) => Boolean;
  }): Promise<FieldMetaDTO[]> => {
    await formRef.value?.resetFields();
    formState.field = [];
    if (!modelKey) {
      message.warn('请选择业务模型');
      return Promise.reject();
    }
    maxField.value = maxlength;
    let list = (await getFieldMetaList({ modelKey })) || [];
    options.value = list.filter((i) => {
      if (filterCallback && typeof filterCallback === 'function') {
        return filterCallback(i);
      }
      return (
        disabledIds &&
        disabledIds.indexOf(i.id!) === -1 &&
        i.key !== 'tenant_id_' &&
        i.type !== FIELD_TYPE.MASTERSLAVE
      );
    });
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  function validator(rule, value) {
    if (formState.field.length > maxField.value) {
      return Promise.reject('总字段数不能超出指定数量');
    }
    return Promise.resolve();
  }
  defineExpose({ open });
</script>
<style scoped lang="less"></style>
