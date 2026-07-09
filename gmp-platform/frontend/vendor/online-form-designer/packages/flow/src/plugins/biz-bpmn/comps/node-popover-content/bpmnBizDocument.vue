<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.bizDocument') }}</div>
        ：
        <div class="ks-col">{{ data?.onlineFormVersionName }}</div>
      </div>
      <div class="ks-row">
        <div>{{ label || $t('sys.edhr.visibleUser') }}</div>
        ：
        <div class="ks-col">{{ data?.viewRangeName }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';

  const props = defineProps<{
    data: any;
    label?: string;
  }>();

  const docName = ref('');
  const getDocName = async (id: string) => {
    const res: any = await getFormRelateInfo({
      id,
      moduleType: 'online_form_module',
    });
    const { version, name } = res;
    docName.value = version ? `${name}:${version}` : name;
  };

  // watch(
  //   () => props.data?.onlineFormInstId,
  //   (val) => {
  //     if (val) getDocName(val);
  //     docName.value = '';
  //   },
  //   { immediate: true },
  // );
</script>
<style lang="less" scoped></style>
