<template>
  <span :class="[ns.b()]" v-if="data.children" :title="data.name">
    {{ data.name }}
  </span>
  <span v-else :class="[ns.e('version-name')]" @click="onClick">
    {{ data.version }}
    <span class="gct-custom-tag" v-if="!!data.default">
      {{ t('sys.default') }}
    </span>
  </span>
</template>

<script lang="ts" setup name="version-name-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();
  const ns = useNamespace('version-name-tag');
  type DataType = {
    children?: IData[];
    name?: string;
    version?: string;
    default?: boolean;
    [key: string]: any;
  };

  const props = withDefaults(
    defineProps<{
      data: DataType;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'link'): void;
  }>();

  const onClick = debounce(() => {
    emit('link');
    console.log('onClick');
  }, 500);
</script>

<style lang="scss" scoped>
  $version-name-tag: ();

  @include b(version-name-tag) {
    @include set-component-css-var(version-name-tag, $version-name-tag);

    @include e(version-name) {
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }
</style>
