import { defineComponent, PropType, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import { Modal } from 'ant-design-vue';
import ReceiptModal from '../modals/receipt-modal';
import { deleteDocument } from '/@/apis/gct-apaas/DocumentController';
import { openWindow, genUrl } from '/@/utils';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useBranch } from '/@/hooks/develop/useBranch';
import { useI18n } from 'vue-i18n';
import { DocumentInfo } from './document-info/document-info';
import './document-designer.scss';
import DocumentView from '/@online-form/views/integration/apaas_dp/designer/apaas-dp-print-sheet-view.vue';
import { useRouter } from 'vue-router';
import { BasicAction } from '/@/enums/authActionEnum';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

/**
 * 单据设计界面
 */
export const DocumentDesigner = defineComponent({
  name: 'DocumentDesigner',
  components: {
    DocumentView,
  },
  props: {
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    isOptionShow: {
      type: Boolean,
      default: false,
    },
    isFrontPrint: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const router = useRouter();
    const ns = useNamespace('document-designer');
    const usePathQuery = usePathQueryStore();
    const { branchId } = useBranch();

    const { t } = useI18n() as any;

    const id = computed(() => props.data.id);

    const userActions = computed(() => {
      return {
        [BasicAction.Update]: getPermissionByKey('PrintDesigner', BasicAction.Update),
        [BasicAction.Delete]: getPermissionByKey('PrintDesigner', BasicAction.Delete),
        [BasicAction.Design]: getPermissionByKey('PrintDesigner', BasicAction.Design),
      };
    });

    const handleDesign = () => {
      if (props.isFrontPrint) {
        const routeData = router.resolve({
          name: 'DocumentDesigner',
          query: { id: props.data.id },
        });
        window.open(routeData.href, '_blank');
      } else {
        openWindow(
          genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_FORM_DESIGNER}`, {
            aid: usePathQuery.getAid(),
            bid: branchId.value,
            id: props.data.id,
            model: props.data.model,
          }),
          {
            target: '_blank',
          },
        );
      }
    };

    const handleView = (e: MouseEvent) => {
      gct.openUtil.popover(
        e.target as HTMLElement,
        DocumentInfo,
        { context: { id: id.value } },
        { width: 284, height: 620, maxHeight: '60vh', autoClose: true },
      );
    };

    const handleEdit = async () => {
      const result = await gct.openUtil.modal(
        ReceiptModal,
        {
          context: {
            id: id.value,
            category: props.data.categoryId,
            isFrontPrint: props.isFrontPrint,
          },
        },
        {
          title: t('sys.appDesigner.printDesign.editReceipt'),
          width: 640,
          height: 702,
          showFooter: false,
        },
      );
      if (result.ok) {
        emit('refresh', { key: id.value });
      }
    };

    const handleDelete = async () => {
      Modal.confirm({
        title: t('sys.appDesigner.printDesign.deleteConfirm'),
        onOk: async () => {
          await deleteDocument({ ids: id.value });
          emit('refresh', { key: id.value });
        },
      });
    };

    return { ns, t, handleDesign, handleView, handleEdit, handleDelete, userActions };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <a-space size={16}>
            <a-button onClick={this.handleView} class="text-btn">
              <i class="iconfont icon-a-Viewdetails" style="margin-right: 5px"></i>
              {this.t('sys.viewDetails')}
            </a-button>
            {(!!this.userActions[BasicAction.Delete] && this.isOptionShow) || !this.isFrontPrint ? (
              <a-button
                onClick={this.handleDelete}
                icon={<i class="iconfont icon-shanchu2" />}
                danger
              >
                {this.t('sys.delete')}
              </a-button>
            ) : (
              ''
            )}

            {(!!this.userActions[BasicAction.Update] && this.isOptionShow) || !this.isFrontPrint ? (
              <a-button
                type="primary"
                onClick={this.handleEdit}
                icon={<i class="iconfont icon-bianji" />}
                ghost
              >
                {this.t('sys.edit')}
              </a-button>
            ) : (
              ''
            )}

            {(!!this.userActions[BasicAction.Design] && this.isOptionShow) || !this.isFrontPrint ? (
              <a-button type="primary" onClick={this.handleDesign}>
                <i class="iconfont icon-sheji" style="margin-right: 5px"></i>
                {this.t('sys.design')}
              </a-button>
            ) : (
              ''
            )}
          </a-space>
        </div>
        <div class={this.ns.b('content')}>
          <document-view dataId={this.data.id}></document-view>
        </div>
      </div>
    );
  },
});
