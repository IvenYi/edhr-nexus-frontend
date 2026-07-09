<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      formState.copiedId
        ? t('sys.appDesigner.copyMobilePage')
        : isEdit
          ? t('sys.appDesigner.editMobilePage')
          : t('sys.appDesigner.newMobilePage')
    "
    centered
    width="640px"
    wrap-class-name="ant-modal-new"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.category')"
        name="categoryId"
        :rules="[{ required: !formState.copiedId }]"
      >
        <a-select
          ref="select"
          show-search
          v-model:value="formState.categoryId"
          :options="webPageCategory.map(({ id, name }) => ({ label: name, value: id }))"
          :filter-option="filterOption"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.pageName')"
        name="name"
        :rules="[{ required: true }, maxValidate]"
      >
        <a-input v-model:value="formState.name" autocomplete="off" />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.pageKey')"
        name="key"
        :rules="[{ required: true }, { validator: validateSpecialCharacters }, maxValidate]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          :show-count="!formState.copiedId"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import {
    getWebpageInfo,
    postWebpage,
    putWebpageById,
    postWebpageCopyByIdById,
  } from '/@/apis/gct-apaas/WebpageController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { PageTypeEnum, CategoryType } from '/@/layouts/tree-sider-page/enum';
  import {
    getMobilePageInfo,
    postMobilePage,
    putMobilePageById,
    postMobilePageCopyByIdById,
  } from '/@/apis/gct-apaas/MobilePageController';
  import {
    getPadPageInfo,
    postPadPage,
    putPadPageById,
    postPadPageCopyByIdById,
  } from '/@/apis/gct-apaas/PadPageController';
  import { MobilePageRequest } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const props = defineProps<{
    webPageCategory;
    tab: CategoryType;
  }>();

  const { t } = useI18n();
  // console.log(props.tab);
  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };
  const addonBefore = computed(() => {
    let key = 'web_';
    switch (props.tab) {
      case PageTypeEnum.WEB:
        key = 'web_';
        break;
      case PageTypeEnum.MOBILE:
        key = 'mobile_';
        break;
      case PageTypeEnum.PAD:
        key = 'pad_';
        break;
    }
    return key;
  });

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser(addonBefore);

  const emit = defineEmits(['refresh', 'register']);
  const currentId = ref('');
  const formRef = ref<FormInstance>();
  const apiMap = new Map([
    [PageTypeEnum.WEB, getWebpageInfo],
    [PageTypeEnum.MOBILE, getMobilePageInfo],
    [PageTypeEnum.PAD, getPadPageInfo],
  ]);

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    formState.categoryId = data.categoryId;
    if (data && data.uuid) {
      formState.key = data.uuid;
    }
    if (data && data.node) {
      const { node } = data;
      const api = apiMap.get(props.tab)!;
      const info = await api({ id: node.id });
      isEdit.value = !node.isCopy;
      currentId.value = node.id;
      formState.categoryId = info?.categoryResponse?.id;
      formState.name = info?.name + (node.isCopy ? t('sys.copy') : '');
      formState.description = !node.isCopy ? info?.description || '' : '';
      formState.copiedId = node.isCopy ? node.id : undefined;
      formState.terminal = info?.terminal || '';
      if (!node.isCopy) formState.key = keyClip(info?.key ?? '');
    }
  });

  const formState = reactive<MobilePageRequest>({
    categoryId: '',
    description: '',
    key: '',
    name: '',
    terminal: '',
  });

  // const webPageCategory = ref<string[]>([]);

  const isEdit = ref(false);

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    currentId.value = '';
    formState.copiedId = '';
    closeModal();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    if (!value) {
      callback();
      return;
    }
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value)) {
      const text =
        props.tab === PageTypeEnum.MOBILE
          ? t('sys.printDesigner.moduleValidateKeyErrorMsg', {
              sth: `MOBILE${t('sys.page')}`,
            })
          : props.tab === PageTypeEnum.PAD
            ? t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                sth: `PAD${t('sys.page')}`,
              })
            : t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                sth: `WEB${t('sys.page')}`,
              });
      callback(text);
    }
    callback();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    let data = {};
    switch (props.tab) {
      case PageTypeEnum.WEB:
        data = { ...formState, key: keyPad(formState.key!) };
        if (isEdit.value) {
          await putWebpageById({ id: currentId.value }, data);
        } else if (formState.copiedId) {
          await postWebpageCopyByIdById({ id: formState.copiedId }, data);
        } else {
          await postWebpage(data);
        }
        break;
      case PageTypeEnum.MOBILE:
        data = { ...formState, key: keyPad(formState.key!) };
        // Mobile页面创建接口
        if (isEdit.value) {
          await putMobilePageById({ id: currentId.value }, data);
          message.success(t('sys.appDesigner.appPageChangeSuccessMsg'));
        } else if (formState.copiedId) {
          await postMobilePageCopyByIdById({ id: formState.copiedId }, data);
        } else {
          await postMobilePage(data);
          message.success(t('sys.appDesigner.appPageNewSuccessTip'));
        }
        break;
      case PageTypeEnum.PAD:
        data = { ...formState, key: keyPad(formState.key!) };
        if (isEdit.value) {
          await putPadPageById({ id: currentId.value }, data);
          message.success(t('sys.appDesigner.padPageChangeSuccessMsg'));
        } else if (formState.copiedId) {
          await postPadPageCopyByIdById({ id: formState.copiedId }, data);
        } else {
          await postPadPage(data);
          message.success(t('sys.appDesigner.padPageNewSuccessTip'));
        }
        break;
      default:
    }
    closeModal();
    emit('refresh', data);
    isEdit.value = false;
  };
</script>

<style lang="less" scoped>
  .terminal-border {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: #f2f5f8;
    color: #1a1d23;
  }

  .terminal-selected {
    background-color: hsl(from var(--ant-primary-color) h s l / 8%) !important;
    color: var(--ant-primary-color);
  }

  :deep(.ant-radio) {
    position: absolute;
    top: unset;
    bottom: 2px;
    left: 10px;
  }
</style>
