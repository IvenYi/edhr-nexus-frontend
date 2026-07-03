<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="
      isEdit
        ? t('sys.edit') + t('sys.appDesigner.PERMISSIONMenu')
        : t('sys.add') + t('sys.appDesigner.PERMISSIONMenu')
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 11 }">
      <a-form-item name="parentId" :label="t('sys.appDesigner.owningMenu')">
        {{ parentName }}
      </a-form-item>
      <i18n-select-input-form
        :formRef="formRef"
        formItemName="name"
        :fromItemExtraProps="{ label: t('sys.appDesigner.menuName'), rules: [{ required: true }] }"
        :inputExtraProps="{ placeholder: `${t('sys.inputText')}`, showCount: true, maxlength: 32 }"
        v-model:text="formState.name"
        v-model:i18nConfig="formState.i18nConfig"
      />
      <a-form-item
        :label="t('sys.appDesigner.linkPage')"
        name="linkPage"
        :rules="[{ required: true, message: t('sys.chooseText') + t('sys.appDesigner.linkPage') }]"
      >
        <a-select
          v-model:value="formState.linkPage"
          :placeholder="t('sys.chooseText')"
          :options="pages"
          :dropdownMatchSelectWidth="false"
          show-search
          @change="handleLinkPageChange"
        />
      </a-form-item>
      <a-form-item name="visible" :label="t('sys.appDesigner.revealing')">
        <a-radio-group disabled v-model:value="formState.visible">
          <a-radio :value="0">{{ t('sys.appDesigner.hidden') }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message, SelectProps } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CategoryCompleteResponse, MenuConfigRequest } from '/@/apis/gct-apaas/model';
  import { postMenuConfig, putMenuConfigById } from '/@/apis/gct-apaas/MenuConfigController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { getCategoryPage } from '/@/apis/gct-apaas/CategoryController';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const emit = defineEmits(['refresh']);

  interface Props {
    // menus: any;
    isMobile: boolean;
  }

  defineProps<Props>();

  const { t } = useI18n();

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const pages = ref<SelectProps['options']>([]);
  const id = ref('');
  const parentName = ref('');
  const formState = reactive<MenuConfigRequest>({
    level: 3,
    parentId: '',
    name: '',
    linkPage: undefined,
    visible: 0,
    menuType: 'WEB',
    i18nConfig: '',
    type: 'PERMISSION',
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    const { record, parent } = data;
    // 获取web页面
    isEdit.value = !!data.isEdit;
    formState.menuType = data.menuType;
    formState.level = data.parent.level + 1;
    const res =
      (await getCategoryPage({
        module: PageTypeEnum[data.menuType],
        pageId: record?.linkPage || '',
      })) || [];
    pages.value = formatData(res.filter((e) => e.children && e.children.length));
    if (data.isEdit) {
      const { level, linkPage, name, parentId, visible, i18nConfig } = record;
      formState.level = level;
      formState.linkPage = linkPage;
      formState.name = name;
      formState.parentId = parentId;
      formState.visible = visible;
      formState.i18nConfig = i18nConfig;
      id.value = record.id;
    } else {
      formState.parentId = parent.id;
    }
    parentName.value = parent.name;
  };

  const formatData = (data: CategoryCompleteResponse[]) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          label: '',
          options: [],
        };
        item.label = folder.name!;
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              label: i.name,
              value: i.id,
            };
            item.options.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    let menuId;
    if (isEdit.value) {
      // 编辑菜单属性
      await putMenuConfigById({ id: id.value }, formState);
      menuId = id.value;
      message.success(t('sys.appDesigner.menuModificationSuccessful'));
    } else {
      // 创建菜单属性
      menuId = await postMenuConfig(formState);
      message.success(t('sys.appDesigner.newMenuSuccessfully'));
    }
    emit('refresh', menuId);
    closeModal();
  };

  const handleLinkPageChange = (e, v) => {
    if (!formState.name?.trim()) {
      formState.name = v.label;
      formRef.value?.validate(['name']);
    }
  };
</script>

<style lang="less"></style>
