<template>
  <div class="ref-card-editor pb16px">
    <a-spin :spinning="loading">
      <div v-if="loading" class="h100px"></div>
      <empty v-else-if="!cardList.length" />
      <div v-else>
        <div class="text-[#8B8B8B] mb12px pt12px"
          >选择当前「{{ defProps.widget.alias }}」字段回显的卡片
        </div>
        <div class="max-h480px overflow-y-auto">
          <cardRender
            :checked="propValue === card.id"
            v-for="(card, index) in cardList"
            :key="index"
            :name="card.name"
            :id="card.id"
            :modelKey="modelKey"
            @click="setPropValue(card.id)"
            :webPngUrl="card.screenShoot"
          />
        </div>
      </div>
    </a-spin>
    <div class="text-center">
      <div class="text-[#8B8B8B]">
        {{ $t('sys.pageDesigner.refCardInfo') }}
      </div>
      <a-button type="link" @click="quickAdd">
        <div class="ks-row-middle">
          <span class="iconfont icon-a-btn_add1 mr4px"></span>
          {{ $t('sys.pageDesigner.quickCreate') }}
        </div>
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-ref-card-editor">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import empty from './components/empty.vue';
  import cardRender from './components/card-render.vue';
  import { postCommonInfoCardList } from '/@/apis/gct-apaas/CommonInfoCardController';
  import { openCardDesign } from '@gct/runtime-web-next';

  const defProps = defineProps(props);
  const modelKey = defProps.widget.props.bindModelKey;
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const cardList = ref<any[]>([]);
  const loading = ref(true);
  onMounted(async () => {
    await getCardOptions();
    loading.value = false;
  });
  function setPropValue(value: string) {
    propValue.value = value;
  }
  async function quickAdd() {
    const res = await openCardDesign('', { modelKey });
    getCardOptions();
  }
  async function getCardOptions() {
    cardList.value = (await postCommonInfoCardList({ type: 'CARD', modelKey })) || [];
    if (cardList.value.length && !cardList.value.find((i) => i.id === propValue.value)) {
      propValue.value = cardList.value[0].id;
    }
  }
</script>
<style lang="scss" scoped>
  .ref-card-editor {
    border-top: 1px solid #f2f5f8;
    border-bottom: 1px solid #f2f5f8;
  }
</style>
