<template>
  <a-dropdown v-if="!!moreOptions.length" :trigger="['click']">
    <a-tooltip placement="left" v-if="useMore">
      <template #title>{{ label + t(`sys.model.${useMore}`) }}</template>
      <a class="ml2 iconfont icon-shezhi" @click.prevent> </a>
    </a-tooltip>
    <span class="ml2 iconfont icon-shezhi" @click.prevent v-else> </span>
    <template #overlay>
      <a-menu v-if="useMore">
        <a-menu-item @click="setope()">
          <a>{{ t(`sys.model.cancel`) }}</a>
        </a-menu-item>
      </a-menu>
      <a-menu v-else>
        <a-menu-item :key="i" v-for="i in moreOptions" @click="setope(i)">
          <a>{{ t(`sys.model.${i}`) }}</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  var opecatch: any = null;
  const props = defineProps<{ useMore: any; moreOptions: any; ope: any; label: any }>();
  const emit = defineEmits(['update:ope', 'update:useMore', 'clear', 'change']);
  function setope(type?: string) {
    if (!type) {
      emit('update:ope', opecatch);
      emit('update:useMore', '');
      opecatch = null;
    } else {
      opecatch = props.ope;
      emit('update:ope', [type]);
      emit('update:useMore', type);
      emit('clear');
    }
    emit('change');
  }
</script>

<style scoped lang="less"></style>
