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
            :label="t('sys.printDesigner.labelType')"
            name="categoryId"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', {
                  sth: t('sys.printDesigner.labelType'),
                }),
              },
            ]"
          >
            <a-select
              ref="select"
              v-model:value="formState.categoryId"
              :disabled="!!formState.handlerType"
            >
              <template v-for="item in labelCategory" :key="item">
                <a-select-option :value="item.value">{{ item.label }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="t('sys.printDesigner.labelName')"
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
            :label="t('sys.printDesigner.labelKey')"
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
          <a-form-item
            v-if="!isEdhr"
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
              :filter-option="filterOption"
              :placeholder="t('sys.chooseText')"
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
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item :label="t('sys.printDesigner.labelSize')" :rules="[{ required: true }]">
            <a-select v-model:value="labelSize" @change="onChange">
              <a-select-option v-for="opt in sizeOpt" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-row style="margin-right: 10px">
            <a-col :offset="6" :span="8">
              <a-form-item :label="t('sys.width')" name="width" :rules="[{ required: true }]">
                <a-input-number v-model:value="formState.width" :disabled="labelSize !== 7">
                  <template #addonAfter> mm </template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :offset="1" :span="8">
              <a-form-item :label="t('sys.height')" name="height" :rules="[{ required: true }]">
                <a-input-number v-model:value="formState.height" :disabled="labelSize !== 7">
                  <template #addonAfter> mm </template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item
            :label="t('sys.printDesigner.printDPI')"
            name="dpi"
            :rules="[{ required: true }]"
          >
            <a-input-number v-model:value="formState.dpi" :min="0" />
          </a-form-item>

          <a-form-item :label="t('sys.printDesigner.labelFormart')" :rules="[{ required: true }]">
            <a-select
              v-model:value="formState.printType"
              :placeholder="t('sys.appDesigner.pleaseSelect')"
            >
              <a-select-option v-for="opt in formartOpt" :key="opt.value" :value="opt.value">{{
                opt.label
              }}</a-select-option>
            </a-select>
          </a-form-item>

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
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, unref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CategoryType, ModelTypeEnum, PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategoryCompleteResponse, LabelRequest } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import {
    getLabelGetVersionById,
    postLabel,
    putLabelUpdateVersionByIdById,
    postLabelCopyVersionById,
    postLabelSaveVersion,
  } from '/@/apis/gct-apaas/LabelController';
  import { sizeOpt, transformsize, transformCoordinateByDpi } from '../constants/size';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useBranch } from '/@/hooks/develop/useBranch';

  const { branchId } = useBranch();
  const activeKey = ref(['1', '2']);
  const { getUuid } = useUUid([], '');
  const { keyPrefix, keyPad, keyClip, keyReset, keyPrePad, keyPreClip, keySuffix } =
    useKeyParser('pl');
  const labelSize = ref(1);
  const oldDpi = ref();
  const { t } = useI18n();
  const props = defineProps<{
    labelCategory: Array<any>;
    isFrontPrint: Boolean;
    isEdhr?: Boolean;
  }>();
  const modelList = ref<CategoryCompleteResponse[]>([]);

  enum formart {
    ZPL = 'zpl',
    // TSPL = 'tspl',
    // CPCL = 'cpcl',
    // 'ESC/POS' = 'esc/pos',
    PNG = 'png',
  }

  const emit = defineEmits(['refresh', 'register']);
  const currentId = ref('');
  const formRef = ref<FormInstance>();

  const formartOpt = Object.values(formart).map((key, index) => ({
    value: key,
    label: Object.keys(formart)[index],
  }));

  const modalTitle = computed(() => {
    const type = formState.handlerType;
    if (type === 'copy') {
      return `${t('sys.copy')}${t('sys.pageDesigner.label')}`;
    } else if (type === 'versionCopy') {
      return `${t('sys.pageDesigner.version_copyText')}`;
    } else if (type === 'versionCreate') {
      return `${t('sys.pageDesigner.version_createText')}`;
    } else if (!type && formState.id) {
      return `${t('sys.edit')}${t('sys.pageDesigner.label')}`;
    } else return `${t('sys.new')}${t('sys.pageDesigner.label')}`;
  });

  const [registerInner, { closeModal, setModalProps }] = useModalInner(async (data) => {
    if (!data) return;
    formState.id = '';
    formState.categoryId = data.categoryId;
    if (data) {
      const info = data.id ? (await getLabelGetVersionById({ id: data.id })) || {} : data;
      oldDpi.value = info?.dpi;
      isEdit.value = !!data.id;
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
        // key: data.id && keyClip(info?.key ?? ''),
        key:
          data.id && (props.isFrontPrint ? keyPreClip(info?.key ?? '') : keyClip(info?.key ?? '')),
        version: props.isFrontPrint ? data.version : 1,
        handlerType: data.handlerType,
        default: data.default,
        designerJson: data.handlerType === 'versionCreate' ? '' : info.designerJson,
      });

      const sizeObj = sizeOpt.find(
        (item) => item.width === info?.width && item.height === info?.height,
      );
      labelSize.value = sizeObj?.value ?? 7;
    }
    (!formState.key || formState.handlerType) && (formState.key = getUuid());
  });

  const onChange = (value) => {
    const opt = sizeOpt.find((d) => d.value === value)!;
    formState.width = opt.width;
    formState.height = opt.height;
    if (value !== 7) {
      formRef.value?.validate(['width', 'height']);
    }
  };

  const formState = reactive<LabelRequest>({
    categoryId: '',
    description: '',
    designerJson: '',
    key: '',
    name: '',
    modelKey: undefined,
    width: 76,
    height: 50,
    dpi: 203,
    printType: 'zpl',
  });

  const isEdit = ref(false);
  const visibleChange = async (visible) => {
    if (visible) {
      const res = (await getCategoryListComplete({ module: ModelTypeEnum.ENTITY as string })) || [];
      modelList.value = res.map((item) => ({
        ...item,
        children: item.children?.filter((i) => i.type !== 'TXN_EXT') || [],
      }));
    }
  };
  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    currentId.value = '';
    labelSize.value = 1;
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
    if (!formState.key) {
      callback();
    }
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value) && !isEdit.value) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.printDesigner.label'),
        }),
      );
    }
    callback();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    setModalProps({ confirmLoading: true });
    let data: any = {};

    data = {
      ...formState,
      // key: keyPad(formState.key!),
      key: props.isFrontPrint ? keyPrePad(formState.key!) : keyPad(formState.key!),
      default: props.isFrontPrint ? (formState.default ? 1 : 0) : 1,
      version: props.isFrontPrint ? formState.version : '1',
      // default: formState.default ? 1 : 0,
    };

    if (oldDpi.value && oldDpi.value !== data.dpi && data.designerJson) {
      const designerJsonParse = JSON.parse(data.designerJson);
      designerJsonParse.height = transformsize(data.height, data.dpi);
      designerJsonParse.width = transformsize(data.width, data.dpi);
      designerJsonParse.page = designerJsonParse.page.map((i) => {
        return {
          ...i,
          top: transformCoordinateByDpi(i.top, oldDpi.value, data.dpi),
          left: transformCoordinateByDpi(i.left, oldDpi.value, data.dpi),
        };
      });
      data['designerJson'] = JSON.stringify(designerJsonParse);
    }

    let res;
    if (formState.handlerType === 'versionCopy') {
      res = await postLabelCopyVersionById({ id: currentId.value }, data);
    } else if (formState.handlerType === 'versionCreate') {
      res = await postLabelSaveVersion(data);
    } else if (!formState.id) {
      res = await postLabel(data);
    } else {
      await putLabelUpdateVersionByIdById({ id: currentId.value }, data);
    }
    if (res) data.id = res;
    setModalProps({ confirmLoading: false });
    data['isEdit'] = isEdit.value && !formState.handlerType;
    closeModal();
    isEdit.value = false;
    emit('refresh', data);
  };

  const validateVersion = async (_rule, _value) => {
    const { name, version } = formState;

    if (!version && !name && props.isFrontPrint) {
      return Promise.reject(t('sys.printDesigner.validNameOrVersionErrorMsg'));
    } else if (!name) {
      return Promise.reject(t('sys.printDesigner.validNameErrorMsg'));  
    } else if (!version && props.isFrontPrint) {
      return Promise.reject(t('sys.printDesigner.validVersionErrorMsg'));
      // } else if (!/\d+/.test(value[0]) || !/\d+/.test(value[1])) {
      //   return Promise.reject('请输入正确的版本号');
    } else {
      return Promise.resolve();
    }
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
