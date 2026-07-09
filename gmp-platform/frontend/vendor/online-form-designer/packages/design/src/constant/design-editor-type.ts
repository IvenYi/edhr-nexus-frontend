/**
 * 设计器编辑器类型
 *
 * @author lingxiaoming
 * @date 2024-07-17 04:29:23
 * @export
 * @enum {number}
 */
export enum DesignEditorType {
  // 基础编辑器
  /**
   * 图片上传编辑器
   */
  UPLOAD_IMAGE = 'upload-image',

  /**
   * 文件上传编辑器
   */
  UPLOAD_FILE = 'upload-file',

  // 样式区编辑器
  /**
   * 定位编辑器
   */
  STYLE_POSITION = 'style-position',

  /**
   * 文本编辑器
   */
  STYLE_FONT = 'style-font',

  /**
   * 边距编辑器
   */
  STYLE_SPACING = 'style-spacing',

  /**
   * 边框编辑器
   */
  STYLE_BORDER = 'style-border',

  /**
   * 子项编辑器
   */
  CHILD_LIST_EDITOR = 'chid-list-editor',

  /**
   * 自定义导航菜单项编辑器
   */
  CUSTOM_EXP_MENU = 'custom-exp-menu',

  /**
   * 自定义导航菜单预置系统页面选择器
   */
  SYSTEM_PAGE_SELECT = 'system-page-select',

  /**
   * 字段值标签样式配置
   */
  CONTENT_TAG_STYLE = 'content-tag-style',
}
