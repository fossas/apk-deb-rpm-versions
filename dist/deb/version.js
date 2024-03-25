"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
class Version {
    constructor(epoch, upstreamVersion, debianRevision) {
        this.epoch = epoch;
        this.upstreamVersion = upstreamVersion;
        this.debianRevision = debianRevision;
    }
    static extract(version) {
        var _a, _b;
        const digitRegexp = /[0-9]+/g;
        const nonDigitRegexp = /[^0-9]+/g;
        const numbers = (_a = version.match(digitRegexp)) !== null && _a !== void 0 ? _a : [];
        const dnum = numbers.map((n) => parseInt(n));
        const strings = (_b = version.match(nonDigitRegexp)) !== null && _b !== void 0 ? _b : [];
        return [dnum, strings];
    }
    static compareString(s1, s2) {
        if (s1 === s2) {
            return 0;
        }
        for (let i = 0;; i++) {
            let a = 0;
            if (i < s1.length) {
                a = Version.order(s1[i]);
            }
            let b = 0;
            if (i < s2.length) {
                b = Version.order(s2[i]);
            }
            if (a !== b) {
                return a - b;
            }
        }
    }
    static order(r) {
        function isLetter(c) {
            return /\p{L}/u.test(c);
        }
        if (isLetter(r)) {
            return r.charCodeAt(0);
        }
        if (r === '~') {
            return -1;
        }
        return r.charCodeAt(0) + 256;
    }
    static compare(v1, v2) {
        if (v1 === v2) {
            return 0;
        }
        const [numbers1, strings1] = Version.extract(v1);
        const [numbers2, strings2] = Version.extract(v2);
        if (v1.length > 0 && /[0-9]/.test(v1[0])) {
            strings1.unshift("");
        }
        if (v2.length > 0 && /[0-9]/.test(v2[0])) {
            strings2.unshift("");
        }
        for (let i = 0;; i++) {
            const diff = Version.compareString(strings1[i] || '', strings2[i] || '');
            if (diff !== 0) {
                return diff;
            }
            const diff2 = (numbers1[i] || 0) - (numbers2[i] || 0);
            if (diff2 !== 0) {
                return diff2;
            }
        }
    }
    static verifyUpstreamVersion(str) {
        if (str.length === 0) {
            throw new Error("upstream_version is empty");
        }
        if (!str[0].match(/[0-9]/)) {
            throw new Error("upstream_version must start with digit");
        }
        const allowedSymbols = ".-+~:_";
        for (const s of str) {
            if (!s.match(/[0-9a-zA-Z]/) && !allowedSymbols.includes(s)) {
                throw new Error("upstream_version includes invalid character");
            }
        }
    }
    static verifyDebianRevision(str) {
        const allowedSymbols = "+.~_";
        for (const s of str) {
            if (!s.match(/[0-9a-zA-Z]/) && !allowedSymbols.includes(s)) {
                throw new Error("debian_revision includes invalid character");
            }
        }
    }
    static parse(ver) {
        let epoch = 0;
        let upstreamVersion = ver;
        let debianRevision = "";
        const trimmedVer = ver.trim();
        const splitted = trimmedVer.split(":");
        if (splitted.length > 1) {
            epoch = parseInt(splitted[0]);
            if (isNaN(epoch)) {
                throw new Error("epoch parse error");
            }
            if (epoch < 0) {
                throw new Error("epoch is negative");
            }
            upstreamVersion = splitted[1];
        }
        const index = upstreamVersion.lastIndexOf("-");
        if (index >= 0) {
            debianRevision = upstreamVersion.substr(index + 1);
            upstreamVersion = upstreamVersion.substr(0, index);
        }
        Version.verifyUpstreamVersion(upstreamVersion);
        Version.verifyDebianRevision(debianRevision);
        return new Version(epoch, upstreamVersion, debianRevision);
    }
    equal(other) {
        return this.compareVersions(this, other) === 0;
    }
    greaterThan(other) {
        return this.compareVersions(this, other) > 0;
    }
    lessThan(other) {
        return this.compareVersions(this, other) < 0;
    }
    compare(other) {
        return this.compareVersions(this, other);
    }
    compareVersions(v1, v2) {
        if (v1.epoch !== v2.epoch) {
            return v1.epoch - v2.epoch;
        }
        const upstreamComparison = Version.compare(v1.upstreamVersion, v2.upstreamVersion);
        if (upstreamComparison !== 0) {
            return upstreamComparison;
        }
        return Version.compare(v1.debianRevision, v2.debianRevision);
    }
    toString() {
        let version = "";
        if (this.epoch > 0) {
            version += `${this.epoch}:`;
        }
        version += this.upstreamVersion;
        if (this.debianRevision !== "") {
            version += `-${this.debianRevision}`;
        }
        return version;
    }
    static isValid(ver) {
        try {
            Version.parse(ver);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.Version = Version;
