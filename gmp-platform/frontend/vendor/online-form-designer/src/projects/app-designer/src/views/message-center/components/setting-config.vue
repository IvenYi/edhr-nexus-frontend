<template>
  <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
    <a-form-item :label="t('sys.integration.dataSource')" name="custom">
      <a-radio-group v-model:value="formState.custom" @change="changeCustom">
        <a-radio :value="0">{{ t('sys.model') }}</a-radio>
        <a-radio :value="1">{{ t('sys.customize') }}</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      v-if="!formState.custom"
      :label="t('sys.message.relationModal')"
      name="modelKey"
      :rules="[
        {
          required: true,
          message: t('sys.chooseTextTip', { name: t('sys.message.relationModal') }),
        },
      ]"
    >
      <template v-if="props.isEdit">
        <a-input-group compact>
          <a-select
            v-model:value="formState.modelCategory"
            style="width: 80px"
            @change="changeModelCategory"
          >
            <a-select-option value="entity">{{ t('sys.model.entity') }}</a-select-option>
            <a-select-option value="view">{{ t('sys.model.view') }}</a-select-option>
          </a-select>

          <a-select
            ref="select"
            v-model:value="formState.modelKey"
            :options="modelOptionsList[formState.modelCategory]"
            :filter-option="filterOption"
            @change="handleChangeModel"
            show-search
            style="width: 240px"
            :getPopupContainer="(trigger) => trigger.parentNode"
          />
        </a-input-group>
      </template>
      <div v-else style="padding-top: 4px">
        <div>
          {{
            formState.modelCategory === 'entity' ? t('sys.entityModel') : t('sys.model.viewModel')
          }}
        </div>
        <div>
          {{ getOptionsLabel(formState.modelKey, modelOptionsList[formState.modelCategory]) }}
        </div>
      </div>
    </a-form-item>
    <a-form-item :label="t('sys.message.pushType')" :rules="[{ required: true }]">
      <a-checkbox-group
        v-model:value="pushTypeVal"
        v-if="isEdit"
        style="width: 100%"
        @change="changePushTypeVal"
      >
        <div v-for="item in pushTypeList" :key="item.value" class="mt4px push-type-item">
          <div class="mr8px push-type-item-label">
            <a-checkbox :value="item.value" @change="handleSelectPushType(item.value)">
              {{ item.label }}
            </a-checkbox>
          </div>
          <div
            v-if="pushTypeVal.includes(item.value) && item.value !== 'system'"
            :class="{
              'push-type-item-value': true,
              'ant-form-item-has-error': isError.pushType && !pushObjectKey[item.value],
            }"
          >
            <a-select
              ref="select"
              v-model:value="pushObjectKey[item.value]"
              style="margin-top: 4px"
              :options="pushTypeOptionsList[item.value]"
              optionLabelProp="text"
              @change="emitChange"
              :getPopupContainer="(trigger) => trigger.parentNode"
            />
          </div>
        </div>
        <a-row>
          <div class="ant-form-item-explain-error" v-if="isError.pushType">
            {{ t('sys.message.pushTypeError') }}
          </div>
        </a-row>
      </a-checkbox-group>
      <div v-else style="padding-top: 4px">
        <div v-for="item in pushTypeVal" :key="item" class="readonly-push-type">
          <div class="mr16px">{{ pushTypeObj[item] }}</div>
          <div>{{ getOptionsLabel(pushObjectKey[item], pushTypeOptionsList[item]) }}</div>
        </div>
      </div>
    </a-form-item>
    <a-form-item :label="t('sys.message.content')" :rules="[{ required: true }]" />
    <a-row>
      <a-col :span="22" :offset="2">
        <div class="message-container">
          <a-tabs
            v-if="computedContentTabs.length"
            v-model:activeKey="activeTabKey"
            @change="handleChangeContentTab"
          >
            <a-tab-pane v-for="item in computedContentTabs" :key="item.value" :tab="item.label">
              <div class="relative message-content">
                <template v-if="isEdit">
                  <div v-if="item.value === 'email'" class="rich-editor">
                    <a-input
                      v-model:value="emailTitle"
                      class="message-emailTitle mb8px"
                      :placeholder="t('sys.pageDesigner.title')"
                      @focus="handleContentFocus('emailTitle')"
                      @change="emitChange"
                      @click="handleClickTitle"
                    />
                    <rich-editor
                      ref="richEditorRef"
                      :content="contentObj.email"
                      @created="editorCreated"
                      @focus="handleContentFocus('emailContent')"
                      @change="handleEmailChange"
                    />
                  </div>
                  <a-textarea
                    v-else
                    class="message-content-box"
                    :class="`message-${item.value}Content`"
                    v-model:value="contentObj[item.value]"
                    :rows="4"
                    @focus="handleContentFocus(`${item.value}Content`)"
                    @change="emitChange"
                  />
                  <div v-if="!formState.custom" class="button-area">
                    <FieldSearchCascader
                      ref="fieldSearchRef"
                      v-model:value="cascadeValue"
                      :modelKey="formState.modelKey"
                      noShowName
                      @update:value="updateValue"
                      style="width: 90px"
                    />
                    <a-popover
                      v-if="supportProcess"
                      v-model:visible="metaModelListVisible[item.value]"
                      trigger="click"
                      overlayClassName="gct-meta-model-list"
                      :key="item.value + '' + formState.modelKey"
                    >
                      <template #content>
                        <p v-for="n in metaModelList" :key="n.key" @click="changeModelMeta(n)">
                          {{ n.name }}
                        </p>
                      </template>
                      <a-button type="link" :key="item.value">
                        {{ t('sys.pageDesigner.fieldCmp.PROCESS') }}
                      </a-button>
                    </a-popover>
                  </div>
                </template>
                <template v-else>
                  <div v-if="item.value === 'email'" class="message-email-title">
                    {{ emailTitle }}
                  </div>
                  <div class="message-content-box message-content-box-readonly">
                    <div v-html="contentObj[item.value]"></div>
                  </div>
                </template>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        <div
          class="message-container-error ant-form-item-explain-error"
          v-if="computedContentTabs.length && isError.content === activeTabKey"
        >
          {{ t('sys.message.contentError') }}
        </div>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, toRefs, computed, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { cloneDeep, groupBy, isEmpty } from 'lodash-es';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getMessageSettingFindAllByType } from '/@/apis/gct-apaas/MessageSettingController';
  import { pushTypeList, pushTypeObj } from '../constant/enum';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { RichEditor } from '/@/components/RichEditor';
  import { FieldSearchCascader } from '/@/components/FieldSearchCascader';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['change', 'changeConfigValidate']);

  const usePathQuery = usePathQueryStore();

  const props = defineProps<{
    isAdd: Boolean;
    isEdit: Boolean;
    data?: Object;
  }>();

  const { t } = useI18n();
  const cascadeValue = ref();
  const fieldSearchRef = ref();
  const supportProcess = ref<boolean>(false);

  watch(
    () => props.data,
    (info: any) => {
      if (!isEmpty(info)) {
        formState.modelCategory = info.modelCategory || 'entity';
        formState.modelKey = info.modelKey;
        formState.custom = info.custom ? 1 : 0;
        pushTypeVal.value = info.pushType.split(',');
        const pushObjectKeyArr = info.pushObjectKey.split(',');
        pushTypeVal.value.forEach(async (type, index) => {
          pushObjectKey[type] = pushObjectKeyArr[index];
          let obj = {};
          if (pushTypeOptionsList.value[type]) {
            obj[type] = cloneDeep(pushTypeOptionsList.value[type]);
          } else {
            const res = (await getMessageSettingFindAllByType({ type })) || [];
            obj[type] = res.map((n) => {
              return {
                value: n.id,
                label: n.name,
                text: `${n.name}[${n.key}]`,
              };
            });
          }
          Object.assign(pushTypeOptionsList.value, toRefs(obj));
          contentObj[type] = info.messageInfo[index].content;
          placeholderObj[type] = reactive(info.messageInfo[index].placeholder);
          if (type === 'email') {
            emailTitle.value = info.messageInfo[index].title;
          }
        });

        activeTabKey.value = pushTypeVal.value.length ? pushTypeVal.value[0] : 'system';
      } else {
        resetConfig();
      }
      getModelList();
    },
    { deep: true },
  );

  onMounted(() => {
    getModelList();
  });

  const getOptionsLabel = (val, options) => {
    return options?.find((n) => n?.value === val)?.label;
  };

  const resetConfig = () => {
    formRef.value?.resetFields();
    formState.modelKey = '';
    formState.custom = 0;
    formState.modelCategory = 'entity';
    formState.pushType = '';
    formState.pushObjectKey = '';
    formState.messageInfo = [];
    modelOptionsList.value = {};
    pushTypeVal.value = ['system'];
    activeTabKey.value = 'system';
    emailTitle.value = '';
    for (const key in pushTypeObj) {
      pushObjectKey[key] = key === 'system' ? usePathQuery.getAid() : '';
      contentObj[key] = '';
      placeholderObj[key] = [];
    }
    isError.content = '';
    isError.pushType = false;
  };

  const formRef = ref<FormInstance>();
  let formState = reactive<ScriptType>({
    custom: 0,
    modelKey: '',
    modelCategory: 'entity',
    pushType: '',
    pushObjectKey: '',
    messageInfo: [],
  });

  const isError = reactive({
    form: false,
    pushType: false,
    content: '',
  });

  const isShow = ref(false);
  const changeCustom = () => {
    handleChangeModel(formState.modelKey);
    emitChange();
  };

  const emitChange = () => {
    let data = cloneDeep(formState);
    let pushTypeList: any = [];
    let pushObjectKeyList = [];
    let messageInfo: any = [];
    pushTypeVal.value.forEach((item) => {
      pushTypeList.push(item);
      pushObjectKeyList.push(pushObjectKey[item]);
      let obj = {
        content: contentObj[item],
        title: item === 'email' ? emailTitle.value : '',
        placeholder: placeholderObj[item],
      };
      messageInfo.push(obj);
    });
    data.pushType = pushTypeList.toString();
    data.pushObjectKey = pushObjectKeyList.toString();
    data.messageInfo = messageInfo;
    data.modelCategory = data.custom ? '' : data.modelCategory;
    data.modelKey = data.custom ? '' : data.modelKey;

    emit('change', data);
  };

  /** 模型选择相关 */
  // 模型选项列表
  let modelOptionsList = ref({});
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const getModelList = async () => {
    let res = await getModelComprehensiveModelSummary({
      category: 'entity,view',
      supportMessage: 1,
    });
    const arr = res
      ?.filter((i) => i.type !== 'TXN_EXT')
      ?.map((n) => {
        return {
          label: n.name,
          value: n.key,
          category: n.category,
        };
      });

    modelOptionsList.value = groupBy(arr, 'category');
    if (!formState.modelKey) {
      formState.modelKey = modelOptionsList.value[formState.modelCategory]?.[0].value;
    }
    handleChangeModel(formState.modelKey, false);
  };

  const changeModelCategory = (val) => {
    formState.modelKey = modelOptionsList.value[val]?.[0]?.value || '';
    handleChangeModel(formState.modelKey);
    emitChange();
  };

  const handleChangeModel = async (modelKey, needReset = true) => {
    if (!modelKey) {
      metaModelList.value = [];
      return;
    }
    const res = await getModelMetaDetail({
      modelKey,
      types: 'image,attachment,esop,master_slave,df_master_slave',
    });
    // metaModelList.value = res?.fieldMetaList?.map((item) => {
    //   return {
    //     name: item.name,
    //     key: item.key,
    //     type: item.type,
    //   };
    // });
    // console.log('metaModelList.value', metaModelList.value);
    supportProcess.value = !!res?.supportProcess;
    //支持流程
    if (res?.supportProcess) {
      const result: any =
        (await getFieldMetaList({ modelKey: modelKey, includeProcess: true })) || [];
      metaModelList.value = result
        .filter((v) => v.fieldCategory === 'process')
        .map((item) => {
          return {
            name: item.name,
            key: item.key,
            type: item.type,
          };
        });
    }

    if (needReset) {
      pushTypeVal.value = ['system'];
      activeTabKey.value = 'system';
      emailTitle.value = '';
      for (const key in pushTypeObj) {
        pushObjectKey[key] = key === 'system' ? usePathQuery.getAid() : '';
        contentObj[key] = '';
        placeholderObj[key] = [];
      }
    }
    emitChange();
  };

  /** 推送方式相关 */
  // 所选推送方式的数组
  const pushTypeVal = ref(['system']);
  // 发送对象key对象
  let pushObjectKey = reactive({
    system: usePathQuery.getAid(),
    email: '',
    wecom: '',
    feishu: '',
    dingtalk: '',
  });
  // 发送对象选项数组
  let pushTypeOptionsList = ref({});

  const changePushTypeVal = async (val) => {
    let obj = {};
    activeTabKey.value = val.length ? val[0] : '';
    formState.pushTypeVal = val.toString();
    await Promise.all(
      val.map(async (type) => {
        if (type !== 'system') {
          if (pushTypeOptionsList.value[type]) {
            obj[type] = cloneDeep(pushTypeOptionsList.value[type]);
          } else {
            const res = (await getMessageSettingFindAllByType({ type })) || [];
            obj[type] = res.map((n) => {
              return {
                value: n.id,
                label: n.name,
                text: `${n.name}[${n.key}]`,
              };
            });
            pushObjectKey[type] = '';
          }
        }
      }),
    );
    pushTypeOptionsList.value = obj;
    validateContent();
    emitChange();
  };

  const handleSelectPushType = (type) => {
    // 如果邮箱变化，手动删除邮箱标题
    if (type === 'email') {
      emailTitle.value = '';
    }

    contentObj[type] = '';
    placeholderObj[type] = [];
    emitChange();
  };

  /** 内容处理 */
  const richEditorRef = ref<any>(null);

  // 消息内容被激活的tab
  const activeTabKey = ref('system');
  // 消息内容tab列表
  const computedContentTabs = computed(() => {
    return pushTypeList.filter((n) => pushTypeVal.value.includes(n.value));
  });
  const emailTitle = ref('');
  const selectionStart = ref(0);
  const contentFocusEl = ref('');
  // 所选模型的业务字段列表
  const metaModelList = ref<any>([]);
  // 业务字段弹窗显隐按钮
  let metaModelListVisible = reactive({
    system: false,
    email: false,
    wecom: false,
    feishu: false,
    dingtalk: false,
  });
  // 消息内容业务字段集合
  let placeholderObj = reactive({
    system: [],
    email: [],
    wecom: [],
    feishu: [],
    dingtalk: [],
  });
  // 消息内容集合
  let contentObj = reactive({
    system: '',
    email: '',
    wecom: '',
    feishu: '',
    dingtalk: '',
  });

  const changeModelMeta = (item) => {
    if (!contentFocusEl.value) {
      metaModelListVisible[activeTabKey.value] = false;
      return;
    }
    if (!placeholderObj[activeTabKey.value].some((n) => n.key === item.name)) {
      placeholderObj[activeTabKey.value].push({
        type: item.type,
        key: item.key,
        name: item.name,
      });
    }
    const text = '${' + item.name + '}';
    if (contentFocusEl.value === 'emailContent') {
      richEditorRef.value?.[0].restoreSelection();
      const htmlText = `<span> </span><span>${text}</span><span> </span>`;
      richEditorRef.value?.[0].dangerouslyInsertHtml(htmlText);
    } else {
      const textarea: any = document.querySelector(`.message-${contentFocusEl.value}`);
      const startPos = textarea.selectionStart || selectionStart.value;
      const endPos = textarea.selectionEnd || selectionStart.value;

      const value =
        contentFocusEl.value === 'emailTitle' ? emailTitle.value : contentObj[activeTabKey.value];
      const beforeText = value.substring(0, startPos);
      const afterText = value.substring(endPos);

      const newText = beforeText + text + afterText;

      if (contentFocusEl.value === 'emailTitle') {
        emailTitle.value = newText;
      } else {
        contentObj[activeTabKey.value] = newText;
      }
    }
    metaModelListVisible[activeTabKey.value] = false;
    emitChange();
  };

  const handleChangeContentTab = () => {
    contentFocusEl.value = '';
  };

  const handleContentFocus = (type) => {
    contentFocusEl.value = type;
  };

  const handleClickTitle = (event) => {
    selectionStart.value = event.target.selectionStart;
  };

  const handleEmailChange = (val) => {
    contentObj.email = val;
    emitChange();
  };

  const editorCreated = () => {
    const text =
      contentObj.email ||
      `<span style="font-size: 14px; font-family: SimHei, 黑体, 华文黑体, STHeiti, sans-serif;"></span>`;
    richEditorRef.value?.[0].setHtml(text);
  };

  const validateForm = () => {
    formRef.value
      ?.validate()
      .then(async () => {
        isError.form = false;
      })
      .catch(() => {
        isError.form = true;
      })
      .finally(() => {
        emit('changeConfigValidate', isError);
      });
  };

  const validatePushType = () => {
    if (pushTypeVal.value.length) {
      for (let i = 0; i < pushTypeVal.value.length; i++) {
        const element = pushTypeVal.value[i];
        if (!pushObjectKey[element]) {
          isError.pushType = true;
          break;
        }
        isError.pushType = false;
      }
    } else {
      isError.pushType = true;
    }
    emit('changeConfigValidate', isError);
  };

  const validateContent = () => {
    if (pushTypeVal.value.length) {
      for (let i = 0; i < pushTypeVal.value.length; i++) {
        const element = pushTypeVal.value[i];
        if (
          !contentObj[element] ||
          (element === 'email' &&
            richEditorRef?.value &&
            richEditorRef.value[0] &&
            !richEditorRef.value[0].getText())
        ) {
          isError.content = element;
          break;
        }
        isError.content = '';
      }
    } else {
      isError.content = '';
    }
    emit('changeConfigValidate', isError);
  };

  watch(pushTypeVal, () => {
    if (!isShow.value) return;
    validatePushType();
  });

  watch(pushObjectKey, () => {
    if (!isShow.value) return;
    validatePushType();
  });

  watch(
    () => contentObj,
    () => {
      if (!isShow.value) return;
      validateContent();
    },
    { deep: true },
  );

  const updateValue = async (val, info) => {
    console.log('updateValue', val, info);
    changeModelMeta(info);
  };

  defineExpose({
    activeTabKey,
    isShow,
    validateForm,
    validatePushType,
    validateContent,
    resetConfig,
  });
