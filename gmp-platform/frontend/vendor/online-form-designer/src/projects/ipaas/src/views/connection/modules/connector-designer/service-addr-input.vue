<template>
  <a-input v-model:value="formState.url" show-count maxlength="128">
    <template #addonBefore>
      <a-select v-model:value="formState.protocol" style="width: 100px">
        <a-select-option value="ldap://">ldap://</a-select-option>
      </a-select>
    </template>
    <template #addonAfter>
      <a-input
        v-model:value="formState.port"
        type="text"
        :placeholder="$t('sys.integration.port')"
        :bordered="false"
        style="width: 100px"
      />
    </template>
  </a-input>
</template>
<script setup lang="ts" name="service-addr-input">
  import { Form } from 'ant-design-vue';
  import { computedEx } from '@gct/runtime';

  const emit = defineEmits(['update:value']);
  const formItemContext = Form.useInjectFormItemContext();

  const props = defineProps({
    value: {
      type: String,
      default: undefined,
    },
  });

  const formState = computedEx({
    get() {
      if (!props.value) {
        return {
          protocol: 'ldap://',
          url: undefined,
          port: '389',
        };
      } else {
        const list = props.value.replace('ldap://', '').split(':');
        return {
          protocol: 'ldap://',
          url: list[0],
          port: list[list.length - 1],
        };
      }
    },
    set(value) {
      const path = value.url ? `${value.protocol}${value.url}:${value.port}` : '';
      emit('update:value', path);
      formItemContext.onFieldChange();
    },
    deep: true,
  });
</script>
<style lang="scss" scoped>
  :deep(.ant-input-group .ant-input-group-addon:last-of-type) {
    padding: 0;
    background-color: #fff;
  }
</style>
