<template>
  <div :class="[ns.b()]">
    <spread-sheet :loading="loading" />
  </div>
</template>

<script lang="ts" setup name="publish-version-preview">
  import { useNamespace } from '@gct/runtime';
  import { PlatformEnum } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { usePrint } from '/@online-form/views/designer/hooks/usePrint';
  import SpreadSheet from '/@online-form/views/designer/modules/sheet-view.vue';
  import { onMounted, ref } from 'vue';
  import { DefaultPaper } from '../../constants';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  import { getOnlineFormTmplLogInfo } from '/@/apis/gct-apaas/OnlineFormTmplLogController';

  const ns = useNamespace('publish-version-preview');
  const loading = ref(true);

  const { initialize } = usePrint();

  const { setPlatformType, setPaper } = useSpreadSheet();
  setPlatformType(PlatformEnum.INTEGRATION_PAAS_SI);

  const route = useRoute();

  onMounted(async () => {
    if (!route.query.versionId) {
      throw new Error($t('sys.onlineForm.publishVersionPreview.tip1'));
    }
    const res = await getOnlineFormTmplLogInfo({ id: route.query.versionId as string });
    if (!res) {
      throw new Error(
        $t('sys.onlineForm.publishVersionPreview.tip1', {
          id: route.query.versionId,
        }),
      );
    }

    loading.value = true;
    await initialize(res.tmplId!);
    // setPaper({
    //   ...cloneDeep(DefaultPaper),
    //   ...JSON.parse(res.designerJson || '{}'),
    // });
    loading.value = false;
  });
</script>

<style lang="less">
  @import url('/@online-form/views/designer/styles/spread-sheet.less');
  @import url('/@online-form/views/designer/styles/dynamic-area.less');
</style>

<style lang="scss" scoped>
  $publish-version-preview: ();

  @include b(publish-version-preview) {
    @include set-component-css-var(publish-version-preview, $publish-version-preview);
    background: #e6e9ef;
    width: 100% !important;
    height: 100% !important;
    min-width: unset !important;
  }
</style>
