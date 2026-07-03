<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? `${t('sys.edit')}${t('sys.printDesigner.label')}`
        : `${t('sys.new')}${t('sys.printDesigner.label')}`
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @visible-change="visibleChange"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item
            :label="t('sys.printDesigner.labelType')"
            name="categoryId"
            :rules="[{ required: true }]"
          >
            <a-select ref="select" v-model:value="formState.categoryId">
              <template v-for="item in labelCategory" :key="item">
                <a-select-option :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="t('sys.printDesigner.labelName')"
            name="name"
            :rules="[{ required: true }]"
          >
            <a-input v-model:value="formState.name" show-count :maxlength="32" />
          </a-form-item>

          <a-form-item
            :label="t('sys.printDesigner.labelKey')"
            name="key"
            :rules="[{ required: true }, { validator: validateSpecialCharacters }]"
          >
            <a-input
              v-model:value="formState.key"
              :disabled="isEdit"
              :addon-before="keyPrefix"
              :addon-after="isFrontPrint ? '' : keySuffix"
              show-count
              :maxlength="32"
            />
          </a-form-item>
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
            <a-select v-model:value="formState.modelKey" :disabled="isEdit">
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
          <a-form-item :label="t('sys.printDesigner.labelSize')">
            <a-select v-model:value="labelSize" @change="onChange">
              <a-select-option v-for="opt in sizeOpt" :key="opt.value" :value="opt.value">{{
                opt.label
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('sys.width')" name="width" :rules="[{ required: true }]">
            <a-input-number v-model:value="formState.width" :disabled="labelSize !== 7" />
          </a-form-item>
          <a-form-item :label="t('sys.height')" name="height" :rules="[{ required: true }]">
            <a-input-number v-model:value="formState.height" :disabled="labelSize !== 7" />
          </a-form-item>
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
            <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CategoryType, ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategoryCompleteResponse, LabelRequest } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import {
    getLabelGetVersionById,
    postLabel,
    putLabelById,
  } from '/@/apis/gct-apaas/LabelController';
  import { sizeOpt, transformsize, transformCoordinateByDpi } from '../constants/size';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset, keyPrePad, keyPreClip } =
    useKeyParser('pl');
  const labelSize = ref(1);
  const oldDpi = ref();
  const { t } = useI18n();
  const activeKey = ref(['1', '2']);

  const props = defineProps<{
    labelCategory: Array<any>;
    tab: CategoryType;
    isFrontPrint?: boolean;
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

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    formState.categoryId = data.categoryId;
    if (data && data.uuid) {
      formState.key = data.uuid;
    }
    if (data && data.node) {
      const { node } = data;
      const info = await getLabelGetVersionById({ id: node.id });
      oldDpi.value = info?.dpi;
      isEdit.value = true;

      currentId.value = node.id;
      Object.assign(formState, {
        ...info,
        key: props.isFrontPrint ? keyPreClip(info?.key ?? '') : keyClip(info?.key ?? ''),
        categoryId: info?.categoryId,
      });

      const sizeObj = sizeOpt.find(
        (item) => item.width === info?.width && item.height === info?.height,
      );
      labelSize.value = sizeObj?.value ?? 7;
    }
  });

  const onChange = (value) => {
    const opt = sizeOpt.find((d) => d.value === value)!;
    formState.width = opt.width;
    formState.height = opt.height;
  };

  const formState = reactive<LabelRequest>({
    categoryId: '',
    description: '',
    designerJson: '',
    key: '',
    name: '',
    modelKey: '',
    width: 76,
    height: 50,
    dpi: 203,
    printType: 'zpl',
  });

  const isEdit = ref(false);
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
    labelSize.value = 1;
    formState.designerJson = '';
    closeModal();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value)) {
      callback(t('sys.printDesigner.validateKeyErrorMsg'));
    }
    callback();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    let data = {};

    data = {
      ...formState,
      key: props.isFrontPrint ? keyPrePad(formState.key!) : keyPad(formState.key!),
    };

    if (oldDpi.value && oldDpi.value !== data.dpi) {
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
      data.designerJson = JSON.stringify(designerJsonParse);
    }

    if (isEdit.value) {
      await putLabelById({ id: currentId.value }, data);
    } else {
      await postLabel(data);
    }
    closeModal();
    emit('refresh', data);
    isEdit.value = false;
  };
</script>

<style lang="less"></style>
