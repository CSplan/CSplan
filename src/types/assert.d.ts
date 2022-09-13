/** 
 * Asserts that the boolean property T[U] is true. 
 * This is useful when working with unions.
 */
declare type Assert<T, U extends keyof T> = Exclude<T, T & Record<U, false>>