<template>
  <div :class="ns.b()" v-if="current === 0">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
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
              :disabled="disabledFields.includes('categoryId')"
              v-model:value="formData.categoryId"
              :module="CategoryModuleEnum.ONLINE_FORM"
            />
          </a-form-item>

          <a-form-item
            v-if="isTargetDomain"
            :label="t('sys.webRender.officeType')"
            name="officeType"
            :rules="[
              {
                required: true,
                message: t('sys.chooseTextTip', {
                  name: t('sys.webRender.officeType'),
                }),
              },
            ]"
          >
            <a-radio-group
              :disabled="disabledFields.includes('officeType')"
              v-model:value="formData.officeType"
              :options="officeTypeOptions"
              @change="handleFormTypeChange"
            />
          </a-form-item>

          <a-form-item
            v-if="isExcel"
            :label="t('sys.mode')"
            name="edition"
            :rules="[{ required: true }]"
          >
            <a-select
              :disabled="disabledFields.includes('edition')"
              v-model:value="formData.edition"
              :placeholder="t('sys.chooseText')"
              :options="editionOptions"
              showSearch
              optionFilterProp="label"
              @change="handleFormEditionChange"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.name')"
            name="name"
            :rules="[
              {
                required: true,
                validator: validateVersion,
              },
            ]"
          >
            <div class="ks-row">
              <a-input-group compact class="ks-col">
                <a-form-item style="width: calc(100% - 120px)" name="name">
                  <a-input
                    v-model:value="formData.name"
                    :disabled="disabledFields.includes('name')"
                    style="height: 32px"
                    @change="onChange"
                    :placeholder="t('sys.inputText')"
                    :maxlength="64"
                  />
                </a-form-item>
                <a-form-item name="version" style="width: 120px">
                  <a-input
                    :placeholder="t('sys.appDesigner.version')"
                    @change="onChange"
                    v-model:value="formData.version"
                    style="height: 32px"
                    :maxlength="20"
                  />
                </a-form-item>
              </a-input-group>
              <div class="checkbox-wrap">
                <a-checkbox v-model:checked="defaultValue" />
                <span class="ml6px">{{ t('sys.default') }}</span>
              </div>
            </div>
          </a-form-item>

          <a-form-item
            :label="t('sys.type')"
            name="formType"
            :rules="[
              {
                required: true,
                message: t('sys.chooseTextTip', {
                  name: t('sys.type'),
                }),
              },
            ]"
          >
            <a-radio-group
              :disabled="disabledFields.includes('formType')"
              v-model:value="formData.formType"
              :options="formTypeOptions"
              @change="handleFormTypeChange"
            />
          </a-form-item>

          <template v-if="isViewForm">
            <a-form-item
              :label="t('sys.model.viewType')"
              name="viewType"
              :rules="[{ required: true }]"
              :wrapper-col="{ span: 18 }"
            >
              <a-radio-group
                :disabled="disabledFields.includes('viewType')"
                v-model:value="formData.viewType"
                :options="viewTypeOption"
                @change="handleViewTypeChange"
              />
            </a-form-item>

            <a-form-item
              v-if="formData.viewType === ViewTypeEnum.VIEW_MODEL"
              :label="t('sys.model.viewModel')"
              name="modelKey"
              :rules="[{ required: true }]"
            >
              <a-select
                :disabled="disabledFields.includes('modelKey')"
                v-model:value="formData.modelKey"
                show-search
                :placeholder="t('sys.chooseText')"
                optionFilterProp="fieldName"
                @change="handleViewModelKeyChange"
              >
                <a-select-opt-group v-for="(models, modelType) in modelList" :key="modelType">
                  <template #label>
                    <span>
                      {{ modelType }}
                    </span>
                  </template>
                  <a-select-option
                    v-for="model in models"
                    :key="model.key"
                    :value="model.key"
                    :fieldName="model.name"
                  >
                    {{ model.name }}
                  </a-select-option>
                </a-select-opt-group>
              </a-select>
            </a-form-item>

            <template v-if="formData.viewType === ViewTypeEnum.VIEW_SQL">
              <a-form-item
                :label="t('sys.integration.dataSource')"
                name="dsKey"
                :rules="[{ required: true }]"
              >
                <a-select
                  :disabled="disabledFields.includes('dsKey')"
                  v-model:value="formData.dsKey"
                  allow-clear
                  showSearch
                  optionFilterProp="fieldName"
                  :placeholder="t('sys.chooseText')"
                  @change="handleDataSourceChange"
                >
                  <a-select-option
                    v-for="item in DataSourceEnvOptions"
                    :key="item.key"
                    :value="item.key"
                    :fieldName="item.name"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </a-form-item>

              <a-form-item :label="t('sys.component.dataConnection.labelDb')" name="dsName">
                <span>{{ dataSourceEnv?.type || '-' }}</span>
              </a-form-item>
              <a-form-item
                :label="t('sys.component.dataConnection.labelSQL')"
                name="script"
                :rules="[{ required: true }]"
              >
                <a-textarea
                  :disabled="disabledFields.includes('script')"
                  v-model:value="formData.script"
                  :rows="3"
                  :placeholder="t('sys.inputText')"
                />
              </a-form-item>
            </template>

            <template v-if="formData.viewType === ViewTypeEnum.VIEW_JS">
              <a-form-item :label="t('sys.script')" name="bindKey" :rules="[{ required: true }]">
                <a-select
                  v-model:value="formData.bindKey"
                  :disabled="disabledFields.includes('bindKey')"
                  :options="jsOptions"
                  showSearch
                  optionFilterProp="label"
                  :placeholder="t('sys.chooseText')"
                />
              </a-form-item>
            </template>
          </template>

          <a-form-item
            :label="t('sys.model.modelKey')"
            name="modelKey"
            :rules="[{ required: true, validator: validateSpecialCharacters }]"
          >
            <a-input
              v-model:value="modelKeyValue"
              :disabled="
                (isViewForm && formData.viewType === ViewTypeEnum.VIEW_MODEL) ||
                disabledFields.includes('modelKey')
              "
              :addon-before="modelKeyAttrs.keyPrefix"
              :addon-after="modelKeyAttrs.keySuffix"
              :placeholder="t('sys.inputText')"
              show-count
              :maxlength="32"
              @change="handleInputChange"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.code')"
            name="code"
            :rules="[{ validator: validateCode }]"
          >
            <a-input
              v-model:value="formData.code"
              :disabled="disabledFields.includes('code')"
              :placeholder="t('sys.inputText')"
              :show-count="true"
              :maxlength="64"
            />
          </a-form-item>
          <a-form-item :label="t('sys.edhr.offlineVersion')" name="offlineVersion">
            <a-input
              v-model:value="formData.offlineVersion"
              :disabled="disabledFields.includes('offlineVersion')"
              :placeholder="t('sys.inputText')"
              :show-count="true"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            v-if="updateRemarkVisible"
            :label="t('sys.edhr.updateRemark')"
            name="updateRemark"
          >
            <a-textarea
              v-model:value="formData.updateRemark"
              :disabled="disabledFields.includes('updateRemark')"
              show-count
              :rows="3"
              :maxlength="120"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <template v-if="!isFileForm">
            <a-form-item
              :label="t('sys.appDesigner.printDesign.form.paperSize')"
              name="paperSize"
              :rules="[{ required: true }]"
            >
              <a-select
                :disabled="disabledFields.includes('paperSize')"
                v-model:value="formData.paperSize"
                showSearch
                optionFilterProp="fieldName"
                @change="handlePaperSizeChange"
              >
                <a-select-option
                  v-for="item in PageSizeEnum"
                  :key="item"
                  :value="item"
                  :fieldName="item"
                  >{{ PaperSizeMap[item].label }}</a-select-option
                >
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
                      :label-col="{ span: 6 }"
                      :wrapper-col="{ span: 18 }"
                      label-align="left"
                    >
                      <a-input-number
                        :disabled="
                          disabledFields.includes('width') ||
                          formData.paperSize !== PageSizeEnum.CUSTOM
                        "
                        v-model:value="formData.width"
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
                      :label-col="{ span: 6 }"
                      :wrapper-col="{ span: 18 }"
                      label-align="left"
                    >
                      <a-input-number
                        :min="0"
                        :disabled="
                          disabledFields.includes('height') ||
                          formData.paperSize !== PageSizeEnum.CUSTOM
                        "
                        v-model:value="formData.height"
                        :step="1"
                        :precision="0"
                        addon-after="mm"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-col>
            </a-row>

            <a-form-item
              :label="t('sys.appDesigner.printDesign.form.paperDirection')"
              name="direction"
            >
              <PaperDirectionRadio
                :disabled="disabledFields.includes('direction')"
                v-model:value="formData.direction"
              />
            </a-form-item>
          </template>
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea
              v-model:value="formData.description"
              show-count
              :rows="5"
              :maxlength="120"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
  <div class="py-12px px-24px" v-if="current === 1">
    <view-field-list ref="sqlFieldRef" :dsKey="formData.dsKey" :script="formData.script" />
  </div>
  <div class="p16px text-right selected-row-modal__footer">
    <a-button class="mr16px" @click="handleClose">{{ t('sys.cancel') }}</a-button>
    <a-button class="mr16px" type="primary" @click="handleOk(false)">{{
      isViewSql && current === 0 ? t('sys.editor.next') : t('sys.ok2')
    }}</a-button>
    <a-button
      type="primary"
      v-if="showOk2Open && !(isViewSql && current === 0)"
      @click="handleOk(true)"
      >{{ $t('sys.onlineForm.confirmAndDesign') }}</a-button
    >
  </div>
