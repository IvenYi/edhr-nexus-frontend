<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('item'), ns.em('item', 'current')]">
      <span :class="ns.e('item-title')">{{ currentVersion?.time }} {{ currentVersion?.user }}</span>
      <span :class="ns.e('item-type')">({{ $t('sys.onlineForm.designing') }})</span>
      <i class="iconfont icon-dingwei primary-color"></i>
    </div>
    <div
      :class="[ns.e('item'), ns.em('item', 'published')]"
      v-for="(item, index) in topPublishVersions"
      :key="item.id"
    >
      <span :class="ns.e('item-title')">{{ item?.time }} {{ item?.user }}</span>
      <span v-if="index === 0" :class="ns.e('item-type')"
        >({{ $t('sys.bpmn.versionStatus.PUBLISHED') }})</span
      >
    </div>
    <div @click="openModal" :class="[ns.e('show-all')]">{{
      $t('sys.onlineForm.viewAllHistoricalVersions')
    }}</div>
  </div>
</template>

<script lang="ts" setup name="publish-version-list">
  import { useNamespace } from '@gct/runtime';
  import { usePublishVersion } from '../../hooks/usePublishVersion';
  import PublishVersionTable from './publish-version-table.vue';

  const ns = useNamespace('publish-version-list');

  const { currentVersion, topPublishVersions } = usePublishVersion();

  const openModal = () => {
    gct.openUtil.modal(
      PublishVersionTable,
      {},
      { title: $t('sys.bpmn.versionStatus.HISTORY'), showFooter: false, width: 800 },
    );
  };
</script>

<style lang="scss" scoped>
  $publish-version-list: (
    height: auto,
  );

  @include b(publish-version-list) {
    @include set-component-css-var(publish-version-list, $publish-version-list);
    height: getCssVar(publish-version-list, height);
    width: 310px;
    background: #ffffff;
    box-shadow: 0 0 10px 1px #0000001f;

    @include e(item) {
      font-size: 14px;
      line-height: 22px;
      padding: 9px 12px;
      position: relative;

      &:hover {
        background: #f7f9ff;
      }
      @include m(current) {
        @include e(item-title) {
          color: #212528;
          font-weight: 500;
        }
        @include e(item-type) {
          color: #3168ec;
        }
      }

      @include m(published) {
        @include e(item-title) {
          color: #474747;
          font-weight: 400;
        }
        @include e(item-type) {
          color: #8f8f8f;
        }
      }
    }

    @include e(item-type) {
      margin-left: 8px;
    }

    @include e(show-all) {
      font-weight: 400;
      font-size: 14px;
      color: #3168ec;
      line-height: 22px;
      text-align: center;
      cursor: pointer;
      padding: 9px 12px;
    }

    .icon-dingwei {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      line-height: 1em;
    }
  }
</style>
