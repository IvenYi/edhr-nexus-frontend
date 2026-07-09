<template>
  <div class="field-wrapper">
    <FieldCascader class="p-12px" />
    <a-tabs
      v-if="showTabEnum.includes(focusFormRef.type) || showTabEnum.includes(selectModalRef.type)"
      v-model:activeKey="activeKey"
      centered
    >
      <a-tab-pane key="1" :tab="t('sys.pageDesigner.modelFieldTitle')">
        <div class="field-wrap">
          <InputSearch
            class="field-search"
            :placeholder="t('sys.pageDesigner.searchField')"
            allowClear
            size="small"
            v-model:value="searchValue"
          />
          <ScrollContainer>
            <draggable
              v-if="!isNewDesigner"
              :list="fieldList"
              class="field-list"
              :data-field-location="subTableModalState ? 'subTable' : 'normal'"
              :group="{
                name: subTableModalState
                  ? 'gct-sub-table-modal'
                  : modalDesignState || workflowModalState
                    ? 'gct-modal'
                    : 'gct',
                pull: onPull,
                put: false,
              }"
              :sort="false"
              ghost-class="widget-item--ghost"
              draggable=".widget-item--draggable"
              :clone="
                (item) =>
                  beginDrag(item, {
                    preLocation: item.currentFormId,
                    materialType: item.materialType,
                  })
              "
              item-key="id"
              :move="checkWidgetMove"
            >
              <template #item="{ element, index }">
                <ToolkitFieldItem :element="element" :index="index" />
              </template>
            </draggable>
            <template v-if="isNewDesigner === true">
              <Vue3DndMaterialItem
                v-for="(item, i) in fieldList"
                :key="i"
                :group="DESIGN_TYPE"
                :index="i"
                :item="item"
                :config="dragOption"
                :clone="
                  (item) =>
                    beginDrag(item, {
                      preLocation: item.currentFormId,
                      materialType: item.materialType,
                    })
                "
                class="field-list"
                :data-field-location="subTableModalState ? 'subTable' : 'normal'"
              >
                <ToolkitFieldItem :element="item" :index="i" />
              </Vue3DndMaterialItem>
            </template>
          </ScrollContainer>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.pageDesigner.displayFieldTitle')">
        <div class="field-wrap">
          <div class="pl12px pr12px">
            <a-button type="link" size="small" @click="addCustomField" style="padding: 0">
              <i class="iconfont icon-chuangjian mr2px" style="font-size: 14px"></i>
              {{ t('sys.pageDesigner.addSelectionField') }}
            </a-button>
            <a-tooltip placement="top">
              <template #title>{{ t('sys.pageDesigner.addFormFieldTips') }}</template>
              <span
                class="iconfont icon-assist text-[#bfbfbf] ml3px"
                style="position: relative; top: 2px"
              ></span>
            </a-tooltip>
          </div>
          <ScrollContainer>
            <draggable
              v-if="!isNewDesigner"
              :list="customFieldList"
              class="field-list"
              :data-field-location="subTableModalState ? 'subTable' : 'normal'"
              :group="{
                name: subTableModalState
                  ? 'gct-sub-table-modal'
                  : modalDesignState || workflowModalState
                    ? 'gct-modal'
                    : 'gct',
                pull: onPull,
                put: false,
              }"
              :sort="false"
              ghost-class="widget-item--ghost"
              draggable=".widget-item--draggable"
              :clone="
                (item) =>
                  beginDrag(item, {
                    preLocation: item.currentFormId,
                    materialType: item.materialType,
                  })
              "
              item-key="id"
              :move="checkWidgetMove"
            >
              <template #item="{ element, index }">
                <ToolkitFieldItem
                  isCustom
                  :element="element"
                  :index="index"
                  @edit="editCustomField"
                  @delete="deleteCustomField"
                />
              </template>
            </draggable>
            <template v-if="isNewDesigner === true">
              <Vue3DndMaterialItem
                v-for="(item, i) in customFieldList"
                :key="item.id"
                :group="DESIGN_TYPE"
                :index="i"
                :item="item"
                :config="dragOption"
                :clone="
                  (item) =>
                    beginDrag(item, {
                      preLocation: item.currentFormId,
                      materialType: item.materialType,
                    })
                "
                class="field-list"
                :data-field-location="subTableModalState ? 'subTable' : 'normal'"
              >
                <ToolkitFieldItem
                  isCustom
                  :element="item"
                  :index="i"
                  @edit="editCustomField"
                  @delete="deleteCustomField"
                />
              </Vue3DndMaterialItem>
            </template>
          </ScrollContainer>
        </div>
      </a-tab-pane>
    </a-tabs>
    <div v-else class="model-field field-wrap">
      <InputSearch
        class="field-search"
        :placeholder="t('sys.pageDesigner.searchField')"
        allowClear
        size="small"
        v-model:value="searchValue"
      />
      <ScrollContainer>
        <draggable
          v-if="!isNewDesigner"
          :list="fieldList"
          class="field-list"
          :data-field-location="subTableModalState ? 'subTable' : 'normal'"
          :group="{
            name: subTableModalState
              ? 'gct-sub-table-modal'
              : modalDesignState || workflowModalState
                ? 'gct-modal'
                : 'gct',
            pull: onPull,
            put: false,
          }"
          :sort="false"
          ghost-class="widget-item--ghost"
          draggable=".widget-item--draggable"
          :clone="
            (item) =>
              beginDrag(item, {
                preLocation: item.currentFormId,
                materialType: item.materialType,
              })
          "
          item-key="id"
          :move="checkWidgetMove"
        >
          <template #item="{ element, index }">
            <ToolkitFieldItem :element="element" :index="index" />
          </template>
        </draggable>
        <template v-if="isNewDesigner === true">
          <Vue3DndMaterialItem
            v-for="(item, i) in fieldList"
            :key="i"
            :group="DESIGN_TYPE"
            :index="i"
            :item="item"
            :config="dragOption"
            :clone="
              (item) =>
                beginDrag(item, {
                  preLocation: item.currentFormId,
                  materialType: item.materialType,
                })
            "
            class="field-list"
            :data-field-location="subTableModalState ? 'subTable' : 'normal'"
          >
            <ToolkitFieldItem :element="item" :index="i" />
          </Vue3DndMaterialItem>
        </template>
      </ScrollContainer>
    </div>
    <add-custom-field-modal :isForm="isForm" @register="register" @ok="customHandleOk" />
  </div>
