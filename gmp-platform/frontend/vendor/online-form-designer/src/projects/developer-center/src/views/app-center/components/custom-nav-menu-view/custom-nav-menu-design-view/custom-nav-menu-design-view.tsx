import { defineComponent, PropType, ref, computed } from 'vue';
import { IModal, useModal, useNamespace, HTTP_TYPE_ENUM } from '@gct/runtime';
import { DesignNodeType, DesignView, DesignViewPrefix, NodeRegister } from '@gct/runtime-design';
import { MobileHomepageResponse } from '/@/apis/gct-apaas/model';
import { clone } from 'lodash-es';
import { IDesignData } from '@gct/base';
import { getNavMenuInfo, putNavMenuById } from '/@/apis/gct-platform/NavMenuController';
import './custom-nav-menu-design-view.scss';

export const CustomNavMenuDesignView = defineComponent({
  name: 'CustomNavMenuDesignView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    OperateType: {
      type: String as PropType<HTTP_TYPE_ENUM>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-nav-menu-design-view');
    // 设计器
    const design = ref<any>();
    // 是否加载完成
    const isLoaded = ref(false);
    // 是否编辑过
    const isEdit = ref(false);
    // 自定义首页数据
    const data = ref<MobileHomepageResponse>();
    // 设计界面数据
    const designJson = ref<IDesignData | null>();
    // 保存错误信息
    const errMsg = ref('');
    // 自定义首页名称
    const name = computed({
      get() {
        return data.value?.name;
      },
      set(val) {
        if (data.value && data.value.name !== val) {
          data.value.name = val;
          isEdit.value = true;
        }
      },
    });

    // eslint-disable-next-line vue/no-mutating-props
    props.context.designType = DesignViewPrefix.CUSTOM_EXP_MENU;

    useModal(async () => {
      await save();
      return {
        ok: true,
        data: [clone(data.value) as IData],
      };
    });

    const load = async () => {
      data.value = await getNavMenuInfo({ id: props.context.id });
      if (data.value?.designerJson) {
        designJson.value = JSON.parse(data.value.designerJson);
        designJson.value!.type = DesignViewPrefix.CUSTOM_EXP_MENU;
      } else {
        const pageProvider = NodeRegister.get(
          DesignNodeType.CUSTOM_EXP_MENU,
          DesignViewPrefix.CUSTOM_EXP_MENU,
        );
        if (!pageProvider) {
          isLoaded.value = true;
          throw new Error('未找到自定义应用菜单根节点适配器');
        }
        // 若没有设计数据，则初始化初始菜单结构
        designJson.value = {
          nodes: [],
          pageNode: pageProvider.create(),
          tree: [],
          type: DesignViewPrefix.CUSTOM_EXP_MENU,
        };
      }
      isLoaded.value = true;
    };

    const save = async (_data?: IData) => {
      errMsg.value = '';
      const json = design.value.getData();
      try {
        await putNavMenuById(
          { id: props.context.id },
          { ...data.value, designerJson: json ? JSON.stringify(json) : undefined },
          {
            errorMessageMode: 'none',
            transferToConfig: { headers: { OperateType: props.OperateType } },
          },
        );
        return true;
      } catch (error) {
        const str: string = error.toString();
        errMsg.value = str.replace('Error: ', '');
      }
      return false;
    };
    load();

    const onClose = () => {
      props.modal.dismiss({ ok: isEdit.value });
    };

    const onSave = async (close: boolean = true) => {
      const oldName = data.value?.name;
      try {
        await save();
      } catch (error) {
        data.value!.name = oldName;
      }
      if (close !== false) {
        onClose();
      }
    };

    return {
      ns,
      name,
      design,
      isLoaded,
      data,
      designJson,
      errMsg,
      load,
      save,
      onClose,
      onSave,
    };
  },
  render() {
    if (this.isLoaded === false) {
      return;
    }
    return (
      <DesignView
        ref="design"
        isEditName
        hideUndoRedo
        v-model:name={this.name}
        data={this.designJson!}
        onClose={this.onClose}
        onSave={this.onSave}
        save={this.save as any}
        context={this.context}
        v-model:errMsg={this.errMsg}
        opts={{
          title: window.$t('sys.developer.designView.customExpMenu'),
          prefix: DesignViewPrefix.CUSTOM_EXP_MENU,
          showMobileTitleBar: false,
          isMaterial: false,
          isPreview: false,
        }}
      />
    );
  },
});
