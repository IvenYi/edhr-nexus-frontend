<template>
  <span :class="['value-shower']">
    <template v-if="showImg">
      <img v-for="item in imgs" :key="item.key" :src="item.url" :class="['value-shower__img']" />
    </template>
    <template v-else>
      {{ props.value }}
    </template>
  </span>
</template>

<script lang="ts" setup name="value-shower">
  import { reactive, computed, onMounted, ref } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { getPreviewUrl } from '../../..';
  import { FIELD_TYPE } from '@gct/runtime';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      value: string;
      type: string;
    }>(),
    {},
  );

  const showImg = computed(() => {
    return [FIELD_TYPE.REPORTER, FIELD_TYPE.SIGNATURE, FIELD_TYPE.WAREHOUSE_MANAGER].includes(
      props.type,
    );
  });

  const imgs = computed(() => {
    if (showImg.value && props.value) {
      try {
        const arr = JSON.parse(props.value);
        return arr.map((item: { url: string; username: string; historyId: string }, index) => ({
          url: getPreviewUrl(item.url, item.username),
          key: item.historyId ?? index,
        }));
      } catch (error) {
        console.error('Failed to parse value as JSON:', error);
        return [];
      }
    }
    return [];
  });
</script>

<style lang="less" scoped>
  .value-shower {
    display: inline-block;
    &__img {
      width: 78px;
      height: auto;
    }
  }
</style>
