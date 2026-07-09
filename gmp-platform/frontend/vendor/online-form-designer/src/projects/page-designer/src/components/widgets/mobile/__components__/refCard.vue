<template>
  <div class="cardbox mb16px">
    <MobCardViewRender
      :modelKey="bindModelKey"
      :id="refCardId"
      :key="modelValue"
      :fetch="() => getCardData(modelValue)"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, toRef, computed } from 'vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { MobCardViewRender } from '@gct/runtime-mobile-render';
  import { getDataByModelType } from '/@page-designer/components/widgets/hooks/refCardList';
  import { gctMemoizeAsync } from '@gct/base';

  const props = defineProps<{
    props?: any;
    modelValue: string;
  }>();
  const { fieldType, refCard, refCardId, bindModelKey } = props.props;
  const getCardData = gctMemoizeAsync(getDataByModelType, { fieldType, modelKey: bindModelKey });
</script>
<style scoped lang="less">
  .cardbox {
    overflow: hidden;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
  }
</style>
