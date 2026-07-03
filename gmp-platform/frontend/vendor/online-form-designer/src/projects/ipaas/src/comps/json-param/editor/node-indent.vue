<template>
  <div
    :class="[ns.b(), !param.collapse && ns.m('collapse')]"
    :style="{
      paddingLeft: level * 20 + 'px',
    }"
  >
    <div style="width: 20px; height: 20px" class="flex justify-center items-center flex-none">
      <div
        v-if="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(param.type)"
        @click="handleToggle"
      >
        <caret-right-outlined :class="[ns.e('node-arrow')]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="node-indent">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AuthKeyTypeEnum } from '/@ipaas/enums';
  import { ITreeJsonParam } from '../types';

  const { t } = useI18n();
  const ns = useNamespace('node-indent');

  const props = withDefaults(
    defineProps<{
      param: ITreeJsonParam;
      level: number;
    }>(),
    {},
  );

  const handleToggle = () => {
    let item = props.param;
    item.collapse = !item.collapse;
  };
</script>

<style lang="scss" scoped>
  $node-indent: ();

  @include b(node-indent) {
    @include set-component-css-var(node-indent, $node-indent);
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    align-items: center;

    @include e(node-arrow) {
      transition: all 0.3s;
      cursor: pointer;
    }

    @include m(collapse) {
      @include e(node-arrow) {
        transform: rotate(90deg);
      }
    }
  }
</style>
