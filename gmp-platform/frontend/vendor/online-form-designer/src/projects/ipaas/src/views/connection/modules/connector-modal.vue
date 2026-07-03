<template>
  <div :class="ns.b()">
    <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
      <a-collapse v-model:activeKey="activePanel" ghost>
        <a-collapse-panel key="1" :header="t('sys.basicInfo')">
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
              :module="CategoryModuleEnum.CONNECTOR"
            />
          </a-form-item>
          <a-form-item
            :label="$t('sys.ipaas.connectorName')"
            name="name"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', {
                  sth: t('sys.ipaas.connectorName'),
                }),
              },
            ]"
          >
            <a-input v-model:value="formState.name" show-count :maxlength="32" />
          </a-form-item>
          <a-form-item
            :label="t('sys.ipaas.appBrand')"
            name="brand"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', {
                  sth: t('sys.ipaas.appBrand'),
                }),
              },
            ]"
          >
            <a-input v-model:value="formState.brand" show-count :maxlength="32" />
          </a-form-item>
          <a-form-item
            :label="t('sys.editor.version')"
            name="version"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', {
                  sth: t('sys.editor.version'),
                }),
              },
            ]"
          >
            <a-input v-model:value="formState.version" show-count :maxlength="32" />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <AppLogoEditor
            :label="t('sys.integration.connectorLogo')"
            v-model:value="formState"
            :fieldMap="{
              type: 'logoType',
              icon: 'logo',
              iconColor: 'logoColor',
              iconBgColor: 'logoBgColor',
              image: 'logo',
            }"
          />
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea
              class="--resize-none"
              v-model:value="formState.description"
              :maxlength="120"
              style="height: 100px"
              show-count
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { onMounted, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { AppLogoEditor, AppLogoTypeEnum } from '/@/components/AppLogo';
  import { cloneDeep } from 'lodash-es';
  import CategorySelect from '../../../comps/category/category-select.vue';
  import { CategoryModuleEnum } from '../../../comps/category';
  import { putFlowAppById, postFlowApp } from '/@/apis/gct-ipaas2/FlowAppController';
  import { FlowAppResponse } from '/@/apis/gct-ipaas2/model';

  const ns = useNamespace('edhr-outline-modal');

  const { t } = useI18n();
  const activePanel = ref(['1', '2']);

  const props = defineProps<{
    isEdit: boolean;
    data: FlowAppResponse;
  }>();

  const formState = ref(cloneDeep(props.data));

  onMounted(() => {
    // 初始化数据
    if (!formState.value.logoType) {
      formState.value.logoType = AppLogoTypeEnum.Icon;
    }
  });

  const formRef = ref<FormInstance>();
  /** 是否修改过 */

  useModal(async () => {
    await formRef.value?.validate();

    if (props.isEdit) {
      await putFlowAppById({ id: formState.value.id! }, formState.value);
    } else {
      await postFlowApp(formState.value as any);
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

  .ant-collapse {
    :deep(.ant-collapse-header) {
      color: #212528;
      font-weight: 500;
    }
  }
</style>
