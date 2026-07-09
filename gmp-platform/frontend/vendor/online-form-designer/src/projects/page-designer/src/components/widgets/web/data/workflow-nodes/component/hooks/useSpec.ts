import { ref } from 'vue';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { getModelMetaByKeys } from '/@/apis/gct-apaas/ModelMetaController';

const refModelKey = ref<string>();

export function useSpec(props) {
  const Event = getPageEvent();

  async function getRefModelKey() {
    const models = await getModelMetaByKeys({
      modelKeys: props.modelKey,
    });
    refModelKey.value = (models ?? [])[0]?.refModelKey ?? '';
  }

  async function getSpecChildren(id) {
    const data = (await Event.context.$httpBizService(
      { action: 'rdoListAllVersion', key: refModelKey.value! },
      {
        query: {
          base_id_: id,
        },
      },
    )) as { data: any[] };
    return data.data.map((i) => {
      return { ...i, isLeaf: true, key: i.id_ };
    });
  }

  return {
    refModelKey,
    getRefModelKey,
    getSpecChildren,
  };
}
