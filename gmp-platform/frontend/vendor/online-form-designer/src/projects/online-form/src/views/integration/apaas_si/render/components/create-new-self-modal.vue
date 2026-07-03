<template>
  <div class="px34px py28px">
    <div v-if="showTip" class="text-[#000000] mb20px text-[16px]">
      {{
        $t('sys.webRender.edhrApplication.createNewInstanceTitle', {
          sth: `【${selectDocData?.name}】`,
        })
      }}
    </div>
    <div v-if="showTip" class="bg-[#F8F8F8] p8px text-[#797A7D] mb20px">
      <i class="iconfont icon-a-zhuyi_attention2 text-[#F54547]"></i>
      {{ $t('sys.webRender.edhrApplication.createNewInstanceContentNew') }}
    </div>
    <a-form ref="formRef" :model="formState">
      <a-form-item
        :label="$t('sys.onlineForm.remarkName')"
        :rules="[{ required: true }]"
        name="instanceAlias"
      >
        <a-input
          v-model:value="formState.instanceAlias"
          allowClear
          :placeholder="$t('sys.inputText')"
          maxlength="64"
          showCount
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { useModal } from '@gct/runtime';
  import { ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      selectDocData: any;
      showTip?: boolean;
    }>(),
    {
      showTip: true,
    },
  );

  const formRef = ref();
  const formState = ref<{
    instanceAlias: string | undefined;
  }>({
    instanceAlias: undefined,
  });

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      params: formState.value,
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
