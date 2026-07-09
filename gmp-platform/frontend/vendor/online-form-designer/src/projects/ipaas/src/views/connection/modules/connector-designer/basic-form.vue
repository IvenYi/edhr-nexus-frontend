<template>
  <a-row :class="[ns.b()]" :gutter="16">
    <a-col :span="12">
      <a-form-item 
        name="authMode" 
        :label="t('sys.authMethod')" 
        :label-col="{ span: 8 }" 
        :wrapper-col="{ span: 14 }" 
        required
      >
        <a-select
          :disabled="disabled"
          v-model:value="formState.authMode"
          @change="handleModeChange"
        >
          <a-select-option
            v-for="item in [
              AuthModeEnum.ACCESS_TOKEN,
              AuthModeEnum.NONE,
              AuthModeEnum.AD,
              AuthModeEnum.SAP_RFC,
            ]"
            :key="item"
            :value="item"
          >
            {{ t('sys.ipaas.authModeEnum.' + item) }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col v-if="formState.authMode === AuthModeEnum.NONE" :span="12">
      <a-form-item
        :label="t('sys.ipaas.connector') + t('sys.ipaas.domain')"
        name="host"
        :label-col="{ span: 9 }"
        :wrapper-col="{ span: 13 }"
        required
        :rules="[getUrlRule(t('sys.ipaas.domain'))]"
      >
        <UrlInput :disabled="disabled" style="width: 100%" v-model:value="formState.host" />
      </a-form-item>
    </a-col>
    <template v-else-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN">
      <a-col :span="12">
        <a-form-item
          :label="t('sys.integration.authEffectiveTime')"
          name="effectiveTime"
          :label-col="{ span: 11 }"
          :wrapper-col="{ span: 11 }"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', {
                sth: t('sys.integration.authEffectiveTime'),
              }),
            },
          ]"
        >
          <a-input-number
            v-model:value="formState.effectiveTime"
            :min="1"
            :max="999999999"
            :step="1"
            :precision="0"
            :disabled="disabled"
            :placeholder="t('sys.inputTextTip', { name: t('sys.numberVal') })"
            style="width: 100%" 
          >
            <template #addonAfter>
              <a-select style="width: 84px" v-model:value="formState.timeUnit">
                <a-select-option v-for="item in EffectiveTimeUnitEnum" :key="item" :value="item">{{
                  t('sys.ipaas.timeUnit.' + item)
                }}</a-select-option>
              </a-select>
            </template>
          </a-input-number>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item 
          name="dynamicDomain" 
          :label="t('sys.integration.domainVar')"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 14 }"
        >
          <a-switch
            v-model:checked="formState.dynamicDomain"
            :checked-value="1"
            :un-checked-value="0"
            :disabled="disabled"
          />
        </a-form-item>
      </a-col>
    </template>
  </a-row>
</template>

<script lang="ts" setup name="basic-form">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref } from 'vue';
  import { AuthModeEnum, EffectiveTimeUnitEnum } from '/@ipaas/enums';
  import { UrlInput } from '/@ipaas/comps';
  import { validateUrl } from '/@ipaas/utils/url-check';
  import { getUrlRule, initAuthFormConfig } from './logic';

  const { t } = useI18n();
  const ns = useNamespace('basic-form');

  const props = withDefaults(
    defineProps<{
      disabled: boolean;
      data: IData;
    }>(),
    {
      disabled: false,
    },
  );

  const formState = computed({
    get() {
      return props.data;
    },
    set(v) {
      Object.assign(props.data, v);
    },
  });

  const checkHost = (_rule, value: string, callback, source, options) => {
    if (!value || validateUrl(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(options.message);
    }
  };

  const handleModeChange = (val) => {
    formState.value.loginAddress = undefined;
    formState.value.authFormConfig = initAuthFormConfig(val);
  };
</script>

<style lang="scss" scoped>
  $basic-form: ();

  @include b(basic-form) {
    @include set-component-css-var(basic-form, $basic-form);
    .ant-form-item-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
