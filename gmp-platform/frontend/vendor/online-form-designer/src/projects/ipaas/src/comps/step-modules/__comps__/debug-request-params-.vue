<template>
  <div class="flex gap-12px items-center">
    <div class="flex">
      <span class="text-16px">{{ name }}</span>
      <ParamsTip class="ml-6px" />
    </div>
    <a-button type="primary" ghost class="" @click="addParam(list)">
      + {{ t('sys.add') }}
    </a-button>
  </div>
  <div class="mt12px h352px overflow-auto">
    <div
      v-for="(item, idx) in list"
      :key="idx"
      class="w100% px8px py4px bg-[#eee] mb-4px rounded-2px"
    >
      <div class="ks-row gap-8px items-center">
        <a-input
          v-model:value="item.key"
          :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
          :disabled="disabled"
        />
        <a-input v-model:value="item.value" :placeholder="$t('sys.inputText')" :disabled="disabled" />
        <i
          v-if="!disabled"
          class="iconfont icon-shanchu2 error-gct-hover text-[#333333] cursor-pointer ml5px"
          style="line-height: 24px"
          @click="deleteParam(list, idx)"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';
  import { computed } from 'vue';

  const props = defineProps<{
    name: string;
    data: object;
    disabled?: boolean;
  }>();

  const emit = defineEmits(['update:data']);
  const { t } = useI18n();

  const list = computed<object>({
    get() {
      return props.data;
    },
    set(val) {
      emit('update:data', val);
    },
  });

  //请求头和query参数，添加
  const addParam = (list) => {
    list.unshift({ value: '', key: '' });
  };

  //请求头和query参数，删除
  const deleteParam = (list, idx) => {
    list.splice(idx, 1);
  };
</script>

<style lang="less" scoped></style>
