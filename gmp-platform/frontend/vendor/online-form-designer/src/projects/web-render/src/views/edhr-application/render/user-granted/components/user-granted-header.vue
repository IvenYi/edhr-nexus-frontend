<template>
  <div :class="[ns.b()]">
    <GrantedStatistics :statistics="statistics" :type="type" :class="[ns.e('statistics')]" />
  </div>
</template>

<script lang="ts" setup name="user-granted-header">
  import { useNamespace } from '@gct/runtime';
  import { AppGrantedStatisticDTO } from '/@/apis/gct-platform/model';
  import GrantedStatistics from './granted-statistics.vue';

  const ns = useNamespace('user-granted-header');

  const props = defineProps<{
    statistics?: AppGrantedStatisticDTO;
    type?: number;
  }>();
</script>

<style lang="scss" scoped>
  $user-granted-header: ();

  @include b(user-granted-header) {
    @include set-component-css-var(user-granted-header, $user-granted-header);

    @include e(left) {
      display: flex;
      justify-content: space-between;
    }
    @include e(right) {
      text-align: right;
      margin-bottom: 20px;
    }

    @include e(search-form) {
      display: flex;
      column-gap: 32px;
    }

    @include e(statistics) {
      margin-bottom: 16px;
    }

    @include e(num) {
      & ~ & {
        margin-left: 150px;
      }
      font-weight: bold;
    }
  }
</style>