</template>

<script setup lang="ts" name="form-modal">
  import { computed, reactive, ref, onBeforeMount, toRaw } from 'vue';
  import type { FormInstance, SelectProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import ViewFieldList from './view-field-list.vue';
  import { useModal, useNamespace, IModal } from '@gct/runtime';
  import { merge, pickBy, cloneDeep, groupBy } from 'lodash-es';
  import { CategoryModuleEnum, ControlAction, FormVersionAction } from '../constant';
  import { useUUid } from '/@/hooks/web/useUUid';
  import { PaperSizeMap } from '/@online-form/views/designer/enums';
  import {
    Orientation,
    PageSizeEnum,
    FormTypeEnum,
    ViewTypeEnum,
    OfficeTypeEnum,
  } from '@gct/nocode-base';
  import { FormEditionEnum, getBaseButtonConfig } from '/@app-designer/views/online-form/constants';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategorySelect } from '../category';
  import {
    OnlineFormTmplRequest,
    ModelBriefInfo,
    CategoryCompleteResponse,
  } from '/@/apis/gct-apaas/model';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getDataSourceList } from '/@/apis/gct-platform/DataSourceController';

  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { PaperDirectionRadio } from '../components';
  import type { DataSourceMainResponse } from '/@/apis/gct-platform/model';

  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');
  const isInMedpro = computed(() => appInfoStore.appInfo.suiteKey === 'MEDPRO');

  // 检查域名是否为 paas.cloud.gct-china.com
  const isTargetDomain = computed(() => {
    // if (typeof window !== 'undefined') {
    //   return window.location.hostname === 'paas.cloud.gct-china.com';
    // }
    // return false;
    return true;
  });

  const validateCode = (_, value, callback) => {
    // 格式校验
    const formatRegex = /^[a-zA-Z0-9_\\.-/]+$/;
    if (value && !formatRegex.test(value)) {
      callback(t('sys.edhr.codeFormat2'));
    }

    if (value && value.length > 64) {
      callback(t('sys.onlineForm.codeLengthValidateTip'));
    }
    callback();
  };

  const { t } = useI18n();

  const { getUuid } = useUUid([], '', { chars: 'lowercase&number' });

  const {
    keyPrefix: fmKeyPrefix,
    keySuffix: fmKeySuffix,
    keyPad: fmKeyPad,
    keyClip: fmKeyClip,
  } = useKeyParser('fm', '');

  const {
    keyPrefix: fvmKeyPrefix,
    keySuffix: fvmKeySuffix,
    keyPad: fvmKeyPad,
    keyClip: fvmKeyClip,
  } = useKeyParser('fvm', '');

  const {
    keyPrefix: vmKeyPrefix,
    keySuffix: vmKeySuffix,
    keyPad: vmKeyPad,
    keyClip: vmKeyClip,
  } = useKeyParser('vm');

  const viewTypeOption = [
    { label: t('sys.component.dataConnection.SQL2View'), value: ViewTypeEnum.VIEW_SQL },
  ];
  if (!isInMedpro.value && !isInEDHR.value) {
    viewTypeOption.push({
      label: t('sys.model.sqlView'),
      value: ViewTypeEnum.VIEW,
      disabled: true,
    });
  }
  if (!isInEDHR.value) {
    viewTypeOption.unshift({
      label: t('sys.model.viewModel'),
      value: ViewTypeEnum.VIEW_MODEL,
    });
    viewTypeOption.push({ label: t('sys.model.jsView'), value: ViewTypeEnum.VIEW_JS });
  }

  const officeTypeOptions = [
    {
      label: t('sys.webRender.officeExcel'),
      value: OfficeTypeEnum.EXCEL,
    },
    {
      label: t('sys.webRender.officeWord'),
      value: OfficeTypeEnum.WORD,
    },
  ];

  const ns = useNamespace('form-modal');

  const props = withDefaults(
    defineProps<{
      modal: IModal;
      data?: IData;
      showFieldConfig?: boolean;
      disabledFields?: Array<keyof OnlineFormTmplRequest>;
      /** 允许表单类型转换 */
      allowFormTypeChange?: boolean;
      /** 是否显示确认并打开按钮 */
      showOk2Open?: boolean;
      formAction?: FormVersionAction | ControlAction;
      shouldClose?: (data, isOk2Open?: boolean) => Promise<boolean>;
    }>(),
    {
      data: () => ({}),
      disabledFields: () => [],
      allowFormTypeChange: false,
      showFieldConfig: true,
      showOk2Open: false,
    },
  );

  const formData = reactive(
    merge(
      {
        id: undefined,
        categoryId: '',
        default: 0,
        description: '',
        direction: Orientation.Portrait,
        height: PaperSizeMap[PageSizeEnum.A4].size[1],
        modelKey: '',
        name: '',
        code: '',
        paperSize: PageSizeEnum.A4,
        version: '',
        width: PaperSizeMap[PageSizeEnum.A4].size[0],
        edition: FormEditionEnum.PROFESSIONAL,
        officeType: OfficeTypeEnum.EXCEL,
        formType: FormTypeEnum.BASE,
        viewType: undefined, // 视图类型
        dsKey: undefined, // 数据源key
        script: undefined, // SQL脚本
        fieldConfig: undefined, // 字段列表信息
        bindKey: undefined, // js脚本
        operation: JSON.stringify(cloneDeep(getBaseButtonConfig(appInfoStore.appInfo.suiteKey))),
      },
      props.data || {},
    ),
  );

  const formTypeOptions = computed(() => {
    const disabledAll =
      props.allowFormTypeChange &&
      ![FormTypeEnum.BASE, FormTypeEnum.PROCESS].includes(formData.formType);
    return Object.values(FormTypeEnum)
      .filter((item) => {
        if (formData.edition === FormEditionEnum.PROFESSIONAL) {
          if (isInEDHR.value) {
            return (
              item !== FormTypeEnum.TEXT && item !== FormTypeEnum.FILE && item !== FormTypeEnum.VIEW
            );
          }
          return item !== FormTypeEnum.TEXT && item !== FormTypeEnum.FILE;
        } else {
          return item !== FormTypeEnum.VIEW;
        }
      })
      .map((item) => ({
        label: $t(`sys.onlineForm.formTypeEnum.${item}`),
        value: item,
        disabled:
          disabledAll ||
          (props.allowFormTypeChange && ![FormTypeEnum.BASE, FormTypeEnum.PROCESS].includes(item)),
      }));
  });

  const sqlFieldRef = ref();

  const current = ref<number>(0);

  const cacheModelKeys = reactive({
    fmKey: props.data.modelKey,
    fvmKey: 'fvm_' + getUuid(),
    vmKey: '',
  });

  const modelList = ref<{
    [key: string]: ModelBriefInfo[];
  }>({});

  const DataSourceEnvOptions = ref<DataSourceMainResponse[]>([]);

  const jsOptions = ref<SelectProps['options']>([]);

  onBeforeMount(() => {
    //获取实体类型
    getModelComprehensiveModelSummary({
      type: 'NDO,BASE,TREE,TRANSACTION',
      category: 'view',
    }).then((res) => {
      if (res) {
        modelList.value = groupBy(res, 'group');
      }
    });

    getDataSourceList().then((res) => {
      if (res) {
        DataSourceEnvOptions.value = res.filter(
          (item) => item.detailList && item.detailList[0].enabled === 1,
        );
      }
    });

    getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT }).then((res) => {
      console.log('res', res);
      if (res) {
        jsOptions.value = formatData(res);
      }
    });
  });

  /** 是否是视图表单 */
  const isViewForm = computed(() => {
    return formData.formType === FormTypeEnum.VIEW;
  });

  /** 是否是文件表单 */
  const isFileForm = computed(() => {
    return formData.formType === FormTypeEnum.FILE;
  });

  /** 是否是SQL视图 */
  const isViewSql = computed(() => {
    return (
      isViewForm.value &&
      formData.viewType === ViewTypeEnum.VIEW_SQL &&
      props.showFieldConfig &&
      !formData.id
    );
  });

  /** 是否是类 excel */
  const isExcel = computed(() => {
    return formData.officeType === OfficeTypeEnum.EXCEL;
  });

  /** 模型key属性 */
  const modelKeyAttrs = computed(() => {
    if (isViewForm.value && formData.viewType === ViewTypeEnum.VIEW_SQL) {
      return {
        keyPrefix: fvmKeyPrefix.value,
        keySuffix: fvmKeySuffix.value,
        keyPad: fvmKeyPad,
        keyClip: fvmKeyClip,
      };
    }

    if (isViewForm.value && formData.viewType === ViewTypeEnum.VIEW_MODEL) {
      return {
        keyPrefix: vmKeyPrefix.value,
        keySuffix: vmKeySuffix.value,
        keyPad: vmKeyPad,
        keyClip: vmKeyClip,
      };
    }

    return {
      keyPrefix: fmKeyPrefix.value,
      keySuffix: fmKeySuffix.value,
      keyPad: fmKeyPad,
      keyClip: fmKeyClip,
    };
  });

  /** 升级备注是否显示 */
  const updateRemarkVisible = computed(() => {
    return (
      props.formAction === FormVersionAction.CREATE_VERSION ||
      props.formAction === FormVersionAction.COPY_VERSION ||
      props.formAction === FormVersionAction.EDIT_VERSION
    );
  });

  /** 默认复选框的值（boolean） */
  const defaultValue = computed({
    get() {
      return formData.default === 1;
    },
    set(v) {
      formData.default = v ? 1 : 0;
    },
  });

  /** 模型key的值裁剪了前后缀 */
  const modelKeyValue = computed({
    get() {
      return formData?.modelKey ? modelKeyAttrs.value.keyClip(formData?.modelKey) : '';
    },
    set(v) {
      formData.modelKey = modelKeyAttrs.value.keyPad(v)!;
    },
  });

  const dataSourceEnv = computed(() => {
    if (isViewForm.value && formData.viewType === ViewTypeEnum.VIEW_SQL) {
      return DataSourceEnvOptions.value.find((item) => item.key === formData.dsKey);
    }
    return undefined;
  });

  const handlePaperSizeChange = (size: PageSizeEnum) => {
    const value = PaperSizeMap[size].size;
    if (value) {
      formData.width = value[0];
      formData.height = value[1];
    } else {
      Object.assign(formData, { width: undefined, height: undefined });
    }
    formRef.value?.clearValidate('width');
    formRef.value?.clearValidate('height');
  };

  const validateVersion = async (_rule, _value) => {
    const { name, version } = formData;

    if (!version && !name) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterNameVersionNumber'));
    } else if (!name) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterName'));
    } else if (!version) {
      return Promise.reject($t('sys.onlineForm.pleaseEnterVersionNumber'));
      // } else if (!/\d+/.test(value[0]) || !/\d+/.test(value[1])) {
      //   return Promise.reject('请输入正确的版本号');
    } else if (version.length > 20) {
      return Promise.reject($t('sys.onlineForm.fieldVersionValidateTip'));
    } else if (name.length > 64) {
      return Promise.reject($t('sys.onlineForm.fieldNameValidateTip'));
    } else {
      return Promise.resolve();
    }
  };

  const validateSpecialCharacters = (_, value, callback) => {
    if (!value) {
      callback(t('sys.inputTextTip', { name: t('sys.model.modelKey') }));
    }
    const reg = /^[a-z0-9_]+$/;
    if (!reg.test(value) && !(isViewForm.value && formData.viewType === ViewTypeEnum.VIEW_MODEL)) {
      callback(t('sys.model.modelKeyFormat'));
    }
    callback();
  };

  function handleInputChange() {
    if (formData.formType === FormTypeEnum.VIEW) {
      cacheModelKeys.fvmKey = 'fvm_' + modelKeyValue.value;
    } else {
      cacheModelKeys.fmKey = 'fm_' + modelKeyValue.value;
    }
  }

  function handleViewModelKeyChange(value) {
    cacheModelKeys.vmKey = value;
  }

  /** 表单类型切换 */
  function handleFormTypeChange(event) {
    const { value } = event.target ?? {};

    if (value === FormTypeEnum.VIEW) {
      if (!formData.viewType) {
        const firstValue =
          viewTypeOption.find((i) => i.disabled !== true)?.value || ViewTypeEnum.VIEW_MODEL;
        Object.assign(formData, { viewType: firstValue });
      }

      if (formData.viewType === ViewTypeEnum.VIEW_MODEL) {
        formData.modelKey = cacheModelKeys.vmKey;
      } else if (formData.viewType === ViewTypeEnum.VIEW_SQL) {
        formData.modelKey = cacheModelKeys.fvmKey;
      } else if (formData.viewType === ViewTypeEnum.VIEW_JS) {
        formData.modelKey = cacheModelKeys.fmKey;
      }
    } else {
      formData.modelKey = cacheModelKeys.fmKey;
    }
  }

  /** 视图类型切换 */
  function handleViewTypeChange(event) {
    const { value } = event.target ?? {};

    if (value === ViewTypeEnum.VIEW_MODEL) {
      formData.modelKey = cacheModelKeys.vmKey;
    } else if (value === ViewTypeEnum.VIEW_SQL) {
      formData.modelKey = cacheModelKeys.fvmKey;
    } else if (value === ViewTypeEnum.VIEW_JS) {
      formData.modelKey = cacheModelKeys.fmKey;
    }
  }

  /** 数据源切换 */
  function handleDataSourceChange() {
    formData.script = undefined;
  }

  const onChange = () => {
    formRef.value?.validateFields('name');
  };

  const formatData = (data: CategoryCompleteResponse[]) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          id: folder.id,
          name: folder.name,
          label: folder.name,
          options: [],
        };
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              id: i.id,
              label: i.name,
              value: i.key,
            };
            item.options.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  const formRef = ref<FormInstance>();
  const activeKey = ref(['1', '2']);

  useModal(async (isOk2Open) => {
    if (formRef.value) {
      await formRef.value!.validate();
    }
    const editedData = formData.id
      ? pickBy(formData, (v, k) => v !== undefined && k !== 'modelKey')
      : pickBy(formData, (v) => v !== undefined);
    let isClose = true;
    if (props.shouldClose) {
      isClose = await props.shouldClose(editedData, isOk2Open);
    }
    return {
      ok: isClose,
      data: [editedData],
    };
  });

  function handleClose() {
    props.modal.dismiss();
  }

  async function handleOk(isOk2Open = false) {
    if (isViewSql.value && current.value === 0) {
      await formRef.value!.validate();
      current.value++;
      return;
    }

    try {
      if (isViewSql.value && current.value === 1) {
        await sqlFieldRef.value.currentRef.validate();
        formData.fieldConfig = sqlFieldRef.value.getValue().map((item) => {
          return {
            ...toRaw(item),
            enabled: Number(item.enabled),
          };
        });
      }

      if (props.modal && typeof props.modal.ok === 'function') {
        const result = await props.modal.ok(isOk2Open);
        if (result && result.ok) {
          props.modal.dismiss(result!);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const editionOptions = Object.values(FormEditionEnum).map((item) => ({
    label: $t(`sys.onlineForm.formEditionEnum.${item}`),
    value: item,
  }));

  const handleFormEditionChange = () => {
    // 切换模式时，置空不符合要求的表单类型
    if (
      formData.edition === FormEditionEnum.PROFESSIONAL
        ? formData.formType === FormTypeEnum.TEXT || formData.formType === FormTypeEnum.FILE
        : formData.formType === FormTypeEnum.VIEW
    ) {
      formData.formType = FormTypeEnum.BASE;
    }
  };
</script>

<style lang="less">
  .online-form-custom-modal {
    .ant-modal.gct-modal:not(.is-full-screen) {
      min-width: 640px;
      max-width: 1120px;

      .ant-modal-body {
        margin-bottom: 64px;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @include b(form-modal) {
    padding-top: 12px;
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

  .checkbox-wrap {
    height: 32px;
    margin-left: 8px;
    color: #3d3d3e;
    line-height: 32px;
  }

  .selected-row-modal__footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e0e3ea;
    background: #fff;
  }
</style>
