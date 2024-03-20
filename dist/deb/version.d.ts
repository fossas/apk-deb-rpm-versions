export declare class Version {
    epoch: number;
    upstreamVersion: string;
    debianRevision: string;
    constructor(epoch: number, upstreamVersion: string, debianRevision: string);
    static extract(version: string): [number[], string[]];
    static compareString(s1: string, s2: string): number;
    static order(r: string): number;
    static compare(v1: string, v2: string): number;
    static verifyUpstreamVersion(str: string): void;
    static verifyDebianRevision(str: string): void;
    static parse(ver: string): Version;
    equal(other: Version): boolean;
    greaterThan(other: Version): boolean;
    lessThan(other: Version): boolean;
    compare(other: Version): number;
    private compareVersions;
    toString(): string;
    static isValid(ver: string): boolean;
}
