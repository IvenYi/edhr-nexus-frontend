<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="local"
    :options="options"
    :placeholder="$t('sys.chooseTextTip', { name: $t('sys.edhr.productType') })"
  />
</template>

<script lang="ts" setup name="product-type-select">
  import { useNamespace } from '@gct/runtime';
  import { getProductType } from '../logic/use-model-service';
  import { computed, onMounted, ref } from 'vue';

  const ns = useNamespace('product-type-select');

  const props = withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();

  const local = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const options = ref<any[]>([]);

  onMounted(() => {
    getProductType().then((data) => {
      options.value =
        data?.map((item) => {
          return {
            label: item.text,
            value: item.value,
          };
        }) || [];
    });
  });
</script>

<style lang="scss" scoped>
  $product-type-select: ();

  @include b(product-type-select) {
    @include set-component-css-var(product-type-select, $product-type-select);
  }
</style>
