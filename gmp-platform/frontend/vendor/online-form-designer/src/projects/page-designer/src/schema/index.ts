import {
  IDesignerProvider,
  ExportWidgetStyleEditors,
  ExportWidgetEvents,
  ExportWidgetPropEditors,
  ExportWidgetSchema,
  ExportWidgetCallback,
  ExportWidgetBeforeCreate,
  ExportWidgetLoopCallback,
  ExportWidgetDesignerConfig,
  ExportWidgetHooks,
  ExportWidgetWhiteList,
  ExportWidgetBlackList,
} from '@gct/runtime';
import {
  fieldFormCallback,
  fieldFormLoopCallback,
  fieldFormEditors,
  fieldFormDesignerConfig,
} from '/@page-designer/schema/field/form/index';
import {
  searchFieldCmpEditors,
  searchDesignerConfig,
} from '/@page-designer/schema/field/search/index';

/**系统web组件 */
const webWidgetStyleEditors: ExportWidgetStyleEditors = {};
const webWidgetEvents: ExportWidgetEvents = {};
const webWidgetHooks: ExportWidgetHooks = {};
const webWidgetWhiteList: ExportWidgetWhiteList = {};
const webWidgetBlackList: ExportWidgetBlackList = {};
const webWidgetPropEditors: ExportWidgetPropEditors = {
  ...searchFieldCmpEditors,
  ...fieldFormEditors,
};
const webWidgetSchema: ExportWidgetSchema = {};
const webWidgetCallback: ExportWidgetCallback = { ...fieldFormCallback };
const webWidgetBeforeCreate: ExportWidgetBeforeCreate = {};
const webWidgetLoopCallback: ExportWidgetLoopCallback = { ...fieldFormLoopCallback };
const webWidgetDesignerConfig: ExportWidgetDesignerConfig = {
  ...searchDesignerConfig,
  ...fieldFormDesignerConfig,
};
/**系统mobile组件 */
const mobileWidgetEvents: ExportWidgetEvents = {};
const mobileWidgetHooks: ExportWidgetHooks = {};
const mobileWidgetWhiteList: ExportWidgetWhiteList = {};
const mobileWidgetBlackList: ExportWidgetBlackList = {};
const mobileWidgetPropEditors: ExportWidgetPropEditors = {
  ...searchFieldCmpEditors,
  ...fieldFormEditors,
};
const mobileWidgetStyleEditors: ExportWidgetStyleEditors = {};
const mobileWidgetSchema: ExportWidgetSchema = {};
const mobileWidgetCallback: ExportWidgetCallback = { ...fieldFormCallback };
const mobileWidgetBeforeCreate: ExportWidgetBeforeCreate = {};
const mobileWidgetLoopCallback: ExportWidgetLoopCallback = { ...fieldFormLoopCallback };
const mobileWidgetDesignerConfig: ExportWidgetDesignerConfig = {
  ...searchDesignerConfig,
  ...fieldFormDesignerConfig,
};
/**系统pad组件 */
const padWidgetEvents: ExportWidgetEvents = {};
const padWidgetHooks: ExportWidgetHooks = {};
const padWidgetWhiteList: ExportWidgetWhiteList = {};
const padWidgetBlackList: ExportWidgetBlackList = {};
const padWidgetPropEditors: ExportWidgetPropEditors = {
  ...searchFieldCmpEditors,
  ...fieldFormEditors,
};
const padWidgetStyleEditors: ExportWidgetStyleEditors = {};
const padWidgetSchema: ExportWidgetSchema = {};
const padWidgetCallback: ExportWidgetCallback = { ...fieldFormCallback };
const padWidgetBeforeCreate: ExportWidgetBeforeCreate = {};
const padWidgetLoopCallback: ExportWidgetLoopCallback = { ...fieldFormLoopCallback };
const padWidgetDesignerConfig: ExportWidgetDesignerConfig = {
  ...searchDesignerConfig,
  ...fieldFormDesignerConfig,
};
/**后续用户自己上传的 */
const customWidgetSchema: ExportWidgetSchema = {};
const customWidgetPropEditors: ExportWidgetPropEditors = {};
const customWidgetEvents: ExportWidgetEvents = {};
const customWidgetCallback: ExportWidgetCallback = {};

