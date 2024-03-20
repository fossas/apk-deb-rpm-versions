export type Expression<Version> = {
    op: 'true';
} | {
    op: 'false';
} | {
    op: 'lt';
    value: Version;
} | {
    op: 'gt';
    value: Version;
} | {
    op: 'eq';
    value: Version;
} | {
    op: 'and';
    lhs: Expression<Version>;
    rhs: Expression<Version>;
} | {
    op: 'or';
    lhs: Expression<Version>;
    rhs: Expression<Version>;
};
export interface ComparableVersion<T> {
    lessThan(other: ComparableVersion<T>): boolean;
    greaterThan(other: ComparableVersion<T>): boolean;
    equals(other: ComparableVersion<T>): boolean;
}
export declare class ExpressionBuilder<T> {
    root: Expression<ComparableVersion<T>>;
    where(predicate: Expression<ComparableVersion<T>>): this;
    whereOr(predicate: Expression<ComparableVersion<T>>): this;
    dump(): Expression<ComparableVersion<T>>;
    eval<V>(against: ComparableVersion<V>): boolean;
    evalInverse<V>(against: ComparableVersion<V>): boolean;
    static LT<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>>;
    static GT<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>>;
    static EQ<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>>;
    static AND<V>(lhs: Expression<ComparableVersion<V>>, rhs: Expression<ComparableVersion<V>>): Expression<ComparableVersion<V>>;
    static OR<V>(lhs: Expression<ComparableVersion<V>>, rhs: Expression<ComparableVersion<V>>): Expression<ComparableVersion<V>>;
    static INVERSE<V>(exp: Expression<ComparableVersion<V>>): Expression<ComparableVersion<V>>;
    static perform<V>(target: Expression<ComparableVersion<V>>, against: ComparableVersion<V>): boolean;
    static sort<V>(target: ComparableVersion<V>[], kind?: 'asc' | 'dsc'): ComparableVersion<V>[];
}
