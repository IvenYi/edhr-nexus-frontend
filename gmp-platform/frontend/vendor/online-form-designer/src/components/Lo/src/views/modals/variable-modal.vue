<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(options.isEdit ? '编辑变量' : '新建变量')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="FormRef"
      :model="formState"
      autocomplete="off"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item
        :label="t('变量名称')"
        name="name"
        :rules="[
          { required: true, message: t('sys.notEmptySth', { sth: t('变量名称') }) },
          {
            validator: validateName,
            trigger: 'change',
          },
        ]"
      >
        <a-input
          :disabled="options.isEdit"
          v-model:value="formState.name"
          :addon-before="PREFIX"
          :maxlength="32"
          show-count
        />
      </a-form-item>

      <a-form-item
        :label="t('变量类型')"
        name="type"
        :rules="[{ required: true, message: t('sys.notEmptySth', { sth: t('变量类型') }) }]"
      >
        <a-select
          :disabled="options.isEdit"
          v-model:value="formState.type"
          @change="handleTypeChange"
        >
          <a-select-option v-for="item in VariableOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        v-if="
          [VariableTypeEnum.String, VariableTypeEnum.Number, VariableTypeEnum.Boolean].includes(
            formState.type!,
          )
        "
        :label="t('默认值')"
        name="defaultValue"
      >
        <a-input
          v-model:value="formState.defaultValue"
          v-if="formState.type === VariableTypeEnum.String"
        />
        <a-input-number
          v-model:value="formState.defaultValue"
          v-else-if="formState.type === VariableTypeEnum.Number"
        />
        <a-select
          v-model:value="formState.defaultValue"
          v-if="formState.type === VariableTypeEnum.Boolean"
        >
          <a-select-option value="true">{{ t('布尔真') }} </a-select-option>
          <a-select-option value="false">{{ t('布尔假') }} </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('描述')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          :maxlength="120"
          show-count
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { VariableOptions } from '../../constants';
  import { VariableInterface, VariableTypeEnum } from '../../types';
  import type { Rule } from 'ant-design-vue/es/form';

  defineEmits(['register']);

  interface Options {
    isEdit: boolean; // 新建编辑
    data?: VariableInterface; // 数据
    callback: (data: VariableInterface) => void; // 回调
    list: VariableInterface[]; // 当前列表、校验用
  }

  const PREFIX = 'LOCAL_VAR_';
  const FormRef = ref<FormInstance>();
  const options = ref<Partial<Options>>({});
  const formState = ref<Partial<VariableInterface>>({});

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((payload: Options) => {
    if (payload === undefined) return;
    options.value = payload;
    if (payload.isEdit) {
      formState.value = { ...payload.data, name: payload.data?.name.replace(PREFIX, '') };
    }
  });

  const validateName = async (_rule: Rule, value: string) => {
    // 新增场景判断变量重名
    if (
      !options.value.isEdit &&
      options.value.list?.find((item) => item.name === `${PREFIX}${value}`)
    ) {
      return Promise.reject('变量名称已存在');
    } else {
      return Promise.resolve();
    }
  };

  const handleTypeChange = () => {
    formState.value.defaultValue = undefined;
  };

  const handleClose = () => {
    formState.value = {};
    options.value = {};
    FormRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await FormRef.value!.validate();
      changeOkLoading(false);
      if (options.value.callback && typeof options.value.callback === 'function') {
        options.value.callback({
          ...formState.value,
          name: `${PREFIX}${formState.value.name}`,
        } as VariableInterface);
      }
      closeModal();
    } catch (err) {
      console.log(err);
      changeOkLoading(false);
    }
  };
</script>

<style scoped lang="less"></style>
