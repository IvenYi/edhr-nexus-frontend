<!-- <template></template> -->
<script setup lang="ts">
  import {
    onCreateReleaseOrder,
    openConnectionModal,
    postIpaasWebhookFunc,
    onOpenLaunchApprovalModal,
  } from './comps';

  defineExpose({
    onCreateReleaseOrder,
    openConnectionModal,
    postIpaasWebhookFunc,
    onOpenLaunchApprovalModal,
  });
</script>
<style lang="less" scoped></style>
