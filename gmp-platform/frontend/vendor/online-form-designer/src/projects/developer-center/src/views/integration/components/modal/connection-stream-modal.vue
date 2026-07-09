<template>
  <div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item
            :label="`${t('sys.categoryOfSth', { sth: t('sys.ipaas.connectionFlow') })}`"
            name="categoryId"
            :rules="[{ required: true }]"
          >
            <a-select
              v-model:value="formState.categoryId"
              show-search
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option v-for="item in categoryList" :value="item.id" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :label="`${t('sys.nameOfSth', { sth: t('sys.ipaas.connectionFlow') })}`"
            name="flowName"
            :rules="[{ required: true }]"
          >
            <a-input v-model:value="formState.flowName" show-count :maxlength="32" />
          </a-form-item>
          <a-form-item
            :label="`${t('sys.model')}KEY`"
            name="ckey"
            :rules="[
              { required: true },
              { pattern: /^[a-z0-9_]+$/, message: t('sys.model.modelKeyFormat') },
            ]"
          >
            <a-input
              :addon-before="keyPrefix"
              :addon-after="keySuffix"
              v-model:value="formState.ckey"
              show-count
              :maxlength="64 - keyPrefix.length - keySuffix.length"
              :disabled="isEdit"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item
            v-if="!isEdit"
            :label="t('sys.triggerMode')"
            name="triggerType"
            :rules="[{ required: true }]"
          >
            <a-select
              v-model:value="formState.triggerType"
              show-search
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option
                :key="e"
                v-for="e in Object.values(FlowTriggerType)"
                :value="e"
                :name="e"
              >
                <!-- {{ t(`sys.ipaas.${e}`) }} -->
                {{ e }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('sys.description')" name="mark">
            <a-textarea v-model:value="formState.mark" show-count :maxlength="120" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>
<script setup lang="ts" name="">
  import { reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useModal } from '@gct/runtime';
  import { useUUid } from '@/hooks/web/useUUid';
  import { getCategories, postCategoryByIdFlow } from '/@/apis/gct-ipaas/IpaasCategoryController';
  import { putFlowByFuui } from '/@/apis/gct-ipaas/IpaasDataFlowController';
  import { FlowTriggerType } from '../../enum';
  import { omit } from 'lodash-es';

  const props = defineProps<{
    context: IParams;
  }>();

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('sl', '');
  const { getUuid } = useUUid([], '', { chars: 'lowercase&number' });

  interface FormState {
    categoryId: string;
    flowName: string;
    triggerType: string;
    ckey: string;
    mark: string;
    fuuid: string;
  }
  const formRef = ref();
  const activeKey = ref(['1', '2']);
  const formState = reactive<FormState>({
    categoryId: '',
    flowName: '',
    triggerType: '',
    ckey: '',
    mark: '',
    fuuid: '',
  });
  const isEdit = ref(false);
  const categoryList = ref([]);

  watch(
    () => props.context,
    () => {
      const data = props.context;
      isEdit.value = data.isEdit;
      // formState.value = omit(data, []);
      Object.assign(formState, omit(data, ['isEdit', 'name']));
      formState.ckey = data.ckey ? keyClip(data.ckey) : getUuid();
    },
    {
      immediate: true,
    },
  );

  const save = async () => {
    await formRef.value.validate();
    const data = {
      ...formState,
      ckey: keyPad(formState.ckey!),
    };
    if (isEdit.value) {
      await putFlowByFuui(
        {
          fuui: formState.fuuid,
        },
        data,
      );
    } else {
      await postCategoryByIdFlow({ id: formState.categoryId! }, data);
    }
  };

  useModal(async () => {
    await save();
    return { ok: true, node: { ...formState } };
  });

  const getCategoryList = async () => {
    const res = await getCategories({ module: 'connection_stream' });
    categoryList.value = res!;
    if (!formState.categoryId) {
      formState.categoryId = categoryList.value[0]?.id ?? '';
    }
  };
  getCategoryList();
</script>
<style lang="less" scoped></style>
