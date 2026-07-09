import { defineComponent, onMounted, ref } from 'vue';
import { ITable, ITableActionItem, useNamespace, HTTP_TYPE_ENUM } from '@gct/runtime';
import { CustomNavPageCreateModal } from './custom-nav-page-create-modal/custom-nav-page-create-modal';
import { CustomNavPageDesignView } from './custom-nav-page-design-view/custom-nav-page-design-view';
import { useI18n } from 'vue-i18n';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useRouter } from 'vue-router';
import './custom-nav-page-view.scss';
// import EmptyPage from '/@/assets/icons/custom-nav-page.svg';
import { getNavPagePageList, deleteNavPage } from '/@/apis/gct-platform/NavPageController';
import { SvgIcon } from '/@/components/Icon';

/**
 * 首页配置
 */
export const CustomNavPageView = defineComponent({
  name: 'CustomNavPageView',
  setup() {
    const ns = useNamespace('custom-nav-page-view');

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
          title: t('sys.menu.navPageName'),
          customRender({ record }) {
            return record.name;
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
            },
            {
              tag: 'delete',
              text: t('sys.delete'),
              icon: 'delete',
              type: 'text',
              confirm: {
                title: t('sys.sureToDo'),
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
        const res = await getNavPagePageList({
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
        CustomNavPageCreateModal,
        {},
        {
          title: t('sys.menu.newCustomNavPage'),
          width: 640,
          height: 360,
          okText: t('sys.saveText'),
        },
      );
      if (res.ok) {
        table.value.reload();
        const context = res.data?.[0] || {};
        edit(context, HTTP_TYPE_ENUM.INSERT);
      }
    };

    const edit = async (context: IContext, OperateType?: HTTP_TYPE_ENUM) => {
      const res2 = await gct.openUtil.fullScreen(CustomNavPageDesignView, { context, OperateType });
      if (res2.ok) {
        table.value.reload();
      }
    };

    const remove = async (opts: { ids: string }) => {
      await deleteNavPage({ ids: opts.ids });
      table.value.reload();
    };

    // const assignHomePage = async () => {
    //   const res = await gct.openUtil.modal(
    //     AssignNavPageModal,
    //     {
    //       selectedId: defaultPageId.value,
    //     },
    //     {
    //       title: t('sys.appDesigner.customAppHome.assignAppHome'),
    //       width: 640,
    //       height: 360,
    //       okText: t('sys.saveText'),
    //     },
    //   );
    //   if (res.ok && res.data?.[0]) {
    //     const id = res.data[0].id;
    //     await postMobileHomepageSelect({ id });
    //     // 刷新表格
    //     table.value.reload();
    //   }
    // };

    return { ns, table, model, isEmpty, hasFirstLoad, t, onClick };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.isEmpty ? this.ns.m('no-data') : this.ns.m('has-data')]}>
        <div class={this.ns.b('no-data')}>
          <div class={this.ns.be('no-data', 'left')}>
            <SvgIcon size="505" name="custom-nav-page" />
            {/* <img src={EmptyPage} /> */}
          </div>
          <div class={this.ns.be('no-data', 'right')}>
            <div class={this.ns.be('no-data', 'title')}>{this.t('sys.menu.pageNoDataMsg.1')}</div>
            <div class={this.ns.be('no-data', 'content')}>
              <div class={'mb-13px'}>{this.t('sys.menu.pageNoDataMsg.2')}</div>
              <div class={'mb-8px'}>{this.t('sys.menu.pageNoDataMsg.3')}</div>
              <div>{this.t('sys.menu.pageNoDataMsg.4')}</div>
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
            {/* <a-button onClick={this.assignHomePage}>
              {this.t('sys.appDesigner.customAppHome.assignAppHome')}
            </a-button> */}
            <a-button type="primary" onClick={this.onClick}>
              {this.t('sys.appDesigner.new')}
            </a-button>
          </div>
          <gct-table ref="table" model={this.model} v-loading={!this.hasFirstLoad} />
        </div>
      </div>
    );
  },
});

export default CustomNavPageView;
