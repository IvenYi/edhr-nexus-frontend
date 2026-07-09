<template>
  <div class="p20px h500px">
    <JsonParamTabs
      :header="headerJson"
      :body="bodyJson"
      :path="pathJson"
      :query="queryJson"
      :readonly="readonly"
    />
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import JsonParamTabs from '../../json-param/json-param-tabs.vue';
  import { IApiJsonParam } from '../../json-param';
  import { AuthKeyTypeEnum } from '../../../enums';
  import { useModal } from '@gct/runtime';
  import { toTreeJsonParam, toApiJsonParam } from '../../json-param/logic';

  const props = defineProps<{
    // modal: IModal;
    metaHeader?: IApiJsonParam;
    metaBody?: IApiJsonParam;
    metaQuery?: IApiJsonParam;
    metaUri?: IApiJsonParam;
    readonly?: boolean;
  }>();

  const headerJson = ref();
  const bodyJson = ref();
  const queryJson = ref();
  const pathJson = ref();

  onMounted(() => {
    headerJson.value = transformData('header', props.metaHeader);
    bodyJson.value = transformData('body', props.metaBody);
    queryJson.value = transformData('query', props.metaQuery);
    pathJson.value = transformData('path', props.metaUri);
  });

  function transformData(type, data) {
    return (
      (data && toTreeJsonParam(data)) ?? {
        key: type,
        type: AuthKeyTypeEnum.Object,
      }
    );
  }

  const onSave = () => {
    const params = {
      metaHeader: toApiJsonParam(headerJson.value),
      metaQuery: toApiJsonParam(queryJson.value),
      metaBody: toApiJsonParam(bodyJson.value),
      metaUri: toApiJsonParam(pathJson.value),
    };
    return {
      ok: true,
      params,
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
