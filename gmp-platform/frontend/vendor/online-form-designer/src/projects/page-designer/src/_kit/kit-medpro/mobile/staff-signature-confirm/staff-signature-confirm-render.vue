<template>
  <div class="staff-signature-confirm-render">
    <van-form ref="formRef" label-align="left" input-align="right" validate-trigger="onChange">
      <van-cell-group
        class="staff-van-cell-group"
        :border="false"
        v-for="(item, index) in dataSource"
        :key="item.key"
      >
        <template v-for="field in computedFields" :key="field.dataIndex">
          <DynamicField
            :field="field"
            :item="item"
            :required="!!field.required"
            :name="`dataSource.${index}.dataIndex`"
            :dataSource="dataSource"
            :staffFields="staffFields"
          />
        </template>
        <div class="ks-row verify-item" :class="[item.validatePassed && 'disabled']">
          <i
            class="iconfont icon-shanchu2 text-[16px] lh-1 p7px ml14px"
            :class="[!item.validatePassed && 'error-gct']"
            @click="handleDelete(index)"
          />
          <van-button
            plain
            type="primary"
            class="verify-btn"
            :disabled="item.validatePassed"
            @click="handleConfirm(item)"
          >
            签名验证
          </van-button>
        </div>
      </van-cell-group>
    </van-form>

    <div class="text-[14px] py4px add-btn" @click="handleAdd" v-if="!hideAdd">
      <i class="iconfont icon-tianjia lh-1 mr6px"></i>
      添加
    </div>

    <!-- 签名确认弹框 -->
    <van-popup
      v-model:show="showPopup"
      round
      closeable
      close-icon-position="top-right"
      destroy-on-close
      position="bottom"
    >
      <label class="signature-confirm-title font-bold text-#323233">签名确认</label>
      <SignatureConfirm
        class="signature-confirm"
        ref="signatureConfirm"
        :key="signatureConfirmKey"
        :widget="signatureWidget"
        :relationId="signRelationId"
        :justConfirm="true"
        :isSignRequired="isSignRequired"
        @afterVerify="onAfterVerify"
      />
    </van-popup>
  </div>
</template>

