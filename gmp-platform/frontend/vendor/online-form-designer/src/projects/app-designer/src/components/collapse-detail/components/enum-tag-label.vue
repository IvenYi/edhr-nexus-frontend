<template>
  <Taglabel
    :type="FIELD_TYPE.ENUM"
    :label="enumInfo.text"
    :tagWidgetStyle="{ tagStyleOpen: true }"
    :isDesign="false"
    :iconExtraProps="iconExtraProps"
    :iconProps="iconProps"
  />
</template>
<script setup lang="ts">
  import { watch, ref } from 'vue';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
  import Taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { pick } from 'lodash-es';
  import { getEnumModelInfoById } from '/@/apis/gct-apaas/EnumModelController';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { gctMemoizeAsync } from '@gct/base';


  const props = defineProps<{
    model: string;
    value: string;
  }>();

  const enumInfo = ref<any>({})
  const iconProps = ref<{
    icon: string;
    iconColor: string;
    textColor: string;
  }>();

  const iconExtraProps = ref<{
    [k: string]: {
      icon: string;
      iconColor: string;
      textColor: string;
    };
  }>();

  const loadData = gctMemoizeAsync(getEnumConfig);

  watch(() => props.model,
  async () => {
    if (!props.model) return;
    const { list, tagProps } = await loadData({ id: props.model });
    enumInfo.value = list.find(e => e.value === props.value);
    iconExtraProps.value = tagProps;
  },
  {
    immediate: true,
  });

  async function getEnumConfig({ id }) {
    const res: any = await getEnumModelInfoById({ id }) || {};
    return await getEnumData(res);
  }

  async function getEnumData({ iconState, textState }) {
    const res = await getEnumModelFieldPageList(
      {
        enumModelId: props.model,
        enumModelKey: props.model,
      },
    );
    const keys = iconState ? ['icon', 'iconColor'] : [];
    if (textState) keys.push('textColor');
    return {
      list: res?.data || [],
      tagProps: res?.data?.reduce((map, e) => {
        map[e.text!] = pick(e, keys);
        return map;
      }, {})
    }
  }
  
</script>
<style lang="less" scoped></style>
