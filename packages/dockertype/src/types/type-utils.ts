export type ValueOf<T> = T[keyof T];

export type KeyOf<T> = Extract<keyof T, string>;
