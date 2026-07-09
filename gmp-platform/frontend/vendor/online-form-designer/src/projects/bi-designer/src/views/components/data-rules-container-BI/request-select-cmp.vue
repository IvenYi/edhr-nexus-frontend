<template>
  <a-select
    :options="options"
    maxTagCount="responsive"
    @popupScroll="popupScroll"
    :maxTagTextLength="2"
  />
</template>
<script setup lang="ts" name="select-userdep-cmp">
  import { ref, onBeforeMount, nextTick } from 'vue';
  // import { useModalPicker } from '/@/components/UserPick';

  // const { openPickerByUser, openPicker, openPickerByDept } = useModalPicker(true);

  // const emits = defineEmits(['change']);

  interface Props {
    api: any;
    apiParams: any;
  }

  const emit = defineEmits(['update:pageNo']);

  const props = defineProps<Props>();

  const options = ref<any>([]);

  /**下拉分页事件 */
  async function popupScroll(e) {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      if (props.apiParams?.pageNo * props.apiParams?.pageSize > options.value.length) {
        return;
      }
      emit('update:pageNo');
      await nextTick();
      if (typeof props.api === 'function') {
        const result = await props.api({ ...(props.apiParams ?? {}) });
        const list = Array.isArray(result) ? result : (result.data ?? []);
        const opts = list.map((item) => {
          return {
            label: item.__LABEL__ || item.text || item.name,
            value: item.id_ || item.value || item.key,
          };
        });
        const optionsList = options.value;
        opts.forEach((i) => {
          if (!optionsList.find((j) => j.value === i.value)) {
            options.value.push(i);
          }
        });
        // opts.length && options.value.push(opts);
      }
    }
  }

  onBeforeMount(async () => {
    if (typeof props.api === 'function') {
      const result = await props.api({ ...(props.apiParams ?? {}) });
      const list = Array.isArray(result) ? result : (result.data ?? []);
      options.value = list.map((item) => {
        return {
          label: item.__LABEL__ || item.text || item.name,
          value: item.id_ || item.value || item.key,
        };
      });
    }
  });
</script>
