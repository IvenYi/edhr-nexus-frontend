<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row overflow-hidden">
        <div>{{ $t('sys.pageDesigner.labelTemplateRef') }}</div>
        ：
        <div class="ks-col break-all">
          {{ labelName }}
        </div>
      </div>
      <div v-if="node?.data?.templateType === 'zpl'" class="ks-row">
        <div>{{ $t('sys.pageDesigner.printService') }}</div>
        ：
        <div class="ks-col break-all">
          <div>
            {{ selectedPrinter?.label || node?.data?.printService || '' }}
            <div
              class="custom-tag"
              v-if="selectedPrinter?.defaultPrint === '是'"
              color="processing"
            >
              {{ $t('sys.default') }}
            </div>
          </div>
        </div>
      </div>
      <div class="ks-row">
        <div>{{ $t('sys.pageDesigner.printNumber') }}</div>
        ：
        <div class="ks-col">{{ node?.data?.printNumber || 1 }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';

  const props = defineProps<{
    data: any;
    node: any;
  }>();

  const options = ref<any[]>([]);
  const labelName = ref('');

  const selectedPrinter = computed(() => {
    return options.value.find((i) => i.printKey === props.node?.data?.printService);
  });

  onMounted(() => {
    getPrinterList();
  });

  watch(
    () => props.node?.data?.printTmplId,
    async (val) => {
      if (val) {
        labelName.value = (await getTmplInfo(val)) || val;
      }
    },
    {
      immediate: true,
    },
  );

  async function getPrinterList() {
    const data = (await getPrintPrintDropdownList()) || [];
    const list: Array<any> = [];
    data?.forEach((i) => {
      const dftInfo =
        (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
        undefined;
      const obj = {
        ...i,
        label: i.name,
        value: i.printKey,
        parentId: i.parentId || 'ROOT',
        dftPrintInfo:
          i.type === 'CLIENT_PRINT' && dftInfo
            ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
            : undefined,
      };
      list.push({ ...obj });
      if (i.printChildNode) {
        list.push(
          ...i.printChildNode.map((e) => {
            const obj = {
              ...e,
              label: e.name,
              value: e.printKey,
              parentId: i.printKey,
            };
            return {
              ...obj,
            };
          }),
        );
      }
    });
    options.value = list;
  }

  async function getTmplInfo(id) {
    const res: any = await getPrintDesignerInfo({
      id,
      moduleType: 'label_module',
    });
    return res ? `${res.name}${res.version ? ' : ' + res.version : ''}` : '';
  }
</script>
<style lang="less" scoped></style>
