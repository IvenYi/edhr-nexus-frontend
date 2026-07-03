<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="viewModelTitle"
    centered
    width="900px"
    :maskClosable="false"
    @visible-change="handleShow"
    :afterClose="handleClose"
    @ok="handleOk"
    :ok-text="steps.current < steps.num && !isEdit ? t('sys.editor.next') : t('sys.okText')"
  >
    <a-steps v-if="!isEdit" v-model:current="currentStep">
      <a-step title="基础信息" />
      <a-step title="模型配置" />
      <a-step title="筛选条件" />
    </a-steps>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <div v-show="steps.current === 1">
        <!-- 第一步的内容 -->
        <a-collapse v-model:activeKey="activeKey" ghost>
          <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
            <a-form-item
              :label="t('sys.model.viewClassification')"
              name="categoryId"
              :rules="[{ required: true }]"
            >
              <a-select ref="select" v-model:value="formState.categoryId">
                <template v-for="item in viewModelList" :key="item.id">
                  <a-select-option :value="item.id">{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
            <!-- <a-form-item :label="t('sys.model.viewType')" name="type" :rules="[{ required: true }]">
              <a-radio-group v-model:value="formState.type" :options="viewTypeOption" />
            </a-form-item> -->
            <a-form-item
              :label="t('sys.model.viewName')"
              name="name"
              :rules="[{ required: true }, { validator: validateModelName }]"
            >
              <a-input v-model:value="formState.name" show-count :maxlength="32" />
            </a-form-item>
            <a-form-item
              :label="t('sys.model.viewKey')"
              name="key"
              :rules="[
                { required: true },
                {
                  validator: validateSpecialCharacters,
                },
              ]"
            >
              <a-input
                :disabled="isEdit"
                v-model:value="formState.key"
                :addon-before="keyPrefix"
                :addon-after="keySuffix"
                show-count
                :maxlength="60"
              />
            </a-form-item>
          </a-collapse-panel>
          <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
            <a-form-item name="viewIdentifier" :label="t('sys.model.viewIdentifier')">
              <a-checkbox-group v-model:value="formState.viewIdentifier">
                <a-checkbox value="check_supportMessage">{{
                  t('sys.appDesigner.msgNotification')
                }}</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item :label="t('sys.description')" name="description">
              <a-textarea
                class="--resize-none"
                v-model:value="formState.description"
                :placeholder="t('sys.model.viewDescriptionPlaceholder')"
                show-count
                :maxlength="120"
              />
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <div v-if="steps.current === 2">
        <div v-if="isEdit" class="step-tip mb-16px">
          <i class="iconfont icon-a-zhuyi_attention2 step-tip-icon pr-4px"></i>
          <span>{{ t('sys.model.modelConfigEditTip') }}</span>
        </div>
        <!-- 第二步的内容 -->
        <join-config :readonly="false" :isEdit="isEdit" />
      </div>

      <div v-show="steps.current === 3">
        <div v-if="!isEdit" class="step-tip mx-20px mt-4px mb-16px">
          <i class="iconfont icon-a-zhuyi_attention2 step-tip-icon pr-4px"></i>
          <span>{{ t('sys.model.viewStepTip') }}</span>
        </div>
        <!-- 第三步的内容 -->
        <data-rules-container
          ref="dataRulesRef"
          :fieldList="allLinkFieldList"
          :detail="filterConfig"
          type="filterConfig"
          :mainModelKey="mainModelKey"
          :allowClear="true"
        />
      </div>
    </a-form>
    <template v-if="steps.current == 2" #insertFooter>
      <a-button type="link" @click="onAddJoin" style="float: left">{{
        t('sys.add') + t('sys.pageDesigner.model')
      }}</a-button>
    </template>
    <template v-if="steps.current > 1 && !isEdit" #centerFooter>
      <a-button @click="handleBack">{{ t('sys.editor.prev') }}</a-button>
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, toRaw, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import {
    postViewModel,
    putViewModelById,
    getViewModelInfo,
  } from '/@/apis/gct-apaas/ViewModelController';

  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { useJoinConfig } from '../hooks/useJoinConfig';
  import JoinConfig from '../components/join-config.vue';
  import DataRulesContainer from '/@/projects/web-render/src/views/user-group/components/modal/data-role-setting/data-rules-container.vue';
  import { cloneDeep, pick, indexOf } from 'lodash-es';
  import { validateModelName } from '/@/utils/validate';

  const { t } = useI18n();

  const emit = defineEmits(['ok', 'register']);

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('vm');

  const viewTypeOption = [
    { label: t('sys.model.queryView'), value: 'QUERY' },
    { label: t('sys.model.sqlView'), value: 'DB', disabled: true },
  ];

  interface IFormState {
    /** 视图分类 */
    categoryId?: string;
    /** 视图类型 */
    type: string;
    /** 视图名称 */
    name?: string;
    /** 视图key */
    key?: string;
    /** 描述 */
    description?: string;
    /** 视图标识 */
    viewIdentifier: Array<viewIdentifierKey>;
  }

  type viewIdentifierKey = 'check_supportMessage';

  const activeKey = ref(['1', '2']);
  const formRef = ref<FormInstance>();
  const dataRulesRef = ref();
  const formState = reactive<IFormState>({
    categoryId: undefined,
    type: 'QUERY',
    name: undefined,
    key: undefined,
    description: undefined,
    /** 视图标识 */
    viewIdentifier: [],
  });

  /** 视图模型分类列表 */
  const viewModelList = ref<CategoryCompleteResponse[]>([]);
  const filterConfig = ref({});
  const isEdit = ref<boolean>(false);

  const currentId = ref<string>('');

  const steps = ref({
    current: 1,
    num: 3,
  });

  const {
    editJoinConfig,
    allLinkFieldList,
    getModelList,
    clearJoinConfig,
    validateJoinConfig,
    onAddJoin,
    setJoinConfig,
  } = useJoinConfig(false);

  watch(
    () => editJoinConfig,
    () => {
      // 刷新模态框高度
      nextTick(() => {
        if (redoModalHeight && typeof redoModalHeight === 'function') {
          redoModalHeight();
        }
      });
    },
    {
      deep: true,
    },
  );

  const currentStep = computed(() => {
    return steps.value.current - 1;
  });

  const mainModelKey = computed(() => {
    return editJoinConfig.mainModelKey;
  });

  const viewModelTitle = computed(() => {
    let title = t('sys.model.createViewModel');
    if (isEdit.value) {
      if (steps.value.current == 2) {
        title = t('sys.edit') + t('sys.model.modelConfig');
      } else if (steps.value.current == 3) {
        title = t('sys.edit') + t('sys.model.filterCondition');
      } else {
        title = t('sys.model.editViewModel');
      }
    }
    return title;
  });

  const [registerInner, { closeModal, redoModalHeight }] = useModalInner((data) => {
    if (data) {
      dataRulesRef.value.resetData();
      isEdit.value = data.isEdit;
      formState.categoryId = data.categoryId;
      if (!data.isEdit) {
        formState.key = data?.uuid;
      }
      data.isEdit && onDataReceive(data);
    }
  });

  const onDataReceive = async (node) => {
    currentId.value = node.id;
    formState.type = node.type;
    formState.name = node.name;
    formState.key = keyClip(node.key);
    formState.description = node.description;
    if (['2', '3'].includes(node.stepIndex)) {
      steps.value.current = +node.stepIndex;
      setJoinConfig(node.joinConfig);
      nextTick(() => {
        filterConfig.value['dataRuleConfig'] = node.filterConfig?.expJson;
      });
    }
    if (node.supportMessage) {
      formState.viewIdentifier.push(`check_supportMessage` as viewIdentifierKey);
    }
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]*$/;
    if (!reg.test(value)) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.model.viewModel'),
        }),
      );
    }
    callback();
  };

  // 弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      viewModelList.value = (await getCategoryListComplete({ module: ModelTypeEnum.VIEW })) ?? [];
      await getModelList();
    }
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    steps.value.current = 1;
    formRef.value?.resetFields();
    viewModelList.value = [];
    clearJoinConfig();
    filterConfig.value = {};
    closeModal();
  };

  const handleBack = () => {
    steps.value.current--;
  };

  // const handleAddModel = () => {};

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const viewIdentifier = toRaw(formState.viewIdentifier);
      if (isEdit.value) {
        const info = await getViewModelInfo({ id: currentId.value });
        const cloneInfo = cloneDeep(info);
        let data;
        if (steps.value.current === 2) {
          const joinConfig = toRaw(editJoinConfig);
          const cloneJoin = cloneInfo?.joinConfig;
          const joinModelkeys = joinConfig?.joins?.map((i) => i.modelKey);
          const cloneJoinModelkeys = cloneJoin?.joins?.map((i) => i.modelKey) || [];
          let hasJoinEdit = false;
          for (let i = 0; i < cloneJoinModelkeys?.length; i++) {
            if (cloneJoinModelkeys[i] !== joinModelkeys[i]) {
              hasJoinEdit = true;
              break;
            }
          }
          if (joinConfig.mainModelKey !== cloneJoin?.mainModelKey || hasJoinEdit) {
            data = {
              joinConfig: toRaw(editJoinConfig),
              filterConfig: {
                exp: null,
                expJson: null,
                query: null,
                varKeys: null,
              },
            };
          } else {
            data = {
              joinConfig: toRaw(editJoinConfig),
            };
          }
        } else if (steps.value.current === 3) {
          const dataRulesRes = dataRulesRef.value.getDataRulesResult();

          data = {
            filterConfig: {
              ...pick(dataRulesRes, ['query', 'varKeys', 'exp']),
              expJson: dataRulesRes.treeStr,
            },
          };
        } else {
          data = {
            ...formState,
            supportMessage: Number(indexOf(viewIdentifier, 'check_supportMessage') !== -1),
            key: keyPad(formState.key as string),
          };
        }

        const newInfo = {
          ...cloneInfo,
          ...data,
        };

        await putViewModelById(
          {
            id: currentId.value,
          },
          newInfo,
          {
            transferToConfig: { headers: { operateType: 'UPDATE' } },
          },
        );
        message.success(t('sys.model.viewEditBasicSuccess'));
        emit('ok', newInfo, true);
      } else {
        if (steps.value.current < steps.value.num) {
          if (steps.value.current === 2) {
            const errorMsg = validateJoinConfig();
            if (errorMsg) {
              message.warn(errorMsg);
              return;
            }
            filterConfig.value['dataRuleConfig'] = '';
          }

          steps.value.current++;
          return;
        }

        const dataRulesRes = dataRulesRef.value.getDataRulesResult();

        // if (dataRulesRes.error) {
        //   message.warn(dataRulesRes.error);
        //   return;
        // }
        const data = {
          ...formState,
          key: keyPad(formState.key as string),
          joinConfig: toRaw(editJoinConfig),
          supportMessage: Number(indexOf(viewIdentifier, 'check_supportMessage') !== -1),
          filterConfig: dataRulesRes.error
            ? undefined
            : {
                ...pick(dataRulesRes, ['query', 'varKeys', 'exp']),
                expJson: dataRulesRes.treeStr,
              },
        };

        const id = await postViewModel(data);
        message.success(t('sys.model.viewCreateSuccess'));
        emit('ok', { id }, false);
      }

      closeModal();
    });
  };
