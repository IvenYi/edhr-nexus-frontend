<template>
  <OnlineFormOperator
    class="paas-si-form-builder-container"
    style="flex: 1; overflow: hidden; height: 100%"
    :selfId="productReleaseInfo.id!"
    :material-no="props.materialNo"
    :in-drawer="false"
    :paramExtraProps="{ _gct_is_form_dhr_release_page_: true }"
    keep
    :isViewPage="false"
  />
</template>

<script setup lang="ts" name="ReleaseFillingBuilder">
  import { ref, watch, provide } from 'vue';

  import { OnlineFormOperator } from '/@online-form/views/integration/apaas_si/index';

  import { getProductReleaseGetProductReleaseInstByMaterialNo } from '/@/apis/gct-apaas/ProductReleaseController';
  import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

  const props = withDefaults(
    defineProps<{
      /** 物料编号 */
      materialNo: string;
      keep: boolean;
    }>(),
    {
      keep: true,
    },
  );

  const loading = ref(false);

  const productReleaseInfo = ref<OnlineFormInstanceResponse>({});

  async function requestData() {
    const detail = await getProductReleaseGetProductReleaseInstByMaterialNo({
      materialNo: props.materialNo,
    });
    console.log('放行单详情', detail);
    productReleaseInfo.value = detail ?? {};
  }

  watch(
    () => props.materialNo,
    async () => {
      loading.value = true;
      await requestData();
      loading.value = false;
    },
    {
      immediate: true,
    },
  );
</script>

<style scoped lang="less">
  .ebr-release-fill-builder-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow: hidden;

    .ebr-release-fill-builder-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex: 1;

      &.isFullScreen {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 999;
      }
    }
  }
</style>