// 此处导出的的是webWidget下的
const modules: Record<string, any> = import.meta.glob(['./web/**/[^__]*.ts', './modal/modal.ts'], {
  eager: true,
});
// 此处导出的是mobileWidget下的
const mModules: Record<string, any> = import.meta.glob(
  ['./mobile/**/[^__]*.ts', './modal/modal.ts'],
  {
    eager: true,
  },
);
// 此处导出的的是padWidget下的
const pModules: Record<string, any> = import.meta.glob(['./pad/**/[^__]*.ts', './modal/modal.ts'], {
  eager: true,
});

for (const path in modules) {
  const fileNameWithExtension = path.split('/').pop()!;
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
  if (modules[path]) {
    webWidgetEvents[fileNameWithoutExtension] = modules[path].eventList;
    webWidgetPropEditors[fileNameWithoutExtension] = modules[path].propEditorList;
    webWidgetSchema[fileNameWithoutExtension] = modules[path].widget;
    webWidgetCallback[fileNameWithoutExtension] = modules[path].runCallback;
    webWidgetBeforeCreate[fileNameWithoutExtension] = modules[path].beforeCreate;
    webWidgetLoopCallback[fileNameWithoutExtension] = modules[path].loopCallback;
    webWidgetStyleEditors[fileNameWithoutExtension] = modules[path].styleEditorList;
    webWidgetDesignerConfig[fileNameWithoutExtension] = modules[path].designerConfig;
    webWidgetHooks[fileNameWithoutExtension] = modules[path].hooks;
    webWidgetWhiteList[fileNameWithoutExtension] = modules[path].whiteList;
    webWidgetBlackList[fileNameWithoutExtension] = modules[path].blackList;
  }
}

function registerWebItem(designer: IDesignerProvider): void {
  if (designer) {
    const { type } = designer.schema;
    webWidgetEvents[type] = designer.events!;
    webWidgetPropEditors[type] = designer.propEditors;
    webWidgetSchema[type] = designer.schema;
    webWidgetCallback[type] = designer.callback!;
    webWidgetBeforeCreate[type] = designer.beforeCreate!;
    webWidgetStyleEditors[type] = designer.styleEditors!;
    webWidgetDesignerConfig[type] = designer.designerConfig!;
    webWidgetHooks[type] = designer.hooks!;
    webWidgetWhiteList[type] = designer.whiteList!;
    webWidgetBlackList[type] = designer.blackList!;
  }
}

gct.register.designer.web.hooks.register.tap((_, designer) => {
  registerWebItem(designer);
});

gct.register.designer.web.getProviders().forEach((designer) => {
  registerWebItem(designer);
});

export function initSchema(): void {
  if (window._gct) {
    _gct.register.designer.web.hooks.register.tap((_, tag, provider) => {
      registerWebItem(provider);
    });
    const keys = _gct.register.designer.web.getKeys();
    keys.forEach((key) => {
      const provider = _gct.register.designer.web.getProvider(key);
      registerWebItem(provider);
    });

    _gct.register.designer.mobile.hooks.register.tap((_, tag, provider) => {
      registerMobileItem(provider);
    });
    const keys2 = _gct.register.designer.mobile.getKeys();
    keys2.forEach((key) => {
      const provider = _gct.register.designer.mobile.getProvider(key);
      registerMobileItem(provider);
    });
  }
}

for (const path in mModules) {
  const fileNameWithExtension = path.split('/').pop()!;
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
  if (mModules[path]) {
    mobileWidgetEvents[fileNameWithoutExtension] = mModules[path].eventList;
    mobileWidgetHooks[fileNameWithoutExtension] = mModules[path].hooks;
    mobileWidgetWhiteList[fileNameWithoutExtension] = mModules[path].whiteList;
    mobileWidgetBlackList[fileNameWithoutExtension] = mModules[path].blackList;
    mobileWidgetPropEditors[fileNameWithoutExtension] = mModules[path].propEditorList;
    mobileWidgetSchema[fileNameWithoutExtension] = mModules[path].widget;
    mobileWidgetCallback[fileNameWithoutExtension] = mModules[path].runCallback;
    mobileWidgetBeforeCreate[fileNameWithoutExtension] = mModules[path].beforeCreate;
    mobileWidgetLoopCallback[fileNameWithoutExtension] = mModules[path].loopCallback;
    mobileWidgetStyleEditors[fileNameWithoutExtension] = mModules[path].styleEditorList;
    mobileWidgetDesignerConfig[fileNameWithoutExtension] = mModules[path].designerConfig;
  }
}

