export interface AppMueus {
  appId: string;
  menuId?: string;
  type: 'APP' | 'MENU';
  name?: string;
  sortNum?: number;
  children?: AppMueus[];
  invalid?: number;
}
export interface Menus {
  id: string;
  name: string;
  children?: Menus[];
}
