<template>
  <div class="content-center">
    <div style="margin-bottom: 8px; line-height: 1">
      <a-button type="primary" @click="addButton" ghost block>
        <!-- <span class="iconfont icon-tianjia primary-gct mr5px"></span> -->
        {{ $t('sys.pageDesigner.addButton') }}
      </a-button>
    </div>
    <draggable
      :list="propValue.list"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      class="dragable-wrap"
    >
      <template #item="{ element, index }">
        <div class="ks-row-middle fieldrow mb8px">
          <i class="iconfont icon-drag mover cursor-pointer mr8px text-[#C3C3C3]"></i>
          <div
            v-show="!element.props.isEdit"
            class="ks-col gct-text-overflow text-[#212528]"
            :title="element.props.title"
          >
            <!-- {{
              element.props.i18nConfig
                ? $t(JSON.parse(element.props.i18nConfig).title)
                : element.props.title
            }} -->
            {{ element.props.title || element.props.label }}
          </div>
          <div v-if="element.props.isEdit">
            <i18n-select-input
              v-model:i18nText="element.props.title"
              :i18nConfig="element.props.i18nConfig"
              attr="title"
              :inputExtraProps="{
                maxlength: 32,
                showCount: true,
              }"
              :placeholderText="$t('sys.inputText')"
              size="small"
              @on-i18n-select="(data) => handleI18nSelect(data, element)"
              @clickOutside="clickOutside(element)"
            />
          </div>
          <a-tooltip placement="top">
            <template #title>{{ $t('sys.edit') }}</template>
            <i
              v-show="!element.props.isEdit"
              class="iconfont icon-bianji cursor-pointer ml8px primary-gct-hover text-[#797A7D]"
              @click="editButton(element)"
            ></i>
          </a-tooltip>
          <a-popconfirm
            placement="topLeft"
            :title="$t('sys.pageDesigner.areYouSureToDelete')"
            @confirm="deleteList(index)"
          >
            <a-tooltip placement="top">
              <template #title>{{ $t('sys.delete') }}</template>
              <i
                class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"
              ></i>
            </a-tooltip>
          </a-popconfirm>
        </div>
      </template>
    </draggable>
  </div>
  <addButtonModal
    ref="addFieldModel"
    :model="propValue.model"
    :id="propValue.cmpId"
    :module="moduleType"
    :sysMethedData="sysMethedData"
    :compType="widget?.type"
    @on-save="onSaveModal"
  />
</template>

