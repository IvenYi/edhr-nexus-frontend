export interface PersonnelTarget {
  id: string;
  name: string;
  username: string;
}
export interface PersonnelTargetPage {
  content: PersonnelTarget[];
  page: number;
  size: number;
  hasNext: boolean;
}
