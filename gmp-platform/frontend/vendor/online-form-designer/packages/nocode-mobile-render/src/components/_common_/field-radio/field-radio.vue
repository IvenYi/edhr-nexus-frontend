<template>
  <NocodeField :class="['field-radio']" :label="label" v-bind="$attrs" :clearable="false">
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
    <template #input>
      <van-checkbox-group
        v-model="currentValue"
        :direction="direction"
        :shape="shape"
        :disabled="$attrs.disabled"
        @change="onChange"
      >
        <van-checkbox v-for="option of options" :key="option.value" :name="option.value">
          {{ option.label }}
        </van-checkbox>
      </van-checkbox-group>
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-radio">
  import { computed } from 'vue';
  import { isNil, last } from 'lodash-es';
  import NocodeField from '../nocode-field/nocode-field.vue';

  const props = withDefaults(
    defineProps<{
      label?: string;
      modelValue?: string;
      options: any;
      direction: 'horizontal' | 'vertical';
      shape: 'shape' | 'round';
      onChange?: Function;
    }>(),
    {
      direction: 'horizontal',
      shape: 'round',
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
  }>();

  const currentValue = computed({
    get() {
      return [props.modelValue];
    },
    set(v) {
      const bool = last(v);
      if (isNil(bool)) {
        emit('update:modelValue', null);
        return;
      }

      emit('update:modelValue', typeof bool !== 'boolean' ? Boolean(bool) : !!bool);
    },
  });
</script>
