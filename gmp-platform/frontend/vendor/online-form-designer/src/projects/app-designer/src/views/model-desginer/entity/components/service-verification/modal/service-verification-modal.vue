<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="
      isEdit
        ? t('sys.appDesigner.editServiceVerification')
        : t('sys.appDesigner.newServiceVerification')
    "
    centered
    width="720px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.name')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="64"
          :placeholder="`${t('sys.inputText')}`"
        />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.appDesigner.verification')}KEY`"
        name="key"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
          :disabled="isEdit"
          :placeholder="`${t('sys.inputText')}`"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.appDesigner.linkService')"
        name="bizServiceKeys"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.bizServiceKeys"
          mode="multiple"
          :placeholder="t('sys.chooseText')"
          :options="bizServiceOptions"
          :maxTagCount="5"
          :maxTagTextLength="6"
        />
      </a-form-item>

      <a-form-item name="status" :label="t('sys.status')">
        <a-select v-model:value="formState.status">
          <a-select-option :value="ServiceVerificationStatusEnum.UN_ENABLE">{{
            t('sys.disabled')
          }}</a-select-option>
          <a-select-option :value="ServiceVerificationStatusEnum.ENABLE">{{
            t('sys.enable')
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('sys.appDesigner.illustrate')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>

    <basic-table
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      rowKey="id"
      :ellipsis="true"
      :pagination="false"
      :columns="rulesColumns"
      :dataSource="formState.listRule"
      :expandedRowKeys="expandedRowKeys"
      :rowDraggable="true"
      @row-drag-end="onRowDragEnd"
    >
      <template #headerTop>
        <a-row justify="space-between" type="flex">
          <a-col style="display: flex">
            <span class="font-bold">{{ t('sys.appDesigner.ruleList') }}</span>
          </a-col>
          <a-col style="display: flex">
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item :key="RuleTypeEnum.RULE_EXP">
                    {{ t('sys.appDesigner.addExpressionRules') }}
                  </a-menu-item>
                  <a-menu-item :key="RuleTypeEnum.RULE_SCRIPT">
                    {{ t('sys.appDesigner.addScriptRules') }}
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                {{ t('sys.appDesigner.addRules') }}
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-col>
        </a-row>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <div>{{ Ch_RuleType[record.type] }}</div>
        </template>
        <template v-if="column.key === 'action'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: handleRowEdit.bind(null, record),
              },
              {
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  arrowPointAtCenter: true,
                  placement: 'topRight',
                  confirm: handleRowDelete.bind(null, record.id),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </basic-table>

    <rules-modal @register="rulesRegister" :modelKey="modelKey" @get-value="getRulesInfo" />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { FormInstance, message, SelectProps } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { pick } from 'lodash-es';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { ServiceVerificationStatusEnum, RuleTypeEnum, Ch_RuleType } from '../constant/index';
  import { rulesColumns } from '../constant/columns';
  import RulesModal from './rules-modal.vue';

  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
  import {
    postServiceValidation,
    getServiceValidationInfo,
    putServiceValidationById,
  } from '/@/apis/gct-apaas/ServiceValidationController';

  const { t } = useI18n();

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('valid');

  const [rulesRegister, { openModal: openRulesModal }] = useModal();

  interface Props {
    /** 模型定义表key */
    modelKey: string;
  }

  interface FormState {
    /** 服务校验名称 */
    name?: string;
    /** 服务校验key */
    key?: string;
    /** 关联业务服务id */
    bizServiceKeys?: string[];
    /** 状态 */
    status: number;
    /** 说明 */
    description?: string;
    /** 规则列表 */
    listRule: any[];
  }

  const emit = defineEmits(['refresh', 'register']);

  const props = defineProps<Props>();

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    name: undefined,
    key: undefined,
    bizServiceKeys: undefined,
    status: ServiceVerificationStatusEnum.ENABLE,
    description: undefined,
    listRule: [],
  });

  const isEdit = ref<boolean>(false);

  const currentId = ref<string>('');

  const bizServiceOptions = ref<SelectProps['options']>();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;

      if (!isEdit.value) {
        formState.key = data.uuid;
      }

      if (data.isEdit && data.info) {
        onDataReceive(data.info);
      }
    }
  });

  const onDataReceive = async (data) => {
    const detail = (await getServiceValidationInfo({ id: data.id })) || {};

    currentId.value = detail.id ?? '';

    formState.name = detail.name;
    formState.key = keyClip(detail.key ?? '');
    formState.bizServiceKeys = (detail.relationResponses ?? []).map(
      (item) => item.bizServiceKey ?? '',
    );
    formState.status = detail.status;
    formState.description = detail.description;
    formState.listRule = detail.listRule ?? [];
  };

  const handleShow = (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
      getLinkBusinessData();
    }
  };

  // 获取关联业务服务列表
  const getLinkBusinessData = async () => {
    const data = (await getBizServiceCrudList({ modelKey: props.modelKey })) || [];

    bizServiceOptions.value = data.map((item) => {
      return {
        label: item.name,
        value: item.key,
      };
    });
  };

  const handleMenuClick = ({ key }) => {
    openRulesModal(true, {
      type: key,
      uuid: randomUUID([]),
    });
  };

  const getRulesInfo = (info, isEdit) => {
    if (isEdit) {
      formState.listRule = formState.listRule.map((item) => {
        if (item.id === info.id) {
          return info;
        }
        return item;
      });

      message.success(t('sys.appDesigner.editRulesSuccess'));
    } else {
      formState.listRule = formState.listRule.concat(info);
      message.success(t('sys.appDesigner.addRulesSuccess'));
    }
  };

  const handleRowEdit = (record) => {
    openRulesModal(true, {
      isEdit: true,
      info: record,
    });
  };

  const handleRowDelete = (id) => {
    formState.listRule = formState.listRule.filter((item) => {
      return item.id !== id;
    });
    message.success(t('sys.appDesigner.deleteRulesSuccess'));
  };

  const handleClose = () => {
    keyReset();
    currentId.value = '';
    isEdit.value = false;
    formRef.value?.resetFields();
    formState.bizServiceKeys = undefined;
  };

  const handleOk = async () => {
    const data = {
      modelKey: props.modelKey,
      ...pick(formState, ['name', 'status', 'description']),
      key: keyPad(formState.key ?? ''),
      bizServiceKeys: (formState.bizServiceKeys ?? []).join(),
      listRule: formState.listRule.map((item) => toRaw(item)),
    };

    if (isEdit.value) {
      await putServiceValidationById({ id: currentId.value }, data);
    } else {
      await postServiceValidation(data);
    }
    message.success(t('sys.operationSuccess'));
    closeModal();
    emit('refresh');
  };

  const onRowDragEnd = ({ oldIndex, newIndex }) => {
    let sortData = formState.listRule.slice();
    let temp = sortData[oldIndex - 1];
    sortData.splice(oldIndex - 1, 1);
    sortData.splice(newIndex - 1, -1, temp);
    formState.listRule = sortData;
  };
</script>

<style lang="less"></style>