<script setup lang="ts" name="add-button-list-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import addButtonModal from '../modals/add-button-modal.vue';
  import { ref, reactive, computed } from 'vue';
  import draggable from 'vuedraggable';
  import { cloneDeep } from 'lodash-es';
  import { DisplayType, Platform } from '../../../../enum';
  import { operateSysEnums, FormComponents } from '/@page-designer/enum';
  import { useI18n } from 'vue-i18n';
  import { LowCodeWidget } from '../../../../types/widget-basic-types';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';

  const { pageJson } = useDesigner();

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const propConfig = reactive(defProps.propConfig);
  const addFieldModel = ref<InstanceType<typeof addButtonModal> | null>(null);
  const moduleType =
    defProps.widget?.platform === Platform.MOBILE ? PageTypeEnum.MOBILE : PageTypeEnum.WEB;

  const sysMethedData = computed(() => {
    if (!propConfig.options) {
      const arr: string[] = [];
      const data: any = defProps.widget?.props;
      if (
        !data ||
        !data.modeldata ||
        data.modeldata.modelCategory !== EntityModelCategoryEnum.VIEW
      ) {
        arr.push(operateSysEnums.COLUMNDELETE);
      }
      arr.push(operateSysEnums.COLUMNLINK);
      return arr;
    } else if (typeof propConfig.options === 'function') return propConfig.options(defProps.widget);
    else return propConfig.options;
  });

  interface BaseButton extends LowCodeWidget.BasicSchema {
    props: BaseButtonProps;
  }
  interface BaseButtonProps extends LowCodeWidget.WidgetProps {
    /**标题 */
    title: string;
    /**二次确认 */
    confirm?: boolean;
    confirmText?: string;
    /**内置事件 */
    innerEvent?: boolean;
    /**系统事件类型 */
    sysMethedType?: operateSysEnums;
    linkPage?: string;
    /**事件名称 */
    eventName?: string;
    /**显示规则 */
    // displayRule?: string;
    icon: string;
    iconColor: string;
    size: string;
    disabled: boolean;
    // btnType: ButtonTypeGroup;
    /**是否显示按钮名称 */
    hasText: boolean;
    /**是否显示图标 */
    hasIcon: boolean;
    /**按钮type */
    type: string;
    /**是否是危险类型 */
    danger: boolean;
    /**关联模型 */
    model?: string;
    i18nConfig?: string;
  }

  const buttonComp = ref<BaseButton>();
  async function addButton() {
    buttonComp.value = propConfig.createField!();
    await addFieldModel.value!.open(t('sys.pageDesigner.addButton'), {
      id: buttonComp.value?.id,
      modeldata: (defProps.widget as any)?.modeldata,
      ...(propConfig.defaultButtonType || {}),
    });
  }
  async function editButton(ele) {
    buttonComp.value = { ...ele };
    await addFieldModel.value!.open(
      t('sys.pageDesigner.editButton'),
      cloneDeep({ ...ele.props, id: ele.id }),
    );
  }
  function deleteList(index) {
    const delBtn = propValue.value.list.splice(index, 1)[0];
    if (delBtn.id in pageJson.permissions) {
      delete pageJson.permissions[delBtn.id];
    }
  }
  const btnMap = {
    [operateSysEnums.SUBMIT]: FormComponents.SubmitButton,
    [operateSysEnums.RESET]: FormComponents.ResetButton,
    [operateSysEnums.EXCUTE]: FormComponents.ExcuteButton,
  };
  function onSaveModal(form) {
    buttonComp.value!.platform =
      moduleType === PageTypeEnum.MOBILE ? Platform.MOBILE : Platform.WEB;
    buttonComp.value!.props = { ...form };
    buttonComp.value!.props.componentDependency = { configDependency: form.configDependency };
    buttonComp.value!.alias = form.title;
    buttonComp.value!.props.model = defProps.widget?.props.model ?? propValue.value.model;
    if (form.innerEvent && form.sysMethedType) {
      /**新版本的事件名称就是内置按钮组件type */
      buttonComp.value!.type = btnMap[form.sysMethedType] || FormComponents.CustomButton;
      buttonComp.value!.events || (buttonComp.value!.events = {});
    } else {
      buttonComp.value!.type = FormComponents.CustomButton;
      buttonComp.value!.events = form.events;
    }
    const idx = propValue.value.list.findIndex((e) => e.id === form.id);
    if (idx > -1) {
      propValue.value.list.splice(idx, 1, buttonComp.value!);
    } else {
      propValue.value.list.push(buttonComp.value!);
    }
  }
  const clickOutside = (e) => {
    e.props.isEdit = false;
  };
  const handleI18nSelect = (data, ele) => {
    ele.props.i18nConfig = JSON.stringify({ title: data.i18nKey });
  };
  // const handleDelEvent = (eventType) => {
  //   const newEvents = cloneDeep(selectedEvents.value);
  //   if (newEvents[eventType].type === EventCategory.LO) {
  //     unbindLoByWidgetId(selectedRef.value.id!);
  //   }
  //   delete newEvents[eventType];
  //   selectedEvents.value = newEvents;
  // };
</script>

<style lang="less" scoped>
  .content-center {
    // padding-top: 8px;
  }

  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f2f4f7;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .iconfont {
    font-size: 16px;
    // color: #999999;
  }

  .icon-shanchu2:hover {
  }

  .dragable-wrap {
    max-height: 392px;
    overflow: auto;
  }
</style>
