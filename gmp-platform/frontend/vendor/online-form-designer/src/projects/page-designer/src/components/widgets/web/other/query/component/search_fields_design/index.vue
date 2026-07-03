<template>
  <div class="ks-row-middle" v-if="widget.props.isRang">
    <field :widget="widget" />
    <div class="w10 text-center">-</div>
    <a-form-item-rest>
      <field :widget="widget" />
    </a-form-item-rest>
  </div>
  <template v-else>
    <div class="ks-row-middle">
      <field :widget="widget" />
      <moreOption
        v-if="moreOptions?.length"
        v-model:useMore="useMore"
        v-model:ope="ope"
        :label="label"
        :moreOptions="moreOptions"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
  import { toRefs } from 'vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
  import field from './field.vue';
  import moreOption from '../more_option.vue';

  const props = defineProps<{ widget: SearchWidgets }>();

  const { label } = props.widget.props;
  const { useMore, ope, moreOptions } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
