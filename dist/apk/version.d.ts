export declare class Version {
    private version;
    tokens: Token[];
    constructor(version: string, tokens: Token[]);
    static parse(ver: string): Version;
    static isValid(ver: string): boolean;
    equal(v2: Version): boolean;
    greaterThan(v2: Version): boolean;
    lessThan(v2: Version): boolean;
    compare(v2: Version): number;
}
type SuffixValue = {
    kind: 'alpha' | 'beta' | 'pre' | 'rc' | 'cvs' | 'svn' | 'git' | 'hg' | 'p' | 'other';
    value: number;
};
type DigitToken = {
    kind: 'digit';
    value: number;
    rest: string;
};
type LetterToken = {
    kind: 'letter';
    value: string;
    rest: string;
};
type InvalidToken = {
    kind: 'invalid';
    value: null;
    rest: string;
};
type EndToken = {
    kind: 'end';
    value: '';
    rest: string;
};
type DotToken = {
    kind: 'dot';
    value: '.';
    rest: string;
};
type ReleaseNoToken = {
    kind: 'releaseNo';
    value: number;
    rest: string;
};
type SuffixToken = {
    kind: 'suffix';
    value: SuffixValue;
    rest: string;
};
type Token = DigitToken | LetterToken | InvalidToken | EndToken | DotToken | ReleaseNoToken | SuffixToken;
export declare function makeInvalid(input: string): InvalidToken;
export declare function parseLetter(input: string): LetterToken | InvalidToken;
export declare function compareVersion(tokensLhs: Token[], tokensRhs: Token[]): number;
export {};