</template>

<script lang="ts" setup name="toolkit-field">
  import { ref, computed, nextTick } from 'vue';
  import { InputSearch, message } from 'ant-design-vue';
  import draggable from 'vuedraggable';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';
  import { FieldCascader } from '/@/components/FieldTransfer';
  import { beginDrag } from '/@page-designer/schema/utils';
  import { FIELD_TYPE, CreateType, MaterialEnum, NodesConfigTypeEnum } from '/@/enums/appEnum';
  import { findNodeAll } from '/@/utils/helper/treeHelper';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { platform } from '/@page-designer/hooks/usePage';
  import { FormComponents, Platform } from '/@page-designer/enum';
  import { has, cloneDeep } from 'lodash-es';
  // import addCustomFieldModal from './modals/add-custom-field-modal.vue';
  import addCustomFieldModal from '../panels/prop-editor/modals/add-custom-field-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { Vue3DndMaterialItem } from '../components/vue3-dnd-material-item/vue3-dnd-material-item';
  import { ToolkitFieldItem } from './toolkit-field-item';
  import { IVue3DndItemOptions } from '../interface';
  import { DESIGN_TYPE } from '../../constant';

  const { t } = useI18n();

  const { selectedRef, selectModalRef, focusFormRef } = useSelectedWidget();
  const {
    checkWidgetMove,
    modalDesignState,
    subTableModalState,
    workflowModalState,
    isNewDesigner,
  } = useDesigner();
  const { selectObj } = useModelField();

  const searchValue = ref<string>('');
  const activeKey = ref('1');
  const [register, { openModal: openCustomModal }] = useModal();
  const showTabEnum = [FormComponents.Form, FormComponents.CardList];

  const dragOption: IVue3DndItemOptions<IObject> = {
    mode: 'create',
    isDrop: false,
    canDrag(data) {
      return !data.disabled;
    },
  };

  // 内容高亮处理，名称被searchkey 匹配不到时，返回 null
  const highlightName = (str) => {
    const displayName = str;
    const rDisplayName = displayName?.replace(
      // eslint-disable-next-line no-useless-escape
      new RegExp(searchValue.value?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'), 'g'),
      (s) => `<span class="is-highlight">${s}</span>`,
    );
    if (rDisplayName === displayName) return null;

    return rDisplayName;
  };

  const getBindFieldKey = (value) => {
    try {
      const fieldCodeChainObj = JSON.parse(value);
      if (fieldCodeChainObj) {
        return fieldCodeChainObj.bindFieldKey || '';
      }
    } catch (error) {
      return '';
    }
  };

  const isForm = computed(() => {
    return focusFormRef.value.type == 'form';
  });

  const materialTypes = computed(() => {
    if (subTableModalState.value) {
      return [MaterialEnum.MaterialSubTableModalField];
    }
    return [MaterialEnum.MaterialFormField, MaterialEnum.cardListFormField];
  });

  const fieldList = computed(() => {
    const existIds = findNodeAll(focusFormRef.value.children || [], (res) => {
      return res.isField && materialTypes.value.includes(res.materialType);
    }).map((item) => {
      const fieldId =
        item.props.fieldId === 'version_,name_,default_'
          ? `${item.props.modelKey}$${item.props.field}`
          : item.props.fieldId;
      return `${item.props.bindFieldKey ? `${item.props.bindFieldKey}__` : ''}${fieldId}`;
    });
    console.log('selectObj', selectObj, focusFormRef);

    const list = selectObj.fieldList
      .filter((item) => {
        if (item.createType === CreateType.USER_DEFINED) {
          // if (
          //   subTableModalState.value &&
          //   [FIELD_TYPE.ESOP, FIELD_TYPE.MASTERSLAVE, FIELD_TYPE.AGG].includes(
          //     item.type as FIELD_TYPE,
          //   )
          // ) {
          //   return false;
          // }
          // if (
          //   (selectObj.isFieldModel ||
          //     selectedRef.value.materialType === MaterialEnum.cardListFormField) &&
          //   [FIELD_TYPE.MASTERSLAVE].includes(item.type as FIELD_TYPE)
          // ) {
          //   return false;
          // }
          if (platform.value === Platform.WEB) {
            return ![FIELD_TYPE.DOCUMENT_TEMPLATE].includes(item.type as FIELD_TYPE);
          }
          if (platform.value === Platform.MOBILE) {
            return ![
              FIELD_TYPE.ESOP,
              // FIELD_TYPE.ONLINE_FORM,
              FIELD_TYPE.RANGE_USER,
              FIELD_TYPE.MESSAGE_TMPL,
              FIELD_TYPE.SERIALRULE,
              FIELD_TYPE.LABEL_TEMPLATE,
              FIELD_TYPE.EXPRESSION_CONDITION,
              FIELD_TYPE.DOCUMENT_TEMPLATE,
              // FIELD_TYPE.MASTERSLAVE,
            ].includes(item.type as FIELD_TYPE);
          }
          // pad 卡片列表不展示子表
          if (
            platform.value === Platform.PAD &&
            focusFormRef.value.materialType === MaterialEnum.cardListFormField
          ) {
            return ![
              FIELD_TYPE.RANGE_USER,
              FIELD_TYPE.SERIALRULE,
              FIELD_TYPE.LABEL_TEMPLATE,
              FIELD_TYPE.EXPRESSION_CONDITION,
              // 以下为5.2.13实现字段，暂不展示
              FIELD_TYPE.ONLINE_FORM_TEMPLATE,
              FIELD_TYPE.E_DHR_TEMPLATE,
              FIELD_TYPE.ESOP,
              FIELD_TYPE.MASTERSLAVE,
              FIELD_TYPE.DOCUMENT_TEMPLATE,
              FIELD_TYPE.MESSAGE_TMPL,
            ].includes(item.type as FIELD_TYPE);
          }
          if (platform.value === Platform.PAD) {
            return ![
              FIELD_TYPE.RANGE_USER,
              FIELD_TYPE.SERIALRULE,
              FIELD_TYPE.LABEL_TEMPLATE,
              FIELD_TYPE.EXPRESSION_CONDITION,
              // 以下为5.2.13实现字段，暂不展示
              FIELD_TYPE.ONLINE_FORM_TEMPLATE,
              FIELD_TYPE.E_DHR_TEMPLATE,
              FIELD_TYPE.ESOP,
              // FIELD_TYPE.MASTERSLAVE,
              FIELD_TYPE.DOCUMENT_TEMPLATE,
              FIELD_TYPE.MESSAGE_TMPL,
            ].includes(item.type as FIELD_TYPE);
          }

          return true;
        }
        const workflowFields = ['name_', 'description_'];
        if (selectedRef.value.props?.nodeType === NodesConfigTypeEnum.SPEC)
          workflowFields.push('spec_id_');
        else if (selectedRef.value.props?.nodeType === NodesConfigTypeEnum.SUB_WORKFLOW)
          workflowFields.push('sub_workflow_');

        return !['id_', 'tenant_id_'].includes(item.key ?? '');
      })
      .map((item) => {
        const hlName = highlightName(item.name); // 高亮列表名称
        if (!searchValue.value || hlName) {
          return {
            ...item,
            highlightName: hlName,
            // 所属表单id
            currentFormId: selectObj.currentFormId,
            // 字段链路key
            fieldCodeChain: selectObj.fieldCodeChain,
            // 是否属于字段模型
            isFieldModel: selectObj.isFieldModel,
            disabled: existIds.includes(
              selectObj.isFieldModel
                ? `${getBindFieldKey(selectObj.fieldCodeChain)}__${item.id}`
                : (item.id as string),
            ),
            materialType: subTableModalState.value
              ? MaterialEnum.MaterialSubTableModalField
              : selectedRef.value.materialType || '',
          };
        }
      })
      .filter((i) => i);
    return list;
  });

  const onPull = (_a, _b, source) => {
    if (
      _a &&
      _a.el &&
      has(_a.el.dataset, 'informid') &&
      _a.el.dataset.informid === source.dataset.prelocation
    ) {
      console.log('拖入表单中');
      return 'clone';
    }
    // console.log('字段没有拖入表单中');
    return false;
  };

  const customAddList = computed(() => {
    return focusFormRef.value.props?.customFieldList || [];
  });

  // 自定义字段
  const customFieldList = computed(() => {
    const existIds = findNodeAll(focusFormRef.value.children || [], (res) => {
      return res.isField && materialTypes.value.includes(res.materialType);
    }).map((item) => {
      const fieldId =
        item.props.fieldId === 'version_,name_,default_'
          ? `${item.props.modelKey}$${item.props.field}`
          : item.props.fieldId;
      return `${item.props.bindFieldKey ? `${item.props.bindFieldKey}__` : ''}${fieldId}`;
    });
    const list = customAddList.value
      .map((item) => {
        const hlName = highlightName(item.name); // 高亮列表名称
        if (hlName) {
          return {
            ...item,
            highlightName: hlName,
            // 所属表单id
            currentFormId: selectObj.currentFormId,
            // 字段链路key
            fieldCodeChain: selectObj.fieldCodeChain,
            // 是否属于字段模型
            isFieldModel: false,
            disabled: existIds.includes(item.id as string),
            materialType: subTableModalState.value
              ? MaterialEnum.MaterialSubTableModalField
              : selectedRef.value.materialType || '',
          };
        }
      })
      .filter((i) => i);

    return list;
  });

  // 添加自定义字段
  const addCustomField = () => {
    const tableData = {
      id: focusFormRef.value.id,
      model: focusFormRef.value.props?.model,
      validateCustomKey: existedCustomKey,
    };
    openCustomModal(true, {
      isEdit: false,
      tableData,
      formData: {},
      isOldData: false,
    });
  };

  // 编辑自定义字段
  const editCustomField = (data) => {
    let specificConfig: any = {};
    if (data.createType == 'data-table-formula' && data.specificConfig) {
      specificConfig =
        data.specificConfig.formulaConfig && !data.specificConfig.formulaConfig.expression
          ? {
              formulaConfig: {
                exp: data.specificConfig.formulaConfig.exp,
                expression: data.specificConfig.formulaConfig.exp,
                showQrCode: data.specificConfig.formulaConfig.showQrCode || false,
                digits: data.specificConfig.formulaConfig.digits || 0,
              },
            }
          : data.specificConfig;
    }

    openCustomModal(true, {
      isEdit: true,
      tableData: {
        id: focusFormRef.value.id,
        model: focusFormRef.value.props?.model,
        validateCustomKey: existedCustomKey,
      },
      formData: {
        ...data,
        specificConfig,
      },
      isOldData: false,
    });
  };

  // 自定义-保存
  const customHandleOk = (form) => {
    if (focusFormRef.value.props?.customFieldList) {
      const formIdx = (focusFormRef.value.children || []).findIndex(
        (e) => e.props.fieldId === form.key,
      );
      if (formIdx > -1) {
        const obj = cloneDeep(focusFormRef.value.children![formIdx!]);
        focusFormRef.value.children?.splice(formIdx!, 1, {
          ...obj,
          id: '',
          alias: form.name,
          props: {
            ...obj.props,
            fieldName: form.name,
          },
        });
        nextTick(() => {
          focusFormRef.value.children![formIdx!].id = obj.id;
        });
      }
      const customList = focusFormRef.value.props?.customFieldList;
      const idx = customList.findIndex((e) => e.key === form.key);
      if (idx > -1) customList.splice(idx, 1, { ...customList[idx], ...form });
      else customList.unshift({ ...form });
    } else {
      focusFormRef.value.props!['customFieldList'] = [{ ...form }];
    }
  };

  // 自定义-删除
  const deleteCustomField = (i, row) => {
    customAddList.value.splice(i, 1);
    const idx = (focusFormRef.value.children || []).findIndex((e) => e.props.fieldId === row.key);
    if (idx > -1) focusFormRef.value.children?.splice(idx, 1);
  };

  // 自定义-校验字段key
  const existedCustomKey = (csField) => {
    if (customAddList.value.some((e) => !csField.isEdit && e.key === csField.key)) {
      message.error(t('sys.pageDesigner.showFieldExisted', { field: 'KEY' }));
      return true;
    }
    return false;
  };
</script>

<style lang="less" scoped>
  .field-wrapper {
    display: flex;
    flex-direction: column;
    // padding: 12px;
    height: 100%;
    overflow: hidden;
  }

  .model-info {
    padding: 8px 12px 0;
  }

  .field-search {
    padding: 0 12px 12px;
  }

  .field-list {
    position: relative;
    padding: 0 12px;
  }

  .field-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    &-title {
      height: 44px;
      margin-bottom: 8px;
      padding: 0 12px;
      background-color: #fff;
      line-height: 44px;
    }
  }

  .iconfont.opt-icon {
    color: #797a7d;
    cursor: pointer;
  }

  :deep(.ant-tabs) {
    flex: 1;

    .ant-tabs-nav {
      margin-bottom: 12px;
      padding: 0 12px;
    }

    .ant-tabs-nav-wrap {
      border-bottom: 1px solid @gct-modal-border-color;

      .ant-tabs-nav-list {
        .ant-tabs-tab {
          padding: 8px 16px 12px;
          color: #272727;
          font-size: 12px;
        }
      }
    }

    .ant-tabs-content {
      height: 100%;
    }
  }

  :deep(.ant-input.ant-input-sm) {
    font-size: 12px;
    line-height: 1.2;
  }
</style>
