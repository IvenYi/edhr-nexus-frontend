<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options"
    width="640px"
    :wrapClassName="'document-modal-wrapper '"
    :mask-closable="false"
    :keyboard="false"
  >
    <template #footer>
      <a-button @click="handleCancel">{{ t('sys.appDesigner.cancel') }}</a-button>
      <a-button
        v-if="!formState.id && sheetType !== SheetType.Refer"
        type="primary"
        @click="handleImportAndOk"
        >{{ t('sys.appDesigner.templateImportConfirmation') }}</a-button
      >
      <a-button type="primary" @click="handleOk">{{ t('sys.appDesigner.ok') }}</a-button>
    </template>
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <template v-if="isSheet">
        <a-form-item :label="$t('sys.onlineForm.parentNode')" name="parentId">
          <EdhrOutlineSelect
            :disabled="!!formState.id"
            v-model:value="formState.parentId"
            size="middle"
          />
        </a-form-item>
        <!-- <a-form-item :label="t('sys.appDesigner.printDesign.form.usage')" name="sheetType">
          <a-radio-group :disabled="!!formState.id" v-model:value="sheetType">
            <a-radio :value="SheetType.Refer">{{
              t('sys.appDesigner.printDesign.form.referPage')
            }}</a-radio>
            <a-radio :value="SheetType.Blank" disabled>{{
              t('sys.appDesigner.printDesign.form.blankPage')
            }}</a-radio>
          </a-radio-group>
        </a-form-item> -->

        <a-form-item
          v-if="sheetType === SheetType.Refer"
          :label="t('sys.appDesigner.printDesign.form.refDocument')"
          name="refId"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseSelectSth', {
                sth: t('sys.appDesigner.printDesign.form.refDocument'),
              }),
            },
          ]"
        >
          <VersionSelect
            :disabledKeys="disabledKeys"
            :type="FormDesignEnum.ONLINE_FORM"
            :value="formState.refId"
            @select="onFormVersionSelect"
            :disabled="!!formState.id"
            :enableControl="true"
            :notEmitParent="false"
          />
        </a-form-item>
      </template>
      <a-form-item
        :label="
          isSheet
            ? t('sys.appDesigner.printDesign.form.name2')
            : t('sys.appDesigner.printDesign.form.name')
        "
        name="name"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseInputSth', { sth: t('sys.appDesigner.printDesign.form.name') }),
            whitespace: true,
          },
        ]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="
          (isSheet ? t('sys.pageDesigner.form') : t('sys.pageDesigner.document')) +
          t('sys.pageDesigner.inputAttr')
        "
        required
        name="ofRequired"
      >
        <a-checkbox v-model:checked="ofRequiredValue">{{ t('sys.edhr.isNeedFill') }}</a-checkbox>
      </a-form-item>
      <template v-if="sheetType === SheetType.Blank || !isSheet">
        <a-form-item
          :label="t('sys.appDesigner.printDesign.form.dataModel')"
          name="modelKey"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', {
                sth: t('sys.appDesigner.printDesign.form.dataModel'),
              }),
            },
          ]"
        />
        <a-form-item
          :label="t('sys.appDesigner.printDesign.form.paperSize')"
          name="paperSize"
          :rules="[
            { required: true },
            {
              validator: validateSpecialCharacters,
            },
          ]"
        >
          <a-select
            :disabled="!!formState.id"
            v-model:value="formState.paperSize"
            @change="handlePaperSizeChange"
          >
            <a-select-option v-for="item in PaperSize" :key="item" :value="item">{{
              pagerSizeMap[item]
            }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-row>
          <a-col :span="6" />
          <a-col :span="16">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item
                  :label="t('sys.appDesigner.printDesign.form.height')"
                  name="width"
                  :rules="[
                    {
                      required: true,
                      message: t('sys.pleaseInputSth', {
                        sth: t('sys.model.length'),
                      }),
                    },
                  ]"
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label-align="left"
                >
                  <a-input-number
                    :disabled="!!formState.id || formState.paperSize !== PaperSize.CUSTOM"
                    v-model:value="formState.width"
                    :min="0"
                    :step="1"
                    :precision="0"
                    addon-after="mm"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label="t('sys.appDesigner.printDesign.form.width')"
                  name="height"
                  :rules="[
                    {
                      required: true,
                      message: t('sys.pleaseInputSth', {
                        sth: t('sys.width'),
                      }),
                    },
                  ]"
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label-align="left"
                >
                  <a-input-number
                    :min="0"
                    :disabled="!!formState.id || formState.paperSize !== PaperSize.CUSTOM"
                    v-model:value="formState.height"
                    :step="1"
                    :precision="0"
                    addon-after="mm"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>

        <a-form-item :label="t('sys.appDesigner.printDesign.form.paperDirection')" name="direction">
          <a-radio-group :disabled="!!formState.id" v-model:value="formState.direction">
            <a-radio :value="Orientation.Portrait">{{
              t('sys.appDesigner.printDesign.form.portrait')
            }}</a-radio>
            <a-radio :value="Orientation.Landscape">{{
              t('sys.appDesigner.printDesign.form.landscape')
            }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </template>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :rows="3" :maxlength="120" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uploaderFiles } from '/@/utils/file/download';
  import { XlsxParser } from '/@online-form/views/designer/utils/xlsx-parser';
  import { DomParser } from '/@online-form/views/designer/utils/dom-parser';
  import { EdhrOutlineSelect } from '/@online-form/views/edhr-designer/components/edhr-outline';
  import { getDocOutlineInfo } from '/@/apis/gct-apaas/DocOutlineController';
  import { DocOutlineResponse } from '/@/apis/gct-apaas/model';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';

  enum Orientation {
    Portrait = 'portrait', // 纵
    Landscape = 'landscape', // 横
  }

  enum PaperSize {
    A3 = 'A3',
    A4 = 'A4',
    A5 = 'A5',
    CUSTOM = 'CUSTOM',
  }

  const pagerSizeMap = {
    A3: 'A3',
    A4: 'A4',
    A5: 'A5',
    CUSTOM: $t('sys.customize'),
  };

  enum SheetType {
    Blank = 'Blank',
    Refer = 'Refer',
  }

  const PaperSizeMap = {
    [PaperSize.A3]: [297, 420],
    [PaperSize.A4]: [210, 297],
    [PaperSize.A5]: [148, 210],
  };

  const props = defineProps<{
    props?: object;
    options?: object;
    isSheet?: boolean;
    callback?: any;
    disabledKeys?: string[];
  }>();

  console.log('props', props);

  const { t } = useI18n();
  const visible = ref<boolean>(true);
  const sheetType = ref<SheetType>(SheetType.Refer);
  const formRef = ref<FormInstance>();
  const formState: DocOutlineResponse & {
    id?: string;
  } = reactive({
    baseId: undefined,
    categoryId: undefined,
    description: '',
    direction: Orientation.Portrait,
    height: PaperSizeMap[PaperSize.A4][1],
    modelKey: undefined,
    name: undefined,
    paperSize: PaperSize.A4,
    refId: undefined,
    type: undefined,
    width: PaperSizeMap[PaperSize.A4][0],
    ofRequired: 1,
  });

  const ofRequiredValue = computed({
    get() {
      return formState.ofRequired !== 0;
    },
    set(v) {
      formState.ofRequired = v === true ? 1 : 0;
    },
  });

  (async () => {
    Object.assign(formState, props.props);
    if (formState.id) {
      const res = await getDocOutlineInfo({
        id: formState.id,
      });
      Object.assign(formState, res ?? {});
      if (formState.parentId === res?.baseId) {
        formState.parentId = '';
      }
      sheetType.value = formState.refId ? SheetType.Refer : SheetType.Blank;
    }
  })();

  const validateSpecialCharacters = (_, value) => {
    const firstPageSize = props?.props?.firstPageSize;
    if (firstPageSize && firstPageSize !== value) {
      return Promise.reject(
        $t('sys.onlineForm.selectDocumentErrorTip1', { pageSize: 'firstPageSize' }),
      );
    }
    return Promise.resolve();
  };

  const handlePaperSizeChange = (size: PaperSize) => {
    const value = PaperSizeMap[size];
    if (value) {
      formState.width = value[0];
      formState.height = value[1];
      formRef.value?.validateFields(['width', 'height']);
    } else {
      formState.width = undefined;
      formState.height = undefined;
    }
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const handleOk = async () => {
    try {
      await formRef.value?.validate();
      if (props.callback && typeof props.callback) {
        if (!formState.parentId) {
          formState.parentId = props.props.parentId;
        }
        await props.callback(formState, sheetType.value);
      }
      visible.value = false;
    } catch (err) {
      console.warn(err);
    }
  };

  const handleImportAndOk = async () => {
    try {
      await formRef.value?.validate();
      const files = await uploaderFiles({
        accept: '.xlsx',
      });
      const paperJson = await XlsxParser.xlsx2json(files[0]);

      // const
      const { width, height } = formState;
      // 默认纵向
      let size = [width, height].sort();
      if (formState.direction === Orientation.Landscape) {
        // 横向尺寸
        size.reverse();
      }
      XlsxParser.contentFitToPaper(paperJson as any, size.map((item) => item! - 20 + 'mm') as any);

      formState.designerJson = JSON.stringify(paperJson);
      formState.runtimeJson = JSON.stringify(
        await DomParser.toRuntimeJson(paperJson as any, {
          type: formState.paperSize as any,
          size: [formState.width!, formState.height!],
          orientation: formState.direction as any,
        }),
      );
      // return;
      if (props.callback && typeof props.callback) {
        props.callback(formState, sheetType.value);
      }
      visible.value = false;
    } catch (err) {
      console.warn(err);
    }
  };

  const onFormVersionSelect = (v) => {
    console.log('vvvv', v);
    formState.refId = v.refId;
    formState.name = v.name;
  };
</script>

<style lang="less">
  .document-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      max-height: 80vh;

      .ant-modal-body {
        overflow: auto;
      }
    }
  }
</style>
