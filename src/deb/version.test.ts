import { describe, expect, test } from "vitest";
import { Version } from "./version";

describe("Version", () => {
  describe("compareString", () => {
    const cases: { lhs: string; rhs: string }[] = [
      { lhs: "~~", rhs: "~~a" },
      { lhs: "~~a", rhs: "~" },
      { lhs: "~", rhs: "" },
      { lhs: "", rhs: "a" },
      { lhs: "a", rhs: "." },
    ];

    cases.forEach((c) => {
      test(`Version.compareString(${c.lhs}, ${c.rhs})`, () => {
        expect(Version.compareString(c.lhs, c.rhs)).toBeLessThanOrEqual(0);
      });
    });
  });

  describe("order", () => {
    const cases: { lhs: string; rhs: number }[] = [
      { lhs: "A", rhs: 65 },
      { lhs: "~", rhs: -1 },
    ];

    cases.forEach((c) => {
      test(`Version.order(${c.lhs}) == ${c.rhs}`, () => {
        expect(Version.order(c.lhs)).toBe(c.rhs);
      });
    });
  });

  describe("extract", () => {
    test(`Version.extract works`, () => {
      expect(Version.extract("1.2.3")).toStrictEqual([
        [1, 2, 3],
        [".", "."],
      ]);
      expect(Version.extract("12.+34.~45")).toStrictEqual([
        [12, 34, 45],
        [".+", ".~"],
      ]);
      expect(Version.extract(".+-:~123.45")).toStrictEqual([
        [123, 45],
        [".+-:~", "."],
      ]);
    });
  });

  describe("compare", () => {
    test(`Version.compare works`, () => {
      expect(Version.compare("6.4.052", "7.4.052")).toBeLessThan(0);
      expect(Version.compare("6.4.052", "6.5.052")).toBeLessThan(0);
      expect(Version.compare("6.4.052", "6.4.053")).toBeLessThan(0);
      expect(Version.compare("1ubuntu1", "1ubuntu3.1")).toBeLessThan(0);
      expect(Version.compare("1", "1ubuntu1")).toBeLessThan(0);
      expect(Version.compare("7.4.027", "7.4.052")).toBeLessThan(0);
    });
  });

  describe("parse", () => {
    const cases: { version: string; expected: Version }[] = [
      { version: "1.2.3", expected: new Version(0, "1.2.3", "") },
      { version: "1:1.2.3", expected: new Version(1, "1.2.3", "") },
      {
        version: "6.0-4.el6.x86_64",
        expected: new Version(0, "6.0", "4.el6.x86_64"),
      },
      {
        version: "6.0-9ubuntu1.5",
        expected: new Version(0, "6.0", "9ubuntu1.5"),
      },
      {
        version: "2:7.4.052-1ubuntu3.1",
        expected: new Version(2, "7.4.052", "1ubuntu3.1"),
      },
    ];

    cases.forEach((c) => {
      test(`Version.parseVersion(${c.version}) == ${c.expected}`, () => {
        const actual = Version.parse(c.version);
        expect(actual).toStrictEqual(c.expected);
      });
    });
  });

  describe("equal", () => {
    const cases: { v1: Version; v2: Version; expected: boolean }[] = [
      makeCase(
        new Version(2, "7.4.052", "1ubuntu3"),
        new Version(2, "7.4.052", "1ubuntu3.1"),
        false,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu2"),
        new Version(2, "7.4.052", "1ubuntu3"),
        false,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu3"),
        new Version(2, "7.4.052", "1ubuntu3"),
        true,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu1"),
        new Version(2, "7.4.052", "1"),
        false,
      ),
      makeCase(
        new Version(0, "7.4.052", ""),
        new Version(0, "7.4.052", ""),
        true,
      ),
    ];

    cases.forEach((c) => {
      test(`Version.equal ${c.v1} == ${c.v2}`, () => {
        expect(c.v1.equal(c.v2)).toStrictEqual(c.expected);
      });
    });
  });

  describe("greaterThan", () => {
    const cases: { v1: Version; v2: Version; expected: boolean }[] = [
      makeCase(
        new Version(2, "7.4.052", "1ubuntu3"),
        new Version(2, "7.4.052", "1ubuntu3.1"),
        false,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu2"),
        new Version(2, "7.4.052", "1ubuntu3"),
        false,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu1"),
        new Version(2, "7.4.052", "1"),
        true,
      ),
      makeCase(
        new Version(0, "6.0", "9ubuntu1.4"),
        new Version(0, "6.0", "9ubuntu1.5"),
        false,
      ),
      makeCase(
        new Version(0, "7.4.052", ""),
        new Version(0, "7.4.052", "1ubuntu2"),
        false,
      ),
      makeCase(
        new Version(0, "7.4.052", ""),
        new Version(2, "7.4.052", ""),
        false,
      ),
    ];

    cases.forEach((c) => {
      test(`Version.equal ${c.v1} > ${c.v2} ? ${c.expected}`, () => {
        expect(c.v1.greaterThan(c.v2)).toStrictEqual(c.expected);
      });
    });
  });

  describe("lessThan", () => {
    const cases: { v1: Version; v2: Version; expected: boolean }[] = [
      makeCase(
        new Version(2, "7.4.052", "1ubuntu3"),
        new Version(2, "7.4.052", "1ubuntu3.1"),
        true,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu2"),
        new Version(2, "7.4.052", "1ubuntu3"),
        true,
      ),
      makeCase(
        new Version(2, "7.4.052", "1ubuntu1"),
        new Version(2, "7.4.052", "1"),
        false,
      ),
      makeCase(
        new Version(2, "6.0", "9ubuntu1.4"),
        new Version(2, "6.0", "9ubuntu1.5"),
        true,
      ),
      makeCase(
        new Version(0, "7.4.052", ""),
        new Version(0, "7.4.052", "1ubuntu2"),
        true,
      ),
      makeCase(
        new Version(0, "1.9.1", "2"),
        new Version(0, "1.16", "1+deb8u1"),
        true,
      ),
      makeCase(
        new Version(0, "1.9", "9ubuntu1.4"),
        new Version(0, "1.9.1", "1+deb8u1"),
        true,
      ),
      makeCase(
        new Version(0, "7.4.052", "9ubuntu1.4"),
        new Version(2, "7.4.052", ""),
        true,
      ),
      makeCase(new Version(0, "1", ""), new Version(0, "2", ""), true),
      makeCase(new Version(0, "1", ""), new Version(0, "1.1", ""), true),
      makeCase(new Version(0, "1.1", ""), new Version(0, "1.2", ""), true),
      makeCase(new Version(0, "1.11", ""), new Version(0, "1.12", ""), true),
    ];

    cases.forEach((c) => {
      test(`Version.equal ${c.v1} < ${c.v2} ? ${c.expected}`, () => {
        expect(c.v1.lessThan(c.v2)).toStrictEqual(c.expected);
        if (c.expected) {
          expect(c.v1.compare(c.v2)).toBeLessThan(0);
        }
      });
    });
  });

  describe("isValid", () => {
    const cases: { version: string; expected: boolean }[] = [
      { version: "1.2.3", expected: true },
      { version: "1:1.2.3", expected: true },
      { version: "A:1.2.3", expected: false },
      { version: "-1:1.2.3", expected: false },
      { version: "6.0-4.el6.x86_64", expected: true },
      { version: "6.0-9ubuntu1.5", expected: true },
      { version: "2:7.4.052-1ubuntu3.1", expected: true },
      { version: "2:-1ubuntu3.1", expected: false },
      { version: "2:A7.4.052-1ubuntu3.1", expected: false },
      { version: "2:7.4.!052-1ubuntu3.1", expected: false },
      { version: "7.4.052-!1ubuntu3.1", expected: false },
    ];

    cases.forEach((c) => {
      test(`isValid(${c.version}) == ${c.expected}`, () => {
        const actual = Version.isValid(c.version);
        expect(actual).toBe(c.expected);
      });
    });
  });

  describe("toString", () => {
    test("converts tostring", () => {
      expect(new Version(2, "7.4.052", "1ubuntu3").toString()).toBe(
        "2:7.4.052-1ubuntu3",
      );
      expect(new Version(2, "7.4.052", "1").toString()).toBe("2:7.4.052-1");
      expect(new Version(0, "7.4.052", "1").toString()).toBe("7.4.052-1");
      expect(new Version(1, "7.4.052", "").toString()).toBe("1:7.4.052");
      expect(new Version(0, "7.4.052", "").toString()).toBe("7.4.052");
    });
  });
});

