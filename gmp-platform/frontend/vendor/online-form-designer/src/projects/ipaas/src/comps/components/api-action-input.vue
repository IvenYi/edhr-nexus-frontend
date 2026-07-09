<template>
  <a-input :class="[ns.b()]" v-model:value="local.url" show-count :maxlength="128">
    <template #addonBefore>
      <span v-if="props.dynamicDomain">{{ $t('sys.ipaas.connectorDomain') }}</span>
      <a-select v-else v-model:value="local.hostProtocol" style="width: 90px">
        <a-select-option v-for="item in ProtocolEnum" :key="item" :value="item">{{
          item
        }}</a-select-option>
      </a-select>
    </template>
    <template #addonAfter>
      <a-select v-model:value="_httpMethod" style="width: 84px">
        <a-select-option value="GET">GET</a-select-option>
        <a-select-option value="POST">POST</a-select-option>
      </a-select>
    </template>
  </a-input>
</template>

<script lang="ts" setup name="api-action-input">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, watch } from 'vue';
  import { Form } from 'ant-design-vue';

  const formItemContext = Form.useInjectFormItemContext();

  const { t } = useI18n();
  const ns = useNamespace('api-action-input');

  enum ProtocolEnum {
    Http = 'http://',
    Https = 'https://',
  }

  const props = withDefaults(
    defineProps<{
      value?: string;
      httpMethod: string;
      // 是否启用动态域名,0: 未启用 1: 启用
      dynamicDomain: number;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'update:httpMethod', value: string): void;
  }>();

  const _httpMethod = computed({
    get() {
      return props.httpMethod;
    },
    set(v) {
      emit('update:httpMethod', v);
      formItemContext.onFieldChange();
    },
  });

  const local = computedEx({
    get: () => {
      // 启用动态域名的时候,不考虑协议
      if (props.dynamicDomain) {
        return {
          hostProtocol: undefined,
          url: props.value,
        };
      }
      if (!props.value) {
        return {
          hostProtocol: ProtocolEnum.Http,
          url: '',
        };
      } else if (props.value.startsWith(ProtocolEnum.Https)) {
        return {
          hostProtocol: ProtocolEnum.Https,
          url: props.value.replace(ProtocolEnum.Https, ''),
        };
      } else if (props.value.startsWith(ProtocolEnum.Http)) {
        return {
          hostProtocol: ProtocolEnum.Http,
          url: props.value.replace(ProtocolEnum.Http, ''),
        };
      } else {
        return {
          hostProtocol: undefined,
          url: props.value,
        };
      }
    },
    set: (v) => {
      let emitVal = v.url;
      if (!props.dynamicDomain) {
        emitVal = (v.hostProtocol || '') + emitVal;
      }
      emit('update:value', emitVal);
    },
    deep: true,
  });

  // 变更动态域名时,清空value
  watch(
    () => props.dynamicDomain,
    (v) => {
      emit('update:value', undefined);
    },
  );
</script>

<style lang="scss" scoped>
  $api-action-input: ();

  @include b(api-action-input) {
    @include set-component-css-var(api-action-input, $api-action-input);
  }
</style>
