<template>
  <a-empty>
    <template #description>
      <div
        v-if="description"
        class="description"
        :class="{ 'has-sub-description': subDescription }"
      >
        {{ $t(i18n?.description || description) }}
      </div>
      <div v-if="subDescription" class="sub-description">
        {{ $t(i18n?.subDescription || subDescription) }}
      </div>
    </template>
  </a-empty>
</template>

<script setup lang="ts" name="gct-empty">
  import { toRefs } from 'vue';
  import { IEmpty } from './schema';

  const props = defineProps<{
    widget: IEmpty;
  }>();

  const { description, subDescription } = toRefs(props.widget.props);
  const { i18n = {} } = toRefs(props.widget);
</script>

<style scoped lang="less">
  .description,
  .sub-description {
    font-size: 14px;
  }

  .has-sub-description {
    font-size: 16px;
    color: #1a1d23;
  }

  .sub-description {
    font-weight: 400;
    font-size: 14px;
    color: #8b8b8b;
  }
</style>
