<template>
  <a-input :class="[ns.b()]" v-model:value="local.url" show-count :maxlength="128">
    <template #addonBefore>
      <a-select v-model:value="local.hostProtocol" style="width: 90px">
        <a-select-option v-for="item in ProtocolEnum" :key="item" :value="item">{{
          item
        }}</a-select-option>
      </a-select>
    </template>
  </a-input>
</template>

<script lang="ts" setup name="url-input">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Form } from 'ant-design-vue';

  const formItemContext = Form.useInjectFormItemContext();

  const { t } = useI18n();
  const ns = useNamespace('url-input');

  const props = withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {
      value: '',
    },
  );

  enum ProtocolEnum {
    Http = 'http://',
    Https = 'https://',
  }

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();

  const local = computedEx({
    get: () => {
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
          url: props.value || '',
        };
      }
    },
    set: (v) => {
      emit('update:value', (v.hostProtocol || '') + v.url);
      formItemContext.onFieldChange();
    },
    deep: true,
  });
</script>

<style lang="scss" scoped>
  $url-input: ();

  @include b(url-input) {
    @include set-component-css-var(url-input, $url-input);
  }
</style>
