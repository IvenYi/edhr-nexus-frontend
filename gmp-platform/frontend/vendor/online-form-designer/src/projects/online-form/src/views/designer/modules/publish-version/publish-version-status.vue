<template>
  <div :class="[ns.b()]">
    <a-dropdown :trigger="['click']">
      <div :class="ns.e('trigger')">
        <span :class="[ns.e('label')]">{{ $t('sys.app.currentVersion') }}: </span>
        {{ $t('sys.onlineForm.designing') }}
        <DownOutlined :class="[ns.e('arrow')]" />
      </div>
      <template #overlay>
        <PublishVersionList />
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup name="publish-version-status">
  import { useNamespace } from '@gct/runtime';
  import { DownOutlined } from '@ant-design/icons-vue';
  import PublishVersionList from './publish-version-list.vue';

  const ns = useNamespace('publish-version-status');
</script>

<style lang="scss" scoped>
  $publish-version-status: (
    height: auto,
  );

  @include b(publish-version-status) {
    @include set-component-css-var(publish-version-status, $publish-version-status);
    height: getCssVar(publish-version-status, height);
    position: absolute;
    z-index: 10;
    top: 76px;
    left: 34px;
    box-shadow: 0 0 10px 1px #0000001f;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fafafa;

    @include e(trigger) {
      background-color: #f0f0f0;
      padding: 7px;
    }

    @include e(label) {
      color: #797a7d;
    }

    @include e(arrow) {
      margin-left: 4px;
    }
  }
</style>
