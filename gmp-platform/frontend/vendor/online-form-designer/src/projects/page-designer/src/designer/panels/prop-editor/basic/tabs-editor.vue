<template>
  <div>
    <div class="mb10px ks-row-middle">
      <div class="mr-auto">{{ $t('sys.pageDesigner.tabs') }}</div>
      <span :class="{ 'disable-btn': children.length >= 10 }">
        <a @click="handleClick">
          <span class="iconfont icon-tianjia"></span>
          {{ $t('sys.pageDesigner.add') }}
        </a>
      </span>
    </div>
    <draggable
      :list="children"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      @sort="emitCache"
    >
      <template #item="{ element, index }">
        <div class="ks-row-middle mb5px">
          <span class="iconfont icon-drag mr5px mover primary-gct cursor-pointer"></span>
          <a-radio :checked="propValue === element.id" @change="checkValue(element.id)" />
          <i18n-select-input
            attr="title"
            @on-i18n-select="(v) => handleI18nSelect(v, element)"
            :i18nConfig="element.i18n"
          >
            <template #i18n-input>
              <a-input
                style="width: calc(100% - 32px); height: 32px"
                :value="element.props.title"
                :placeholder="t('sys.inputText')"
                :maxlength="32"
                show-count
                @change="(v) => changeValue(v, element)"
              />
            </template>
          </i18n-select-input>
          <a-popconfirm
            v-if="children.length > 1"
            placement="topLeft"
            :title="$t('sys.pageDesigner.areYouSureToDelete')"
            @confirm="deleteList(index)"
          >
            <!-- <delete-outlined class="error-gct cursor-pointer ml5px" /> -->
            <span class="icon-shanchu iconfont ml10px cursor-pointer"></span>
          </a-popconfirm>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts" name="tabs-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref, reactive } from 'vue';
  import draggable from 'vuedraggable';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  const defProps = defineProps(props);
  const { emitCache } = useDesigner();
  const propConfig = reactive(defProps.propConfig);
  const children = ref(defProps.widget!.children!);
  const { t } = useI18n();
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const handleClick = async () => {
    propConfig.eventCallback && propConfig.eventCallback!(defProps.widget);
    emitCache();
  };
  function deleteList(index) {
    let row = children.value[index];
    children!.value?.splice(index, 1);
    if (row.id === propValue.value) {
      propValue.value = children.value[0].id;
    }
    emitCache();
  }

  function handleI18nSelect({ i18nKey, i18nTitle }, widget) {
    widget.i18n.title = i18nKey;
    widget.props.title = widget.props.title || i18nTitle;
  }
  function checkValue(id) {
    propValue.value = id;
  }
  function changeValue(e, widget) {
    const value = e.target.value;
    widget.props.title = value;
    widget.alias = value;
  }
</script>

<style lang="less" scoped>
  .disable-btn {
    cursor: not-allowed;

    a {
      color: #00000040;
      pointer-events: none;
    }
  }

  .icon-shanchu {
    color: #7f8695;

    &:hover {
      color: #ff4d4f;
    }
  }
</style>
