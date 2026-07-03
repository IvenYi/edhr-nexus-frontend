<template>
  <basic-modal
    v-bind="{ ...$attrs, 'z-index': 1001, okButtonProps: { disabled: disabledOk } }"
    @register="registerInner"
    :min-height="40"
    :title="exprOptions?.modalTitle || t('sys.expression.regularExpr')"
    centered
    width="800px"
    :canFullscreen="true"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    :getContainer="getContainer"
    :z-index="9999"
  >
    <div class="re-modal" ref="reModelRef">
      <a-form
        layout="inline"
        class="expression-form"
        v-if="
          [ExpressionModeEnum.DATA_SET_FORMULA,ExpressionModeEnum.GATEWAY_RULE, ExpressionModeEnum.CREATE_FIELD, ExpressionModeEnum.PAAS_CREATE_FIELD, ExpressionModeEnum.ENTITY_FORMULA,ExpressionModeEnum.RUN_FORMULA,ExpressionModeEnum.BI_FORMULA].includes(
            exprOptions?.mode as ExpressionModeEnum,
          )
        "
        ref="FormRef"
        :model="formState"
        autocomplete="off"
      >
        <a-form-item
          :label="t('sys.pageDesigner.ruleName')"
          name="exprName"
          v-if="exprOptions?.mode === ExpressionModeEnum.GATEWAY_RULE"
          :rules="[
            {
              required: true,
              whitespace: true,
              message: t('sys.notEmptySth', { sth: t('sys.pageDesigner.ruleName') }),
            },
          ]"
        >
          <a-input v-model:value="formState.exprName" />
        </a-form-item>
        <a-form-item
          :label="t('sys.expression.returnValueType')"
          v-if=" [ExpressionModeEnum.DATA_SET_FORMULA,ExpressionModeEnum.CREATE_FIELD,  ExpressionModeEnum.PAAS_CREATE_FIELD, ExpressionModeEnum.ENTITY_FORMULA,ExpressionModeEnum.RUN_FORMULA].includes(
            exprOptions?.mode as ExpressionModeEnum,
          )
          "
        >
          <a-select
            style="width: 220px"
            :get-popup-container="() => reModelRef"
            v-model:value="formState.returnType"
            :disabled="!!formState.disabledReturnType"
          >
            <a-select-option v-for="value in returnTypeOptions" :key="value" :value="value">
              {{ t('sys.expression.' + value) }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          style="width: 130px"
          v-if="formState.returnType===EntityFormulaReturnTypeEnum.Double&& [ ExpressionModeEnum.ENTITY_FORMULA,ExpressionModeEnum.RUN_FORMULA,ExpressionModeEnum.PAAS_CREATE_FIELD].includes(
            exprOptions?.mode as ExpressionModeEnum,
          )"
          :label="`${t('sys.model.decimalDigits')}`"
        >
          <a-input-number
            v-model:value="formState.fieldProps.digits"
            @blur="formState.fieldProps.digits = formState.fieldProps.digits || 0"
            :min="0"
            :precision="0"
            :max="8"
          />
        </a-form-item>
        <a-form-item
          v-if="formState.returnType===EntityFormulaReturnTypeEnum.Boolen&& [ ExpressionModeEnum.ENTITY_FORMULA,ExpressionModeEnum.RUN_FORMULA].includes(
            exprOptions?.mode as ExpressionModeEnum,
          )"
          :label="`${t('sys.expression.booleanText')}`"
        >
          <a-input
            style="width: 60px"
            :allowClear="false"
            v-model:value="formState.fieldProps.trueText"
            @blur="onBooleanblur('trueText', $t('sys.pageDesigner.true'))"
            class="mr8px"
          />
          <a-input
            :allowClear="false"
            style="width: 60px"
            v-model:value="formState.fieldProps.falseText"
            @blur="onBooleanblur('falseText', $t('sys.pageDesigner.false'))"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.pageDesigner.fieldTitle')"
          name="exprName"
          v-if="exprOptions?.mode === ExpressionModeEnum.BI_FORMULA"
          :rules="[
            {
              required: true,
              whitespace: true,
              message: t('sys.notEmptySth', { sth: t('sys.pageDesigner.fieldTitle') }),
            },
          ]"
        >
          <a-input v-model:value="formState.exprName" />
        </a-form-item>
      </a-form>

      <div class="flex re-modal__section">
        <div class="re-modal__left ks-row">
          <div class="re-modal__left-tabs">
            <div
              v-for="tab in exprTabs"
              class="re-modal__left-tabs-item"
              @click="changeExpre(tab)"
              :class="{ active: activeKey === tab }"
              :key="tab"
            >
              <!-- ModeTabDict -->
              <span :class="ModeTabDict[tab].icon"> </span>
              <div class="text-12px">{{ t('sys.expression.' + tab) }}</div>
            </div>
          </div>
          <div class="ks-col pt16px ks-column overflow-hidden">
            <div
              class="pl16px pr16px mb8px"
              v-if="
                activeKey === ExpressionTabEnum.FIELD || activeKey === ExpressionTabEnum.OPERATOR || activeKey === ExpressionTabEnum.PARAMS
              "
            >
              <div
                class="mb8px ks-row-middle"
                v-if="exprOptions?.mode === ExpressionModeEnum.RUN_FORMULA"
              >
                <span class="mr4px whitespace-nowrap">
                  {{ t('sys.pageDesigner.selectModel') }}:</span
                >
                <a-select
                  show-search
                  :filterOption="filterOption"
                  @change="changeModel"
                  :get-popup-container="() => reModelRef"
                  class="w160px"
                  v-model:value="formulaConditionsFormState.modelKey"
                  :placeholder="t('sys.pleaseSelectSth')"
                  :options="formulaConditionsFormState.modelData"
                >
                </a-select>
              </div>
              <div
                class="mb8px"
                v-if="exprOptions?.mode === ExpressionModeEnum.MEDPRO_BUSINESSFLOW"
              >
                <a-select
                  class="w100%"
                  v-model:value="businessFlowFormState.selectNode"
                  :placeholder="t('sys.pleaseSelectSth')"
                  :get-popup-container="() => reModelRef"
                >
                  <a-select-option
                    v-for="(item, index) in businessFlowFormState.businessTreeData"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.nodeName }}
                  </a-select-option>
                </a-select>
              </div>
              <a-input v-model:value.trim="keyWord" :placeholder="t('sys.searchText')">
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input>
            </div>
            <div class="ks-col overflow-auto">
              <identifier-tree
                :key="businessFlowFormState.selectNode + activeKey"
                :tree-data="treeData"
                @hover="handleHover"
                @trigger="handleClick"
              />
            </div>
            <div
              class="h170px bg-[#F7F7F7] p16px overflow-auto text-12px text-[#5D6474] whitespace-pre-line"
              v-show="note !== undefined"
            >
              {{ note || t('sys.expression.noteIsNull') }}
            </div>
          </div>
        </div>
        <div class="re-modal__right">
          <div class="re-modal__editor ks-col">
            <div class="re-modal__section-title">{{ t('sys.expression.index') }}=</div>
            <iframe
              ref="iframeRef"
              @load="handleExpressIframeLoad"
              :src="expressionIframeUrl"
              frameborder="0"
            ></iframe>
          </div>
          <div
            class="re-modal__usage h170px"
            v-if="
              exprOptions?.mode !== ExpressionModeEnum.DATA_SET_FORMULA ||
              formState.returnType !== 'string'
            "
          >
            <a-tabs activeKey="1" size="small">
              <a-tab-pane key="1">
                <template #tab> <span> {{ t('sys.appDesigner.problem') }} </span> <a-badge :count="errors.length" /> </template>
                <errorList :errors="errors" @onMarkerByEvent="onMarkerByEvent" />
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
  import { ExpressionTabEnum, ExpressionModeEnum, EntityFormulaReturnTypeEnum } from '../types';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModeTabDict } from '../constant/modeCfg';
  import { checkExpr } from '../utils/expression';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { genUrl } from '/@/utils';
  import IdentifierTree from './identifier-tree.vue';
  import type { FormInstance } from 'ant-design-vue';
  import { message, Modal } from 'ant-design-vue';
  import { useRunFormula } from '../hooks/useCommon';
  import { useExpression } from '../hooks/useExpression';
  import { useParamsHook } from '../hooks/useParamsHook';
  import errorList from './errorList.vue';

  const iframeRef = ref<HTMLIFrameElement>();
  const disabledOk = ref(false);
  const { t } = useI18n();
  const errors = ref([]);
  const {
    exprOptions,
    destory,
    exprSyncFn,
    containerId,
    exprTabs,
    globalIdentifiersTyped,
    returnTypeOptions,
  } = useExpression(false);
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    formState.exprName = exprOptions.value?.exprName ?? '';
    formState.returnType = exprOptions.value?.returnType ?? '';
    formState.disabledReturnType = exprOptions.value?.disabledReturnType ?? false;
    if (exprOptions?.value?.fieldProps) {
      Object.assign(formState.fieldProps, exprOptions.value.fieldProps);
    }
  });

  function onBooleanblur(key, value) {
    nextTick(() => {
      formState.fieldProps[key] = formState.fieldProps[key] || value;
    });
  }
  const { formulaConditionsFormState, initFields, changeModel } = useRunFormula({
    exprOptions,
    iframeRef,
  });

  const { initParamsList } = useParamsHook({ exprOptions });
  const usePathQuery = usePathQueryStore();
  const keyWord = ref();
  const reModelRef = ref();
  const filterOption = (text, item) => {
    if (item.options) return false;
    return item.label.includes(text?.trim());
  };
  let expressionIframeRef: any = null;
  const expressionIframeUrl = genUrl(
    `${location.origin}${import.meta.env.VITE_PATHNAME_FORMULA}?_t=${Date.now()}`,
    {
      aid: usePathQuery.getAid(),
    },
  );

  const activeKey = ref<ExpressionTabEnum>(exprTabs.value[0]);
  /**业务流节点相关数据 */
  const businessFlowFormState = <
    { selectNode?: string; businessTreeData: any[]; fixedData: any[] }
  >reactive({
    //选中的节点id
    selectNode: undefined,
    //**选中的 */
    businessTreeData: [],
    /**固定的节点 */
    fixedData: [],
  });

  const FormRef = ref<FormInstance>();
  const formState: {
    exprName?: string;
    /**返回值 */
    returnType?: string;
    disabledReturnType?: boolean;
    fieldProps: {
      /**小数位数 */
      digits: number;
      /**布尔值真 */
      trueText: string;
      /**布尔值假 */
      falseText: string;
    };
  } = reactive({
    fieldProps: {
      digits: 0,
      trueText: t('sys.pageDesigner.true'),
      falseText: t('sys.pageDesigner.false'),
    },
  });

  watch(formState, () => {
    if (!exprOptions.value) {
      return;
    }
    exprOptions.value.returnType = formState.returnType;
    const win = iframeRef.value!.contentWindow!;
    if (!win) {
      return;
    }
    const expr = {
      ...exprOptions.value,
      returnType:
        exprOptions.value?.mode === ExpressionModeEnum.DATA_SET_FORMULA &&
        formState.returnType === 'string'
          ? ''
          : exprOptions.value?.returnType,
    };
    if (win.GCT_EXPRESSION_WINDOW) {
      win.GCT_EXPRESSION_WINDOW.updateOpts(expr);
    } else {
      win.GCT_EXPRESSION_WINDOW = {
        options: expr,
      };
    }
    if (formState.returnType !== 'string') {
      handleExpressIframeLoad();
    }
  });

  const note = ref<string>();

  const emit = defineEmits(['register']);

  const getContainer = () => document.querySelector(`#${containerId.value}`);

  const handleClose = () => {
    formState.exprName = '';
    destory();
  };

  const handleOk = async () => {
    try {
      if (FormRef.value) {
        await FormRef.value.validate();
      }
      const expr: [string, string] = expressionIframeRef!.GCT_EXPRESSION_WINDOW.getExpression();
      const { ok } = await checkExpr(expr[0]);
      if (!ok) {
        message.warn('表达式错误');
      }
      if (exprOptions.value?.beforeClose && typeof exprOptions.value.beforeClose === 'function') {
        const result = await exprOptions.value.beforeClose(
          expr[0],
          expr[1],
          formState.returnType || '',
          { modelKey: formulaConditionsFormState.modelKey, ...formState },
        );
        if (!result) return;
      }
      if (exprOptions.value!.callback && typeof exprOptions.value!.callback === 'function') {
        exprOptions.value!.callback(...expr, {
          expr: expr[0],
          exprEcho: expr[1],
          modelKey: formulaConditionsFormState.modelKey,
          ...formState,
        });
      }
      exprSyncFn.value[0]!(expr);
      closeModal();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleClick = (data) => {
    const { children, _id_, _type_ } = data;
    if (children) return;
    if (_type_ === ExpressionTabEnum.FUNCTION) {
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.insertFunction(_id_);
    } else if (_type_ === ExpressionTabEnum.OPERATOR) {
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.insertText(_id_);
    } else {
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.insertBlock(_id_);
    }
  };

  const handleHover = ({ desc }) => {
    note.value = desc;
  };

  const handleExpressIframeLoad = () => {
    expressionIframeRef = iframeRef.value!.contentWindow!;
    if (
      expressionIframeRef!.GCT_EXPRESSION_WINDOW &&
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.openIframe
    ) {
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.openIframe(exprOptions.value);
    } else {
      const expr = {
        ...exprOptions.value,
        returnType:
          exprOptions.value?.mode === ExpressionModeEnum.DATA_SET_FORMULA &&
          formState.returnType === 'string'
            ? ''
            : exprOptions.value?.returnType,
      };
      expressionIframeRef!.GCT_EXPRESSION_WINDOW = {
        options: expr,
      };
    }
    // 数据集且等于字符串时不校验
    if (
      exprOptions.value?.mode !== ExpressionModeEnum.DATA_SET_FORMULA ||
      formState.returnType !== 'string'
    ) {
      expressionIframeRef.GCT_EXPRESSION_WINDOW.expressionMessage = (v) => {
        errors.value = v.errors || [];
        disabledOk.value = !!errors.value.length;
      };
    }
  };

  function replaceI18n(text: string) {
    return text.replace(/\$t\('([^']+)'\)/g, (_, key) => t(key) || key)
  }

  const originData = computed(() => {
    let data = globalIdentifiersTyped.value[activeKey.value] as any[];
    data = data.map(item => {
      return {
        ...item,
        name: t(item.name),
        children: item.children?.map(child => {
          return {
            ...child,
            desc: child.desc ? replaceI18n(child.desc) : undefined,
          }
        })
      }
    });
    if (activeKey.value === ExpressionTabEnum.FIELD) {
      if (exprOptions.value?.mode === ExpressionModeEnum.MEDPRO_BUSINESSFLOW) {
        /**业务流节点字段过滤逻辑 */

        return businessFlowFormState.selectNode
          ? [
              data.find((i) => i.id === businessFlowFormState.selectNode),
              ...businessFlowFormState.fixedData,
            ]
          : [...businessFlowFormState.fixedData];
      }
    }
    return data;
  });

  const treeData = computed(() => {
    if (activeKey.value === ExpressionTabEnum.FIELD && keyWord.value) {
      /**字段关键字过滤*/
      // if (originData.value[0].children) {
      //   /**二級tree */
      //   return originData.value
      //     .map((i) => {
      //       const children = i.children.filter((t) => t.name.includes(keyWord.value)) || [];
      //       return { ...i, children };
      //     })
      //     .filter((i) => i.children.length);
      // } else {
      //   return originData.value?.filter((t) => t.name.includes(keyWord.value)) || [];
      // }
      return searchDataByKeyWord(originData.value);
    } else if (activeKey.value === ExpressionTabEnum.OPERATOR && keyWord.value) {
      const _f = originData.value?.filter((t) => t.name.includes(keyWord.value)) || [];
      if (!!_f.length) return _f;
      return originData.value
        .map((i) => {
          const children = i.children.filter((t) => t.name.includes(keyWord.value)) || [];
          return { ...i, children };
        })
        .filter((i) => i.children.length);
    } else {
      return originData.value;
    }
  });

  function searchDataByKeyWord(list) {
    return (
      list
        .map((item) => {
          if (item.children?.length) {
            const children = searchDataByKeyWord(item.children);
            return { ...item, children };
          }
          return item;
        })
        .filter((t) => t.name.includes(keyWord.value) || t.children?.length) || []
    );
  }

  function onMarkerByEvent(i, event) {
    expressionIframeRef.GCT_EXPRESSION_WINDOW &&
      expressionIframeRef.GCT_EXPRESSION_WINDOW[event](i);
  }

  function changeExpre(tab) {
    activeKey.value = tab;
    note.value = '';
    keyWord.value = '';
  }
  onMounted(async () => {
    if (exprOptions.value?.mode === ExpressionModeEnum.MEDPRO_BUSINESSFLOW) {
      const data = globalIdentifiersTyped.value[ExpressionTabEnum.FIELD] as any[];
      businessFlowFormState.selectNode = data.find((i) => i.defaultValue && !i.fixed)?.id;
      businessFlowFormState.businessTreeData = data.filter((i) => !i.fixed);
      businessFlowFormState.fixedData = data.filter((i) => i.fixed);
    }
    if (exprOptions.value?.mode === ExpressionModeEnum.RUN_FORMULA) {
      initFields(exprOptions.value.modelKey);
    }
    if (exprOptions.value?.mode === ExpressionModeEnum.EDHR_LABEL_PRINT) {
      initParamsList({ modelKey: exprOptions.value.modelKey })
    }
  });
</script>

<style lang="less" scoped>
  .re-modal {
    padding-bottom: 1px;

    &__left {
      display: flex;
      width: 300px;

      &-tabs {
        flex-shrink: 0;
        width: 50px;
        border-right: 1px solid #e0e3ea;
        text-align: center;

        .active {
          background-color: hsl(from var(--ant-primary-color) h s 95%);
          color: var(--ant-primary-color);
        }

        &-item {
          height: 74px;
          padding-top: 15px;
          color: #5d6474;
          cursor: pointer;

          &:hover {
            background-color: hsl(from var(--ant-primary-color) h s 95%);
            color: var(--ant-primary-color);
          }

          span {
            font-size: 20px;
          }
        }
      }
    }

    &__right {
      display: flex;
      flex: 1;
      flex-direction: column;
      border-left: 1px solid #d9d9d9;
    }

    &__section {
      height: 500px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;

      &-title {
        height: 38px;
        padding-left: 16px;
        border-bottom: 1px solid #d9d9d9;
        color: #5d6474;
        font-size: 12px;
        line-height: 38px;

        & + div,
        & + iframe {
          width: 100%;
          height: calc(100% - 38px);
        }
      }
    }

    &__editor {
      padding-bottom: 1px;
    }

    &__usage {
      border-top: 1px solid #d9d9d9;

      & > div:nth-child(2) {
        padding: 8px 16px;
        overflow-y: auto;
        white-space: pre-line;
      }
    }
  }

  :deep(.ant-tabs-nav-wrap) {
    padding: 0 12px;
  }
</style>
