<template>
  <basic-modal
    @register="registerInner"
    :title="isEdit ? `${t('sys.edit')}${t('sys.field')}` : `${t('sys.new')}${t('sys.field')}`"
    center
    width="800px"
    :maskClosable="false"
    @visible-change="handleShow"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.model.viewMappingField')" name="originFieldKey" required>
        <a-select
          v-model:value="formState.id"
          style="width: 100%"
          :disabled="isEdit"
          :placeholder="t('sys.chooseText')"
          @change="changeOriginField"
          :showSearch="true"
          optionFilterProp="fieldName"
        >
          <a-select-opt-group v-for="item in mappingFieldList" :key="item.key">
            <template #label>
              <span>
                {{ item.name }}
              </span>
            </template>
            <a-select-option
              v-for="field in item.fieldMetaList"
              :key="field.id"
              :value="field.id"
              :fieldName="field.name"
              :modelKey="field.modelKey"
              :fieldType="field.type"
              :fieldKey="field.key"
              >{{ field.name }}</a-select-option
            >
          </a-select-opt-group>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('sys.model.viewFieldType')" name="type">
        <span>{{ formState.type ? t(`sys.pageDesigner.fieldCmp.${formState.type}`) : '-' }}</span>
      </a-form-item>

      <a-form-item :label="t('sys.model.viewFieldName')" name="name" :rules="[{ required: true }]">
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.model.viewFieldKey')"
        name="key"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input
          :disabled="isEdit"
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="60"
        />
      </a-form-item>

      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          :placeholder="t('sys.model.viewDescriptionPlaceholder')"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>
<script setup lang="ts" name="view-filed-modal">
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { putViewModelById, getViewModelInfo } from '/@/apis/gct-apaas/ViewModelController';

  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message, type FormInstance } from 'ant-design-vue';
  import type { TableFieldMetaDTO } from '/@/apis/gct-apaas/model';

  import { cloneDeep, pick, omit } from 'lodash-es';

  const { t } = useI18n();

  interface IProps {
    modelKeys: string[];
  }

  const props = defineProps<IProps>();

  const emit = defineEmits(['refresh']);

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('f');

  interface IFormState {
    id: string;
    /** 映射字段所属模型key */
    originModelKey?: string;
    /** 映射字段key */
    originFieldKey?: string;
    /** 字段类型 */
    type?: string;
    /** 字段名称 */
    name?: string;
    /** 字段key */
    key?: string;
    /** 描述 */
    description?: string;
  }

  const formState = reactive<IFormState>({
    id: '',
    originModelKey: undefined,
    originFieldKey: undefined,
    type: undefined,
    name: undefined,
    key: undefined,
    description: undefined,
  });

  const formRef = ref<FormInstance>();

  const mappingFieldList = ref<TableFieldMetaDTO[]>([]);

  const isEdit = ref<boolean>(false);

  const currentId = ref<string>('');
  const index = ref<number>(-1);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;
      currentId.value = data.viewId;
      data.isEdit && onDataReceive(data);
    }
  });

  const onDataReceive = async (node) => {
    index.value = node.recordIndex;
    formState.originModelKey = node.originModelKey;
    formState.originFieldKey = node.originFieldKey;
    formState.type = node.type;
    formState.name = node.name;
    formState.key = keyClip(node.key);
    formState.description = node.description;
    formState.id = `${node.originModelKey}$${node.originFieldKey}`;
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-z_0-9]*$/;
    if (!reg.test(value)) {
      callback(t('sys.model.fieldKeyFormat'));
    }
    callback();
  };

  function changeOriginField(key, info) {
    if (info) {
      formState.originModelKey = info.modelKey;
      formState.type = info.fieldType;
      formState.originFieldKey = info.fieldKey;
    }
  }

  // 弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      mappingFieldList.value =
        (await Promise.all(props.modelKeys?.map((key) => getModelMetaDetail({ modelKey: key })))) ??
        [];
    }
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    formState.id = '';
    formState.originModelKey = undefined;
    formState.originFieldKey = undefined;
    formState.type = undefined;
    formState.name = undefined;
    formState.key = undefined;
    formState.description = undefined;
    mappingFieldList.value = [];
    closeModal();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      if (currentId.value) {
        const info = await getViewModelInfo({ id: currentId.value });

        const data = {
          ...formState,
          key: keyPad(formState.key as string),
        };
        if (isEdit.value) {
          const cloneInfo = cloneDeep(info);
          if (index.value !== -1 && cloneInfo?.fieldConfig?.fields) {
            cloneInfo.fieldConfig.fields[index.value] = {
              ...data,
              /**
               * 用flag判断是新增还是编辑以便于后端获取相应时间，0为新增，1为编辑
               */
              flag: 1,
            };

            await putViewModelById(
              {
                id: currentId.value,
              },
              cloneInfo,
              {
                transferToConfig: { headers: { operateType: 'UPDATE' } },
              },
            );
            message.success(t('sys.model.viewEditFieldSuccess'));
          }
        } else {
          await putViewModelById(
            {
              id: currentId.value,
            },
            {
              ...pick(info, ['type', 'name', 'key', 'description']),
              joinConfig: cloneDeep(info?.joinConfig),
              filterConfig: cloneDeep(info?.filterConfig),
              fieldConfig: {
                fields: [].concat(...(info?.fieldConfig?.fields ?? []), omit(data, 'type')),
              },
            },
            {
              transferToConfig: { headers: { operateType: 'INSERT' } },
            },
          );
          message.success(t('sys.model.viewCreateFieldSuccess'));
        }

        emit('refresh', currentId.value);
        closeModal();
      }
    });
  };
</script>
<style lang="scss" scoped></style>
