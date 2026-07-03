export type ToNode<T> = T & {
  collapse?: boolean;
  children?: ToNode<T>[];
};
