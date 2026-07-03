<template>
  <div class="edhr-view-container">
    <MedProEdhrView :selfId="edhrId" :materialNo="containerName" :docList="docList" />
  </div>
</template>

<script setup lang="ts" name="gct-edhr-view">
  import { MedProEdhrView } from '@gct/nocode-mobile-render';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ref, onMounted } from 'vue';
  import { cloneDeep } from 'lodash-es';

  const edhrId = ref();
  const containerName = ref();
  const containerId = ref(null);
  const docList = ref([]);

  const Event = getPageEvent();
  const treeData = ref([]);
  let container = {};
  const initTree = async (id, showHalf) => {
    container = {};
    treeData.value = [];
    edhrId.value = null;
    // 批次列表为空 隐藏左侧批次树
    containerId.value = null;
    const containerData = await Event.context.$customBizService.get(
      {
        // @ts-ignore
        action: 'getById',
        key: 'em_container',
      },
      {
        id,
      },
    );
    // showHalf 时 展示批次树
    if (showHalf) {
      Event.context.$customBizService
        .post(
          {
            // @ts-ignore
            action: 'biz_get_container_tree',
            key: 'em_container',
          },
          {
            query: {
              container: id,
            },
          },
        )
        .then((res) => {
          containerId.value = id;
          let data =
            res && res.length
              ? res
              : [
                  {
                    ...containerData.data,
                    container_id_: containerData.data.id_,
                  },
                ];
          treeData.value = list2Tree(
            cloneDeep(
              data.map((d) => {
                container[d.id_] = d;
                return {
                  ...d,
                  title: d.name_,
                  key: d.id_,
                };
              }),
            ),
          );
        });
    } else {
      const { name_, id_ } = containerData.data;
      getEdhr(name_);
      getDocumentList(id_);
    }
  };

  function list2Tree(list) {
    let treeOptions = [];
    const arrClone: any = cloneDeep(list);
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      item.children = [];
      obj[item.id_] = item;
      return obj;
    }, {});
    // 转树
    arrClone.forEach((i: any) => {
      const parent = mapInfo[i.parent_id_];
      // 如果父节点存在，push到父级的children数组中
      // 如果父级不存在，直接push到treeData数组
      parent ? parent.children.push(i) : treeOptions.push(i);
    });
    return treeOptions;
  }

  const onSelect = (value) => {
    const { name_, container_id_ } = container[value[0]];
    getEdhr(name_);
    getDocumentList(container_id_);
  };

  const getEdhr = (name_) => {
    if (!name_) {
      edhrId.value = null;
      return;
    }
    Event.context.$customBizService
      .get(
        {
          key: 'em_edhr_usage_rule',
          // @ts-ignore
          action: 'getEdhrInstId',
        },
        {
          container_name_: name_,
        },
      )
      .then((res) => {
        edhrId.value = res;
        containerName.value = name_;
      })
      .catch(() => {
        edhrId.value = null;
      });
  };

  const getDocumentList = (id) => {
    Event.context.$customBizService
      .post(
        {
          // @ts-ignore
          action: 'listAll',
          key: 'em_move_document_history',
        },
        {
          query: {
            container_id_: id,
          },
        },
      )
      .then((res) => {
        docList.value = res.data || [];
      });
  };

  onMounted(() => {
    // initTree()
  });

  defineExpose({
    async reload({ container_id_, showHalf }) {
      initTree(container_id_, showHalf);
    },
  });
</script>

<style scoped lang="less">
  .edhr-view-container {
    height: calc(100vh - 250px);
    :deep(.van-collapse-item__content) {
      color: #000;
    }
  }
</style>
