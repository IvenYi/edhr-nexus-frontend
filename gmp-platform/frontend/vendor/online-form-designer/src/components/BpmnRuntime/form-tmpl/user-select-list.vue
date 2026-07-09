<template>
  <div :class="[ns.b()]">
    <div
      :class="[ns.e('item')]"
      v-for="data in options"
      :key="data.value"
      :title="data.label"
      :iconProps="returnIconExtra(data)"
    >
      <IconNext
        :class="[ns.e('item-icon')]"
        :value="returnIconExtra(data).icon"
        :color="returnIconExtra(data).iconColor"
        :size="16"
      />
      {{ data.label }}
    </div>
  </div>
</template>

<script lang="ts" setup name="user-select-list">
  import { useNamespace } from '@gct/runtime';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const ns = useNamespace('user-select-list');

  const props = withDefaults(
    defineProps<{
      options: Array<{ label: string; value: string }>;
    }>(),
    {},
  );

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { value } = option;
    let icon, iconColor;
    if (value.includes('ROLE:')) {
      icon = 'icon-jiaose1';
      iconColor = '#00B2F8';
    } else if (value.includes('USER_GROUP:')) {
      icon = 'icon-yonghuzu1';
      iconColor = '#00D627';
    } else if (value.includes('ORG:')) {
      icon = 'icon-bumen1';
      iconColor = '#FF6937';
    } else if (value.includes('USER:')) {
      icon = 'icon-renyuan2';
      iconColor = '#2C71FC';
    } else {
      icon = 'icon-dongtai';
      iconColor = '#B445F5';
    }
    return {
      icon,
      iconColor,
      textColor: '',
    };
  };
</script>

<style lang="scss" scoped>
  $user-select-list: ();

  @include b(user-select-list) {
    @include set-component-css-var(user-select-list, $user-select-list);

    max-height: 300px;
    overflow: auto;

    @include e(item) {
      margin-bottom: 8px;
      display: block;
      border-radius: 2px;
      background: #f0f0f0;
      padding: 4px 6px;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
