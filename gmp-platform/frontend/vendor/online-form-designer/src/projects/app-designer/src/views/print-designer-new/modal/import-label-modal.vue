<template>
  <div class="import-label">
    <div class="px32px pt30px pb20px">
      <a-steps :current="curStep">
        <a-step :title="t('sys.uploadFile')" />
        <a-step :title="t('sys.basicInfo')" />
        <a-step :title="t('sys.app.contentSetting')" />
      </a-steps>

      <div class="text-[#212528]">
        <div v-if="curStep === 0" class="h470px">
          <div class="font-500 mb16px mt30px">{{ t('sys.uploadFile') }}</div>
          <div>
            <a-upload-dragger
              name="file"
              :customRequest="customRequest"
              :showUploadList="false"
              accept=".bq"
              style="padding-top: 40px; padding-bottom: 40px"
            >
              <div>
                <SvgIcon size="56" name="folder" />
              </div>
              <p class="text-[#212528] mt12px">{{t('sys.ipaas.clickOrDragToUploadTip')}}</p>
              <p class="text-[12px] text-[#8F8F8F]">{{t('sys.printDesigner.supportFileFormatTip')}}</p>
            </a-upload-dragger>
            <div class="progress-box mt8px">
              <div
                class="progress-item mb-8px w-full"
                v-for="(item, index) in fileList"
                :key="index"
              >
                <SvgIcon class="svg-icon" :size="32" name="attachment" />
                <div class="progress-item__box pl-10px">
                  <div class="progress-item__name">
                    <!-- <a-tooltip>
                      <template #title>{{ item.name }}</template>
                    </a-tooltip> -->
                    <span class="label" :title="item.name">{{ item.name }}</span>
                    <span v-if="item.fileSize" :class="['size', { 'mr-40px': item.status }]">{{
                      fileSizeParser(item.fileSize)
                    }}</span>
                  </div>
                  <a-progress :strokeWidth="4" :percent="item.percentNum" :status="item.status">
                    <template #format="percent">
                      <span
                        class="error progress-error-info"
                        v-if="item.status === statusEnum.EXCEPTION"
                        :title="item.errorMessge || t('sys.component.upload.uploadError')"
                      >
                        {{ item.errorMessge || t('sys.component.upload.uploadError') }}
                      </span>
                      <span v-else class="text-[12px]">{{ percent + '%' }}</span>
                    </template>
                  </a-progress>
                </div>
                <close-outlined class="mt-3px icon" @click.stop="deleteFile" />
              </div>
            </div>
          </div>
        </div>
        <template v-else-if="curStep === 1">
          <a-form
            ref="formRef"
            :model="formState"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
            style="margin-top: 20px"
          >
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
                  <a-select ref="select" v-model:value="formState.categoryId">
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
                        <a-form-item :style="{ width: isFrontPrint ? '72%' : '100%' }" name="name">
                          <a-input
                            v-model:value="formState.name"
                            show-count
                            :maxlength="32"
                            :placeholder="t('sys.inputText')"
                            @change="onNameVersionChange"
                          />
                        </a-form-item>
                        <a-form-item v-if="isFrontPrint" name="version" style="width: 28%">
                          <a-input
                            v-model:value="formState.version"
                            :placeholder="t('sys.appDesigner.version')"
                            @change="onNameVersionChange"
                          />
                        </a-form-item>
                      </a-input-group>
                    </a-col>
                    <a-col v-if="isFrontPrint" :span="5" class="text-right lh-32px">
                      <a-checkbox v-model:checked="formState.default">{{
                        t('sys.default')
                      }}</a-checkbox>
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
                    :addon-before="keyPrefix"
                    :addon-after="keySuffix"
                    show-count
                    :maxlength="32"
                  />
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
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
                    showSearch
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
                  :label="t('sys.printDesigner.labelSize')"
                  :rules="[{ required: true }]"
                >
                  <a-select v-model:value="labelSize" @change="onChange">
                    <a-select-option v-for="opt in sizeOpt" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-row>
                  <a-col style="padding-left: 22px" :offset="5" :span="8">
                    <a-form-item :label="t('sys.width')" name="width" :rules="[{ required: true }]">
                      <a-input-number v-model:value="formState.width" :disabled="labelSize !== 7">
                        <template #addonAfter> mm </template>
                      </a-input-number>
                    </a-form-item>
                  </a-col>
                  <a-col style="padding-right: 10px" :offset="2" :span="8">
                    <a-form-item
                      :label="t('sys.height')"
                      name="height"
                      :rules="[{ required: true }]"
                    >
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
                <a-form-item
                  :label="t('sys.printDesigner.labelFormart')"
                  :rules="[{ required: true }]"
                >
                  <a-select
                    v-model:value="formState.printType"
                    :placeholder="t('sys.appDesigner.pleaseSelect')"
                  >
                    <a-select-option
                      v-for="opt in formartOpt"
                      :key="opt.value"
                      :value="opt.value"
                      >{{ opt.label }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
                <a-form-item :label="t('sys.description')" name="description">
                  <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
                </a-form-item>
              </a-collapse-panel>
            </a-collapse>
          </a-form>
        </template>
        <div v-else-if="curStep === 2">
          <div class="h530px mt32px">
            <div class="px12px py8px info-area">
              <info-circle-filled class="mr8px info-icon" />
              {{ t('sys.printDesigner.importLabelModalStep1Tip') }}
            </div>
            <div class="mt12px">
              <a-table
                :columns="columns"
                :data-source="tableData"
                size="middle"
                :scroll="{ y: 440 }"
                :pagination="false"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'content'">
                    <!-- {{
                      console.log(
                        1111,
                        record.type,
                        record.attrs,
                        getComponentPropertiesByType(record).children,
                      )
                    }} -->
                    <template
                      v-for="(s, i) in getComponentPropertiesByType(record, props.isEdhr).children"
                      :key="i"
                    >
                      <component
                        :is="Comps[s.type]"
                        v-bind="s.props"
                        :isEdhr="isEdhr"
                        label=""
                        :modelKey="formState.modelKey"
                        @changeEvent="s.changeEvent"
                        @change2Event="s.change2Event"
                        :style="{
                          width: s.type === 'input-content' ? '205px' : '100px',
                          display: 'inline-block',
                          marginLeft: '5px',
                        }"
                      />
                    </template>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-right btn-wrap">
      <a-button v-show="curStep === 0" @click="props.modal.dismiss()">{{
        t('sys.cancel')
      }}</a-button>
      <a-button v-show="curStep > 0" @click="onPrev">{{ t('sys.editor.prev') }}</a-button>
      <a-button v-show="curStep < 2" type="primary" @click="onNext">{{
        t('sys.editor.next')
      }}</a-button>
      <a-button v-show="curStep === 2" type="primary" @click="onConfirm">{{
        t('sys.okText')
      }}</a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, computed, onMounted } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal } from '@gct/runtime';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import {
    postLabelImport,
    postLabel,
    postLabelSaveVersion,
    postLabelLabelDuplicateNameCheck,
  } from '/@/apis/gct-apaas/LabelController';
  import { message } from 'ant-design-vue';
  import { LabelRequest, CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { sizeOpt, transformsize, transformCoordinateByDpi } from '../constants/size';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { PRINT_ELE_TYPE, DATA_TYPE } from '../label-design/constants/CommonPrintElems';
  import { useProp } from '../label-design/hooks/useProp';
  import Comps from '../label-design/panels/widget/controls';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const props = defineProps<{
    modal: IModal;
    labelCategory: Array<any>;
    isFrontPrint: Boolean;
    isEdhr?: Boolean;
  }>();

  const emit = defineEmits(['propchange', 'refresh']);
  const { getComponentPropertiesByType } = useProp({ emit });

  const { t } = useI18n();
  const { keyPrefix, keyPad, keyPrePad, keySuffix } = useKeyParser('pl');

  const curStep = ref(0);
  const formState = reactive<LabelRequest>({});
  const activeKey = ref(['1', '2']);
  const tableData = ref([]);
  const fileList = ref<object[]>([]);
  const formRef = ref();
  const oldDpi = ref();
  const modelList = ref<CategoryCompleteResponse[]>([]);
  const timer = ref();

  const columns = [
    { title: t('sys.pageDesigner.widget'), dataIndex: 'displayName', key: '1', width: 80 },
    { title: t('sys.name'), dataIndex: 'alias', key: '2', width: 120 },
    { title: t('sys.content'), dataIndex: 'content', key: '3' },
  ];

  enum formart {
    ZPL = 'zpl',
    // TSPL = 'tspl',
    // CPCL = 'cpcl',
    // 'ESC/POS' = 'esc/pos',
    PNG = 'png',
  }

  const formartOpt = Object.values(formart).map((key, index) => ({
    value: key,
    label: Object.keys(formart)[index],
  }));

  const labelSize = computed(() => {
    const obj = sizeOpt.find(
      (item) => item.width === formState.width && item.height === formState.height,
    );
    return obj?.value ?? 7;
  });

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  onMounted(async () => {
    if (!props.isEdhr) {
      modelList.value =
        (await getCategoryListComplete({ module: ModelTypeEnum.ENTITY as string })) || [];
    }
  });

  const onPrev = () => {
    curStep.value -= 1;
  };

  const onNext = async () => {
    if (curStep.value === 0) {
      if (!fileList.value.length || fileList.value[0]?.status) {
        message.warn('请先上传文件');
        return;
      }
    } else if (curStep.value === 1) {
      await formRef.value?.validate();
      if (oldDpi.value && oldDpi.value !== formState.dpi && formState.designerJson) {
        const designerJsonParse = JSON.parse(formState.designerJson || '') || {};
        designerJsonParse.height = transformsize(formState.height!, formState.dpi!);
        designerJsonParse.width = transformsize(formState.width!, formState.dpi!);
        designerJsonParse.page = designerJsonParse.page.map((i) => {
          return {
            ...i,
            top: transformCoordinateByDpi(i.top, oldDpi.value, formState.dpi!),
            left: transformCoordinateByDpi(i.left, oldDpi.value, formState.dpi!),
          };
        });
        formState.designerJson = JSON.stringify(designerJsonParse);
      }
    }
    curStep.value += 1;
  };

  const onConfirm = async () => {
    if (formState.designerJson) {
      const JsonStr = JSON.parse(formState.designerJson);
      if (JsonStr.page) {
        JsonStr.page = JsonStr.page?.reduce((list, e) => {
          const obj = tableData.value.find((f) => f.id === e.id);
          if (obj) {
            list.push(obj);
          } else list.push(e);
          return list;
        }, []);
      }
      JsonStr.modelKey = formState.modelKey;
      formState.designerJson = JSON.stringify(JsonStr);
    }
    const data: LabelRequest = {
      ...formState,
      key: props.isFrontPrint ? keyPrePad(formState.key!) : keyPad(formState.key!),
      default: props.isFrontPrint ? (formState.default ? 1 : 0) : 1,
      version: props.isFrontPrint ? formState.version : '1',
    };
    let res;
    if (data.baseId) {
      res = await postLabelSaveVersion(data);
    } else {
      res = await postLabel(data);
    }
    props.modal.dismiss({ ok: true, params: { ...data, id: res } });
    message.success(t('sys.printDesigner.importSuccessTip'));
  };

  const customRequest = async ({ file }) => {
    const nameArr = file.name.split('.');
    const type = nameArr[nameArr.length - 1];
    if (type !== 'bq') {
      message.warn(`【${file.name}】${t('sys.printDesigner.importBqFormatError')}`);
      return Promise.reject();
    }
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 10) {
      message.warn(`【${file.name}】${t('sys.pageDesigner.fileSizeTooLarge', [10])}`);
      return Promise.reject();
    }
    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: '',
        percentNum: 0,
        status: statusEnum.ACTIVE,
      },
    ];
    const formData: any = new FormData();
    formData.append('file', file, file.name);
    timer.value = setInterval(() => {
      if (fileList.value[0]['percentNum'] < 95) {
        fileList.value[0]['percentNum']++;
      }
    }, 100);
    try {
      const res = await postLabelImport(formData, {
        transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
        errorMessageMode: 'none',
      });
      fileList.value[0]['percentNum'] = 100;
      fileList.value[0]['status'] = undefined;
      oldDpi.value = res?.dpi;
      Object.assign(formState, {
        ...res,
        key: props.isFrontPrint ? res?.key : null,
      });
      checkLabelData(formState);
      const designerJsonParse = JSON.parse(formState.designerJson || '{}');
      tableData.value = (designerJsonParse.page || [])
        .filter((e) =>
          [PRINT_ELE_TYPE.BAR_CODE, PRINT_ELE_TYPE.QR_CODE, PRINT_ELE_TYPE.TEXT].includes(e.type),
        )
        .map((e) => {
          return {
            ...e,
            children: undefined,
          };
        });
    } catch (error) {
      fileList.value[0]['status'] = statusEnum.EXCEPTION;
      fileList.value[0]['errorMessge'] = error;
      clearInterval(timer.value);
    }
  };

  // 校验上传的标签的categoryId和modelKey
  const checkLabelData = (data) => {
    if (!props.labelCategory.find((e) => e.value === data.categoryId)) {
      data.categoryId = '';
    }
    if (
      !props.isEdhr &&
      !modelList.value
        .map((e) => e.children || [])
        .flat()
        .find((e) => e.key === data.modelKey)
    ) {
      data.modelKey = '';
      const JsonStr = JSON.parse(data.designerJson || '');
      if (!JsonStr) return;
      if (JsonStr.page && JsonStr.page.length) {
        JsonStr.page.forEach((e) => {
          const attr = e.attrs?.content || e.attrs?.text;
          if (attr && attr.type === DATA_TYPE.VAR) {
            attr.value = '';
            attr.label = '';
            attr.exp && (attr.exp = {});
          }
        });
        data.designerJson = JSON.stringify(JsonStr);
      }
    }
  };

  const deleteFile = () => {
    fileList.value = [];
    if (timer.value) clearInterval(timer.value);
  };

  const validateVersion = async (_rule, value) => {
    const { name, version } = formState;
    const res = await postLabelLabelDuplicateNameCheck({ name: formState.name });
    if (!res) {
      return Promise.reject(t('sys.printDesigner.labelNameConflictSth', { sth: name }));
    }

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

  const onNameVersionChange = () => {
    formRef.value?.validateFields('name');
  };

  const onChange = (value) => {
    const opt = sizeOpt.find((d) => d.value === value)!;
    formState.width = opt.width;
    formState.height = opt.height;
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value)) {
      callback(t('sys.printDesigner.validateKeyErrorMsg'));
    }
    callback();
  };

  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.title.includes(input);
    }
    return false;
  };
