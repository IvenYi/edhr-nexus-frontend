<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    width="900px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-tabs v-model:activeKey="state.eventCategory" tab-position="left">
      <a-tab-pane
        :key="EventCategory.INNER"
        :tab="t('sys.pageDesigner.innerEvent')"
        v-if="showTab(EventCategory.INNER)"
      >
        <a-row>
          <a-col class="flex-col">
            <div
              class="title-header"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-right: 12px;
              "
            >
              <span>{{ t('sys.pageDesigner.resEvent') }}</span>
              <a-popover :visible="visible" placement="rightTop" trigger="click">
                <template #content>
                  <close-outlined
                    style="position: absolute; top: 8px; right: 15px"
                    @click="visible = false"
                  />
                  <a-list size="small" :data-source="innerType" style="width: 300px">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-button type="link" @click="addToInnerEvent(item)">{{
                          t(innerEvent[item].title)
                        }}</a-button>
                      </a-list-item>
                    </template>
                  </a-list>
                </template>
                <template #title>
                  <span>{{ t('sys.pageDesigner.innerEvent') }}</span>
                </template>
                <a-button type="link">
                  <template #icon>
                    <plus-square-outlined @click="visible = true" />
                  </template>
                </a-button>
              </a-popover>
            </div>
            <ul class="self-action-ul">
              <li
                v-for="(event, index) in state.inner"
                class="event-li"
                @click="clickInnerFunction(event)"
                :class="clickInner === event.key ? 'selected' : null"
                :key="index"
              >
                <div>{{ t(event.title) }}</div>
                <delete-outlined @click.stop="deleteInner(event, index)" />
              </li>
            </ul>
          </a-col>
          <a-col class="flex-col" style="flex: 1">
            <a-form
              v-if="!!clickInner || innerForm"
              layout="vertical"
              :model="innerForm"
              ref="innerJsForm"
              class="js-form"
              autocomplete="off"
            >
              <a-form-item
                :label="t('sys.pageDesigner.scope')"
                name="scopeId"
                v-if="innerForm!.name === INNER_EVENT.REFRESH_TABLE"
              >
                <a-select v-model:value="innerForm!.scopeId" @change="innerForm!.refId = ''">
                  <a-select-option value="">{{ t('sys.pageDesigner.page') }}</a-select-option>
                  <a-select-option
                    v-for="(modal, index) in pageJson.modals"
                    :key="index"
                    :value="modal.id"
                    >{{ `${t(modal.name)}[${modal.id}] ` }}</a-select-option
                  >
                </a-select>
              </a-form-item>
              <a-form-item :label="t('sys.pageDesigner.refWidget')" name="refId">
                <a-select v-model:value="innerForm!.refId" :placeholder="t('sys.chooseText')">
                  <a-select-option
                    v-for="(widget, index) in refWidgets"
                    :key="index"
                    :value="widget.id"
                    >{{ `${t(widget.modalName)}[${widget.id}] ` }}</a-select-option
                  >
                </a-select>
              </a-form-item>
              <a-form-item
                label=""
                name="syncBtnNameToModal"
                v-if="
                  innerForm!.name === INNER_EVENT.OPEN_MODAL &&
                  selectedRef.type === FormComponents.CustomButton
                "
              >
                <a-checkbox v-model:checked="syncBtnNameToModal">{{
                  t(`sys.pageDesigner.syncBtnNameToModal`)
                }}</a-checkbox>
              </a-form-item>
            </a-form>
            <!-- <div class="title-header">参数设置</div>
            <template v-if="Event.InnerActionType.OPENURL === innerType">
              <div class="area-header">网站地址</div>
              <a-input v-model:value="url" class="ele"></a-input>
              <div class="area-header">新开页面</div>
              <a-switch v-model:checked="newPageFlag" style="width: 30px" class="ele" />
              <div class="area-header">外部链接</div>
              <a-switch v-model:checked="outerLinkFlag" style="width: 30px" class="ele" />
            </template> -->
          </a-col>
        </a-row>
      </a-tab-pane>
      <a-tab-pane
        :key="EventCategory.JS"
        :tab="t('sys.pageDesigner.jsEvent')"
        v-if="showTab(EventCategory.JS)"
      >
        <a-row>
          <a-col class="flex-col">
            <div class="title-header">{{ t('sys.pageDesigner.resEvent') }}</div>
            <div class="border-div">
              <a-input v-model:value="searchText" @change="handleSearchMethods">
                <template #prefix>
                  <!-- <search-outlined /> -->
                  <i class="iconfont icon-sousuo1"></i>
                </template>
              </a-input>
              <ul class="method-ul">
                <li
                  class="event-li"
                  @click="clickNewEventFunction"
                  :class="state.js.isNew ? 'selected' : null"
                  ><span class="ell">{{ t('sys.pageDesigner.addNewEvent') }}</span></li
                >
                <li
                  class="event-li"
                  v-for="item in methods"
                  :key="item"
                  @click="clickEventFunction(item)"
                  :class="item == state.js.methodName && !state.js.isNew ? 'selected' : null"
                  ><span class="ell" :title="item">{{ item }}</span></li
                >
              </ul>
            </div>
          </a-col>
          <a-col style="flex: 1; min-width: 10px">
            <a-form
              layout="vertical"
              :model="state.js"
              ref="jsForm"
              class="js-form"
              autocomplete="off"
            >
              <a-form-item
                :label="t('sys.pageDesigner.eventName')"
                name="methodName"
                :rules="[
                  {
                    required: true,
                    message: t('sys.pageDesigner.eventName') + t('sys.pageDesigner.cannotBeEmpty'),
                  },
                  { validator: validateName },
                ]"
                v-if="state.js.isNew"
              >
                <a-input v-model:value="state.js.methodName" />
              </a-form-item>
              <a-form-item label="" name="extParams" :rules="[{ validator: validateJSON }]">
                <code-editor
                  v-model:value="state.js.extParams"
                  language="json"
                  ref="editorRef"
                  :theme="Theme.VS"
                  style="height: 100%"
                >
                  <template #title>
                    <span class="title-header">{{ t('sys.pageDesigner.extParamSetting') }}</span>
                  </template>
                </code-editor>
              </a-form-item>
            </a-form>
          </a-col>
        </a-row>
      </a-tab-pane>
      <a-tab-pane
        :key="EventCategory.LO"
        :tab="t('sys.pageDesigner.orchestrationLogic')"
        v-if="false"
      >
        <!-- v-if="showTab(EventCategory.LO)" -->
        <a-row>
          <a-col class="flex-col">
            <div class="title-header">{{ t('sys.pageDesigner.resEvent') }}</div>
            <div class="border-div">
              <a-input v-model:value="searchText" @change="handleSearchMethods">
                <template #prefix>
                  <!-- <search-outlined /> -->
                  <i class="iconfont icon-sousuo1"></i>
                </template>
              </a-input>
              <ul class="method-ul">
                <li
                  class="event-li"
                  @click="clickNewEventLoFunction"
                  :class="state.lo.isNew ? 'selected' : null"
                >
                  <span class="ell">{{ t('sys.pageDesigner.addOrchestration') }}</span></li
                >
                <li
                  class="event-li"
                  v-for="(loItem, key) in groupLos"
                  :key="key"
                  @click="clickEventLoFunction(loItem)"
                  :class="key == state.lo.methodName && !state.lo.isNew ? 'selected' : null"
                  ><span class="ell">{{ key }}</span></li
                >
              </ul>
            </div>
          </a-col>
          <a-col style="flex: 1; min-width: 10px">
            <a-form
              layout="vertical"
              :model="state.lo"
              ref="loForm"
              class="js-form"
              autocomplete="off"
            >
              <a-form-item :label="t('sys.pageDesigner.loKey')" name="methodName">
                <a-input disabled v-model:value="state.lo.methodName" />
              </a-form-item>
              <a-form-item
                :label="t('sys.pageDesigner.loName')"
                name="methodTitle"
                :rules="[{ required: true }]"
              >
                <a-input v-model:value="state.lo.methodTitle" />
              </a-form-item>
              <a-form-item label="" name="extParams" :rules="[{ validator: validateJSON }]">
                <code-editor
                  v-model:value="state.lo.extParams"
                  language="json"
                  ref="loEditorRef"
                  :theme="Theme.VS"
                  style="height: 100%"
                >
                  <template #title>
                    <span class="title-header">{{ t('sys.pageDesigner.extParamSetting') }}</span>
                  </template>
                </code-editor>
              </a-form-item>
            </a-form>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect, watch, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { EventCategory, INNER_EVENT, FormComponents } from '/@page-designer/enum';
  import { EventModalState } from '/@page-designer/types/panel';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import { Theme } from '/@/components/code-editor/useMonacoEditor';
  import { FormInstance } from 'ant-design-vue';
  import { innerType, innerEvent } from '/@page-designer/constant/events';
  import { cloneDeep } from 'lodash-es';
  import { LowCodeWidget } from '../../../../types/widget-basic-types';
  import { LowCodeModal } from '../../../../types/modal-types';
  import { findNodeAll } from '/@/utils/helper/treeHelper';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const props = defineProps<{
    hiddenEventCategory?: EventCategory[];
  }>();
  function showTab(key: EventCategory) {
    const hiddenEventCategory = props.hiddenEventCategory || [];
    return hiddenEventCategory.indexOf(key) === -1;
  }
  const { t } = useI18n();
  const { methodMap, pageJson, groupLos } = useDesigner();
  const searchText = ref<string>('');
  const emit = defineEmits(['ok', 'register', 'afterClose']);
  const editorRef = ref();
  const loEditorRef = ref();
  const jsForm = ref<FormInstance>();
  const loForm = ref<FormInstance>();
  const innerJsForm = ref<FormInstance>();
  /**内置事件propover的visible */
  const visible = ref(false);
  const clickInner = ref<INNER_EVENT>();
  const state = ref<EventModalState>({
    eventCategory: EventCategory.INNER,
    inner: [],
    js: {
      isNew: true,
      methodName: '',
      extParams: '{}',
    },
    lo: {
      isNew: true,
      methodName: '',
      methodTitle: '',
      extParams: '{}',
    },
  });
  const title = ref(t('sys.pageDesigner.eventBind'));
  const { selectedRef } = useSelectedWidget();

  const generateLoId = () => {
    return 'lo_' + Math.random().toString(32).slice(2, 10);
  };
  watch(
    () => state.value.eventCategory,
    async (value) => {
      if (value === EventCategory.LO && !state.value.lo.methodName) {
        const newName = generateLoId();
        state.value.lo.methodName = newName;
        state.value.lo.methodTitle = newName;
        await nextTick();
        loEditorRef.value?.reload(state.value.lo.extParams);
      }
    },
  );

  //打开弹框传参
  const [registerInner] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = async (data) => {
    console.log('selectedRef.value', selectedRef.value);
    title.value = t('sys.pageDesigner.eventBind');
    const { eventCategory, name, eventType, event, isEdit } = data;
    let evtCate = eventCategory;
    if (!evtCate) {
      if (event) {
        evtCate = EventCategory.INNER;
      } else if ((name && groupLos.value[name]) || (eventType && groupLos.value[eventType])) {
        evtCate = EventCategory.LO;
      } else {
        evtCate = EventCategory.JS;
      }
    }
    if (isEdit) {
      title.value = t('sys.pageDesigner.eventEdit');
    }
    if (evtCate === EventCategory.INNER) {
      state.value.eventCategory = EventCategory.INNER;
      state.value.inner = cloneDeep(data.event);
    } else if (evtCate === EventCategory.LO) {
      const { isEdit, eventType, name, extraParams } = data;
      state.value.eventCategory = EventCategory.LO;
      eType = eventType;
      if (isEdit) {
        state.value.lo.isNew = false;
        state.value.lo.methodName = name;
        state.value.lo.methodTitle = groupLos.value[name].title;
        state.value.lo.extParams = JSON.stringify(extraParams);
      } else {
        const newName = generateLoId();
        state.value.lo.methodName = newName;
        state.value.lo.methodTitle = newName;
      }
    } else {
      const { isEdit, eventType, name, extraParams } = data;
      state.value.js.methodName = eventType;
      state.value.eventCategory = EventCategory.JS;
      eType = eventType;
      if (isEdit) {
        state.value.js.isNew = false;
        state.value.js.methodName = name;
        state.value.js.extParams = JSON.stringify(extraParams);
      }
    }
    await nextTick();
    editorRef.value?.reload(state.value.js.extParams);
  };
  const handleClose = () => {
    jsForm.value?.resetFields();
    loForm.value?.resetFields();
    innerJsForm.value?.resetFields();
    resetState();
    emit('afterClose');
  };
  const handleOk = () => {
    if (state.value.eventCategory === EventCategory.JS) {
      jsForm.value?.validate().then(() => {
        const js = state.value.js;
        const event = {
          extParams: js.extParams ? JSON.parse(js.extParams) : {},
          methodName: js.methodName,
          isNew: js.isNew,
        };
        emit('ok', { event, eventCategory: EventCategory.JS });
      });
    } else if (state.value.eventCategory === EventCategory.LO) {
      loForm.value?.validate().then(() => {
        const lo = state.value.lo;
        const event = {
          extParams: lo.extParams ? JSON.parse(lo.extParams) : {},
          methodName: lo.methodName,
          methodTitle: lo.methodTitle,
          isNew: lo.isNew,
        };
        emit('ok', { event, eventCategory: EventCategory.LO });
      });
    } else {
      emit('ok', { event: cloneDeep(state.value.inner), eventCategory: EventCategory.INNER });
    }
  };
  let eType = '';
  const clickNewEventFunction = () => {
    state.value.js.isNew = true;
    state.value.js.methodName = eType;
  };
  const clickEventFunction = (name) => {
    state.value.js.methodName = name;
    state.value.js.isNew = false;
  };
  const clickNewEventLoFunction = () => {
    if (state.value.lo.isNew) return;
    const newName = generateLoId();
    state.value.lo.isNew = true;
    state.value.lo.methodName = newName;
    state.value.lo.methodTitle = newName;
  };
  const clickEventLoFunction = (loItem) => {
    const { name, title } = loItem;
    state.value.lo.methodName = name;
    state.value.lo.methodTitle = title;
    state.value.lo.isNew = false;
  };
  const methods = computed({
    get() {
      return Object.keys(methodMap.value);
    },
    set(val) {
      methods.value = val;
    },
  });
  /**搜索过滤methods */
  const handleSearchMethods = () => {
    if (searchText.value) {
      methods.value = methods.value.filter((d) => {
        return d == searchText.value;
      });
    } else {
      methods.value = Object.keys(methodMap.value);
    }
  };
  /**校验名称是否重复 */
  const validateName = async (_rule, value) => {
    if (value && !/^[a-zA-Z_][a-zA-Z_0-9]?/.test(value)) {
      return Promise.reject(t('sys.pageDesigner.methodsFormat'));
    }
    const methodNames = Object.keys(methodMap.value);
    const name = methodNames.find((d) => {
      return value == d;
    });
    if (name) {
      return Promise.reject(t('sys.pageDesigner.notUniqueMethod'));
    } else {
      return Promise.resolve();
    }
  };
  /**校验是否是JSON */
  const validateJSON = async () => {
    // this.$refs.editorRef.handleFullScreenClick();
    if (
      (
        (state.value.eventCategory === EventCategory.JS ? editorRef : loEditorRef) as any
      ).value.getEditorMarkers().length
    ) {
      return Promise.reject(t('sys.pageDesigner.pleaseCheckJSON'));
    } else {
      return Promise.resolve();
    }
  };
  const resetState = () => {
    visible.value = false;
    clickInner.value = undefined;
    state.value = {
      eventCategory: EventCategory.INNER,
      inner: [],
      js: {
        isNew: true,
        methodName: '',
        extParams: '{}',
      },
      lo: {
        isNew: true,
        methodName: '',
        methodTitle: '',
        extParams: '{}',
      },
    };
  };
  const addToInnerEvent = (name) => {
    state.value.inner.push({
      ...innerEvent[name],
      key: buildShortUUID(),
    });
  };
  const clickInnerFunction = (event) => {
    //先把popover关闭
    visible.value = false;
    clickInner.value = event.key;
  };
  const innerForm = computed(() => {
    return state.value.inner.find((d) => d.key === clickInner.value);
  });

  const syncBtnNameToModal = computed({
    get() {
      return !!innerForm.value?.modalTitle;
    },
    set(val) {
      if (innerForm.value) {
        if (val) {
          innerForm.value.modalTitle = selectedRef.value?.preLocation
            ? selectedRef.value?.preLocation + '.' + selectedRef.value?.id
            : selectedRef.value?.id;
        } else {
          innerForm.value.modalTitle = '';
        }
      }
    },
  });
  const deleteInner = (event, index) => {
    if (clickInner.value === event.key) {
      clickInner.value = undefined;
    }
    state.value.inner.splice(index, 1);
  };
  const refWidgets = ref<LowCodeWidget.BasicSchema[] | LowCodeModal.Modal[]>([]);
  const listOptions = [
    FormComponents.DataTable,
    FormComponents.DataVTable,
    FormComponents.CardList,
    FormComponents.DataList,
    FormComponents.RdoDataList,
    FormComponents.TreeTable,
    FormComponents.RefDataTable,
    FormComponents.Form,
    FormComponents.RdoForm,
    FormComponents.RdoTable,
    FormComponents.MedProRdoForm,
    FormComponents.MedProRdoTable,
  ];
  watchEffect(() => {
    if (innerForm.value?.name === INNER_EVENT.REFRESH_TABLE) {
      let scope: any = pageJson.widgets;
      if (innerForm.value.scopeId) {
        scope = pageJson.modals.find((modal) => innerForm.value?.scopeId === modal.id)?.children;
      }
      refWidgets.value = findNodeAll(scope, (widget) => {
        return listOptions.indexOf(widget.type) > -1;
      }) as LowCodeWidget.BasicSchema[];
    } else {
      refWidgets.value = pageJson.modals;
    }
  });
</script>

<style lang="less" scoped>
  .title-header {
    height: 30px;
    font-weight: bold;
    text-align: left;
    // display: flex;
    // justify-content: space-between;
    // margin-right: 12px;
    // align-items: center;
  }

  .flex-col {
    display: flex;
    flex-direction: column;

    .border-div {
      width: 150px;
      height: 100%;
      margin-right: 20px;
      border: 1px solid rgb(31 56 88 / 10%);
    }
  }

  .event-li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px;
    padding-left: 5px;
    cursor: pointer;
  }

  .selected {
    background-color: rgb(31 56 88 / 10%);
  }

  .self-action-ul {
    width: 150px;
    height: 300px;
    margin-right: 20px;
    overflow: auto;
    border: 1px solid rgb(31 56 88 / 10%);
  }

  .area-header {
    display: flex;
    align-items: center;
    height: 30px;
    margin-bottom: 10px;
    padding-left: 10px;
    border-top: 1px solid rgb(31 56 88 / 10%);
    border-bottom: 1px solid rgb(31 56 88 / 10%);
    background-color: #f5f6f7;
    font-size: 14px;
  }

  .ele {
    margin-bottom: 10px;
  }

  .js-form {
    :deep(.ant-form-item-label) {
      font-weight: bold;
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
