<template>
  <div class="p-24px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 15 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.category')"
        name="categoryId"
        :rules="[
          {
            required: true,
            message: t('sys.chooseTextTip', {
              name: t('sys.category'),
            }),
          },
        ]"
      >
        <CategorySelect
          v-model:value="formState.categoryId"
          :module="CategoryModuleEnum.FLOW"
          :placeholder="
            t('sys.chooseTextTip', {
              name: t('sys.category'),
            })
          "
        />
      </a-form-item>

      <a-form-item :label="t('sys.integration.flowName')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.integration.flowName') })"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.integration.flowKey')"
        name="key"
        :rules="[
          { required: true },
          { pattern: /^[a-z0-9_]+$/, message: t('sys.model.keyFormat') },
        ]"
      >
        <a-input
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          v-model:value="formState.key"
          show-count
          :maxlength="64 - keyPrefix.length - keySuffix.length"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.integration.flowKey') })"
        />
      </a-form-item>

      <a-form-item :label="t('sys.description')" name="name">
        <a-textarea v-model:value="formState.mark" show-count :rows="3" :maxlength="120" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="category-info">
  import { reactive, ref, watch, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { pick } from 'lodash-es';
  import CategorySelect from '../../../../comps/category/category-select.vue';
  import { CategoryModuleEnum } from '../../../../comps/category';
  import { postCategoryFlow } from '/@/apis/gct-ipaas2/AppFlowCategoryController';
  import { FlowMainResp } from '/@/apis/gct-ipaas2/model';
  import { putFlowByFuuid } from '/@/apis/gct-ipaas2/FlowDefController';

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('sl', '');

  const props = defineProps<{
    isEdit: boolean;
    categoryId: string;
    context: IParams;
  }>();

  console.log(props.context);

  const formRef = ref<FormInstance>();
  const formState = reactive<FlowMainResp>({
    name: '',
    key: '',
    mark: '',
    categoryId: props.categoryId,
  });

  onMounted(() => {
    Object.assign(formState, {
      ...props.context,
    });

    if (props.context?.key) {
      formState.key = keyClip(props.context.key);
    } else {
      formState.key = Math.random().toString(36).substring(2, 8);
    }
  });

  async function onSave() {
    try {
      await formRef.value?.validate();

      const data = {
        ...pick(formState, ['name', 'categoryId', 'mark']),
        key: formState.key ? keyPad(formState.key) : '',
      };

      if (props.isEdit) {
        await putFlowByFuuid({ fuuid: formState.fuuid! }, data);
        message.success(t('sys.operationSuccess'));
      } else {
        await postCategoryFlow(data);
        message.success(t('sys.operationSuccess'));
      }

      return {
        ok: true,
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped></style>