describe("Version snapshot", () => {
  const cases: { v1: string; v2: string; expected: boolean }[] = [
    // RedHat
    { v1: "7.4.629-3", v2: "7.4.629-5", expected: true },
    { v1: "7.4.622-1", v2: "7.4.629-1", expected: true },
    { v1: "6.0-4.el6.x86_64", v2: "6.0-5.el6.x86_64", expected: true },
    { v1: "6.0-4.el6.x86_64", v2: "6.1-3.el6.x86_64", expected: true },
    { v1: "7.0-4.el6.x86_64", v2: "6.1-3.el6.x86_64", expected: false },
    // // Debian
    { v1: "2:7.4.052-1ubuntu3", v2: "2:7.4.052-1ubuntu3.1", expected: true },
    { v1: "2:7.4.052-1ubuntu2", v2: "2:7.4.052-1ubuntu3", expected: true },
    { v1: "2:7.4.052-1", v2: "2:7.4.052-1ubuntu3", expected: true },
    { v1: "2:7.4.052", v2: "2:7.4.052-1", expected: true },
    { v1: "1:7.4.052", v2: "2:7.4.052", expected: true },
    { v1: "1:7.4.052", v2: "7.4.052", expected: false },
    { v1: "2:7.4.052-1ubuntu3.2", v2: "2:7.4.052-1ubuntu3.1", expected: false },
  ];

  cases.forEach((c) => {
    test(`${c.v1} < ${c.v2} === ${c.expected}`, () => {
      const v1 = Version.parse(c.v1)!;
      const v2 = Version.parse(c.v2)!;
      expect(v1.lessThan(v2)).toBe(c.expected);
    });
  });
});

const makeCase = (v1: Version, v2: Version, expected: boolean) => {
  return { v1, v2, expected };
};
