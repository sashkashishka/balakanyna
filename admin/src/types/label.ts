export interface ILabel {
  id: number;
  name: string;
  type: 'image' | 'task';
  config: {
    bordered: boolean;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
}
