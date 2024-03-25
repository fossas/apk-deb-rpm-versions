"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVersion = exports.parseLetter = exports.makeInvalid = exports.Version = void 0;
const LESS = -1;
const EQUAL = 0;
const GREATER = 1;
class Version {
    constructor(version, tokens) {
        this.version = version;
        this.tokens = tokens;
    }
    static parse(ver) {
        const tokens = parseVersion(ver.trim());
        return new Version(ver, tokens);
    }
    static isValid(ver) {
        const verr = ver.trim();
        if (verr === '') {
            return false;
        }
        const v = Version.parse(verr);
        const invalids = v.tokens.filter(f => f.kind === 'invalid');
        const ends = v.tokens.filter(f => f.kind === 'end');
        return invalids.length <= 0 && ends.length === 1;
    }
    equal(v2) {
        return this.compare(v2) === 0;
    }
    greaterThan(v2) {
        return this.compare(v2) > 0;
    }
    lessThan(v2) {
        return this.compare(v2) < 0;
    }
    compare(v2) {
        return compareVersion(this.tokens, v2.tokens);
    }
}
exports.Version = Version;
const preSuffixes = ['alpha', 'beta', 'pre', 'rc'];
const postSuffixes = ['cvs', 'svn', 'git', 'hg', 'p'];
function isLetter(character) {
    const charCode = character.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || // A-Z
        (charCode >= 97 && charCode <= 122); // a-z
}
function parseDigit(input) {
    let value = '';
    let i = 0;
    while (i < input.length && /[0-9]/.test(input[i])) {
        value += input[i];
        i++;
    }
    return {
        value: parseInt(value),
        rest: input.slice(i),
        kind: 'digit'
    };
}
function parseRelease(input) {
    let value = null;
    let rest = input;
    if (input.startsWith("-r")) {
        rest = input.substring(2);
        const parsedDigit = parseDigit(rest);
        if (parsedDigit.value !== null) {
            rest = parsedDigit.rest;
            value = parsedDigit.value;
        }
    }
    return {
        value: value || 0,
        rest,
        kind: 'releaseNo'
    };
}
function parseSuffix(input) {
    let value = null;
    let rest = input;
    const possibleSuffix = [...preSuffixes, ...postSuffixes];
    for (const cSuffix of possibleSuffix) {
        if (!input.startsWith(`_${cSuffix}`)) {
            continue;
        }
        rest = input.substring(`_${cSuffix}`.length);
        const parsedDigit = parseDigit(rest);
        rest = parsedDigit.rest;
        value = {
            kind: cSuffix,
            value: parsedDigit.value || 0
        };
        return {
            value,
            rest,
            kind: 'suffix'
        };
    }
    return {
        value: {
            kind: 'other',
            value: 0,
        },
        rest: input.substring(1),
        kind: 'suffix'
    };
}
function makeInvalid(input) {
    return {
        kind: 'invalid',
        value: null,
        rest: input,
    };
}
exports.makeInvalid = makeInvalid;
function parseLetter(input) {
    if (!isLetter(input[0])) {
        return makeInvalid(input);
    }
    return {
        value: input[0],
        rest: input.substring(1),
        kind: 'letter',
    };
}
exports.parseLetter = parseLetter;
function nextTokenKind(currToken) {
    if (currToken.rest === '') {
        return 'end';
    }
    if (currToken.kind === 'digit' && currToken.rest[0] === '.') {
        return 'dot';
    }
    if (currToken.kind === 'dot' && '0123456789'.includes(currToken.rest[0])) {
        return 'digit';
    }
    if (currToken.rest.length > 2 && currToken.rest.startsWith("-r")) {
        return 'releaseNo';
    }
    if (currToken.rest.length > 1 && currToken.rest.startsWith("_")) {
        return 'suffix';
    }
    if (isLetter(currToken.rest[0])) {
        return 'letter';
    }
    return 'invalid';
}
function parseVersion(version) {
    const tokens = [];
    const invalidToken = {
        kind: 'invalid',
        value: null,
        rest: '',
    };
    let value;
    let rest;
    let kind = 'digit';
    const parsedInitDigit = parseDigit(version);
    value = parsedInitDigit.value;
    if (value === null || Number.isNaN(value)) {
        return [invalidToken];
    }
    tokens.push(parsedInitDigit);
    rest = parsedInitDigit.rest;
    kind = nextTokenKind(parsedInitDigit);
    let paranoidCounter = 1999;
    while (kind !== 'invalid' && kind !== 'end') {
        paranoidCounter--;
        if (paranoidCounter == 0) {
            break;
        }
        if (kind === 'dot') {
            rest = rest.substring(1);
            kind = nextTokenKind({ value, rest, kind });
        }
        else if (kind === 'digit') {
            const parsedDigit = parseDigit(rest);
            tokens.push(parsedDigit);
            value = parsedDigit.value;
            kind = parsedDigit.kind;
            rest = parsedDigit.rest;
            kind = nextTokenKind(parsedDigit);
        }
        else if (kind === 'releaseNo') {
            const parsedRelease = parseRelease(rest);
            tokens.push(parsedRelease);
            value = parsedRelease.value;
            kind = parsedRelease.kind;
            rest = parsedRelease.rest;
            kind = nextTokenKind(parsedRelease);
        }
        else if (kind === 'suffix') {
            const parsedSuffix = parseSuffix(rest);
            tokens.push(parsedSuffix);
            value = parsedSuffix.value;
            kind = parsedSuffix.kind;
            rest = parsedSuffix.rest;
            kind = nextTokenKind(parsedSuffix);
        }
        else if (kind === 'letter') {
            const parsedLetter = parseLetter(rest);
            tokens.push(parsedLetter);
            value = parsedLetter.value;
            kind = parsedLetter.kind;
            rest = parsedLetter.rest;
            kind = nextTokenKind(parsedLetter);
        }
        else {
            tokens.push(invalidToken);
            kind = nextTokenKind(invalidToken);
        }
    }
    if (kind === 'end') {
        tokens.push({ value: '', rest: '', kind: 'end' });
    }
    return tokens;
}
function compareNum(a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
}
function compareTokenKind(a, b) {
    const precedence = {
        'digit': 0,
        'dot': 0,
        'letter': 1,
        'suffix': 2,
        'releaseNo': 3,
        'end': 99,
        'invalid': 100
    };
    if (precedence[a] > precedence[b]) {
        return LESS;
    }
    if (precedence[a] === precedence[b]) {
        return EQUAL;
    }
    return GREATER;
}
function compareSuffix(a, b) {
    const aIsPreSuffix = preSuffixes.includes(a.kind);
    const bIsPreSuffix = preSuffixes.includes(b.kind);
    const aIsPostSuffix = postSuffixes.includes(a.kind);
    const bIsPostSuffix = postSuffixes.includes(b.kind);
    if (a.kind === 'other' && b.kind === 'other') {
        return 0;
    }
    if (a.kind === 'other' || b.kind === 'other') {
        return a.kind < b.kind ? LESS : GREATER;
    }
    if (aIsPreSuffix && bIsPostSuffix) {
        return LESS;
    }
    if (aIsPreSuffix && bIsPreSuffix) {
        const aIdx = preSuffixes.indexOf(a.kind);
        const bIdx = preSuffixes.indexOf(b.kind);
        if (aIdx === bIdx) {
            return compareNum(a.value, b.value);
        }
        return aIdx < bIdx ? LESS : GREATER;
    }
    if (bIsPreSuffix && aIsPostSuffix) {
        return GREATER;
    }
    if (aIsPostSuffix && bIsPostSuffix) {
        const aIdx = postSuffixes.indexOf(a.kind);
        const bIdx = postSuffixes.indexOf(b.kind);
        if (aIdx === bIdx) {
            return compareNum(a.value, b.value);
        }
        return aIdx < bIdx ? LESS : GREATER;
    }
    return EQUAL;
}
function areValueEqual(lhs, rhs) {
    if (lhs.kind === 'suffix' && rhs.kind === 'suffix') {
        const ll = lhs.value;
        return compareSuffix(lhs.value, rhs.value) === EQUAL;
    }
    return lhs.value === rhs.value;
}
function compareVersion(tokensLhs, tokensRhs) {
    let ai = 0;
    let bi = 0;
    function getTokenAt(arr, idx) {
        if (idx < arr.length) {
            return arr[idx];
        }
        return { kind: 'end', value: '', rest: '' };
    }
    while (getTokenAt(tokensLhs, ai).kind === getTokenAt(tokensRhs, bi).kind &&
        getTokenAt(tokensLhs, ai).kind !== 'end' &&
        getTokenAt(tokensLhs, ai).kind !== 'invalid' &&
        areValueEqual(getTokenAt(tokensLhs, ai), getTokenAt(tokensRhs, bi))) {
        // loop until, we find first difference
        ai++;
        bi++;
    }
    const aToken = getTokenAt(tokensLhs, ai);
    const bToken = getTokenAt(tokensRhs, bi);
    if (aToken.kind === 'suffix' && bToken.kind === 'suffix') {
        return compareSuffix(aToken.value, bToken.value);
    }
    if (aToken.kind === 'suffix' && (bToken.kind === 'end')) {
        if (preSuffixes.includes(aToken.value.kind)) {
            return LESS;
        }
    }
    if (bToken.kind === 'suffix' && (aToken.kind === 'end')) {
        if (preSuffixes.includes(bToken.value.kind)) {
            return GREATER;
        }
    }
    if (aToken.kind !== bToken.kind) {
        return compareTokenKind(aToken.kind, bToken.kind);
    }
    // @ts-ignore - this is safe as aToken.kind, and bToken.kind have same types 
    if (aToken.value < bToken.value) {
        return LESS;
        // @ts-ignore - this is safe as aToken.kind, and bToken.kind have same types 
    }
    else if (aToken.value > bToken.value) {
        return GREATER;
    }
    return EQUAL;
}
exports.compareVersion = compareVersion;
