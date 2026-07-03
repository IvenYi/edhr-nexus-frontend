import { operateSysEnums } from '/@page-designer/enum';
import { provide } from 'vue';
import { message as Message } from 'ant-design-vue';
import { cloneDeep, merge, orderBy, isEmpty } from 'lodash-es';
import { EntityModelTypeEnum, openWindowEnums, ExamineAndApproveStateEnum } from '@gct/runtime';
import { useProcessPage } from '/@/hooks/web/useProcessPage';

export const useTableEvents = ({
  getDataSource,
  Event,
  deleteByChecked,
  getParameters,
  model,
  modeldata,
}) => {
  /**注入的方法给按钮组件使用使用 */
  provide('tableEvent', {
    async modelingTraceability(row, widget) {
      /**建模追溯*/
      Event.context.$modelingTraceability({ id: row.id_, modelKey: model }).open();
    },
    async delete(row) {
      const { id_ } = row;
      await deleteById(id_);
    },
    async linkPage(row, widget) {
      const { linkPage } = widget.props;
      Event.context.$push!(linkPage, { id: row.id_ });
    },
    async edit(row, widget) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.EDIT,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async openDetails(row, widget) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.DETAILS,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            ctx.$setPropsByKey(refForm, { readonly: true });
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async copy(row, widget) {
      const { refModal, refForm, excludeField } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      const rowData = row.__DEFAULT__ || row;
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.COPY,
          title,
          async onOpen(ctx) {
            const info = await getAllDataById(row, {
              model: model,
              modelType: modeldata?.modelType,
              modelCategory: modeldata?.modelCategory,
              excludeField: excludeField,
            });
            const form = await ctx.$asyncRef(refForm);
            form.copyData({ ...rowData, ...info });
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    } /**流程审批 */,
    async approve(row, widget, data) {
      const { taskId, procInstId, node, webPageKey, webViewPageKey, btnList } = data;
      const { refModal, refForm, openType } = widget.props;
      if (openType === openWindowEnums.OPEN) {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.EXAMINE_AND_APPROVE,
          async onReady(E) {
            await E.runProcessBySaskId({
              taskId,
              processInstanceId: procInstId,
              examineAndApproveState: ExamineAndApproveStateEnum.MY_CUSTOM_Modal,
              refFormId: refForm,
            });
          },
        });
      } else {
        const { goPage } = useProcessPage({ processInstanceId: procInstId, taskId });
        const btnkeys = btnList || [];
        if (!node || !btnkeys.length || (node.key === '__initiator__' && !taskId)) {
          // node 不存在表示无关人员 btnList空表示审批完成   node.key 识别开始节点就是申请人开始节点
          goPage(node?.webViewPageKey || webViewPageKey, ExamineAndApproveStateEnum.MY_CUSTOM);
        } else {
          goPage(node.webPageKey || webPageKey, ExamineAndApproveStateEnum.MY_CUSTOM);
        }
      }
    },
    deleteByChecked,
    getImportParames: () => {
      return {};
    },
    afterImport: async () => {
      getDataSource();
    },
    getParameters,
  });

  /**更具id 获取完整的数据信息方便复制 */
  async function getAllDataById(row, { model, modelCategory, modelType, excludeField = [] }) {
    const formData = cloneDeep(row);
    const id = formData.id_;
    if (modelType === EntityModelTypeEnum.RDO || modelType === EntityModelTypeEnum.WORKFLOW) {
      const data = await Event.context.$httpBizService(
        {
          action: 'rdoGetVersionById',
          key: model,
          modelCategory: modelCategory,
        },
        {
          id,
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    } else {
      const data = await Event.context.$httpBizService(
        {
          action: 'getOne',
          key: model,
          modelCategory: modelCategory,
        },
        {
          query: { 'id_.eq': id },
        },
        {
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    }
    excludeField.forEach((i: any) => {
      formData[i.key] = undefined;
    });

    return formData;
  }
  /**
   * 删除选中行根据Id
   */
  async function deleteById(id) {
    await Event.context.$httpBizService(
      { key: model, action: 'remove', modelCategory: modeldata?.modelCategory },
      {
        query: {
          'full_path_.like': id,
        },
      },
    );
    Message.success($t('sys.delSuccess'));
    getDataSource();
  }
};
