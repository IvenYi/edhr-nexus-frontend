<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="local"
    v-model:searchValue="searchValue"
    :options="options"
    :placeholder="$t('sys.chooseTextTip', { name: $t('sys.edhr.productFamily') })"
    :allow-clear="true"
    show-search
    :filterOption="filterOption"
  />
</template>

<script lang="ts" setup name="product-family-select">
  import { useNamespace } from '@gct/runtime';
  import { getProductFamily } from '../logic/use-model-service';
  import { computed, onMounted, ref } from 'vue';

  const ns = useNamespace('product-family-select');

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
      emit('update:value', v ? v : null);
    },
  });

  const options = ref<any[]>([]);
  const searchValue = ref();

  onMounted(() => {
    getProductFamily().then((res) => {
      options.value =
        res?.data?.map((item: any) => {
          return {
            label: item.name_,
            value: item.id_,
          };
        }) || [];
    });
  });

  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };
</script>

<style lang="scss" scoped>
  $product-family-select: ();

  @include b(product-family-select) {
    @include set-component-css-var(product-family-select, $product-family-select);
  }
</style>
