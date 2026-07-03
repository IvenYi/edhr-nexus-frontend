<template>
  <div class="signature-confirm-render">
    <div v-if="!props.justConfirm" class="text-[14px] py4px add-btn" @click="addSign">
      <i class="iconfont icon-chuangjianbanben lh-1 mr6px"></i>
      添加
    </div>
    <van-form ref="formRef" label-align="left" input-align="right">
      <van-cell-group :border="false" v-for="(item, index) in dataSource" :key="index">
        <van-field
          v-model="item.name"
          :border="false"
          :name="`dataSource.${index}.name`"
          required
          :readonly="item.validatePass"
          :rules="[
            { required: true, message: '请输入账号' },
            {
              message: '该签名账号重复',
              validator: (value, rule) => validateName(value, rule, index),
            },
          ]"
          label="账号"
          placeholder="请输入"
        />
        <van-field
          v-model="item.password"
          :border="false"
          :name="`dataSource.${index}.password`"
          :readonly="item.validatePass"
          :rules="[{ required: true, message: '请输入密码' }]"
          type="password"
          label="密码"
          required
          placeholder="请输入"
        />
        <div class="ks-row verify-item" :class="[item.validatePass && 'disabled']">
          <van-button
            type="primary"
            class="verify-btn"
            :disabled="item.validatePass"
            :loading="item.loading"
            @click="onVerify(item, index)"
          >
            签名验证
          </van-button>
          <i
            v-if="!props.justConfirm"
            class="iconfont icon-shanchu2 text-[16px] lh-1 p7px ml14px"
            :class="[!item.validatePass && 'error-gct']"
            @click="!item.validatePass && onDelete(index)"
          ></i>
        </div>
      </van-cell-group>
    </van-form>
  </div>
</template>
<script setup lang="ts" name="gct-signature-confirm-render">
  import { ref, computed, onMounted } from 'vue';
  import { showConfirmDialog } from 'vant';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import CryptoJS from 'crypto-js';
  import { ISignatureConfirm } from './schema';

  interface DataItem {
    name: string;
    password: number | string;
    validatePass?: boolean;
    hasValidated?: boolean;
    loading?: boolean;
  }
  const props = defineProps<{
    widget: ISignatureConfirm;
    justConfirm?: boolean;
    relationId?: string;
    isSignRequired?: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'afterVerify', data: object): void;
  }>();

  const Event = getPageEvent();
  const dataSource = ref<DataItem[]>([]);
  const relationId = ref(uniqueKey());
  const formRef = ref();

  const signRelationId = computed({
    get() {
      if (props?.relationId) {
        return props?.relationId;
      }
      return relationId.value;
    },
    set(val) {
      relationId.value = val;
    },
  });

  const addSign = () => {
    const newData = {
      name: '',
      password: '',
      hasValidated: false,
      validatePass: false,
      loading: false,
    };
    dataSource.value.push(newData);
  };

  const onDelete = (idx) => {
    showConfirmDialog({
      message: '确认删除？',
    })
      .then(() => {
        dataSource.value.splice(idx, 1);
      })
      .catch(() => {
        // on cancel
      });
  };

  const onVerify = async (record, idx) => {
    await formRef.value?.validate([`dataSource.${idx}.name`, `dataSource.${idx}.password`]);
    dataSource.value[idx].loading = true;
    const signParams = {
      sign_account_: record.name,
      relation_id_: signRelationId.value,
      type_: props.widget?.props?.purposeOfSignature,
    };
    try {
      Object.assign(signParams, {
        password_: sha256(record.password),
      });
      await Event.context.$customBizService.post(
        {
          // @ts-ignore
          action: 'accountSave',
          key: 'em_sign_history',
        },
        {
          ...signParams,
        },
      );
      record.validatePass = true;
      dataSource.value[idx].loading = false;
      Event.runEventByName('afterVerification', props?.widget?.events, {
        ...record,
        type_: props.widget?.props?.purposeOfSignature,
      });
      emit('afterVerify', { ...record, type_: props.widget?.props?.purposeOfSignature });
    } catch (err) {
      record.validatePass = false;
      dataSource.value[idx].loading = false;
    } finally {
      record.hasValidated = true;
      dataSource.value[idx].loading = false;
    }
  };

  const fullValidate = async () => {
    if (!dataSource.value.length) {
      return Promise.reject('请添加签名确认');
    }
    try {
      await formRef.value?.validate();
      dataSource.value.forEach((item) => {
        item.hasValidated = true;
        item.validatePass = item.validatePass || false;
      });
      if (!dataSource.value?.length && props.widget?.props.isSignRequired) {
        return Promise.reject('请添加签名账号');
      }
      if (dataSource.value?.length && !dataSource.value.every((item) => item.validatePass)) {
        return Promise.reject('用户验证失败');
      }
    } catch (err) {
      console.error(err, 'error');
      throw err;
    }
  };

  const reset = () => {
    dataSource.value = [];
    signRelationId.value = uniqueKey();
  };

  function sha256(password) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }

  function validateName(value, rule, idx) {
    return !dataSource.value.find((e, i) => e.name === value && i !== idx);
  }

  function uniqueKey() {
    var time = new Date().getTime();
    var random = Math.random().toString().substring(2, 8);
    return time + random;
  }

  onMounted(() => {
    if (props.justConfirm) {
      addSign();
    }
  });

  defineExpose({
    relationId: signRelationId,
    getRelationId: () => signRelationId.value,
    reset,
    fullValidate,
    getValue() {
      return dataSource.value;
    },
    clearValidate() {
      dataSource.value = [];
      formRef.value?.resetValidation();
    },
  });
</script>

<style lang="less" scoped>
  .add-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--van-primary-color);
    color: var(--van-primary-color);
    border-radius: 6px;
  }
  :deep(.van-cell-group) {
    background: transparent;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    padding: 14px 10px;
    margin-top: 10px;
  }
  :deep(.van-cell) {
    background: transparent;
    padding: 10px;
  }
  .verify-item {
    justify-content: right;
    align-items: center;
    color: #fff;
    :deep(.verify-btn.van-button) {
      padding: 7px 21px;
      border-radius: 6px;
      height: auto;
    }

    &.disabled {
      color: #666666;
      .verify-btn {
        color: #666666;
        background-color: #e5e5e5;
        border-color: #e5e5e5;
      }
    }
  }
  .error-gct {
    color: var(--van-danger-color);
  }
</style>
