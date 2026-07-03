<!-- @description: 关联批次/SN展示，可追溯至[Feature/tapd-102381](https://www.tapd.cn/tapd_fe/64352020/iteration/card/1164352020001000462?q=0a19d1b333c97c34a1620f22809f235d&workitem_type_id=task&dialog_preview_id=story_1164352020001023813)-->
<template>
  <div class="related-material-no-label">
    <div class="related-material-no-label-container">
      <template v-if="materialData.length">
        <div
          v-for="(r, index) in materialData"
          :key="r.materialNo"
          :title="r.materialNo"
          @click.stop="() => handleView(r)"
        >
          <span :class="r.hasDhr ? 'link-render' : ''">{{ r.materialNo }}</span>
          <span class="comma pr-1" v-if="index < materialData.length - 1">,</span>
        </div>
      </template>
      <a-tag v-else color="error">
        {{ $t('sys.onlineForm.noAssociation') }}
      </a-tag>
    </div>
  </div>
</template>

<script lang="ts" setup name="related-material-no-label">
  import { computed } from 'vue';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const props = defineProps<{
    data: any;
    slotData: any;
  }>();

  const { openFillWikiFullScreenModal } = useApaasEbr();

  const { appInfo } = useAppInfoStore();

  const linkNames = computed(() => {
    if (!props.data.name) return [];

    return typeof props.data.name === 'string'
      ? props.data.name?.split(',')
      : props.data.name.map((i: any) => i.name);
  });

  const materialData = computed(
    (): Array<{
      materialNo: string;
      mfgOrderId: string | undefined;
      hasDhr: boolean;
    }> => {
      const suiteKey = appInfo.suiteKey;
      const isDhr = suiteKey === 'eDHR';

      return linkNames.value.map((i: any) => {
        const dhr: any = props.slotData.dhrInstanceList?.find((dhr: any) => dhr.materialNo === i);

        return {
          materialNo: i,
          mfgOrderId: dhr ? dhr.mfgOrderId : undefined,
          hasDhr: !!dhr && isDhr,
        };
      });
    },
  );

  function handleView(row: any) {
    if (!row.hasDhr) return;

    openFillWikiFullScreenModal({
      materialNo: row.materialNo,
      isViewPage: true,
      params: {
        _gct_nocode_mfg_order_id_: row.mfgOrderId,
      },
    });
  }
</script>

<style lang="scss" scoped>
  .related-material-no-label {
    &-container {
      display: flex;
      align-items: center;
    }

    .link-render {
      cursor: pointer;
      color: var(--ant-primary-color);
      &:hover {
        text-decoration: underline;
        color: var(--ant-primary-color-hover);
      }
    }
  }
</style>
