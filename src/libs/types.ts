export type JWT = `Bearer ${string}`;
export type TEnvKey = `VITE_${string}`;

/**
 * Function type with arguments and return type
 * @param P - Arguments
 * @param R - Return type
 */
export type Function<P = unknown, R = unknown> = (props: P) => R;
/**
 * Async function type with arguments and return type
 * @param P - Arguments
 * @param R - Return type
 */
export type AsyncFunction<P = unknown, R = unknown> = Function<P, Promise<R>>;