<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="modalTitle"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :zIndex="1002"
    @visible-change="visibleChange"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item
            :label="t('sys.appDesigner.printDesign.form.category')"
            name="categoryId"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', {
                  sth: t('sys.appDesigner.printDesign.form.category'),
                }),
              },
            ]"
          >
            <a-select
              ref="select"
              v-model:value="formState.categoryId"
              :disabled="!!formState.handlerType"
            >
              <template v-for="item in categoryData" :key="item">
                <a-select-option :value="item.value">{{ item.label }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="t('sys.appDesigner.printDesign.form.name')"
            name="name"
            :rules="[{ required: true, validator: validateVersion }]"
          >
            <a-row :gutter="10">
              <a-col :span="isFrontPrint ? 19 : 24">
                <a-input-group compact>
                  <a-form-item
                    :style="{ width: isFrontPrint ? 'calc(100% - 120px)' : '100%' }"
                    name="name"
                  >
                    <a-input
                      v-model:value="formState.name"
                      show-count
                      :maxlength="32"
                      :placeholder="t('sys.inputText')"
                      :disabled="!!formState.handlerType"
                      @change="onNameVersionChange"
                      :style="{ 'border-radius': isFrontPrint ? '4px 0 0 4px' : '4px' }"
                    />
                  </a-form-item>
                  <a-form-item v-if="isFrontPrint" name="version" style="width: 120px">
                    <a-input
                      v-model:value="formState.version"
                      :placeholder="t('sys.appDesigner.version')"
                      @change="onNameVersionChange"
                      style="border-radius: 0 4px 4px 0"
                    />
                  </a-form-item>
                </a-input-group>
              </a-col>
              <a-col v-if="isFrontPrint" :span="5" class="text-right lh-32px">
                <a-checkbox v-model:checked="formState.default">{{ t('sys.default') }}</a-checkbox>
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item
            v-if="!isFrontPrint"
            :label="t('sys.appDesigner.printDesign.form.key')"
            name="key"
            :rules="[{ required: true }, { validator: validateSpecialCharacters }]"
          >
            <a-input
              v-model:value="formState.key"
              :disabled="isEdit && !formState.handlerType"
              :addon-before="keyPrefix"
              :addon-after="keySuffix"
              show-count
              :maxlength="32"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item
            :label="t('sys.printDesigner.refEntity')"
            name="modelKey"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', {
                  sth: t('sys.printDesigner.refEntity'),
                }),
              },
            ]"
          >
            <a-select
              v-model:value="formState.modelKey"
              :disabled="isEdit || formState.handlerType"
              showSearch
              :placeholder="t('sys.chooseText')"
              :filter-option="filterOption"
            >
              <a-select-opt-group v-for="group in modelList" :key="group.name">
                <template #label>
                  <span>
                    {{ group.name }}
                  </span>
                </template>
                <a-select-option
                  v-for="model in group.children"
                  :key="model.key"
                  :value="model.key"
                  :title="model.name"
                  >{{ model.name }}</a-select-option
                >
              </a-select-opt-group>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="t('sys.appDesigner.printDesign.form.paperSize')"
            name="paperSize"
            :rules="[{ required: true }]"
          >
            <a-select
              v-model:value="formState.paperSize"
              :disabled="isEdit || formState.handlerType == 'versionCopy'"
              @change="pageSizeChange"
            >
              <a-select-option
                v-for="opt in Object.keys(pagerSizeMap).map((key) => {
                  return { value: key, label: pagerSizeMap[key] };
                })"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-row style="margin-right: 10px">
            <a-col :offset="6" :span="8">
              <a-form-item
                :label="t('sys.appDesigner.printDesign.form.height')"
                name="height"
                :rules="[{ required: true }]"
              >
                <a-input-number
                  v-model:value="formState.height"
                  :precision="0"
                  :placeholder="t('sys.appDesigner.inputPlaceholder')"
                  :disabled="
                    isEdit ||
                    formState.paperSize !== 'CUSTOM' ||
                    formState.handlerType == 'versionCopy'
                  "
                >
                  <template #addonAfter> mm </template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :offset="1" :span="8">
              <a-form-item
                :label="t('sys.appDesigner.printDesign.form.width')"
                name="width"
                :rules="[{ required: true }]"
              >
                <a-input-number
                  v-model:value="formState.width"
                  :precision="0"
                  :placeholder="t('sys.appDesigner.inputPlaceholder')"
                  :disabled="
                    isEdit ||
                    formState.paperSize !== 'CUSTOM' ||
                    formState.handlerType == 'versionCopy'
                  "
                >
                  <template #addonAfter> mm </template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea
              v-model:value="formState.description"
              :placeholder="t('sys.inputText')"
              show-count
              :maxlength="120"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <template v-if="!isEdit && !formState.handlerType" #centerFooter>
      <a-button type="primary" @click="handleImport">{{
        t('sys.appDesigner.excelImportConfirmation')
      }}</a-button>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, unref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ModelTypeEnum, PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategoryCompleteResponse, DocumentRequest } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useBranch } from '/@/hooks/develop/useBranch';
  // import { groupBy } from 'lodash-es';
  // import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { pagerSizeMap } from '../constants';
  import {
    postDocument,
    postDocumentCopyVersionById,
    postDocumentSaveVersion,
    putDocumentUpdateVersionByIdById,
    getDocumentGetVersionById,
  } from '/@/apis/gct-apaas/DocumentController';
  import { XlsxParser } from '/@online-form/views/designer/utils/xlsx-parser';
  import { uploaderFiles } from '/@/utils/file/download';

  const { t } = useI18n();
  const { branchId } = useBranch();
  const activeKey = ref(['1', '2']);
  const { getUuid } = useUUid([], '');
  const { keyPrefix, keyPad, keyClip, keyReset, keyPrePad, keyPreClip, keySuffix } =
    useKeyParser('pd');

  const props = defineProps<{
    categoryData: Array<any>;
    isFrontPrint: Boolean;
  }>();

  const modelList = ref<CategoryCompleteResponse[]>([]);
  const emit = defineEmits(['refresh', 'register']);
  const currentId = ref('');
  const formRef = ref<FormInstance>();
  const isEdit = ref(false);
  const designerJson = ref();

  const formState = reactive<DocumentRequest>({
    categoryId: '',
    description: '',
    designerJson: '',
    key: '',
    name: '',
    modelKey: undefined,
    width: undefined,
    height: undefined,
    modelCategory: 'entity',
    paperSize: 'A4',
  });

  const validateVersion = async (_rule, value) => {
    const { name, version } = formState;
    if (!version && !name && props.isFrontPrint) {
      return Promise.reject(t('sys.printDesigner.validNameOrVersionErrorMsg'));
    } else if (!name) {
      return Promise.reject(t('sys.printDesigner.validNameErrorMsg'));
    } else if (!version && props.isFrontPrint) {
      return Promise.reject(t('sys.printDesigner.validVersionErrorMsg'));
    } else {
      return Promise.resolve();
    }
  };

  const modalTitle = computed(() => {
    const type = formState.handlerType;
    if (type === 'copy') {
      return `${t('sys.copy')}${t('sys.pageDesigner.document')}`;
    } else if (type === 'versionCopy') {
      return `${t('sys.pageDesigner.version_copyText')}`;
    } else if (type === 'versionCreate') {
      return `${t('sys.pageDesigner.version_createText')}`;
    } else if (!type && formState.id) {
      return `${t('sys.edit')}${t('sys.pageDesigner.document')}`;
    } else return `${t('sys.new')}${t('sys.pageDesigner.document')}`;
  });

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    pageSizeChange();
    if (!data) return;
    formState['id'] = '';
    if (data) {
      formState.categoryId = data.categoryId;
      isEdit.value = !!data.id && !data.handlerType;
      const info = data.id ? (await getDocumentGetVersionById({ id: data.id })) || {} : data;
      currentId.value = info.id!;
      const keyList = info?.key?.split('_');
      if (!props.isFrontPrint && keyList?.length < 3) {
        if (keyList[0] !== keyPrefix.value) {
          info['key'] = keyPrefix.value + info?.key;
        }
        if (keyList[keyList.length - 1] !== unref(branchId)) {
          info['key'] = info?.key + '_' + unref(branchId);
        }
      }

      Object.assign(formState, {
        ...info,
        key:
          data.id && (props.isFrontPrint ? keyPreClip(info?.key ?? '') : keyClip(info?.key ?? '')),
        version: props.isFrontPrint ? data.version : 1,
        handlerType: data.handlerType,
        default: data.default,
        designerJson: data.handlerType === 'versionCreate' ? '' : info.designerJson,
        runtimeJson: data.handlerType === 'versionCreate' ? '' : info.runtimeJson,
      });
    }
    (!formState.key || formState.handlerType) && (formState.key = getUuid());
  });

  const visibleChange = async (visible) => {
    if (visible) {
      modelList.value =
        (await getCategoryListComplete({ module: ModelTypeEnum.ENTITY as string })) || [];
    }
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    currentId.value = '';
    formState.designerJson = '';
    closeModal();
  };

  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.title.includes(input);
    }
    return false;
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value) && !isEdit.value) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.pageDesigner.document'),
        }),
      );
    }
    callback();
  };

  // const getModelList = async () => {
  //   const arr = await getModelComprehensiveModelSummary({
  //     category: formState.modelKey,
  //   });
  //   modelOptions.value = groupBy(arr, 'category');
  // };

  const pageSizeChange = () => {
    let value: string = '';
    switch (formState.paperSize) {
      case 'A3':
        value = '297_420';
        break;
      case 'A4':
        value = '210_297';
        break;
      case 'A5':
        value = '148_210';
        break;
      default:
        value = 'CUSTOM';
        break;
    }

    if (value === 'CUSTOM' || !value) {
      formState.height = undefined;
      formState.width = undefined;
    }
    if (value && value.indexOf('_') !== -1) {
      const [longValue, widthValue] = value.split('_');
      formState.height = Number.parseInt(longValue, 10);
      formState.width = Number.parseInt(widthValue, 10);
    }
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    let data: any = {};

    data = {
      ...formState,
      key: props.isFrontPrint ? keyPrePad(formState.key!) : keyPad(formState.key!),
      default: props.isFrontPrint ? (formState.default ? 1 : 0) : 1,
      version: props.isFrontPrint ? formState.version : '1',
    };

    let res;
    if (formState.handlerType === 'versionCopy') {
      res = await postDocumentCopyVersionById({ id: currentId.value }, data);
    } else if (formState.handlerType === 'versionCreate') {
      res = await postDocumentSaveVersion(data);
    } else if (!formState.id) {
      res = await postDocument({ ...data, designerJson: designerJson.value });
    } else {
      await putDocumentUpdateVersionByIdById({ id: currentId.value }, data);
    }
    if (res) data.id = res;
    /**
     * 新建时需要拿到子数据去跳转设计页面
     */
    if (!isEdit.value && !formState.handlerType) {
      const result = await getDocumentGetVersionById({ id: data.id });
      data = { ...data, ...result };
    }
    data['isEdit'] = isEdit.value && !formState.handlerType;
    closeModal();
    isEdit.value = false;
    designerJson.value = '';
    emit('refresh', data);
  };

  const handleImport = async () => {
    const files = await uploaderFiles({
      accept: '.xlsx',
    });
    const paperJson = await XlsxParser.xlsx2json(files[0]);
    designerJson.value = JSON.stringify(paperJson);
    handleOk();
  };

  const onNameVersionChange = () => {
    formRef.value?.validateFields('name');
  };
</script>

<style lang="less" scoped>
  .ant-input-group {
    :deep(.ant-form-item) {
      margin-bottom: 0;

      &:first-child {
        .ant-input-affix-wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      &:last-child {
        .ant-input-affix-wrapper {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }
</style>
