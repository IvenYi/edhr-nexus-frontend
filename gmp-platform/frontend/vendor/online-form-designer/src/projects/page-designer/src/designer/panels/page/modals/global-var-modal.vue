<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${formState.id ? t('sys.edit') : t('sys.new')}${t('sys.pageDesigner.variable')}`"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-alert
      :message="t('sys.pageDesigner.tipGlobal')"
      type="warning"
      show-icon
      style="margin-bottom: 12px"
    />
    <a-form
      class="pb10px"
      ref="varFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="`${t('sys.pageDesigner.variable')}KEY`"
        :name="['varInfo', 'key']"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input
          v-model:value="formState.varInfo.key"
          :maxlength="16"
          show-count
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
        />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.pageDesigner.variable')}${t('sys.type')}`"
        :name="['varInfo', 'type']"
      >
        <a-select v-model:value="formState.varInfo.type" @change="changeType">
          <a-select-option
            v-for="item in GLOBAL_VAR_TYPE"
            :key="item"
            :value="GLOBAL_VAR_TYPE[item]"
            >{{ t(`sys.pageDesigner.${item}`) }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('sys.pageDesigner.appredis')">
        <a-switch v-model:checked="formState.varInfo.appredis" />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.defaultValue')}`"
        :name="['varInfo', 'defaultValue']"
        v-if="
          [
            GLOBAL_VAR_TYPE.STRING,
            GLOBAL_VAR_TYPE.NUMBER,
            GLOBAL_VAR_TYPE.BOOLEAN,
            GLOBAL_VAR_TYPE.DATE,
            GLOBAL_VAR_TYPE.DATETIME,
            GLOBAL_VAR_TYPE.TIME,
          ].includes(formState.varInfo.type)
        "
      >
        <a-input
          v-model:value="formState.varInfo.defaultValue"
          v-if="formState.varInfo.type === GLOBAL_VAR_TYPE.STRING"
        />
        <a-input-number
          v-model:value="formState.varInfo.defaultValue"
          v-if="formState.varInfo.type === GLOBAL_VAR_TYPE.NUMBER"
        />

        <a-select
          v-model:value="formState.varInfo.defaultValue"
          v-if="formState.varInfo.type === GLOBAL_VAR_TYPE.BOOLEAN"
          name="defaultValue"
        >
          <a-select-option :value="true">{{
            t('sys.pageDesigner.boolean') + t('sys.pageDesigner.true')
          }}</a-select-option>
          <a-select-option :value="false">{{
            t('sys.pageDesigner.boolean') + t('sys.pageDesigner.false')
          }}</a-select-option>
        </a-select>

        <a-row
          :gutter="16"
          v-if="
            [GLOBAL_VAR_TYPE.DATE, GLOBAL_VAR_TYPE.DATETIME, GLOBAL_VAR_TYPE.TIME].includes(
              formState.varInfo.type,
            )
          "
        >
          <a-col :span="12">
            <a-select v-model:value="isCurrentTime">
              <a-select-option :value="true">
                {{ t('sys.pageDesigner.currentTime') }}
              </a-select-option>
              <a-select-option :value="false">
                {{ t('sys.pageDesigner.fixedTime') }}
              </a-select-option>
            </a-select></a-col
          >
          <a-col :span="12">
            <a-date-picker
              v-if="
                [GLOBAL_VAR_TYPE.DATE, GLOBAL_VAR_TYPE.DATETIME].includes(formState.varInfo.type)
              "
              :disabled="isCurrentTime"
              :show-time="formState.varInfo.type === GLOBAL_VAR_TYPE.DATETIME"
              v-model:value="formState.varInfo.defaultValue"
              placeholder=""
              style="width: 100%"
            />

            <a-time-picker
              v-if="formState.varInfo.type === GLOBAL_VAR_TYPE.TIME"
              :disabled="isCurrentTime"
              v-model:value="formState.varInfo.defaultValue"
              placeholder=""
              style="width: 100%"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item :label="`${t('sys.description')}`" :name="['varInfo', 'description']">
        <a-textarea v-model:value="formState.varInfo.description" :maxlength="120" show-count />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { type FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { GLOBAL_VAR_TYPE } from '/@page-designer/enum';
  import { GlobalVar } from '/@page-designer/types/panel';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { cloneDeep } from 'lodash-es';
  import dayjs from 'dayjs';

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('$VAR_');
  const varFormRef = ref<FormInstance>();
  const formState = ref<{ id: string; varInfo: GlobalVar }>({
    id: '',
    varInfo: {
      key: '',
      type: GLOBAL_VAR_TYPE.STRING,
      defaultValue: '',
      description: '',
      appredis: false,
    },
  });
  const isEdit = ref(false);
  const isCurrentTime = ref(true);
  const emit = defineEmits(['ok', 'register']);

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[A-Z0-9_]*$/;
    if (!reg.test(value)) {
      callback(t('sys.appDesigner.validateKeyError', { sth: t('sys.appDesigner.variableName') }));
    }
    callback();
  };

  watch(isCurrentTime, (val) => {
    if (val) {
      formState.value.varInfo.defaultValue = undefined;
    }
  });

  //打开弹框传参
  const [registerInner] = useModalInner((data) => {
    data && onDataReceive(data);
    console.log('Data Received', data);
  });
  const onDataReceive = (data) => {
    isEdit.value = true;
    const key = keyClip(data.varInfo!.key);
    const varInfo = Object.assign(data.varInfo, { key });
    if (
      [GLOBAL_VAR_TYPE.DATE, GLOBAL_VAR_TYPE.DATETIME, GLOBAL_VAR_TYPE.TIME].includes(varInfo.type)
    ) {
      if (varInfo.defaultValue === 'current') {
        isCurrentTime.value = true;
        varInfo.defaultValue = undefined;
      } else {
        isCurrentTime.value = false;
        varInfo.defaultValue = dayjs(varInfo.defaultValue);
      }
    }
    formState.value = { ...data, varInfo };
  };
  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    varFormRef.value?.resetFields();
    formState.value = {
      id: '',
      varInfo: {
        key: '',
        type: GLOBAL_VAR_TYPE.STRING,
        defaultValue: '',
        description: '',
      },
    };
  };
  const handleOk = () => {
    varFormRef.value!.validate().then(() => {
      const varInfo = Object.assign(cloneDeep(formState.value.varInfo), {
        key: keyPad(formState.value.varInfo.key),
      });
      if (
        [GLOBAL_VAR_TYPE.DATE, GLOBAL_VAR_TYPE.DATETIME, GLOBAL_VAR_TYPE.TIME].includes(
          varInfo.type,
        )
      ) {
        varInfo.defaultValue = isCurrentTime.value ? 'current' : formatDate(varInfo.defaultValue);
      }

      emit('ok', { ...formState.value, varInfo });
    });
  };
  const changeType = (val) => {
    if ([GLOBAL_VAR_TYPE.DATE, GLOBAL_VAR_TYPE.DATETIME, GLOBAL_VAR_TYPE.TIME].includes(val)) {
      formState.value.varInfo.defaultValue = isCurrentTime.value ? undefined : dayjs();
    } else {
      formState.value.varInfo.defaultValue = undefined;
    }
  };
  const formatDate = (val) => {
    let format = 'YYYY-MM-DD HH:mm:ss';
    if (formState.value.varInfo.type === GLOBAL_VAR_TYPE.TIME) {
      format = 'hh:mm:ss';
    } else if (formState.value.varInfo.type === GLOBAL_VAR_TYPE.DATE) {
      format = 'YYYY-MM-DD';
    }
    return dayjs(val).format(format);
  };
</script>

<style lang="less" scoped></style>
