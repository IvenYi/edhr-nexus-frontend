<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('body')]">
      <a-form :model="formState">
        <a-form-item name="authMode" label="t('sys.authMode')" />
      </a-form>
    </div>
    <div :class="[ns.e('footer')]">
      <a-button @click="onPrev">
        {{ t('sys.editor.prev') }}
      </a-button>
      <a-button type="primary" @click="onNext">
        {{ t('sys.editor.next') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="auth-fields-form">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import { IConnectorDesignerData } from './type';

  const { t } = useI18n();
  const ns = useNamespace('auth-fields-form');

  const props = withDefaults(
    defineProps<{
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'prev'): void;
    (e: 'next'): void;
  }>();

  const formState = computed({
    get() {
      return props.data;
    },
    set(v) {
      Object.assign(props.data, v);
    },
  });

  const onPrev = () => {
    emit('prev');
  };

  const onNext = () => {
    emit('next');
  };
</script>

<style lang="scss" scoped>
  $auth-fields-form: (
    footer-height: 40px,
  );

  @include b(auth-fields-form) {
    @include set-component-css-var(auth-fields-form, $auth-fields-form);

    @include e(body) {
      height: calc(100% - getcssvar(auth-fields-form, footer-height));
      padding: 1px;
      overflow: auto;
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: getcssvar(auth-fields-form, footer-height);
      gap: 16px;
    }
  }
</style>
