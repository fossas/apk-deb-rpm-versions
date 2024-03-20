function splitOnce(on: string, str: string): [string, string, number] {
  var split = str.split(on);
  var first = split[0];
  var rest = split.slice(1).join(":");
  return [first, rest, split.length];
}

function isNumber(val: string) {
  const num = parseInt(val, 10);
  return !isNaN(num);
}

function trimLeft(str: string, char: string): string {
  let startIndex = 0;
  while (startIndex < str.length && str[startIndex] === char) {
    startIndex++;
  }
  return str.substring(startIndex);
}

function safeMatches(value: string, reg: RegExp) {
  if (value === "") {
    return [];
  }

  return value.match(reg) || [];
}

export function makeVersion(ver: string): Version {
  let epoch = 0;
  let version = "";
  let release = "";

  // Parse epoch
  const [e, rest, count] = splitOnce(":", ver);
  if (rest === "" && count == 1) {
    version = e;
  } else {
    let epochStr = e.trimLeft();
    epoch = parseInt(epochStr) || 0;
    version = rest;
  }

  // Parse version and release
  const index = version.indexOf("-");
  if (index >= 0) {
    release = version.substring(index + 1);
    version = version.substring(0, index);
  }

  return new Version(epoch, version, release);
}

export class Version {
  private static readonly alphanumPattern: RegExp = /([a-zA-Z]+)|([0-9]+)|(~)/g;

  constructor(
    public epoch: number,
    public version: string,
    public release: string,
  ) {}

  equal(other: Version): boolean {
    return this.compare(other) === 0;
  }

  greaterThan(other: Version): boolean {
    return this.compare(other) > 0;
  }

  lessThan(other: Version): boolean {
    return this.compare(other) < 0;
  }

  compare(other: Version): number {
    if (this.equals(other)) {
      return 0;
    }

    if (this.epoch > other.epoch) {
      return 1;
    } else if (this.epoch < other.epoch) {
      return -1;
    }

    let ret = Version.rpmvercmp(this.version, other.version);
    if (ret !== 0) {
      return ret;
    }

    return Version.rpmvercmp(this.release, other.release);
  }

  toString(): string {
    let version = this.epoch > 0 ? `${this.epoch}:` : "";
    version += this.version;

    if (this.release !== "") {
      version += `-${this.release}`;
    }

    return version;
  }

  private equals(other: Version): boolean {
    return (
      this.epoch === other.epoch &&
      this.version === other.version &&
      this.release === other.release
    );
  }

  public static rpmvercmp(a: string, b: string): number {
    if (a === b) {
      return 0;
    }

    const segsa = safeMatches(a, Version.alphanumPattern);
    const segsb = safeMatches(b, Version.alphanumPattern);
    const segs = Math.min(segsa.length, segsb.length);

    for (let i = 0; i < segs; i++) {
      let sega = segsa[i];
      let segb = segsb[i];

      if (sega[0] === "~" || segb[0] === "~") {
        if (sega[0] !== "~") {
          return 1;
        }
        if (segb[0] !== "~") {
          return -1;
        }
      }

      if (isNumber(sega[0])) {
        if (!isNumber(segb[0])) {
          return 1;
        }
        sega = trimLeft(sega, "0");
        segb = trimLeft(segb, "0");
        if (sega.length > segb.length) {
          return 1;
        } else if (sega.length < segb.length) {
          return -1;
        }
      } else if (isNumber(segb[0])) {
        return -1;
      }

      if (sega < segb) {
        return -1;
      } else if (sega > segb) {
        return 1;
      }
    }

    if (segsa.length === segsb.length) {
      return 0;
    }

    if (segsa.length > segs && segsa[segs][0] === "~") {
      return -1;
    } else if (segsb.length > segs && segsb[segs][0] === "~") {
      return 1;
    }

    if (segsa.length > segsb.length) {
      return 1;
    }
    return -1;
  }

  public static parse(ver: string): Version {
    let epoch = 0;
    let version = "";
    let release = "";

    // Parse epoch
    const [e, rest, count] = splitOnce(":", ver);
    if (rest === "" && count == 1) {
      version = e;
    } else {
      let epochStr = e.trimLeft();
      epoch = parseInt(epochStr) || 0;
      version = rest;
    }

    // Parse version and release
    const index = version.indexOf("-");
    if (index >= 0) {
      release = version.substring(index + 1);
      version = version.substring(0, index);
    }

    return new Version(epoch, version, release);
  }
}
