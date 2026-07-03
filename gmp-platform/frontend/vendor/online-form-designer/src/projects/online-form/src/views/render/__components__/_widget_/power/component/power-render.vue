<template>
  <span
    class="nocode-read-only-text"
    :class="[{ 'show-placeholder': isFillIn }]"
    :style="widget.style"
    :data-placeholder="$t('sys.onlineForm.group')"
    @click.stop="openPower"
  >
    <span v-if="isEmpty(currentValue)">--</span>
    <PowerShower v-else :value="currentValue" />
  </span>
</template>

<script setup lang="ts" name="online-form-power-render">
  import { ref, computed, inject } from 'vue';
  import { isEmpty, isNil } from 'lodash-es';
  import { RenderModeEnum, NCB_PROVIDE } from '@gct/nocode-base';
  import { openPowerModal, SaveDataObj } from '../../../_common_/power/use-power';
  import PowerShower from '../../../_common_/power/power-shower.vue';

  import type { IPower, IBasicInfoItem } from '@gct/nocode-base';

  const dataRelationShip = inject<IBasicInfoItem>(NCB_PROVIDE.DATA_RELATION_SHIP);

  const props = defineProps<{ widget: IPower; formData: Object }>();

  const formState = ref(props.formData);

  // 映射关系
  const mapping = {
    base: 'baseValueField',
    exponent: 'exponentValueField',
    value: 'valueField',
  };

  const isFillIn = computed(() => {
    return dataRelationShip?.renderModeType === RenderModeEnum.FormMode;
  });

  const currentValue = computed<SaveDataObj>(() => {
    const obj: any = {};
    for (const [key, value] of Object.entries(mapping)) {
      if (
        props.widget.props[value] &&
        props.widget.props[value].field &&
        !isNil(formState.value[props.widget.props[value].field])
      ) {
        Object.assign(obj, {
          [key]: formState.value[props.widget.props[value].field],
        });
      }
    }
    return obj;
  });

  const openPower = async () => {
    if (!isFillIn.value) {
      return;
    }

    const res = await openPowerModal(props.widget.props, currentValue.value);

    if (res.ok) {
      for (const [key, value] of Object.entries(res.value)) {
        const formKey = mapping[key];
        if (formKey && props.widget.props[formKey] && props.widget.props[formKey].field) {
          formState.value[props.widget.props[formKey].field] = value;
        }
      }
    }

    console.log(res);
  };
</script>

<style scoped lang="less">
  .nocode-read-only-text.show-placeholder {
    &::before {
      content: attr(data-placeholder);
      position: absolute;
      top: 0;
      right: 0;
      color: #fff;
      font-size: 12px;
      pointer-events: none;
      z-index: 9;
      background: #7cdfc3;
      padding: 2px 10px;
      border-bottom-left-radius: 4px;
      line-height: 18px;
    }
  }
</style>
