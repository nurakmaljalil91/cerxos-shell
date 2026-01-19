export type QueryRequest = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
  filter?: string;
};
