<template>
  <div v-if="showCard">
    <refCardCom
      :modelValue="key"
      :props="props.props"
      :key="index"
      v-for="(key, index) in showLabels"
    />
    <div class="more pb16px text-center primary-gct" v-if="labels.length > 1">
      <div v-if="showMore" @click.stop="showMore = false"> 收起 <van-icon name="arrow-up" /> </div>
      <div v-else @click.stop="showMore = true"> 查看更多 <van-icon name="arrow-down" /> </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, toRef, computed } from 'vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import refCardCom from './refCard.vue';

  const props = defineProps<{
    props?: any;
    modelValue: any;
  }>();
  const showMore = ref(false);
  const labels = computed(() => {
    if (!props.modelValue) return [];
    if (props.modelValue instanceof Array) {
      return props.modelValue;
    } else {
      return props.modelValue.split(',');
    }
  });
  const showLabels = computed(() => (showMore.value ? labels.value : labels.value.slice(0, 1)));
  const { fieldType, refCard, refCardId } = props.props;
  const showCard =
    (fieldType === FIELD_TYPE.REF ||
      fieldType === FIELD_TYPE.REF_MULTI ||
      fieldType === FIELD_TYPE.RDO_REF) &&
    refCard &&
    refCardId;
</script>
<style scoped lang="less">
  .more {
    border-bottom: 1px solid #e0e3eb;
  }
</style>