<script lang="ts" setup name="gct-staff-signature-confirm-render">
  import { reactive, ref, computed } from 'vue';
  import type { Ref, ComputedRef } from 'vue';
  import { showConfirmDialog, showNotify } from 'vant';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IStaffSignatureConfirm } from './schema';
  import SignatureConfirm from '../signature-confirm/signature-confirm-render.vue';
  import DynamicField from './components/dynamic-field.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  interface DataItemBase {
    key: string;
    user: string;
    validatePassed?: boolean;
    hasValid?: boolean;
  }

  type DataItem = DataItemBase & {
    [KEY in FIELD_TYPE]?: any;
  };

  interface IField {
    title: string;
    key: string;
    dataIndex: string;
    type: FIELD_TYPE;
    required: boolean;
    rules?: Function;
  }

  const Event = getPageEvent();
  const defProps = defineProps<{ widget?: IStaffSignatureConfirm }>();
  const { isSignRequired, needOtherFields, otherFieldsData, staffFields, hideAdd } = reactive(
    defProps?.widget?.props || ({} as any),
  );

  const dataSource: Ref<DataItem[]> = ref([]);
  const formRef = ref();
  const signRelationId = ref();
  const showPopup = ref(false);
  const signatureConfirmKey = ref();
  const signatureConfirm = ref();
  const signSubjectInfo = ref<DataItem>();

  const signatureWidget = computed(() => {
    return {
      props: {
        isSignRequired: isSignRequired,
        purposeOfSignature: 'producing',
      },
    } as any;
  });

  const computedFields: ComputedRef<IField[]> = computed(() => {
    const columns = [
      {
        title: '人员',
        dataIndex: 'user',
        key: `${FIELD_TYPE.USER}_${getRandomUUID()}`,
        type: FIELD_TYPE.USER,
        required: true,
      },
    ];
    if (needOtherFields && otherFieldsData) {
      for (const key in otherFieldsData) {
        const element = otherFieldsData[key];
        if (element) {
          const addItem = {
            title: element.name,
            dataIndex: element.key,
            key: element.key,
            type: element.type,
            required: element.required,
          };
          columns.push(addItem);
        }
      }
    }
    return columns;
  });

  async function handleConfirm(record) {
    if (!record.user) {
      showNotify({ type: 'warning', message: '请选择人员进行签名确认' });
      return;
    }
    if (record.validatePassed) return;

    showPopup.value = true;
    signSubjectInfo.value = record;
    signatureConfirmKey.value = getRandomUUID();
  }

  function handleDelete(idx: number) {
    showConfirmDialog({
      message: '确认删除？',
    }).then(() => {
      dataSource.value.splice(idx, 1);
    });
  }

  function handleAdd() {
    const newData = {
      key: `${getRandomUUID()}`,
      user: '',
      validatePassed: !isSignRequired,
      hasValid: !isSignRequired,
    };
    dataSource.value.push(newData);
  }

  function onAfterVerify(data) {
    validateAfterClosed();
  }

  async function validateAfterClosed() {
    try {
      await signatureConfirm.value.fullValidate();
      dataSource.value.forEach((item) => (item.hasValid = true));
      await validateSignature();
      dataSource.value.forEach(
        (item) => {
          if(item.key === signSubjectInfo.value?.key) {
            item.validatePassed = true;
          }
        },
      );
      formRef.value.validate();
    } catch (err) {
      if (err && typeof err === 'string') {
        showNotify({ type: 'danger', message: err });
      }
    } finally {
      showPopup.value = false;
    }
  }

  function reset() {
    dataSource.value = [];
    signRelationId.value = getRandomUUID();
  }

  async function validateSignature() {
    try {
      const signList = (signatureConfirm.value?.getValue() ?? []).map((e) => e.name) ?? [];
      const signParams = {
        user_id_: signSubjectInfo.value?.user,
        account_list_: signList,
      };
      await Event.context.$customBizService.post(
        {
          // @ts-ignore
          action: 'biz_validate_account_consistency_edgb',
          key: 'em_sign_history',
        },
        {
          ...signParams,
        },
      );
    } catch (e) {
      console.error(e, 'error about 签名确认和用户不匹配');
      throw e;
    }
  }

  function getRandomUUID() {
    const time = new Date().getTime();
    const random = Math.random().toString().substring(2, 8);
    return time + random;
  }

  async function fullValidate() {
    try {
      await formRef.value?.validate();
      dataSource.value.forEach((item) => {
        item.validatePassed = !!item.validatePassed;
      });
      if (!dataSource.value?.length && isSignRequired) {
        return Promise.reject('请添加签名账号');
      }
      if (dataSource.value?.length && !dataSource.value.every((item) => item.validatePassed)) {
        return Promise.reject('用户验证失败');
      }
    } catch (err) {
      console.error(err, 'error validation');
      throw err;
    }
  }

  
  const addDataSource = (data: any) => {
    const newData = {
      key: `${getRandomUUID()}`,
      validatePassed: !isSignRequired,
      hasValid: false,
      ...data,
    };
    dataSource.value.push(newData);
  };

  const setDataSource = (data: any) => {
    const newData = {
      validatePassed: !isSignRequired,
      hasValid: false,
    };
    dataSource.value = data.map((e, index) => ({
      key: `${getRandomUUID()}${index}`,
      ...newData,
      ...e,
    }));
  };


  defineExpose({
    relationId: signRelationId,
    fullValidate,
    getValue() {
      return dataSource.value;
    },
    reset,
    addDataSource,
    setDataSource
  });
</script>

<style lang="less" scoped>
  .staff-signature-confirm-render {
    .add-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid var(--van-primary-color);
      color: var(--van-primary-color);
      border-radius: 6px;
    }

    :deep(.van-cell-group) {
      border-radius: 4px;
      padding: 14px 10px;
      margin-bottom: 10px;
      &.staff-van-cell-group {
        background-color: #f2f2f2;
      }
    }

    :deep(.van-cell) {
      background: transparent;
      padding: 10px 0;

      .van-icon {
        vertical-align: middle;
        display: flex;
        align-items: center;
      }
    }

    .verify-item {
      justify-content: right;
      align-items: center;
      color: #fff;

      :deep(.verify-btn.van-button) {
        padding: 7px 0 7px 8px;
        border-radius: 6px;
        height: auto;
        border: 0px !important;
        background: transparent !important;
      }

      &.disabled {
        color: #666666;

        .verify-btn {
          border: 0;
          color: #666666;
          background-color: #e5e5e5;
          border-color: #e5e5e5;
        }
      }
    }

    .error-gct {
      color: var(--van-danger-color);
    }

    :deep(.van-popup__close-icon) {
      position: absolute;
    }
  }

  .signature-confirm {
    padding: 16px;
    margin-top: 32px;

    :deep(.van-cell-group) {
      padding: 12px !important;
    }
    :deep(.van-cell) {
      padding-left: 0;
      padding-right: 0;
    }

    &-title {
      position: absolute;
      top: var(--van-popup-close-icon-margin);
      left: var(--van-popup-close-icon-margin);
    }
  }
</style>