</script>

<style lang="less" scoped>
  .push-type-item {
    display: flex;
    align-items: center;
    height: 30px;

    &-label {
      width: 100px;
    }

    &-value {
      width: calc(100% - 100px);
    }
  }

  .message-container {
    min-height: 100px;
    border: 1px solid #e8ebf0;
    background-color: #f7f8fa;

    .message-content {
      .message-content-box,
      .message-email-title {
        padding: 12px;
        border: 1px solid #e8ebf0;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        background: #fff;
      }

      .message-email-title {
        margin-bottom: 8px;
        padding: 8px 12px;
      }

      .message-content-box {
        height: 114px;
        padding-bottom: 44px;
        resize: none;

        &-readonly {
          padding-bottom: 12px;
          border: 1px solid #e8ebf0;
        }
      }
    }

    :deep(.ant-tabs) {
      overflow: visible;
    }

    :deep(.ant-tabs-nav) {
      margin: 0;
    }

    :deep(.ant-tabs-nav-wrap) {
      padding-left: 32px;
      border-bottom: 1px solid #e8ebf0;
      background-color: #fff;
    }

    :deep(.ant-tabs-tabpane) {
      padding: 12px;
    }

    .button-area {
      display: flex;
      border: 1px solid #e8ebf0;
      border-top: none;
      border-radius: 0 0 4px 4px;
      background: #fff;

      button {
        display: inline-block;
      }
    }
  }

  .readonly-push-type {
    display: flex;
  }
</style>

<style lang="less">
  .gct-meta-model-list {
    .ant-popover-content {
      max-height: 400px;
      overflow-y: auto;

      .ant-popover-inner-content {
        p {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }
      }
    }
  }
</style>
