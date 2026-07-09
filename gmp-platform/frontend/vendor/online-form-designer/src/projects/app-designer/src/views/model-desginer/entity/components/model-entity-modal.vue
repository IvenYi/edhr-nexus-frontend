<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? `${t('sys.edit')}${t('sys.model')}` : `${t('sys.new')}${t('sys.model')}`"
    centered
    width="740px"
    :maskClosable="false"
    :afterClose="handleClose"
    :cancel-text="isEdit ? $t('sys.cancel') : $t('sys.editor.prev')"
    @ok="handleOk"
    @cancel="handleCancel"
    @visible-change="handleShow"
  >
    <a-form
      ref="entityFormRef"
      :model="formState"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item :label="`${t('sys.model.modelType')}`" name="type">
            {{ t('sys.model.' + formState.type) }}
            <!-- <a-select v-model:value="formState.type" :disabled="isEdit" @change="handleChange">
              <a-select-option v-for="item in EntityModelTypeEnum" :value="item" :key="item">{{
                t('sys.model.' + item)
              }}</a-select-option>
            </a-select> -->
          </a-form-item>
          <a-form-item :label="`${t('sys.model.modelCategory')}`" name="categoryId">
            <a-select v-model:value="formState.categoryId">
              <a-select-option v-for="item in categoryList" :value="item.id" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :label="`${t('sys.model')}${t('sys.name')}`"
            name="name"
            :rules="[
              { required: true },
              { validator: validateModelName, message: t('sys.model.modelNameError') },
            ]"
          >
            <a-input v-model:value="formState.name" show-count :maxlength="32" />
          </a-form-item>
          <a-form-item
            :label="`${t('sys.model')}KEY`"
            name="key"
            :rules="[
              { required: true },
              isEdit
                ? {}
                : {
                    pattern: /^[a-z_]+$/,
                    message: t('sys.model.moduleFormat', { sth: t('sys.entityModel') }),
                  },
            ]"
          >
            <a-input
              :addon-before="keyPrefix"
              :addon-after="keySuffix"
              v-model:value="formState.key"
              show-count
              :maxlength="64 - keyPrefix.length - keySuffix.length"
              :disabled="isEdit"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item name="modelIdentifier" :label="t('sys.model.modelIdentifier')">
            <a-checkbox-group
              v-model:value="formState.modelIdentifier"
              @change="handleCheckChange"
              :disabled="formState.type === EntityModelTypeEnum.TRANSACTION"
            >
              <!-- <a-checkbox value="check_supportTree" :disabled="notSupportTree || isEdit">{{
                t('sys.treeStructure')
              }}</a-checkbox> -->
              <a-checkbox value="check_permissionEnabled">
                {{ t('sys.model.dataAuthority') }}
              </a-checkbox>
              <a-checkbox value="check_deletePolicy" :disabled="isEdit">
                {{ t('sys.model.logicDelete') }}
              </a-checkbox>
              <a-checkbox
                v-if="formState.type === EntityModelTypeEnum.BASE"
                value="check_subModel"
                :disabled="isEdit"
              >
                {{ t('sys.model.subTableIdent') }}
              </a-checkbox>
              <a-checkbox value="check_supportMessage">
                {{ t('sys.appDesigner.msgNotification') }}
              </a-checkbox>
              <a-checkbox
                value="check_modelTraceSettingEnabled"
                :disabled="
                  isEdit ||
                  formState.modelIdentifier.includes('check_subModel') ||
                  traceNotSupport.includes(formState.type)
                "
              >
                {{ t('sys.appDesigner.modelTrace') }}
              </a-checkbox>
              <a-checkbox
                value="check_supportProcess"
                v-if="
                  !formState.modelIdentifier.includes('check_subModel') &&
                  formState.type !== EntityModelTypeEnum.DYNAMIC_FORM
                "
                :disabled="isEdit"
              >
                {{ t('sys.model.flowIdentifier') }}
              </a-checkbox>
              <a-checkbox
                value="check_dataState"
                v-if="
                  (formState.type === EntityModelTypeEnum.WORKFLOW ||
                    formState.type === EntityModelTypeEnum.NDO ||
                    formState.type === EntityModelTypeEnum.RDO) &&
                  (isExiststate || !formState.id)
                "
              >
                {{ t('sys.model.dataState') }}
                <a-tooltip class="ml6px text-[#5A5F6B]">
                  <template #title>控制该模型状态字段为“关闭”的数据是否能够被引用</template>
                  <question-circle-outlined />
                </a-tooltip>
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <!-- <a-form-item :label="t('sys.stateMachine')" name="boolSupportStateMachine">
            <a-checkbox v-model:checked="formState.boolSupportStateMachine" :disabled="isEdit" />
          </a-form-item> -->
          <a-form-item
            v-if="formState.type === EntityModelTypeEnum.WORKFLOW"
            :label="t('sys.model.technologyModelRef')"
            name="refModelKey"
            :rules="[{ required: true }]"
          >
            <a-select
              :disabled="isEdit"
              v-model:value="formState.refModelKey"
              show-search
              :filter-option="filterOption"
              :placeholder="t('sys.chooseText')"
            >
              <a-select-opt-group v-for="(models, modelType) in refModelList" :key="modelType">
                <template #label>
                  <span>
                    {{ t(`sys.model.${modelType}`) }}
                  </span>
                </template>
                <a-select-option
                  :key="model.key"
                  v-for="model in models"
                  :value="model.key"
                  :name="model.name"
                  >{{ model.name }}</a-select-option
                >
              </a-select-opt-group>
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
  import { reactive, ref, toRaw, watch, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { omit, pull, indexOf, pick, groupBy } from 'lodash-es';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import type {
    ModelMetaVO,
    CategoryResponse,
    TableEntityModelResponse,
  } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { EntityModelTypeEnum } from '/@app-designer/enum';
  import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';
  import type { FormInstance } from 'ant-design-vue';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { validateModelName } from '/@/utils/validate';

  const isSysBuiltinModel = ref(false);
  const modelSuffix = computed(() => {
    return isSysBuiltinModel.value === true ? '' : undefined;
  });
  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('em', modelSuffix);

  const emit = defineEmits(['ok', 'register', 'prev']);

  type modelIdentifierKey =
    | 'check_supportTree'
    | 'check_supportProcess'
    | 'check_permissionEnabled'
    | 'check_deletePolicy'
    | 'check_modelTraceSettingEnabled'
    | 'check_subModel'
    | 'check_supportMessage'
    | 'check_dataState';

  const traceNotSupport = [EntityModelTypeEnum.TRANSACTION, EntityModelTypeEnum.DYNAMIC_FORM];

  interface FormState
    extends Pick<
      ModelMetaVO,
      'categoryId' | 'name' | 'key' | 'description' | 'type' | 'id' | 'refModelKey'
    > {
    /** 模型标识 */
    modelIdentifier: Array<modelIdentifierKey>;
    /** 状态机  */
    boolSupportStateMachine: boolean;
  }

  const entityFormRef = ref<FormInstance>();

  /** 数据状态是否存在 */
  const isExiststate = ref(false);

  const formState = reactive<FormState>({
    categoryId: undefined,
    name: undefined,
    key: undefined,
    modelIdentifier: [],
    boolSupportStateMachine: false,
    description: undefined,
    type: EntityModelTypeEnum.BASE,
    refModelKey: undefined,
  });

  const isEdit = ref(false);
  const activeKey = ref<string[]>(['1', '2']);
  const categoryList = ref<CategoryResponse[]>([]);

  // 关联模型列表
  const refModelList = ref<Record<string, TableEntityModelResponse[]>>({});
  watch(
    () => formState.type,
    async (value) => {
      if (value === EntityModelTypeEnum.WORKFLOW && Object.keys(refModelList.value).length === 0) {
        const res = await getDesignerCommonTableEntityModelList({
          type: EntityModelTypeEnum.RDO,
        });
        refModelList.value = groupBy(res ?? [], 'category');
      }
    },
    {
      immediate: true,
    },
  );
  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.name.includes(input) || option.value.includes(input);
    }
    return false;
  };

  const handleCheckChange = (val) => {
    if (val.includes('check_subModel') && val.includes('check_supportProcess')) {
      formState.modelIdentifier = val.filter((i) => i !== 'check_supportProcess');
    }
    if (val.includes('check_subModel')) {
      formState.modelIdentifier = val.filter((i) => i !== 'check_modelTraceSettingEnabled');
    }
  };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    activeKey.value = ['1', '2'];
    if (data) {
      formState.categoryId = data?.categoryId;
      formState.type = data.type;
      handleChange(data.type);
      if (!data?.isEdit) {
        formState.key = data?.uuid;
        if (!formState.modelIdentifier.includes('check_deletePolicy')) {
          formState.modelIdentifier.push('check_deletePolicy');
        }
        if (
          !formState.modelIdentifier.includes('check_modelTraceSettingEnabled') &&
          !traceNotSupport.includes(data.type)
        ) {
          formState.modelIdentifier.push('check_modelTraceSettingEnabled');
        }
      }
      data?.isEdit && onDataReceive(data);
    }
  });

  const onDataReceive = async (data) => {
    console.log('Data Received', data);
    isEdit.value = true;
    isSysBuiltinModel.value = data.createUserId === '__SYS__' || data.sysBuiltin === 1;
    const res = data;

    Object.assign(formState, {
      ...omit(res, [
        'supportTree',
        'supportStateMachine',
        'supportProcess',
        'supportMessage',
        'permissionEnabled',
        'deletePolicy',
        'modelTraceSettingEnabled',
        'subModel',
        'specificConfig',
      ]),
      key: keyClip(res.key!),
      boolSupportStateMachine: Boolean(res.supportStateMachine),
    });
    isExiststate.value = data.isExiststate;
    Object.entries(
      pick(res, [
        'supportTree',
        'supportProcess',
        'supportMessage',
        'permissionEnabled',
        'modelTraceSettingEnabled',
        'subModel',
      ]),
    ).forEach(([key, value]: [string, number]) => {
      if (value) {
        formState.modelIdentifier.push(`check_${key}` as modelIdentifierKey);
      }
    });
    if (res.specificConfig?.operatingStateEnabled) {
      formState.modelIdentifier.push('check_dataState');
    }

    /**
     *  逻辑删除 deletePolicy 0 表示生效
     */
    if (!res.deletePolicy) {
      formState.modelIdentifier.push(`check_deletePolicy`);
    }
  };

  const handleChange = (type) => {
    pull(formState.modelIdentifier, 'check_supportTree');
    if (type === EntityModelTypeEnum.TRANSACTION) {
      pull(formState.modelIdentifier, 'check_permissionEnabled', 'check_supportProcess');
    } else if (
      type === EntityModelTypeEnum.DYNAMIC_FORM &&
      !formState.modelIdentifier.includes('check_subModel')
    ) {
      formState.modelIdentifier.push('check_subModel');
    }
  };

  // 弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    if (visible) {
      getEntityCategory();
    }
  };

  const getEntityCategory = async () => {
    const res = await getCategoryListComplete({ module: ModelTypeEnum.ENTITY });
    categoryList.value = res!;
    if (!formState.categoryId) {
      formState.categoryId = categoryList.value.filter(
        (e) => e.module === ModelTypeEnum.ENTITY,
      )[0]?.id;
    }
  };

  const handleClose = () => {
    keyReset();
    // activeKey.value = [];
    isEdit.value = false;
    isSysBuiltinModel.value = false;
    entityFormRef.value?.resetFields();
    formState.id = undefined;
    //TODO reset
    // resetReactiveState(formState, {
    //   type: 'NDO',
    //   deletePolicy: 1,
    //   supportTree: 0,
    //   supportStateMachine: 0,
    //   supportProcess: 0,
    // });
  };

  const handleOk = () => {
    entityFormRef.value?.validate().then(() => {
      const modelIdentifier = toRaw(formState.modelIdentifier);
      emit('ok', {
        ...omit(formState, ['boolSupportStateMachine', 'modelIdentifier']),
        key: keyPad(formState.key!),
        supportStateMachine: Number(formState.boolSupportStateMachine),
        supportTree: Number(indexOf(modelIdentifier, 'check_supportTree') !== -1),
        supportProcess: Number(indexOf(modelIdentifier, 'check_supportProcess') !== -1),
        permissionEnabled: Number(indexOf(modelIdentifier, 'check_permissionEnabled') !== -1),
        deletePolicy: Number(indexOf(modelIdentifier, 'check_deletePolicy') === -1),
        modelTraceSettingEnabled: Number(
          indexOf(modelIdentifier, 'check_modelTraceSettingEnabled') !== -1,
        ),
        supportMessage: Number(indexOf(modelIdentifier, 'check_supportMessage') !== -1),
        subModel: Number(indexOf(modelIdentifier, 'check_subModel') !== -1),
        specificConfig: {
          operatingStateEnabled: Number(indexOf(modelIdentifier, 'check_dataState') !== -1),
        },
      });
    });
  };

  // 取消---上一步
  const handleCancel = (e) => {
    closeModal();
    if (e.target.textContent === t('sys.editor.prev')) {
      emit('prev', { ...formState });
    }
  };
</script>

<style scoped lang="less">
  :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
    margin-left: 0;
  }
</style>
