import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { recursiveIterate } from '/@/utils/recursive';
import { FormComponents } from '/@page-designer/enum';
import { Form } from '/@page-designer/types/web';

export const WidgetPatch = {
  [FormComponents.Form]: [
    {
      title: '详情表单样式调整',
      handle(widget: Form) {
        console.log('form', widget);
        // 垂直布局
        widget.props.layout = 'vertical';
        // 表单的样式
        Object.assign(widget.style, {
          backgroundColor: '#FAFAFA',
          marginTop: '0',
          marginBottom: '0',
          marginLeft: '0',
          marginRight: '0',
          marginAll: '0',
          paddingTop: '8',
          paddingBottom: '8',
          paddingLeft: '16',
          paddingRight: '16',
          paddingAll: '',
        });
        // 栅格样式
        if (widget.children?.[0] && widget.children[0].type === FormComponents.Grid) {
          const grid = widget.children[0];
          Object.assign(grid.style, {
            backgroundColor: '#FAFAFA',
            marginTop: '0',
            marginBottom: '0',
            marginLeft: '0',
            marginRight: '0',
            marginAll: '0',
          });
        }
        // 递归修改字段的样式
        recursiveIterate(
          widget,
          ({ item }) => {
            if (item.materialType == 'formField' && item.isField === true) {
              Object.assign(item.style, {
                contentFont: {
                  bold: true,
                  color: '#212528',
                },
                labelFont: {
                  color: '#737A87',
                },
              });
            }
          },
          { childrenFields: ['children'] },
        );
      },
    },
  ],
  [FormComponents.MedProRdoForm]: [
    {
      title: '详情表单样式调整',
      handle(widget: Form) {
        console.log('form', widget);
        // 垂直布局
        widget.props.layout = 'vertical';
        // 表单的样式
        Object.assign(widget.style, {
          backgroundColor: '#FAFAFA',
          marginTop: '0',
          marginBottom: '0',
          marginLeft: '0',
          marginRight: '0',
          marginAll: '0',
          paddingTop: '8',
          paddingBottom: '8',
          paddingLeft: '16',
          paddingRight: '16',
          paddingAll: '',
        });
        // 栅格样式
        if (widget.children?.[0] && widget.children[0].type === FormComponents.Grid) {
          const grid = widget.children[0];
          Object.assign(grid.style, {
            backgroundColor: '#FAFAFA',
            marginTop: '0',
            marginBottom: '0',
            marginLeft: '0',
            marginRight: '0',
            marginAll: '0',
          });
        }
        // 递归修改字段的样式
        recursiveIterate(
          widget,
          ({ item }) => {
            if (item.materialType == 'formField' && item.isField === true) {
              Object.assign(item.style, {
                contentFont: {
                  bold: true,
                  color: '#212528',
                },
                labelFont: {
                  color: '#737A87',
                },
              });
            }
          },
          { childrenFields: ['children'] },
        );
      },
    },
  ],
  [FormComponents.RdoForm]: [
    {
      title: '详情表单样式调整',
      handle(widget: Form) {
        console.log('form', widget);
        // 垂直布局
        widget.props.layout = 'vertical';
        // 表单的样式
        Object.assign(widget.style, {
          backgroundColor: '#FAFAFA',
          marginTop: '0',
          marginBottom: '0',
          marginLeft: '0',
          marginRight: '0',
          marginAll: '0',
          paddingTop: '8',
          paddingBottom: '8',
          paddingLeft: '16',
          paddingRight: '16',
          paddingAll: '',
        });
        // 栅格样式
        if (widget.children?.[0] && widget.children[0].type === FormComponents.Grid) {
          const grid = widget.children[0];
          Object.assign(grid.style, {
            backgroundColor: '#FAFAFA',
            marginTop: '0',
            marginBottom: '0',
            marginLeft: '0',
            marginRight: '0',
            marginAll: '0',
          });
        }
        // 递归修改字段的样式
        recursiveIterate(
          widget,
          ({ item }) => {
            if (item.materialType == 'formField' && item.isField === true) {
              Object.assign(item.style, {
                contentFont: {
                  bold: true,
                  color: '#212528',
                },
                labelFont: {
                  color: '#737A87',
                },
              });
            }
          },
          { childrenFields: ['children'] },
        );
      },
    },
  ],
};

export const PagePatch = [
  {
    title: '查询和表格样式调整',
    handle(page: any) {
      const grid = page.widgets?.[0];
      const table = page.widgets?.[1];
      const searchForm = grid?.children?.[0]?.children?.[0];
      console.log('grid', grid, table, searchForm);
      Object.assign(searchForm.style, {
        backgroundColor: '#F7F8FA',
        marginTop: '16',
        marginBottom: '0',
        marginLeft: '16',
        marginRight: '16',
        marginAll: '',
        paddingTop: '8',
        paddingBottom: '0',
        paddingLeft: '16',
        paddingRight: '16',
        paddingAll: '',
      } as LowCodeWidget.BasicStyle);

      Object.assign(table.style, {
        marginTop: '0',
        marginBottom: '0',
        marginLeft: '0',
        marginRight: '0',
        marginAll: '0',
        paddingTop: '16',
        paddingBottom: '16',
        paddingLeft: '16',
        paddingRight: '16',
        paddingAll: '16',
      } as LowCodeWidget.BasicStyle);

      page.css += `#gct-scrollbody 
  {
    \r\n  display:  flex;\r\n  flex-direction:  column;\r\n  overflow:  hidden;\r\n
  }
  \r\n\r\n#${searchForm.id} .button-area 
  {
    \r\n  margin-top:  8px;\r\n  margin-bottom:  16px;\r\n
  }
  \r\n\r\n#${table.id} 
  {
    \r\n  display:  flex;\r\n  flex-direction:  column;\r\n  flex:  1;\r\n  overflow:  hidden;\r\n
  }
  \r\n\r\n#${table.id} .ant-form 
  {
    \r\n  flex:  1;\r\n  overflow:  hidden;\r\n
  }
  `;
    },
  },
];
