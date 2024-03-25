export declare function makeVersion(ver: string): Version;
export declare class Version {
    epoch: number;
    version: string;
    release: string;
    private static readonly alphanumPattern;
    constructor(epoch: number, version: string, release: string);
    equal(other: Version): boolean;
    greaterThan(other: Version): boolean;
    lessThan(other: Version): boolean;
    compare(other: Version): number;
    toString(): string;
    private equals;
    static rpmvercmp(a: string, b: string): number;
    static parse(ver: string): Version;
}
