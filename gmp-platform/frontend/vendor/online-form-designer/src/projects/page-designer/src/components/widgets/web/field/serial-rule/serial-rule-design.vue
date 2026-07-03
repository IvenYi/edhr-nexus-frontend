<template>
  <div class="serial design">
    <div class="container mt-8px min-h-120px rounded-sm">
      <SerialNumberContainer
        :readonly="rowReadonly || readonly"
        :disabled="disabled"
        :serialConfigValue="value"
        :field="field"
        :isFeild="true"
        :increaseHidden="noIncrease"
        :isDesign="true"
        @update:value="handleUpdate"
      />
    </div>
  </div>
</template>

<script name="gct-serial-rule" setup lang="ts">
  import { toRefs, onBeforeMount, ref, computed } from 'vue';
  import { SerialRule } from '/@page-designer/types/web';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import SerialNumberContainer from '/@app-designer/views/model-desginer/entity/components/data-field/field-type-form/serial-number-container.vue';

  const props = defineProps<{ widget: SerialRule; rowReadonly?: boolean }>();
  const { field, modelKey, readonly, disabled } = toRefs(props.widget.props);
  const { getFileAttrs } = useAsyncFileAttrs();
  const value = ref();
  const noIncrease = computed(() => props.widget.props.increaseHidden);

  const handleUpdate = () => {};

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped>
  .serial {
    overflow-x: auto;
    .container {
      min-width: 550px;
      .title {
        font-size: 14px;
        background-color: #fafafa;
        .txt-disabled {
          color: rgba(0, 0, 0, 0.25);
        }
        .serial-btns {
          font-size: 18px;
          color: #666;
          &.icon-disabled {
            color: rgba(0, 0, 0, 0.25);
            span {
              cursor: default;
            }
          }
          span {
            padding: 0 4px;
          }
        }
      }
    }
  }
</style>
