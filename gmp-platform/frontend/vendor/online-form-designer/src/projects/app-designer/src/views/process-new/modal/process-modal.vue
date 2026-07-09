<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? t('sys.editSth', { sth: t('sys.process.index') })
        : t('sys.newSth', { sth: t('sys.process.index') })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.categoryOfSth', { sth: t('sys.process.index') })"
        name="categoryId"
        :rules="[{ required: true }]"
      >
        <a-select ref="select" v-model:value="formState.categoryId">
          <template v-for="item in categoryTree" :key="item">
            <a-select-option :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.nameOfSth', { sth: t('sys.process.index') })"
        name="name"
        :rules="[{ required: true, whitespace: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>

      <a-form-item
        :label="t('sys.keyOfSth', { sth: t('sys.process.index') })"
        name="key"
        :rules="[
          { required: true, whitespace: true },
          isEdit
            ? {}
            : {
                pattern: /^[A-Za-z_]+$/,
                message: t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                  sth: t('sys.process.index'),
                }),
              },
        ]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>

      <a-form-item :label="t('sys.typeOfSth', { sth: t('sys.process.index') })" name="type">
        <a-radio checked>{{ formState.type === 'BUSINESS' ? '业务流' : '审批流' }}</a-radio>
      </a-form-item>

      <a-form-item :label="t('关联模型')" name="modelKey" :rules="[{ required: true }]">
        <a-select v-model:value="formState.modelKey" :disabled="isEdit" @select="hadnleSelect">
          <a-select-opt-group v-for="mc in categoryModels" :key="mc.id" :label="mc.name">
            <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
              m.name || m.id
            }}</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>

      <process-title :source="formState.modelKey" v-model:value="formState.titleConfig" />

      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          class="--resize-none"
          :rows="5"
          v-model:value="formState.description"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import {
    postPmProcessDefinition,
    putPmProcessDefinitionById,
  } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import { getModelMetaSupportProcess } from '/@/apis/gct-apaas/ModelMetaController';
  import type {
    ProcessRequest,
    CategoryCompleteResponse,
    RelationResponse,
  } from '/@/apis/gct-apaas/model';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModuleKeyPrefix } from '/@/layouts/tree-sider-page/constant';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import ProcessTitle from '../components/process-title.vue';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  defineProps<{
    categoryTree;
  }>();
  const emit = defineEmits(['refresh', 'create-success']);
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('process');

  const { siderTab } = useTreeSiderPage();
  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    if (categoryModels.value.length === 0) {
      loadModels();
    }
    const { edit, data: info } = data;
    isEdit.value = !!edit;
    if (!isEdit.value) {
      formState.categoryId = info.categoryId;
      formState.key = info.key;
      formState.type = info.type;
    } else {
      formState.categoryId = info.categoryId;
      formState.description = info.description;
      formState.name = info.name;
      formState.key = keyClip(info.key);
      formState.type = info.type;
      // formState.categoryId = info.categoryResponse?.id;
      formState.modelKey = info.modelKey;
      // formState.tableMetaKey = info.tableMetaKey;
      formState.titleConfig = info.titleConfig;
      id.value = info.id;
    }
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const id = ref('');
  const formState = reactive<ProcessRequest>({
    categoryId: '',
    description: '',
    key: '',
    name: '',
    modelKey: '',
    titleConfig: '',
    type: '',
  });
  const PREFIX = computed(() => ModuleKeyPrefix[siderTab.value!] + '_');
  const categoryModels = ref<CategoryCompleteResponse[]>([]);
  const categoryModelsMap = computed<CategoryCompleteResponse['children']>(() => {
    return categoryModels.value.reduce((total, g) => {
      g.children?.forEach((item) => {
        total[item.id] = item;
      });
      return total;
    }, {});
  });

  const handleClose = () => {
    keyReset();
    id.value = '';
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  // todo 过滤模型数据
  const loadModels = async () => {
    const res1 = await getCategoryListComplete({
      module: ModelTypeEnum.ENTITY,
    });
    const res = await getModelMetaSupportProcess();
    categoryModels.value = res?.filter((c) => c.children && c.children.length > 0)!;
  };

  const hadnleSelect = (value) => {
    // formState.tableMetaKey = categoryModelsMap.value[value].key;
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data = { ...formState, key: keyPad(formState.key!) };
      if (isEdit.value) {
        await putPmProcessDefinitionById({ id: id.value }, data);
      } else {
        await postPmProcessDefinition(data);
      }
      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('refresh', data);
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
