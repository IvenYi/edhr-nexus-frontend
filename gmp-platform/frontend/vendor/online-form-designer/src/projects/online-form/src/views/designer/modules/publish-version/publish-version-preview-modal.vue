<template>
  <iframe :class="[ns.b()]" :src="url"></iframe>
</template>

<script lang="ts" setup name="publish-version-preview">
  import { useNamespace } from '@gct/runtime';
  import { OnlineFormPublishVersion } from '../../hooks/usePublishVersion';

  const ns = useNamespace('publish-version-preview');

  const props = defineProps<{
    /** 模板id */
    data: OnlineFormPublishVersion;
  }>();

  const url = `${location.origin}${location.pathname}#/render/online-form-publish-version-preview-view?versionId=${props.data.id}`;
</script>

<style lang="scss" scoped>
  $publish-version-preview: (
    height: 99%,
  );

  @include b(publish-version-preview) {
    @include set-component-css-var(publish-version-preview, $publish-version-preview);
    height: getCssVar(publish-version-preview, height);
    width: 100%;
    border: 0;
  }
</style>
