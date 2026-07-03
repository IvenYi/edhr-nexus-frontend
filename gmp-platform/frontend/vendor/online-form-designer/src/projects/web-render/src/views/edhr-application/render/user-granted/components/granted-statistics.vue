<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('item'), ns.em('item', 'total')]">
      <div :class="[ns.e('item-left')]">
        <div :class="[ns.e('item-title')]"> {{ t('sys.edhr.totalGrantedNum') }}</div>
        <div :class="[ns.e('item-num')]">{{ totalNum }}</div>
      </div>
      <img :class="[ns.e('item-img')]" :src="UserGrantedTotal" />
    </div>
    <div :class="[ns.e('item'), ns.em('item', 'used')]">
      <div :class="[ns.e('item-left')]">
        <div :class="[ns.e('item-title')]"> {{ t('sys.edhr.usedGrantedNum') }}</div>
        <div :class="[ns.e('item-num')]">{{ usedNum }}</div>
      </div>
      <img :class="[ns.e('item-img')]" :src="UserGrantedUsed" />
    </div>
    <div v-if="type !== 0" :class="[ns.e('item'), ns.em('item', 'share')]">
      <div :class="[ns.e('item-left')]">
        <div :class="[ns.e('item-title')]"> {{ t('sys.edhr.shareGrantedNum') }}</div>
        <div :class="[ns.e('item-num')]">{{ shared }}</div>
      </div>
      <img :class="[ns.e('item-img')]" :src="UserGrantedShare" />
    </div>
    <div :class="[ns.e('item'), ns.em('item', 'remain')]">
      <div :class="[ns.e('item-left')]">
        <div :class="[ns.e('item-title')]"> {{ t('sys.edhr.remainGrantedNum') }}</div>
        <div :class="[ns.e('item-num')]">{{ remainNum }}</div>
      </div>
      <img :class="[ns.e('item-img')]" :src="UserGrantedRemain" />
    </div>
  </div>
</template>

<script lang="ts" setup name="granted-statistics">
  import { useNamespace } from '@gct/runtime';
  import { AppGrantedStatisticDTO } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';

  import UserGrantedUsed from '/@web-render/assets/image/user-granted-used.png';
  import UserGrantedShare from '/@web-render/assets/image/user-granted-share.png';
  import UserGrantedRemain from '/@web-render/assets/image/user-granted-remain.png';
  import UserGrantedTotal from '/@web-render/assets/image/user-granted-total.png';
  import { computed } from 'vue';

  const ns = useNamespace('granted-statistics');

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      statistics?: AppGrantedStatisticDTO;
      type?: number;
    }>(),
    {
      statistics: () => ({
        total: 0,
        remain: 0,
        used: 0,
        shared: 0,
      }),
    },
  );

  /** 不限制 */
  const noLimit = computed(() => {
    return props.statistics.total === -1;
  });

  /** 不限制显示图标 */
  const noLimitTag = '♾️';

  const usedNum = computed(() => {
    return props.statistics.used || 0;
  });

  const shared = computed(() => {
    return props.statistics.shared || 0;
  });
  const totalNum = computed(() => {
    if (noLimit.value) {
      return noLimitTag;
    }
    return props.statistics.total || 0;
  });
  const remainNum = computed(() => {
    if (noLimit.value) {
      return noLimitTag;
    }
    return props.statistics.remain || 0;
  });
</script>

<style lang="scss" scoped>
  $granted-statistics: ();

  @include b(granted-statistics) {
    @include set-component-css-var(granted-statistics, $granted-statistics);
    display: flex;

    @include e(item) {
      flex-grow: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100px;
      & ~ & {
        margin-left: 20px;
      }

      @include m(total) {
        background: #e4eefd;
      }
      @include m(used) {
        background: #e5f3fc;
      }
      @include m(share) {
        background: #e8f8f8;
      }
      @include m(remain) {
        background: #efefff;
      }
    }

    @include e(item-left) {
      padding: 16px;
      flex-grow: 1;
    }

    @include e(item-title) {
      font-weight: 400;
      font-size: 16px;
      color: #384356;
    }

    @include e(item-num) {
      font-weight: 600;
      font-size: 28px;
      color: #000000;
    }

    @include e(item-img) {
      height: 100%;
    }
  }
</style>
