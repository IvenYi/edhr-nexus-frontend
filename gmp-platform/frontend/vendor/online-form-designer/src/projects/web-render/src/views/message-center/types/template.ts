export interface TemplateType {
  key: string;
  name: string;
  description: string;
  model_key: string;
  model_category: string;
  push_type: string;
  push_object_key: string;
  push_object_name: string;
  message_info: {
    content: string;
    title: string;
    placeholder: Array<object>;
  };
  opened: number;
}
