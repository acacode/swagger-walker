export type ValueOf<T> = T[keyof T];
export type InferRecordValue<T> = T extends { [key: string]: infer B }
  ? B
  : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;
