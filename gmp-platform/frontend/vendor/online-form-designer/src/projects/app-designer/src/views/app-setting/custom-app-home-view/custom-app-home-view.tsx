import { defineComponent, onMounted, ref } from 'vue';
import { ITable, ITableActionItem, useNamespace } from '@gct/runtime';
import {
  deleteMobileHomepage,
  getMobileHomepagePageList,
  postMobileHomepageSelect,
  getMobileHomepageGetSelected,
} from '/@/apis/gct-apaas/MobileHomepageController';
import { CustomAppHomeCreateModal } from './custom-app-home-create-modal/custom-app-home-create-modal';
import { CustomAppHomeDesignView } from './custom-app-home-design-view/custom-app-home-design-view';
import { AssignAppHomeModal } from './assign-app-home-modal/assign-app-home-modal';
import { useI18n } from 'vue-i18n';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useRouter } from 'vue-router';
import './custom-app-home-view.scss';
// import EmptyPage from '/@app-designer/assets/image/empty-page.png';
import { SvgIcon } from '/@/components/Icon';

/**
 * 首页配置
 */
export const CustomAppHomeView = defineComponent({
  name: 'CustomAppHomeView',
  setup() {
    const ns = useNamespace('custom-app-home-view');

    const router = useRouter();

    const store = useAppInfoStore();

    onMounted(() => {
      if (store && store.appInfo.mobileEnabled !== 1) {
        router.push('/app-design/model-designer').then(() => {
          window.location.reload();
        });
        return;
      }
    });

    const { t } = useI18n() as any;

    const table = ref<any>();
    const isEmpty = ref(false);
    const hasFirstLoad = ref(false);
    const defaultPageId = ref<string>();

    const model: ITable = {
      key: 'id',
      pagination: {},
      columns: [
        {
          name: 'index',
          dataIndex: 'index',
          title: t('sys.index'),
          width: 72,
        },
        {
          name: 'name',
          dataIndex: 'name',
          title: t('sys.appDesigner.customAppHome.appHomeViewTitle'),
          ellipsis: true,
          customRender({ record }) {
            return [
              record.name,
              !!record.selected && (
                <span
                  style={
                    'color:#2C71FC; background: #EBF0FFFF; padding: 1px 4px; margin-left: 10px;'
                  }
                >
                  {t('sys.appDesigner.customAppHome.appHomeView')}
                </span>
              ),
            ];
          },
        },
        {
          name: 'createUserName',
          dataIndex: 'createUserName',
          title: t('sys.createUser'),
          ellipsis: true,
        },
        {
          name: 'createTime',
          dataIndex: 'createTime',
          title: t('sys.createTime'),
          minWidth: 170,
          width: 170,
        },
        {
          name: 'modifyUserName',
          dataIndex: 'modifyUserName',
          title: t('sys.modifier'),
          ellipsis: true,
        },
        {
          name: 'modifyTime',
          dataIndex: 'modifyTime',
          title: t('sys.modifyTime'),
          minWidth: 170,
          width: 170,
        },
        {
          name: 'actions',
          dataIndex: 'actions',
          title: t('sys.operation'),
          type: 'actions',
          width: 110,
          actions: [
            {
              tag: 'edit',
              text: t('sys.edit'),
              icon: 'edit',
              type: 'link',
            },
            {
              mode: 'divider',
              tag: '',
              hidden(row) {
                return !!row.selected;
              },
            },
            {
              tag: 'delete',
              text: t('sys.delete'),
              icon: 'delete',
              type: 'text',
              confirm: {
                title: t('sys.appDesigner.customAppHome.deleteConfirm'),
              },
              hidden(row) {
                return !!row.selected;
              },
            },
          ],
          action(tag, row) {
            if (tag === 'edit') {
              edit({ id: row.id, isEdit: true });
            } else if (tag === 'delete') {
              remove({ ids: row.id });
            }
          },
        } as ITableActionItem,
      ],
      fetch: async (params, c) => {
        console.log('[ params ] >', params);
        const res = await getMobileHomepagePageList({
          pageNo: params!.page,
          pageSize: params!.size,
        });

        // 第一次加载
        if (!hasFirstLoad.value) {
          hasFirstLoad.value = true;
        }

        // 判断是否无数据
        isEmpty.value = !res?.data?.length;

        let items: IData[] = [];
        if (res?.data) {
          items = res.data;
          items.forEach((_, i) => {
            (_ as IData).index = i + 1;
            if (_.selected) {
              defaultPageId.value = _.id;
            }
          });
          c?.updatePagination({ total: res.totalCount });
        }
        return items;
      },
    };

    const onClick = async () => {
      const res = await gct.openUtil.modal(
        CustomAppHomeCreateModal,
        {},
        {
          title: t('sys.appDesigner.customAppHome.newAppHomeView'),
          width: 640,
          height: 360,
          okText: t('sys.saveText'),
        },
      );
      if (res.ok) {
        table.value.reload();
        const context = res.data?.[0] || {};
        edit(context);
      }
    };

    const edit = async (context: IContext) => {
      const res2 = await gct.openUtil.fullScreen(CustomAppHomeDesignView, { context });
      if (res2.ok) {
        table.value.reload();
      }
    };

    const remove = async (opts: { ids: string }) => {
      await deleteMobileHomepage({ ids: opts.ids });
      table.value.reload();
    };

    const assignHomePage = async () => {
      const data = await getMobileHomepageGetSelected();
      const res = await gct.openUtil.modal(
        AssignAppHomeModal,
        {
          selectedId: defaultPageId.value || data?.id,
          isDeleted: !!data?.deleted,
          selectedTitle: data?.name,
        },
        {
          title: t('sys.appDesigner.customAppHome.assignAppHome'),
          width: 640,
          height: 360,
          okText: t('sys.saveText'),
        },
      );
      if (res.ok && res.data?.[0]) {
        const id = res.data[0].id && res.data[0].id === data?.name ? data?.id : res.data[0].id;
        await postMobileHomepageSelect({ id });
        // 刷新表格
        table.value.reload();
        defaultPageId.value = id;
      }
    };

    return { ns, table, model, isEmpty, hasFirstLoad, t, onClick, assignHomePage };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.isEmpty ? this.ns.m('no-data') : this.ns.m('has-data')]}
        v-loading={!this.hasFirstLoad}
      >
        <div class={this.ns.b('no-data')}>
          <div class={this.ns.be('no-data', 'left')}>
            {/* <img src={EmptyPage} /> */}
            <SvgIcon size="505" name="custom-app-home-view" />
          </div>
          <div class={this.ns.be('no-data', 'right')}>
            <div class={this.ns.be('no-data', 'title')}>
              {this.t('sys.appDesigner.customAppHome.noDataMsg.1')}
            </div>
            <div class={this.ns.be('no-data', 'content')}>
              <div class={'mb-13px'}>{this.t('sys.appDesigner.customAppHome.noDataMsg.2')}</div>
              <div class={'mb-8px'}>{this.t('sys.appDesigner.customAppHome.noDataMsg.3')}</div>
              <div>{this.t('sys.appDesigner.customAppHome.noDataMsg.4')}</div>
            </div>
            <div class={this.ns.be('no-data', 'action')}>
              <a-button type="primary" onClick={this.onClick}>
                {this.t('sys.appDesigner.new')}
              </a-button>
            </div>
          </div>
        </div>
        <div class={this.ns.e('content')}>
          <div class={this.ns.e('table-action')}>
            <a-button onClick={this.assignHomePage}>
              {this.t('sys.appDesigner.customAppHome.assignAppHome')}
            </a-button>
            <a-button type="primary" onClick={this.onClick}>
              {this.t('sys.appDesigner.new')}
            </a-button>
          </div>
          <gct-table ref="table" model={this.model} />
        </div>
      </div>
    );
  },
});

export default CustomAppHomeView;
