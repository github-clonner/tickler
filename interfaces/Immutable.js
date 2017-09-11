declare module 'immutable' {
  declare module.exports: any;
}


//TODO: Once flow can extend normal Objects we can change this back to actually reflect Record behavior.
// For now fallback to any to not break existing Code
declare class Record<T: Object> {
  static <T: Object>(spec: T, name?: string): /*T & Record<T>*/any;
  get<A>(key: $Keys<T>): A;
  set<A>(key: $Keys<T>, value: A): /*T & Record<T>*/this;
  remove(key: $Keys<T>): /*T & Record<T>*/this;
  toJS(): any;
}
