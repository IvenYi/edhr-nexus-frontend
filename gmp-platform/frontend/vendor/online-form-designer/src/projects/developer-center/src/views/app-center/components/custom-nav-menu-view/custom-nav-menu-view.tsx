import { defineComponent, nextTick, onMounted, ref } from 'vue';
import { ITable, ITableActionItem, useNamespace, HTTP_TYPE_ENUM } from '@gct/runtime';
import { CustomNavMenuCreateModal } from './custom-nav-menu-create-modal/custom-nav-menu-create-modal';
import { CustomNavMenuDesignView } from './custom-nav-menu-design-view/custom-nav-menu-design-view';
import { AssignNavMenuModal } from './assign-nav-menu-modal/assign-nav-menu-modal';
import { useI18n } from 'vue-i18n';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useRouter } from 'vue-router';
import './custom-nav-menu-view.scss';
// import EmptyPage from '/@app-designer/assets/image/empty-page.png';
import {
  getNavMenuPageList,
  deleteNavMenu,
  postNavMenuSelect,
  getNavMenuGetSelected,
} from '/@/apis/gct-platform/NavMenuController';
import { SvgIcon } from '/@/components/Icon';

/**
 * 首页配置
 */
export const CustomNavMenuView = defineComponent({
  name: 'CustomNavMenuView',
  setup() {
    const ns = useNamespace('custom-nav-menu-view');

    const router = useRouter();

    const store = useAppInfoStore();

    onMounted(() => {
      // if (store && store.appInfo.mobileEnabled !== 1) {
      //   router.push('/app-design/model-designer').then(() => {
      //     window.location.reload();
      //   });
      //   return;
      // }
    });

    const { t } = useI18n() as any;

    const table = ref<any>();
    const isEmpty = ref(true);
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
          width: 56,
        },
        {
          name: 'name',
          dataIndex: 'name',
          title: t('sys.menu.navMenuName'),
          customRender({ record }) {
            return [
              record.name,
              !!record.selected && (
                <span
                  style={
                    'color:#2C71FC; background: #EBF0FFFF; padding: 1px 4px; margin-left: 10px;'
                  }
                >
                  {t('sys.menu.navMenu')}
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
          width: 120,
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
                title: t('sys.sureToDo'),
              },
              hidden(row) {
                return !!row.selected;
              },
            },
          ],
          action(tag, row) {
            if (tag === 'edit') {
              edit({ id: row.id });
            } else if (tag === 'delete') {
              remove({ ids: row.id });
            }
          },
        } as ITableActionItem,
      ],
      fetch: async (params, c) => {
        console.log('[ params ] >', params);
        const res = await getNavMenuPageList({
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
        CustomNavMenuCreateModal,
        {},
        {
          title: t('sys.menu.newNavMenu'),
          width: 640,
          height: 360,
          okText: t('sys.saveText'),
        },
      );
      if (res.ok) {
        table.value?.reload();
        const context = res.data?.[0] || {};
        edit(context, HTTP_TYPE_ENUM.INSERT);
      }
    };

    const edit = async (context: IContext, OperateType?: HTTP_TYPE_ENUM) => {
      const res2 = await gct.openUtil.fullScreen(CustomNavMenuDesignView, { context, OperateType });
      if (res2.ok) {
        table.value.reload();
      }
    };

    const remove = async (opts: { ids: string }) => {
      await deleteNavMenu({ ids: opts.ids });
      table.value.reload();
    };

    const assignHomePage = async () => {
      const data = await getNavMenuGetSelected();
      const res = await gct.openUtil.modal(
        AssignNavMenuModal,
        {
          selectedId: defaultPageId.value || data?.id,
          isDeleted: !!data?.deleted,
          selectedTitle: data?.name,
        },
        {
          title: t('sys.menu.assignNavMenu'),
          width: 640,
          height: 360,
          okText: t('sys.saveText'),
        },
      );
      if (res.ok && res.data?.[0]) {
        const id = res.data[0].id && res.data[0].id === data?.name ? data?.id : res.data[0].id;
        await postNavMenuSelect({ id });
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
            <SvgIcon size="505" name="custom-nav-menu" />
            {/* <img src={EmptyPage} /> */}
          </div>
          <div class={this.ns.be('no-data', 'right')}>
            <div class={this.ns.be('no-data', 'title')}>{this.t('sys.menu.menuNoDataMsg.1')}</div>
            <div class={(this.ns.be('no-data', 'content'), 'color-[#474747] mb-20px')}>
              {this.t('sys.menu.menuNoDataMsg.2')}
            </div>
            <div class={this.ns.be('no-data', 'content')}>
              <div class={'mb-13px'}>{this.t('sys.menu.menuNoDataMsg.3')}</div>
              <div class={'mb-8px'}>{this.t('sys.menu.menuNoDataMsg.4')}</div>
              <div class={'mb-8px'}>{this.t('sys.menu.menuNoDataMsg.5')}</div>
              <div>{this.t('sys.menu.menuNoDataMsg.6')}</div>
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
            <a-button onClick={this.assignHomePage}>{this.t('sys.menu.assignNavMenu')}</a-button>
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

export default CustomNavMenuView;
