export type ValueOf<T> = T[keyof T];
export type InferRecordValue<T> = T extends { [key: string]: infer B }
  ? B
  : never;
