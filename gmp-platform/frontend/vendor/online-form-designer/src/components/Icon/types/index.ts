export interface ICategory {
  id: string;
  name: string;
  icons?: Array<{
    id: string; // 唯一标识 格式为${命名空间}:${图标值}
    name: string;
    _filter_: string[]; // 过滤的关键字集合
  }>;
  children?: ICategory[];
}

export enum IconNamespaceEnum {
  Preset = 'icon-preset',
  IconPark = 'icon-park',
  Asset = 'icon-assert',
  Platform = 'icon-platform',
  GctIconFont = 'gct-iconfont',
}