</script>
<style lang="less" scoped>
  .import-label {
    padding-bottom: 65px;
  }

  :deep(.ant-steps) {
    .ant-steps-icon {
      font-weight: 600;
    }

    .ant-steps-item-title {
      color: #8f8f8f !important;
    }

    .ant-steps-item-active {
      .ant-steps-item-title {
        color: #212528 !important;
        font-weight: 500;
      }
    }

    .ant-steps-item-finish {
      .ant-steps-item-title {
        color: #474747 !important;
      }
    }
  }

  :deep(.ant-upload.ant-upload-drag) {
    border-color: #e8ebf0;
    // height: auto;
    background-color: #f7f8fa;
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0 !important;
  }

  :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
    padding-bottom: 20px;
    padding-left: 0;
    font-weight: 500;
  }

  :deep(.ant-form-item-with-help .ant-form-item-explain) {
    height: 0;
    min-height: unset;
  }

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

  .info-area {
    background-color: rgba(from var(--ant-primary-color) r g b / 12%);
    color: #666;

    .info-icon {
      color: var(--ant-primary-color);
      font-size: 16px;
      vertical-align: middle;
    }
  }

  .btn-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    border-top: 1px solid #e0e3ea;
    background-color: #fff;

    .ant-btn {
      & + .ant-btn {
        margin-left: 16px;
      }
    }
  }

  .progress-box {
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 4px;
    }
  }

  .progress-item {
    display: flex;
    justify-content: flex-start;

    .svg-icon {
      width: 32px;
      height: 32px;
    }

    &__box {
      display: flex;
      flex-direction: column;
      align-self: center;
      width: calc(100% - 72px);
      line-height: 22px;

      :deep(.ant-progress) {
        line-height: 0.4;

        .ant-progress-text {
          position: absolute;
          top: -22px;
          right: 0;
          color: #797a7d;
          line-height: 22px;

          &:has(.error) {
            right: 56px;
          }
        }
      }

      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;

        .ant-progress-inner {
          background: #e6e9ef;
        }
      }
    }

    &__name {
      display: flex;
      width: 400px;

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      .size {
        margin-left: 16px;
        color: #c3c3c3;
      }
    }

    .icon {
      align-self: center;
      margin-left: 24px;
      color: #212528;
      font-size: 16px;
      justify-items: flex-end;
    }
  }

  :deep(.component) {
    display: none;
  }

  .progress-error-info {
    display: inline-block;
    max-width: 84px;
    overflow: hidden;
    color: #f54547;
    text-overflow: ellipsis;
  }
</style>