function registerMobileItem(designer: IDesignerProvider): void {
  if (designer) {
    const { type } = designer.schema;
    mobileWidgetEvents[type] = designer.events!;
    mobileWidgetHooks[type] = designer.hooks!;
    mobileWidgetWhiteList[type] = designer.whiteList!;
    mobileWidgetBlackList[type] = designer.blackList!;
    mobileWidgetPropEditors[type] = designer.propEditors;
    mobileWidgetSchema[type] = designer.schema;
    mobileWidgetCallback[type] = designer.callback!;
    mobileWidgetBeforeCreate[type] = designer.beforeCreate!;
    mobileWidgetStyleEditors[type] = designer.styleEditors!;
    mobileWidgetDesignerConfig[type] = designer.designerConfig!;
  }
}

for (const path in pModules) {
  const fileNameWithExtension = path.split('/').pop()!;
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
  if (pModules[path]) {
    padWidgetEvents[fileNameWithoutExtension] = pModules[path].eventList;
    padWidgetHooks[fileNameWithoutExtension] = pModules[path].hooks;
    padWidgetWhiteList[fileNameWithoutExtension] = pModules[path].whiteList;
    padWidgetBlackList[fileNameWithoutExtension] = pModules[path].blackList;
    padWidgetPropEditors[fileNameWithoutExtension] = pModules[path].propEditorList;
    padWidgetSchema[fileNameWithoutExtension] = pModules[path].widget;
    padWidgetCallback[fileNameWithoutExtension] = pModules[path].runCallback;
    padWidgetBeforeCreate[fileNameWithoutExtension] = pModules[path].beforeCreate;
    padWidgetLoopCallback[fileNameWithoutExtension] = pModules[path].loopCallback;
    padWidgetStyleEditors[fileNameWithoutExtension] = pModules[path].styleEditorList;
    padWidgetDesignerConfig[fileNameWithoutExtension] = pModules[path].designerConfig;
  }
}

function registerPadItem(designer: IDesignerProvider): void {
  if (designer) {
    const { type } = designer.schema;
    padWidgetEvents[type] = designer.events!;
    padWidgetHooks[type] = designer.hooks!;
    padWidgetWhiteList[type] = designer.whiteList!;
    padWidgetBlackList[type] = designer.blackList!;
    padWidgetPropEditors[type] = designer.propEditors;
    padWidgetSchema[type] = designer.schema;
    padWidgetCallback[type] = designer.callback!;
    padWidgetBeforeCreate[type] = designer.beforeCreate!;
    padWidgetStyleEditors[type] = designer.styleEditors!;
    padWidgetDesignerConfig[type] = designer.designerConfig!;
  }
}

gct.register.designer.mobile.hooks.register.tap((_, designer) => {
  registerMobileItem(designer);
});

gct.register.designer.mobile.getProviders().forEach((designer) => {
  registerMobileItem(designer);
});

gct.register.designer.pad.hooks.register.tap((_, designer) => {
  registerPadItem(designer);
});

gct.register.designer.pad.getProviders().forEach((designer) => {
  registerPadItem(designer);
});

const allWidgetInfo = {
  /**WEB */
  webWidgetEvents,
  webWidgetHooks,
  webWidgetWhiteList,
  webWidgetBlackList,
  webWidgetPropEditors,
  webWidgetStyleEditors,
  webWidgetDesignerConfig,
  webWidgetSchema,
  webWidgetCallback,
  webWidgetBeforeCreate,
  webWidgetLoopCallback,
  /**MOBILE */
  mobileWidgetEvents,
  mobileWidgetHooks,
  mobileWidgetWhiteList,
  mobileWidgetBlackList,
  mobileWidgetPropEditors,
  mobileWidgetStyleEditors,
  mobileWidgetSchema,
  mobileWidgetCallback,
  mobileWidgetBeforeCreate,
  mobileWidgetLoopCallback,
  mobileWidgetDesignerConfig,
  /**PAD */
  padWidgetEvents,
  padWidgetHooks,
  padWidgetWhiteList,
  padWidgetBlackList,
  padWidgetPropEditors,
  padWidgetStyleEditors,
  padWidgetSchema,
  padWidgetCallback,
  padWidgetBeforeCreate,
  padWidgetLoopCallback,
  padWidgetDesignerConfig,
  /**后续用户自己上传的 */
  customWidgetSchema,
  customWidgetPropEditors,
  customWidgetEvents,
  customWidgetCallback,
};
export { mobileWidgetDesignerConfig, webWidgetDesignerConfig, padWidgetDesignerConfig };
export default allWidgetInfo;
