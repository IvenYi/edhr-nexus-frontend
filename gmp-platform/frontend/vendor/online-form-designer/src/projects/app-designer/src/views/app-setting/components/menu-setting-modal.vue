<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="modalTitle"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :cancelText="isEdit ? $t('sys.cancel') : $t('sys.editor.prev')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 11 }">
      <template v-if="!isMobile || (isMobile && formState.type !== MenuType.CATALOG)">
        <a-form-item
          name="parentId"
          :label="t('sys.appDesigner.parentCatolog')"
          :rules="[
            {
              required: formState.type !== MenuType.CATALOG,
              message: t('sys.chooseText') + t('sys.appDesigner.parentCatolog'),
            },
          ]"
        >
          <a-tree-select
            v-model:value="formState.parentId"
            show-search
            :allow-clear="formState.type === MenuType.CATALOG"
            :tree-data="menuData"
            :placeholder="t('sys.chooseText')"
            :fieldNames="{ label: 'name', value: 'id' }"
            :dropdownMatchSelectWidth="false"
            dropdown-class-name="gct-custom-select-dropdown"
            tree-node-filter-prop="name"
            style="width: 100%"
            @select="handleParentSelect"
            @change="handleParentChange"
          />
        </a-form-item>
      </template>
      <i18n-select-input-form
        :formRef="formRef"
        formItemName="name"
        :fromItemExtraProps="{
          label:
            formState.type === MenuType.CATALOG
              ? t('sys.appDesigner.catalogName')
              : t('sys.appDesigner.menuName'),
          rules: [
            {
              required: true,
            },
          ],
        }"
        :inputExtraProps="{ placeholder: `${t('sys.inputText')}`, showCount: true, maxlength: 32 }"
        v-model:text="formState.name"
        v-model:i18nConfig="formState.i18nConfig"
      />
      <template v-if="formState.type !== MenuType.CATALOG && isMobile">
        <a-form-item name="logo" :label="t('sys.appDesigner.menuIcon')">
          <IconNextPicker
            v-model:value="formState.logo"
            show-background
            v-model:background="formState.color"
            :style="{
              '--box-size': '40px',
            }"
          />
        </a-form-item>
      </template>
      <template v-if="formState.type === MenuType.STANDARD && !isSystem">
        <a-form-item
          :label="t('sys.appDesigner.linkPage')"
          name="linkPage"
          :rules="[
            { required: true, message: t('sys.chooseText') + t('sys.appDesigner.linkPage') },
          ]"
        >
          <a-select
            v-model:value="formState.linkPage"
            :placeholder="t('sys.chooseText')"
            :options="pages"
            show-search
            optionFilterProp="label"
            :dropdownMatchSelectWidth="false"
            @change="handleLinkPageChange"
          />
        </a-form-item>
      </template>
      <template v-if="formState.type !== MenuType.CATALOG">
        <a-form-item name="visible" :label="t('sys.appDesigner.revealing')">
          <a-radio-group v-model:value="formState.visible">
            <a-radio :value="1">{{ t('sys.appDesigner.show') }}</a-radio>
            <a-radio :value="0">{{ t('sys.appDesigner.hidden') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </template>
      <template v-if="formState.type !== MenuType.CATALOG && !isMobile">
        <a-form-item name="openMode" :label="t('sys.appDesigner.openMode')">
          <a-radio-group v-model:value="formState.openMode">
            <a-radio v-show="formState.type === MenuType.LINK" :value="OpenMode.IFRAME">
              {{ t('sys.appDesigner.iframeMenu') }}
            </a-radio>
            <a-radio v-show="formState.type === MenuType.STANDARD" :value="OpenMode.PRESENT">
              {{ t('sys.appDesigner.curPage') }}
            </a-radio>
            <a-radio :value="OpenMode.NEW">{{ t('sys.appDesigner.newTab') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </template>
      <template v-if="formState.type === MenuType.CATALOG && !isMobile">
        <a-form-item name="logo" :label="t('sys.appDesigner.menuIcon')">
          <IconNextPicker
            v-model:value="formState.logo"
            :style="{
              '--box-size': '40px',
            }"
          />
        </a-form-item>
      </template>
      <template v-if="formState.type === MenuType.LINK">
        <a-form-item
          name="url"
          :label="t('sys.appDesigner.menuPath')"
          :rules="[{ required: true, type: 'url' }]"
        >
          <a-input
            v-model:value="formState.url"
            :placeholder="$t('sys.appDesigner.menuUrlInput')"
          />
        </a-form-item>
      </template>
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
  import { IconNextPicker } from '/@/components/Icon';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { getCategoryPage } from '/@/apis/gct-apaas/CategoryController';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { MenuType, OpenMode } from '@/enums/appEnum';
  import { useTheme } from '/@/hooks/web/useTheme';

  const emit = defineEmits(['refresh', 'prev']);

  interface Props {
    menus: any;
    isMobile: boolean;
  }

  const defProps = defineProps<Props>();
  const { t } = useI18n();
  const { themeVars } = useTheme();
  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const pages = ref<SelectProps['options']>([]);
  const id = ref('');
  const isSystem = ref(false);
  const formState = reactive<MenuConfigRequest>({
    type: '',
    level: 1,
    parentId: undefined,
    name: '',
    linkPage: undefined,
    visible: 1,
    openMode: OpenMode.PRESENT,
    logo: '',
    menuType: 'WEB',
    i18nConfig: '',
    color: themeVars.primaryColor,
    url: undefined,
  });
  const modalTitle = computed(() => {
    let title = t('sys.appDesigner.CATALOGMenu');
    if (formState.type === MenuType.STANDARD) title = t('sys.appDesigner.STANDARDMenu');
    else if (formState.type === MenuType.LINK) title = t('sys.appDesigner.LINKMenu');
    return isEdit.value ? t('sys.edit') + title : t('sys.new') + title;
  });
  const editMenuChildren = ref();
  const menuData = computed(() => {
    if (
      isEdit.value &&
      formState.type === MenuType.CATALOG &&
      editMenuChildren.value &&
      editMenuChildren.value.some((e) => e.type === MenuType.CATALOG)
    ) {
      return [];
    } else if (formState.type === MenuType.CATALOG) {
      return defProps.menus
        .filter((e) => !isEdit.value || e.id !== formState.id)
        .map((e) => {
          const obj = Object.assign({}, e);
          delete obj.children;
          return obj;
        });
    } else {
      return defProps.menus
        .filter((e) => !isEdit.value || e.id !== formState.id)
        .map((e) => {
          const obj = Object.assign({}, e);
          obj.children = obj.children && obj.children.filter((f) => f.type === MenuType.CATALOG);
          return obj;
        });
    }
  });
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = async (data) => {
    // 获取web页面
    isEdit.value = data.isEdit;
    formState.type = data.type;
    isSystem.value = !!data.sysBuiltin;
    formState.menuType = data.menuType;
    // formState.parentId = undefined;
    // 打开方式默认值的设置
    formState.openMode = OpenMode.PRESENT;
    if (formState.type === MenuType.LINK) formState.openMode = OpenMode.IFRAME;
    // logo默认值的设置
    if (
      (formState.type === MenuType.CATALOG && !defProps.isMobile) ||
      (defProps.isMobile && formState.type !== MenuType.CATALOG)
    ) {
      formState.logo = 'icon-park:all-application';
    } else formState.logo = '';
    formState.level = formState.type === MenuType.CATALOG ? 1 : 2;
    const res =
      (await getCategoryPage({ module: PageTypeEnum[data.menuType], pageId: data.linkPage })) || [];
    pages.value = formatData(res.filter((e) => e.children && e.children.length));
    if (data.isEdit) {
      const { level, linkPage, logo, name, openMode, parentId, visible, i18nConfig, url } = data;
      formState.level = level;
      formState.linkPage = linkPage;
      formState.logo = logo;
      formState.color = data.color;
      formState.name = name;
      formState.openMode = openMode;
      formState.parentId = parentId === 'ROOT' ? undefined : parentId;
      formState.visible = visible;
      formState.i18nConfig = i18nConfig;
      formState.url = url;
      formState.id = data.id;
      id.value = data.id;
      editMenuChildren.value = data.children;
    }
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

  const handleParentSelect = (val, node) => {
    formState.level = node.level + 1;
  };

  const handleParentChange = (val) => {
    if (!val) formState.level = 1;
  };

  const handleClose = () => {
    // isEdit.value = false;
    formRef.value?.resetFields();
    formState.i18nConfig = '';
    formState.parentId = undefined;
    formState.linkPage = undefined;
    formState.visible = 1;
    formState.openMode = OpenMode.PRESENT;
    formState.color = themeVars.primaryColor;
    closeModal();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    let menuId;
    if (isEdit.value) {
      // 编辑菜单属性
      await putMenuConfigById(
        { id: id.value },
        { ...formState, parentId: formState.parentId || 'ROOT' },
      );
      menuId = id.value;
      message.success(t('sys.appDesigner.menuModificationSuccessful'));
    } else {
      // 创建菜单属性
      menuId = await postMenuConfig(formState);
      message.success(t('sys.appDesigner.newMenuSuccessfully'));
    }
    emit('refresh', menuId);
    isEdit.value = false;
    closeModal();
  };
  const handleCancel = (e) => {
    closeModal();
    if (e.target.textContent === t('sys.editor.prev')) {
      emit('prev', formState);
    }
  };
  const handleLinkPageChange = (e, v) => {
    if (formState.type === MenuType.STANDARD && !formState.name?.trim()) {
      formState.name = v.label;
      formRef.value?.validate(['name']);
    }
  };
</script>

<style lang="less"></style>
