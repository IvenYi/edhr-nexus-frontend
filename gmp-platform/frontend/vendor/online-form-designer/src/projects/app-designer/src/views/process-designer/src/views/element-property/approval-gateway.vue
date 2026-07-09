<template>
  <a-form-item :label="t('分支规则')">
    <div>
      <div class="gateway-rule" v-for="r in ApprovalRules" :key="r.id"> {{ r.title }} </div>
    </div>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BpmnNode } from '../../types';
  import { ApprovalRules } from '../../constants';
  import { useBpmn } from '../../hooks/useBpmn';

  const { t } = useI18n();
  const { setProperties } = useBpmn();

  const props = defineProps<{
    id: string;
    formState: BpmnNode.BusinessTask;
  }>();

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
    },
  });

  watch(
    () => props.formState,
    (value) => {
      console.log(value);
      setProperties(props.id, value);
    },
    {
      deep: true,
    },
  );
</script>

<style lang="less" scoped>
  .gateway-rule {
    height: 40px;
    padding: 0 16px;
    background-color: #f5f5f5;
    align-items: center;
    display: flex;
    color: #333;
    margin-bottom: 6px;
    border-radius: 4px;
    cursor: pointer;
    line-height: 1em;
    justify-content: center;
  }
</style>
