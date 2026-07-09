<template>
  <a-form
    ref="formRef"
    class="form-wrapper"
    :model="formState"
    autocomplete="off"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 15 }"
  >
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
        <i18n-select-input-form
          :formRef="formRef"
          formItemName="title"
          :fromItemExtraProps="{
            label: t('sys.pageDesigner.buttonName'),
            rules: [
              {
                required: true,
                validator: validateBtnLabel,
                message: t('sys.pageDesigner.buttonName') + t('sys.pageDesigner.cannotBeEmpty'),
              },
            ],
          }"
          :inputExtraProps="{
            placeholder: `${t('sys.inputText')}`,
            maxlength: 32,
            showCount: true,
          }"
          v-model:text="formState.title"
          v-model:i18nConfig="formState.i18nConfig"
        />
        <a-form-item :label="t('sys.pageDesigner.buttonType')">
          <buttonTypeSelect
            v-model:has-icon="formState.hasIcon"
            v-model:has-text="formState.hasText"
            v-model:type="formState.type"
            v-model:danger="formState.danger"
            @change="handleChange"
          />
        </a-form-item>
        <a-form-item v-show="formState.hasIcon" :label="t('sys.pageDesigner.buttonIcon')">
          <IconNextPicker
            v-model:value="formState.icon"
            :size="28"
            :background="'#f5f5f5'"
            :style="{
              '--box-size': '50px',
            }"
          />
        </a-form-item>
        <a-form-item :label="t('sys.pageDesigner.customBtnColor')">
          <a-switch v-model:checked="formState.enableCustomColor" @change="handleChange" />
        </a-form-item>
        <a-form-item
          v-show="formState.enableCustomColor"
          :label="t('sys.pageDesigner.buttonNameColor')"
        >
          <g-color-picker
            :preset="presetColor"
            v-model:color="formState.fontColor"
            @update:color="handleUpdateColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '22px',
                  height: '22px',
                  backgroundColor: formState.fontColor,
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </g-color-picker>
        </a-form-item>
        <a-form-item
          v-show="formState.enableCustomColor && formState.type !== 'link'"
          :label="t('sys.pageDesigner.buttonStyleColor')"
        >
          <g-color-picker
            :preset="presetColor"
            v-model:color="formState.backgroundColor"
            @update:color="handleUpdateBgColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '22px',
                  height: '22px',
                  backgroundColor: formState.backgroundColor,
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </g-color-picker>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="2" :header="t('sys.model.displayLocation')">
        <a-form-item>
          <div class="pos-mode">
            <div class="pos-mode-info">选择按钮出现在表格上的位置</div>
            <div class="pos-mode-icon">
              <template v-for="(item, i) in posOptions" :key="i">
                <img
                  :class="{
                    'pos-mode-icon__item': true,
                    'is-active': formState.pos === item.value,
                  }"
                  :src="item.icon"
                />
              </template>
            </div>
            <a-radio-group
              @change="changePos"
              class="specific-location"
              v-model:value="formState.pos"
              :options="posOptions"
            />
          </div>
        </a-form-item>
        <a-form-item
          v-if="
            formState.pos === 0 &&
            (modeldata.modelType === 'RDO' || modeldata.modelType === 'WORKFLOW')
          "
          :label="t('sys.pageDesigner.specificLocation')"
        >
          <a-radio-group
            v-model:value="formState.versionMode"
            :options="[
              { label: t('sys.pageDesigner.parentVersion'), value: 0 },
              { label: t('sys.pageDesigner.childVersion'), value: 1 },
            ]"
          />
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="3" :header="t('sys.model.configOpt')">
        <a-form-item
          v-if="eventType === 1"
          :label="t('sys.pageDesigner.buttonEvent')"
          name="sysMethedType"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.sysMethed') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-input-group compact>
            <a-select
              v-model:value="eventType"
              style="width: 40%"
              @change="handleMethodTypeChange"
              :getPopupContainer="(element) => element.parentNode"
            >
              <a-select-option :value="1">
                {{ t('sys.pageDesigner.sysMethed') }}
              </a-select-option>
              <a-select-option :value="0">
                {{ t('sys.pageDesigner.selfMethed') }}
              </a-select-option>
            </a-select>
            <a-select
              :getPopupContainer="(element) => element.parentNode"
              @change="changeMethed"
              v-model:value="formState.sysMethedType"
              style="width: 60%"
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option
                :name="t(`sys.pageDesigner.${i}Text`)"
                :value="i"
                v-for="i in sysMethedOptions"
                :key="i"
                >{{ t(`sys.pageDesigner.${i}Text`) }}</a-select-option
              >
            </a-select>
          </a-input-group>
        </a-form-item>
        <a-form-item
          v-else
          :label="t('sys.pageDesigner.buttonEvent')"
          name="eventName"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.pleaseBindEvent'),
            },
            // {
            //   pattern: /^[a-zA-Z_]+$/,
            //   message: t('sys.pageDesigner.eventNameRuels'),
            // },
          ]"
        >
          <a-input-group compact>
            <a-select
              v-model:value="eventType"
              style="width: 40%"
              @change="handleMethodTypeChange"
              :getPopupContainer="(element) => element.parentNode"
            >
              <a-select-option :value="1">
                {{ t('sys.pageDesigner.sysMethed') }}
              </a-select-option>
              <a-select-option :value="0">
                {{ t('sys.pageDesigner.selfMethed') }}
              </a-select-option>
            </a-select>
            <a-input
              v-model:value="formState.eventName"
              :placeholder="t('sys.pageDesigner.pleaseBindEvent')"
              style="width: 60%; cursor: pointer"
              readonly
              @click="onEventNameClick"
            />
          </a-input-group>
        </a-form-item>
        <a-form-item
          v-if="formState.sysMethedType === operateSysEnums.EXPORT && formState.innerEvent"
          :label="t('sys.pageDesigner.exportTemplate')"
          name="templateKey"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.exportTemplate') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-select
            v-model:value="formState.templateKey"
            :placeholder="t('sys.chooseText')"
            :getPopupContainer="(element) => element.parentNode"
          >
            <a-select-option
              v-for="(modal, index) in templateKeyOptions"
              :key="index"
              :value="modal.value"
              >{{ modal.label }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="formState.sysMethedType === operateSysEnums.IMPORT && formState.innerEvent"
          :label="t('sys.pageDesigner.importTemplate')"
          name="templateKey"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.importTemplate') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-select
            v-model:value="formState.templateKey"
            :placeholder="t('sys.chooseText')"
            :getPopupContainer="(element) => element.parentNode"
          >
            <a-select-option
              v-for="(modal, index) in templateKeyOptions"
              :key="index"
              :value="modal.value"
              >{{ modal.label }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="
            [operateSysEnums.IMPORT, operateSysEnums.EXPORT].includes(formState.sysMethedType) &&
            formState.innerEvent
          "
          :label="t('sys.pageDesigner.timeout')"
          name="timeout"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.timeout') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-input-number v-model:value="formState.timeout" :min="1" addonAfter="S" />
        </a-form-item>
        <a-form-item
          v-if="showModal"
          :label="t('sys.pageDesigner.modalBox')"
          name="refModal"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.pleaseSelectTheModalBox'),
            },
          ]"
        >
          <a-select
            :getPopupContainer="(element) => element.parentNode"
            v-model:value="formState.refModal"
            :placeholder="t('sys.pageDesigner.pleaseSelectTheModalBox')"
          >
            <a-select-option
              v-for="(modal, index) in pageJson.modals"
              :key="index"
              :value="modal.id"
              >{{ `${t(modal.modalName)}[${modal.id}] ` }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="showModal"
          :label="t('sys.pageDesigner.assignPage')"
          name="refForm"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.assignPage') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-select
            :getPopupContainer="(element) => element.parentNode"
            v-model:value="formState.refForm"
            :placeholder="t('sys.pageDesigner.pleaseSelectAForm')"
          >
            <a-select-option v-for="(modal, index) in modalsForms" :key="index" :value="modal.id">{{
              `${t(modal.name)}[${modal.id}] `
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="showLinkForm"
          :label="t('sys.pageDesigner.assignPage')"
          name="refForm"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.assignPage') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-select
            :getPopupContainer="(element) => element.parentNode"
            v-model:value="formState.refForm"
            show-search
            :placeholder="t('sys.chooseText')"
            @change="handleChange"
          >
            <a-select-option
              :key="widget.id"
              v-for="widget in excludeSubTableFormWidget"
              :value="widget.id"
              :name="`${widget.alias || t(widget.name)} ${widget.id}`"
              >{{ `${widget.alias || t(widget.name)} ${widget.id}` }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="
            [operateSysEnums.COPY, operateSysEnums.VERSION_COPY].includes(
              formState.sysMethedType,
            ) && formState.innerEvent
          "
          :label="t('sys.pageDesigner.replicationConfiguration')"
        >
          <a-button type="link" @click="selectCopyField">{{
            formState.excludeField?.length
              ? $t('sys.pageDesigner.editModelFields')
              : $t('sys.pageDesigner.selectModelFields')
          }}</a-button>
        </a-form-item>
        <a-form-item
          v-if="showlinkPage"
          :label="t('sys.pageDesigner.linkPage')"
          name="linkPage"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.linkPage') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-tree-select
            v-model:value="formState.linkPage"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="t('sys.chooseText')"
            :dropdownMatchSelectWidth="false"
            dropdown-class-name="gct-custom-select-dropdown"
            allow-clear
            tree-default-expand-all
            :tree-data="pageTrees"
            tree-node-filter-prop="label"
          />
        </a-form-item>
        <LabelRdoEditor
          v-if="formState.sysMethedType === operateSysEnums.LABEL_PRINT"
          :label="t('sys.pageDesigner.labelTemplateRef')"
          v-model:before-value="formState.labelMode"
          v-model:after-value="formState.printKey"
          :before-option="modeOptions"
          :after-option="labelOptions"
          :modelKey="model"
          :moduleType="PrintTypeEnum.LABEL"
        >
          <SelectEditor
            style="margin-top: 20px"
            v-if="formState.printKey === TransactionMode.CURRENT"
            v-model:value="formState.printField"
            :options="labelFieldOptions"
            placeholder="sys.pageDesigner.pleaseSelectLabelTemplateFieldCurrentModel"
          />
          <ReferenceRelationship2Editor
            class="pt20px"
            v-if="formState.printKey === TransactionMode.REFERENCE"
            :model="props.model"
            v-model:ruleConfig="formState.ruleConfig"
            modalTitle="sys.pageDesigner.configReferenceRelationship"
            contentTitle="sys.pageDesigner.createReferenceDiagram"
            endPlaceholder="sys.pageDesigner.pleaseSelectLabelTemplateFields"
            :endFieldTypes="[FIELD_TYPE.LABEL_TEMPLATE_REF]"
          />
        </LabelRdoEditor>
        <a-form-item
          v-if="formState.sysMethedType === operateSysEnums.LABEL_PRINT"
          :label="t('sys.pageDesigner.printMode')"
        >
          <a-radio-group
            v-model:value="printMode"
            :options="[
              {
                label: t('sys.pageDesigner.localPrint'),
                value: PrintModeEnums.Local,
              },
              {
                label: t('sys.pageDesigner.servicePrint'),
                value: PrintModeEnums.Server,
              },
            ]"
          />
        </a-form-item>
        <linkageEditor
          v-if="
            formState.sysMethedType === operateSysEnums.LABEL_PRINT &&
            printMode === PrintModeEnums.Server
          "
          :label="t('sys.pageDesigner.printer')"
          v-model:before-value="formState.printType"
          v-model:after-value="formState.printRefType"
          :before-option="modeOptions"
          :after-option="printOptions"
          :isTreeSelect="(data) => data[0] === KeyMode.SYSTEM"
          :slots="{
            title: (_) => {
              return !Object.prototype.hasOwnProperty.call(_, 'selected')
                ? _.dftPrintInfo?.label || _.label
                : _.defaultPrint === '是'
                  ? h('div', { class: 'ks-row', style: { maxWidth: '180px' } }, [
                      h('div', { class: 'gct-text-overflow', title: _.name }, _.name),
                      h(
                        'div',
                        { class: 'gct-custom-tag ml8px', style: { wordBreak: 'keep-all' } },
                        t('sys.default'),
                      ),
                    ])
                  : _.name;
            },
          }"
        >
          <ReferenceRelationship2Editor
            class="pt20px"
            v-if="formState.printRefType === TransactionMode.REFERENCE"
            :model="props.model"
            v-model:ruleConfig="formState.printRuleConfig"
            modalTitle="sys.pageDesigner.configReferenceRelationship"
            contentTitle="sys.pageDesigner.createReferenceDiagram"
            endPlaceholder="sys.pageDesigner.pleaseSelectPrintFields"
            :endFieldTypes="[FIELD_TYPE.PRINTER]"
          />
          <SelectEditor
            style="margin-top: 20px"
            v-if="formState.printRefType === TransactionMode.CURRENT"
            v-model:value="formState.printVal"
            :options="printField2Options"
          />
        </linkageEditor>

        <a-form-item
          v-if="formState.sysMethedType === operateSysEnums.LABEL_PRINT"
          :label="t('sys.pageDesigner.businessServices')"
        >
          <SelectEditor v-model:value="formState.serverKey" :options="businessServicesOptions" />
        </a-form-item>
        <LabelRdoEditor
          v-if="formState.sysMethedType === operateSysEnums.DOCUMENT_PRINT"
          :label="t('sys.pageDesigner.documentTemplate')"
          v-model:before-value="formState.documentType"
          v-model:after-value="formState.documentKey"
          :before-option="modeOptions"
          :after-option="documentOptions"
          :modelKey="model"
          :moduleType="PrintTypeEnum.RECEIPT"
        >
          <SelectEditor
            v-if="formState.documentKey === TransactionMode.CURRENT"
            style="margin-top: 20px"
            v-model:value="formState.printField"
            :options="printFieldOptions"
            placeholder="sys.pageDesigner.pleaseSelectDocumentTemplateFieldCurrentModel"
          />
          <ReferenceRelationship2Editor
            class="pt20px"
            v-if="formState.documentKey === TransactionMode.REFERENCE"
            :model="props.model"
            v-model:ruleConfig="formState.ruleConfig"
            modalTitle="sys.pageDesigner.configReferenceRelationship"
            contentTitle="sys.pageDesigner.createReferenceDiagram"
            endPlaceholder="sys.pageDesigner.pleaseSelectDocumentTemplateFields"
            :endFieldTypes="[FIELD_TYPE.DOCUMENT_TEMPLATE]"
          />
        </LabelRdoEditor>

        <a-form-item
          v-if="formState.sysMethedType === operateSysEnums.DOCUMENT_PRINT"
          :label="t('sys.pageDesigner.printMode')"
        >
          <a-radio-group
            v-model:value="printMode"
            :options="[
              {
                value: PrintModeEnums.PREVIEW_PRINT,
                label: t('sys.pageDesigner.documentPrintButtonOption.previewPrint'),
              },
              // {
              //   value: PrintModeEnums.DIRECT_PRINTING,
              //   label: t('sys.pageDesigner.documentPrintButtonOption.directPrinting'),
              // },
            ]"
          />
        </a-form-item>
        <a-form-item
          name="fieldList"
          :rules="[
            {
              required: true,
              message: t('sys.pageDesigner.fieldProp') + t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
          v-if="formState.sysMethedType === operateSysEnums.DOCUMENT_PRINT"
          :label="t('sys.pageDesigner.fieldProp')"
        >
          <addDieldList v-model="formState.fieldList" :modelKey="model" />
        </a-form-item>

        <a-form-item
          :label="t('sys.pageDesigner.confirm')"
          name="confirm"
          :style="`margin-bottom: ${formState.confirm ? 4 : 20}px`"
        >
          <a-checkbox v-model:checked="formState.confirm">
            {{ t('sys.pageDesigner.confirm_tip') }}
          </a-checkbox>
        </a-form-item>
        <a-form-item v-if="formState.confirm" label=" " :colon="false" class="confirm-text-div">
          <i18n-select-textarea-form
            :formRef="formRef"
            formItemName="confirmText"
            :fromItemExtraProps="{
              label: t('sys.pageDesigner.regHint'),
            }"
            :inputExtraProps="{
              placeholder: `${t('sys.pageDesigner.confirmTodo')}`,
              maxlength: 120,
              showCount: true,
              rows: 3,
            }"
            v-model:text="formState.confirmText"
            v-model:i18nConfig="formState.confirmI18nConfig"
          />
        </a-form-item>
        <a-form-item :label="t('sys.pageDesigner.bindingPermission')" style="margin-bottom: 0">
          <div class="ks-row-middle">
            <a-select
              :getPopupContainer="(element) => element.parentNode"
              v-model:value="pageJson.permissions[formState.id!]"
              allow-clear
              :placeholder="t('sys.chooseText')"
              style=""
              class="ks-col"
            >
              <a-select-option v-for="per in pagePermissions" :key="per.key" :value="per.key">{{
                per.name
              }}</a-select-option>
            </a-select>
            <a-button type="link" @click="openPerModal()" class="ml5px">
              {{ t('sys.pageDesigner.newPermission') }}
            </a-button>
          </div>
          <span class="tip">{{ t('sys.pageDesigner.bindingPermissionTip') }}</span>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="4" :header="t('sys.pageDesigner.componentDependencyProp')">
        <a-form-item :label="t('sys.pageDesigner.componentBehavior')">
          <a-radio-group v-model:value="formState.configDependencyType" size="small">
            <a-radio v-for="(opt, index) in componentBehaviorOptions" :value="opt" :key="index">{{
              $t('sys.pageDesigner.' + opt)
            }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('sys.pageDesigner.preconditions')">
          <div class="ks-row-middle">
            <a-input
              :value="formState.configDependency[formState.configDependencyType].expression"
              :placeholder="t('sys.inputText')"
              readOnly
              @click="handleOpenExpr"
              :allowClear="false"
            />
          </div>
          <span class="tip">{{ t('sys.pageDesigner.preconditionPromptTip') }}</span>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
  </a-form>
  <page-permission-modal @register="permissionRegister" @ok="handlePerOk" />
  <events-modal @register="eventRegister" @ok="handleEventOk" />
</template>
<script setup lang="ts">
  import { ref, computed, watch, unref, h } from 'vue';
  import type { FormInstance, TreeSelectProps } from 'ant-design-vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import {
    operateSysEnums,
    ButtonType,
    FormComponents,
    EventCategory,
    Dependency_ENUM,
  } from '/@page-designer/enum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { IconNextPicker } from '/@/components/Icon';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import buttonTypeSelect from '/@page-designer/components/buttonTypeSelect/buttonTypeSelect.vue';
  import { deepMerge } from '/@/utils';
  import { cloneDeep, isArray } from 'lodash-es';
  import { I18nSelectInputForm, I18nSelectTextareaForm } from '/@/components/I18nSelect';
  import { useI18n } from 'vue-i18n';
  import pagePermissionModal from '../../page/modals/page-permission-modal.vue';
  import EventsModal from '/@page-designer/designer/panels/widget/event-modules/events-modal.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getPermissionList,
    postPermission,
    putPermissionById,
  } from '/@/apis/gct-apaas/PermissionController';
  import { useQueryStore } from '/@/store/modules/query';
  import { pagePermissions, platform } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { presetColor, btnTypeColor, shadeColor } from '/@page-designer/hooks/useStyleEditor';
  import {
    FIELD_TYPE,
    CreateType,
    IModal,
    PrintModeEnums,
    UserServiceType,
    KeyMode,
    TransactionMode,
    EntityModelCategoryEnum,
  } from '@gct/runtime';
  import { findNodeAll } from '/@/utils/helper/treeHelper';
  import { getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';
  import {
    SelectEditor,
    linkageEditor,
    ReferenceRelationship2Editor,
    addDieldList,
    LabelRdoEditor,
  } from '/@page-designer/designer/panels/components/editor';
  import { getLabelList } from '/@/apis/gct-apaas/LabelController';
  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
  import { getDocumentList } from '/@/apis/gct-apaas/DocumentController';
  import { getCompPos } from '../../../../schema/utils';
  import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { useFieldTransfer } from '/@/components/FieldTransfer';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const { t } = useI18n();
  const { mitt } = useMitt();
  const Fieldinstance = useFieldTransfer();
  const { pageJson, setLo, excludeSubTableFormWidget, allFormWidget } = useDesigner();
  const props = defineProps<{
    modal: IModal;
    model: string;
    id: string;
    module: string;
    sysMethodData: Array<operateSysEnums>;
    compType?: string;
    data: IData;
    modeldata: IData;
    type: string;
    isTree: boolean;
    isNew: boolean;
    buttonType: string;
  }>();

  enum ButtonOpeEnum {
    SINGLELINE = 0,
    HEAD = 1,
    BATCH = 2,
  }

  const modeOptions = [
    {
      label: t('sys.pageDesigner.system'),
      value: KeyMode.SYSTEM,
    },
    {
      label: t('sys.pageDesigner.transaction'),
      value: KeyMode.TRANSACTION,
    },
  ];

  const transactionOptions = [
    {
      label: t('sys.pageDesigner.currentModel'),
      value: TransactionMode.CURRENT,
    },
    {
      label: t('sys.pageDesigner.referenceOtherModel'),
      value: TransactionMode.REFERENCE,
    },
  ];
  const headerMap = {
    [EntityModelCategoryEnum.VIEW]: [operateSysEnums.EXPORT],
    [EntityModelCategoryEnum.ENTITY]: [operateSysEnums.IMPORT, operateSysEnums.EXPORT],
    [EntityModelCategoryEnum.DATA]: [],
  };
  const opeMap = {
    [ButtonOpeEnum.SINGLELINE]: {
      label: t('sys.pageDesigner.singleLineButton'),
      value: ButtonOpeEnum.SINGLELINE,
      icon: '/assets/svg/single-button.svg',
      sys: [
        operateSysEnums.COLUMNDELETE,
        operateSysEnums.COLUMNLINK,
        operateSysEnums.COPY,
        operateSysEnums.DETAILS,
        operateSysEnums.EDIT,
        operateSysEnums.LABEL_PRINT,
        // operateSysEnums.DOCUMENT_PRINT,
      ],
    },
    [ButtonOpeEnum.HEAD]: {
      label: t('sys.pageDesigner.headerButton'),
      value: ButtonOpeEnum.HEAD,
      icon: '/assets/svg/header-button.svg',
      sys: headerMap[props.modeldata.modelCategory],
    },
    [ButtonOpeEnum.BATCH]: {
      label: t('sys.pageDesigner.batchButton'),
      value: ButtonOpeEnum.BATCH,
      icon: '/assets/svg/batch-button.svg',
      sys: [operateSysEnums.BATCHDELETE],
    },
  };
  if (props.isTree !== true) {
    opeMap[ButtonOpeEnum.SINGLELINE].sys.push(
      ...[
        operateSysEnums.MODELINGTRACEABILITY,
        operateSysEnums.USAGEINFORMATION,
        operateSysEnums.VERSION_COPY,
        operateSysEnums.VERSION_CREATE,
      ],
    );
  }

  const { openModal } = useExpression();
  const formRef = ref<FormInstance>();
  type ButtonProps = BaseButton['props'];
  interface FormState extends ButtonProps {
    id: string;
    versionMode: number;
    pos: ButtonOpeEnum;
    refModal?: string;
    refForm?: string;
    templateKey?: string;
    timeout: number;
    configDependencyType: Dependency_ENUM;
    configDependency: any;
    /* 标签打印 */
    // 标签模板模式
    labelMode?: KeyMode;
    // 标签模板值
    printKey?: string;
    // 打印方式
    printMode?: string;
    // 打印机类型
    printType?: KeyMode;
    printVal?: string;
    // 关联服务
    serverKey?: string;
    /* 单据打印 */
    // 单据模板类型
    documentType?: KeyMode;
    // 单据模板值
    documentKey?: string;
    // 打印字段
    printField?: string;
    // 打印机业务类型
    printRefType?: string;
    // 引用关系配置
    ruleConfig: IData;
    // 打印机的关联配置
    printRuleConfig: IData;
    /**打印选择模型字段 */
    fieldList: any[];
    /**复制按钮排除复制的字段 */
    excludeField?: string[];
  }

  const formData = ref<Partial<FormState>>({
    id: '',
    icon: 'icon-park:all-application',
    title: '',
    confirm: false,
    confirmText: '',
    innerEvent: true,
    sysMethedType: props.sysMethodData[Object.keys(props.sysMethodData)[0]],
    displayRule: '',
    linkPage: undefined,
    eventName: '',
    hasIcon: false,
    hasText: true,
    printMode: PrintModeEnums.Local,
    labelMode: KeyMode.SYSTEM,
    printType: KeyMode.SYSTEM,
    printVal: '',
    serverKey: '',
    documentType: KeyMode.SYSTEM,
    documentKey: '',
    printField: '',
    printRefType: '',
    ruleConfig: {},
    type: ButtonType.PRIMARY,
    danger: false,
    disabled: false,
    i18nConfig: '',
    confirmI18nConfig: '',
    enableCustomColor: false,
    backgroundColor: '',
    fontColor: '',
    versionMode: 0,
    pos: ButtonOpeEnum.SINGLELINE,
    refModal: undefined,
    refForm: undefined,
    events: {},
    templateKey: undefined,
    timeout: 20,
    configDependencyType: Dependency_ENUM.HIDDEN,
    configDependency: {
      /**隐藏 */
      [Dependency_ENUM.HIDDEN]: {
        expression: '',
        value: false,
      },
      /**禁用 */
      [Dependency_ENUM.DISABLED]: {
        expression: '',
        value: false,
      },
    },
    fieldList: [],
    excludeField: [],
  });

  const formState = ref<Partial<FormState>>({});
  const pageTrees = ref<TreeSelectProps['treeData']>([]);
  const activeKey = ref(['1', '2', '3', '4', '5']);
  const customEvent = ref({
    eventName: '',
    isNew: false,
    event: [],
    eventCategory: '',
    methodTitle: '',
    extParams: {},
  });
  const templateKeyOptions = ref([]);
  const [permissionRegister, { openModal: openPerModal, closeModal: closePerModal }] = useModal();
  const [eventRegister, { openModal: openEventModal, closeModal: closeEventModal }] = useModal();

  const printMode = computed({
    get() {
      return formState.value.printMode;
    },
    set(val) {
      formState.value.printMode = val;
    },
  });

  const posOptions = computed(() => {
    const arr: ButtonOpeEnum[] = [];
    if (
      props.type === FormComponents.RdoTable ||
      props.modeldata.modelCategory === EntityModelCategoryEnum.VIEW
    ) {
      arr.push(...[ButtonOpeEnum.HEAD, ButtonOpeEnum.SINGLELINE]);
    } else {
      arr.push(...[ButtonOpeEnum.HEAD, ButtonOpeEnum.SINGLELINE, ButtonOpeEnum.BATCH]);
    }
    return arr.map((i) => opeMap[i]);
  });

  // 组行为配置项
  const componentBehaviorOptions = computed(() => {
    const arr: Dependency_ENUM[] = [Dependency_ENUM.HIDDEN];
    if (formState.value.pos !== 0) {
      arr.push(Dependency_ENUM.DISABLED);
    }
    return arr;
  });

  const sysMethedOptions = computed(() => {
    const sys = opeMap[formState.value.pos]?.sys;
    return props.sysMethodData.filter((k) => sys.includes(k));
  });

  const changePos = () => {
    formState.value.sysMethedType = sysMethedOptions.value[0];
    if (formState.value.pos === ButtonOpeEnum.SINGLELINE) {
      formState.value.type = ButtonType.LINK;
      formState.value.danger = false;
    } else {
      formState.value.type = ButtonType.PRIMARY;
      formState.value.danger = false;
    }
    formState.value.ruleConfig = {};
    changeMethed(formState.value.sysMethedType, {
      name: $t(`sys.pageDesigner.${formState.value.sysMethedType}Text`),
    });
  };

  /**切换系统事件  删除默认自定义颜色红色 */
  const changeMethed = async (type, { name }) => {
    if (type === operateSysEnums.COLUMNDELETE) {
      formState.value.fontColor = '#ff4d4f';
      formState.value.enableCustomColor = true;
    } else {
      formState.value.enableCustomColor = false;
    }
    if (type === operateSysEnums.LABEL_PRINT) {
      printMode.value = PrintModeEnums.Local;
    }
    if (type === operateSysEnums.DOCUMENT_PRINT) {
      printMode.value = PrintModeEnums.PREVIEW_PRINT;
    }
    if (!formState.value.title) {
      formState.value.title = name;
    }
    formState.value.ruleConfig = {};
    reloadTemplate(type);
  };
  /**更新模版 */
  async function reloadTemplate(type) {
    if (type === operateSysEnums.EXPORT || type === operateSysEnums.IMPORT) {
      const map = {
        [operateSysEnums.EXPORT]: 'EXPORT',
        [operateSysEnums.IMPORT]: 'IMPORT',
      };
      const data = (await getExcelTmplList({ modelKey: props.model, type: map[type] })) || [];
      templateKeyOptions.value = data
        .filter((i) => {
          if (props.buttonType === 'export-button' || props.buttonType === 'import-button') {
            return !i.version && !!i.configJson;
          } else {
            return i.version && !!i.configJson;
          }
        })
        .map((i) => {
          return { value: i.key, label: i.name };
        });
    }
  }
  const showlinkPage = computed(() => {
    return (
      formState.value.innerEvent && formState.value.sysMethedType === operateSysEnums.COLUMNLINK
    );
  });

  const showLinkForm = computed(() => {
    return (
      formState.value.innerEvent &&
      formState.value.sysMethedType &&
      [operateSysEnums.SUBMIT, operateSysEnums.RESET].includes(formState.value.sysMethedType)
    );
  });
  const showModal = computed(() => {
    return (
      formState.value.innerEvent &&
      formState.value.sysMethedType &&
      [
        operateSysEnums.DETAILS,
        operateSysEnums.COPY,
        operateSysEnums.VERSION_COPY,
        operateSysEnums.EDIT,
        operateSysEnums.VERSION_CREATE,
      ].includes(formState.value.sysMethedType)
    );
  });
  const eventType = computed(() => {
    return formState.value.innerEvent ? 1 : 0;
  });

  watch(showlinkPage, (i) => {
    if (i) {
      getPageLinkOptions();
    }
  });

  const handleChange = () => {
    const findItem: any = btnTypeColor.find(
      (i) => i.type === formState.value.type && i.danger === formState.value.danger,
    );
    formState.value.fontColor = getColor(findItem.fontColor);
    formState.value.backgroundColor = getColor(findItem.backgroundColor);
  };

  function getColor(colorString) {
    let defautColor = colorString;
    if (defautColor.indexOf('--ant') > -1) {
      const element: any = document.querySelector(':root');
      defautColor = getComputedStyle(element).getPropertyValue(colorString);
    }
    if (defautColor.indexOf('rgb') > -1) {
      defautColor = shadeColor(defautColor);
    }
    return defautColor;
  }

  async function getPageLinkOptions() {
    let tree = (await getCategoryListComplete({ module: props.module })) || [];
    pageTrees.value = tree.map((i) => {
      const children = i.children?.map((c) => {
        return { label: c.name, value: c.id };
      });
      return { label: i.name, value: i.id, disabled: true, children };
    });
  }

  props.modal.callback(async () => {
    await handleOk();
    return {
      ok: true,
      data: [unref(formState)],
    };
  });

  // 保存
  const handleOk = async () => {
    await formRef.value!.validate();
    const { eventName, isNew, event, eventCategory, methodTitle, extParams } = customEvent.value;
    if (formState.value.innerEvent) {
      // 选择系统事件时，清除自建的事件
      formState.value.eventName = '';
    } else if (eventCategory === EventCategory.JS) {
      if (isNew) {
        mitt.emit('new-event', {
          methodName: eventName,
          params: 'rowValue,index,extParams',
        });
        mitt.emit('get-schema-code');
      }
      formState.value.events = {
        onClick: {
          extParams,
          type: eventCategory,
          name: eventName,
        },
      };
    } else if (eventCategory === EventCategory.LO) {
      // 如果是新建函数
      if (isNew) {
        setLo(eventName, {
          name: eventName,
          title: methodTitle,
          runtimeJs: `function ${eventName}() {}`,
          bindTo: formData.value.id,
          parameter: ['rowValue', 'index', 'extraParams'],
        });
      } else {
        setLo(eventName, {
          title: methodTitle,
          bindTo: formData.value.id,
        });
      }
      formState.value.events = {
        onClick: {
          extParams,
          type: eventCategory,
          name: eventName,
        },
      };
    } else {
      /**内置事件 */
      formState.value.events = {
        onClick: event,
      };
    }
  };

  const init = () => {
    formState.value = deepMerge(formData.value, cloneDeep({ ...formData.value, ...props.data }));
    if (formState?.value?.events?.onClick) {
      // 内置事件与JS事件，事件参数数据结构不同，故做不同处理
      if (isArray(formState?.value?.events?.onClick)) {
        customEvent.value = {
          ...customEvent.value,
          event: formState?.value?.events?.onClick,
        };
      } else {
        const { type, name, extParams } = formState.value.events.onClick;
        customEvent.value = {
          ...customEvent.value,
          eventName: name,
          eventCategory: type,
          extParams,
        };
      }
    }
    const findItem: any = btnTypeColor.find(
      (i) => i.type === formState.value.type && i.danger === formState.value.danger,
    );
    formState.value.fontColor = formState.value.fontColor || getColor(findItem.fontColor);
    formState.value.backgroundColor =
      formState.value.backgroundColor || getColor(findItem.backgroundColor);
    if (!sysMethedOptions.value.includes(formState.value.sysMethedType)) {
      changePos();
    }
    reloadTemplate(formState.value.sysMethedType);
  };

  init();

  // 显示规则-open
  const handleOpenExpr = async () => {
    const type = formState.value.configDependencyType!;
    openModal({
      expr: formState.value.configDependency[type].expression,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        formState.value.configDependency[type].expression = expr;
        formState.value.configDependency[type].value = !!expr;
      },
    });
  };
  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P =
      props.compType === FormComponents.BottomButtonContainer ||
      formState.value.pos !== ButtonOpeEnum.SINGLELINE
        ? allFormWidget.value
            .filter((i) => i.props.model)
            .map(async (form) => {
              const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
              const children =
                fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
              return {
                id: form.id,
                name: `${form.alias || t(form.name)} ${form.id}`,
                children,
              };
            })
        : [
            {
              id: props.id,
              props: {
                name:
                  props.compType && props.compType === FormComponents.CardList
                    ? t('sys.pageDesigner.currentCard')
                    : t('sys.pageDesigner.currentTable'),
                model: props.model,
              },
            },
          ]
            .filter((i) => i.props.model)
            .map(async (form) => {
              const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
              const children =
                fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
              return {
                id: form.id,
                name: form.props.name || form.id,
                children,
              };
            });
    const formlist = await Promise.all(P);
    return formlist;
  };

  const validateBtnLabel = (rule, value) => {
    if (!value || !value.trim()) return Promise.reject();
    else return Promise.resolve();
  };

  // 事件类型-change
  const handleMethodTypeChange = (val) => {
    formState.value.innerEvent = val === 1;
    if (val === 1) {
      formState.value.sysMethedType = sysMethedOptions.value[0];
      formRef.value?.clearValidate(['eventName']);
    } else {
      formState.value.sysMethedType = undefined;
      formState.value.refForm = undefined;
      formRef.value?.clearValidate(['sysMethedType']);
    }
    formState.value.ruleConfig = {};
  };

  // 绑定事件-open
  const onEventNameClick = () => {
    openEventModal(
      true,
      !formState.value.events?.onClick
        ? {
            name: formState.value.eventName,
            eventType: 'onClick',
            isEdit: !!formState.value.eventName,
          }
        : {
            event: formState.value.events?.onClick,
            isEdit: !!formState.value.eventName,
            eventCategory: formState.value.events?.onClick.type,
          },
    );
  };

  // 绑定事件-保存
  const handleEventOk = (event) => {
    initOrUpdateEvents(event);
  };
  /**添加或者修改组件中的events */
  const initOrUpdateEvents = (eventData) => {
    const { event, eventCategory } = eventData;
    formState.value.eventName =
      eventCategory !== EventCategory.INNER ? event.methodName : event.map((e) => e.name);
    customEvent.value = {
      event: eventCategory !== EventCategory.INNER ? [] : event,
      eventCategory,
      isNew: eventCategory !== EventCategory.INNER && event.isNew,
      eventName:
        eventCategory !== EventCategory.INNER ? event.methodName : event.map((e) => e.name),
      methodTitle: event.methodTitle,
      extParams: eventCategory === EventCategory.JS ? event.extParams : '',
    };
    closeEventModal();
  };

  // 权限配置-保存
  const handlePerOk = async (data) => {
    const queryStore = useQueryStore();
    !data.id
      ? await postPermission({
          ...data,
          terminalType: platform.value.toUpperCase(),
          relationId: queryStore.getPid(),
        })
      : await putPermissionById(
          { id: data.id },
          {
            name: data.name,
            key: data.key,
            terminalType: platform.value.toUpperCase(),
            relationId: queryStore.getPid(),
          },
        );
    closePerModal();
    pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
  };

  const handleUpdateColor = (_e, color) => {
    formState.value.fontColor = color;
  };

  const handleUpdateBgColor = (_e, color) => {
    formState.value.backgroundColor = color;
  };
  const listOptions = [FormComponents.Form, FormComponents.RdoForm, FormComponents.MedProRdoForm];
  const modalsForms = computed(() => {
    const scope =
      pageJson.modals.find((modal) => formState.value.refModal === modal.id)?.children || [];
    return findNodeAll(scope, (widget) => {
      if (
        [FormComponents.RdoForm, FormComponents.MedProRdoForm].includes(widget.type) &&
        widget.props.model == props.model
      ) {
        return true;
      }
      return (
        widget.type === FormComponents.Form &&
        !getCompPos(widget, FIELD_TYPE.MASTERSLAVE, FormComponents.Form) &&
        widget.props.model == props.model
      );
    });
  });

  const labelOptions = async (val) => {
    if (val) {
      if (val === KeyMode.SYSTEM) {
        const data = (await getLabelList({ modelKey: props.model })) || [];
        return data.map((i) => {
          return { value: i.key, label: i.name };
        });
      }
      if (val === KeyMode.TRANSACTION) {
        return transactionOptions;
      }
      // if (val === KeyMode.TRANSACTION) {
      //   const files = await getFieldMetaList({
      //     includeBuiltin: false,
      //     sys: false,
      //     modelKey: props.model,
      //   });
      //   if (files) {
      //     return files
      //       .filter((i) => i.type === FIELD_TYPE.LABEL_TEMPLATE_REF)
      //       .map((i) => {
      //         return { value: i.key, label: i.name };
      //       });
      //   }
      // }
    }
    return [];
  };

  const printOptions = async (val) => {
    if (val) {
      if (val === KeyMode.SYSTEM) {
        const data = (await getPrintPrintDropdownList()) || [];
        data.forEach((i) => {
          const dftInfo =
            (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
            undefined;
          i.label = i.name;
          i.value = i.printKey;
          i.children = i.printChildNode || [];
          i.disabled = i.type === PrintResourceEnum.INTERNET_PRINT;
          i.dftPrintInfo =
            i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
              ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
              : undefined;
          i.children?.forEach((_) => {
            _.label = _.name;
            _.value = _.printKey;
          });
        });
        return data;
      }
      if (val === KeyMode.TRANSACTION) {
        return transactionOptions;
      }
    }
  };

  const printField2Options = async () => {
    const files = await getFieldMetaList({
      includeBuiltin: true,
      sys: false,
      modelKey: props.model,
    });
    if (files) {
      return files
        .filter((i) => i.type === FIELD_TYPE.PRINTER)
        .map((i) => {
          return { value: i.key, label: i.name };
        });
    }
    return [];
  };

  const documentOptions = async (val) => {
    if (val) {
      if (val === KeyMode.SYSTEM) {
        const data = (await getDocumentList({ modelKey: props.model })) || [];
        return data.map((i) => {
          return { value: i.key, label: i.name };
        });
      }
      if (val === KeyMode.TRANSACTION) {
        return transactionOptions;
      }
    }
    return [];
  };

  const businessServicesOptions = async () => {
    const data = (await getBizServiceCrudList({ modelKey: props.model })) || [];
    return data
      .filter(
        (i) =>
          i.type !== UserServiceType.BUILTIN_SERVICE ||
          i.key === 'getById' ||
          i.key === 'rdoGetVersionById',
      )
      .map((i) => {
        return { value: i.key, label: i.name };
      });
  };

  const printFieldOptions = async () => {
    const files = await getFieldMetaList({
      includeBuiltin: true,
      sys: false,
      modelKey: props.model,
    });
    if (files) {
      return files
        .filter((i) => i.type === FIELD_TYPE.DOCUMENT_TEMPLATE)
        .map((i) => {
          return { value: i.key, label: i.name };
        });
    }
    return [];
  };

  const labelFieldOptions = async () => {
    const files = await getFieldMetaList({
      includeBuiltin: true,
      sys: false,
      modelKey: props.model,
    });
    if (files) {
      return files
        .filter((i) => i.type === FIELD_TYPE.LABEL_TEMPLATE_REF)
        .map((i) => {
          return { value: i.key, label: i.name };
        });
    }
    return [];
  };
  /**选择不需要复制的模型字段 */
  const selectCopyField = () => {
    Fieldinstance.open({
      modelKey: props.model,
      modalTitle: $t('sys.pageDesigner.selectModelFields'),
      isShowCascader: false,
      data: formState.value.excludeField,
      draggable: false,
      excludeFieldType: [FIELD_TYPE.SERIAL],
      containCreateType: [CreateType.BUILTIN, CreateType.USER_DEFINED],
      width: 640,
      promptMessage: $t('sys.pageDesigner.excludeMessage'),
      saveCallback: ({ objFieldList }) => {
        formState.value.excludeField = objFieldList;
      },
    });
  };
  defineExpose({ open });
</script>
<style scoped lang="less">
  .form-wrapper {
    padding: 16px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }

  .confirm-text-div {
    :deep(.ant-form-item-label > label) {
      color: #797a7d;
    }

    :deep(.ant-form-item) {
      margin-bottom: 0;
    }

    :deep(& > .ant-form-item-control) {
      border-radius: 4px;
    }
  }

  .tip {
    margin-top: 4px;
    color: #c3c3c3;
    font-size: 12px;
  }

  .pos-mode {
    width: 100%;
    margin-left: 80px;
  }

  .pos-mode-info {
    margin-bottom: 8px;
    color: #797a7d;
  }

  .pos-mode-icon {
    display: flex;
    justify-content: space-around;
    margin-bottom: 8px;
    gap: 16px;

    img {
      width: 104px;
      height: 64px;
    }
  }

  .pos-mode-icon__item {
    border: 1px solid #e8ebf0;
    border-radius: 4px;
  }

  .pos-mode-icon__item.is-active {
    border: 1px solid #3168ec;
  }

  .specific-location {
    display: flex;
    justify-content: space-around;
  }
</style>