</script>

<style lang="less" scoped>
  .ant-steps {
    padding: 28px 20px;
  }
  .step-tip {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: rgba(from var(--ant-primary-color) r g b / 12%);
    color: #666;
    .step-tip-icon {
      line-height: 20px;
      color: var(--ant-primary-color);
    }
  }

  .join-config-wrapper {
    position: relative;

    .join-config-item {
      position: relative;
      border-radius: 4px;
      border: 1px solid #e8e8f0;

      & + .join-config-item {
        margin-top: 16px;
      }

      &.is-master {
        background-color: #f2f4f7;
      }

      &-header {
        display: flex;
        padding: 12px 16px;
        align-items: center;
        .join-config-label {
          display: inline-block;
          font-size: 14px;
          color: #212528;
          flex: 2;
          text-align: right;
          padding-right: 8px;

          &::after {
            content: ':';
            margin: 0 8px 0 2px;
            position: relative;
            top: -0.5px;
          }
        }

        &-container {
          display: flex;
          flex: 18;
          justify-content: space-between;
          align-items: center;

          .join-config-link-type {
            margin-left: 40px;
            display: flex;
            flex-shrink: 0;
          }

          .add-action,
          .delete-action {
            display: flex;
            flex-shrink: 0;
            margin-left: 24px;
            align-items: center;
            > i {
              line-height: 1;
            }
            .add-button {
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              border: none;
              > i {
                line-height: 1;
              }
            }
          }

          .delete-action {
            margin-left: 40px;
            color: #797a7d;
            > i {
              line-height: 1;
              cursor: pointer;
            }
            .icon-blank {
              width: 16px;
              height: 16px;
              background-color: transparent;
              cursor: default;
            }
          }
        }
      }

      &-container {
        position: relative;
        border-top: 1px solid #e0e3ea;
        display: flex;
        padding: 16px;

        .join-config-label {
          display: inline-block;
          font-size: 14px;
          color: #212528;
          flex: 2;
          text-align: right;
          padding-right: 8px;

          &::after {
            content: ':';
            margin: 0 8px 0 2px;
            position: relative;
            top: -0.5px;
          }
        }

        .join-config-content {
          display: flex;
          flex: 18;
          flex-direction: column;
          &-item {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #f2f4f7;
            border-radius: 4px;

            & + .join-config-content-item {
              margin-top: 8px;
            }

            &.is-header {
              background-color: #fff;
              padding: 0 8px;

              & + .join-config-content-item {
                margin-top: 4px;
              }
            }

            .join-config-header {
              flex: 1;
            }

            .unit-type {
              color: #212528;
              width: 9px;
              margin: 0 8px;
              flex-shrink: 0;
            }

            .blank-type {
              color: #212528;
              padding: 0 8px;
              flex-shrink: 0;
            }

            .item-actions {
              display: flex;
              flex-shrink: 0;

              color: var(--ant-primary-color);
              align-items: center;
              > i {
                line-height: 1;
                margin-left: 8px;
                cursor: pointer;
              }

              .icon-blank {
                width: 16px;
                height: 16px;
                background-color: transparent;
                cursor: default;
              }
            }
          }
        }
      }
    }
  }
</style>

<style lang="less" scoped>
  .series {
    :deep(.ant-form-item-label) {
      label {
        display: none;
      }
    }
  }
</style>
