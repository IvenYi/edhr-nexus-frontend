<template>
  <div :class="ns.b()">
    <div :class="[ns.e('item')]">
      <div :class="[ns.e('item-key')]">{{ `${$t('sys.bi.param.name')}（KEY）` }}</div>
      <div :class="[ns.e('item-val')]">{{ `${$t('sys.bi.param.value')}（VALUE）` }}</div>
    </div>
    <div :class="[ns.e('item')]" v-for="(param, index) in paramsData" :key="index">
      <!-- key -->
      <a-input
        :class="ns.e('item-key')"
        v-model:value="param.key"
        :placeholder="$t('sys.pleaseInputSth')"
      />
      <!-- value -->
      <a-input
        :class="ns.e('item-val')"
        v-model:value="param.value"
        :placeholder="$t('sys.pleaseInputSth')"
      />
      <a-button
        v-if="paramsData.length > 1"
        :title="$t('sys.delete')"
        class="ml-10px"
        type="link"
        danger
        @click="handleDelete(index)"
      >
        <delete-outlined />
      </a-button>
    </div>
    <a-button :title="$t('sys.bi.param.add')" type="link" @click="handleAdd">
      <plus-outlined />
      {{ $t('sys.bi.param.add') }}
    </a-button>
  </div>
</template>

<script setup lang="ts" name="param-items">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';

  type NodeDataItem = {
    key?: string;
    value?: string;
  };

  const props = defineProps<{
    params: NodeDataItem[];
  }>();

  const emit = defineEmits(['update:params']);
  const ns = useNamespace('param-items');

  const paramsData = computed({
    get() {
      return props.params?.length ? props.params : [];
    },
    set(v) {
      emit('update:params', v);
    },
  });

  const handleAdd = () => {
    paramsData.value = [...paramsData.value, { key: undefined, value: undefined }];
  };

  const handleDelete = (index) => {
    paramsData.value.splice(index, 1);
  };

  const getParamsData = () => {
    const config = paramsData.value?.reduce((obj, item) => {
      obj[item['key']] = item['value'];
      return obj;
    }, {});
    return config;
  };

  defineExpose({
    handleAdd,
    getParamsData,
  });
</script>

<style lang="scss" scoped>
  @include b(param-items) {
    width: 100%;
    padding: 10px 20px;
    @include e(item) {
      display: flex;
      width: 100%;
      margin-bottom: 10px;
      text-align: center;
    }
    @include e(item-key) {
      flex: 1;
    }
    @include e(item-val) {
      flex: 2;
      margin-left: 30px;
    }
  }
</style>
