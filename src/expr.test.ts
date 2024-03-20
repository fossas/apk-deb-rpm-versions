import { describe, test, expect } from "vitest";
import { ExpressionBuilder as EB } from "./expr";

class SomeVersion {
  value: number = 0;

  constructor(val: number) {
    this.value = val;
  }

  lessThan(o: SomeVersion) {
    return this.value < o.value;
  }
  greaterThan(o: SomeVersion) {
    return this.value > o.value;
  }
  equals(o: SomeVersion) {
    return this.value === o.value;
  }
}

const ver = (n: number) => new SomeVersion(n);

describe("expression", () => {
  test("lt", () => {
    let builder = new EB().where(EB.LT(ver(5)));
    const res = [ver(4), ver(5)].filter((v) => builder.eval(v));
    expect(res).toStrictEqual([ver(4)]);
  });

  test("gt", () => {
    let builder = new EB().where(EB.GT(ver(4)));
    const res = [ver(4), ver(5)].filter((v) => builder.eval(v));
    expect(res).toStrictEqual([ver(5)]);
  });

  test("eq", () => {
    let builder = new EB().where(EB.EQ(ver(5)));
    const res = [ver(4), ver(5)].filter((v) => builder.eval(v));
    expect(res).toStrictEqual([ver(5)]);
  });

  test("and", () => {
    let builder = new EB().where(EB.AND(EB.LT(ver(10)), EB.GT(ver(5))));
    const res = [ver(4), ver(6), ver(11)].filter((v) => builder.eval(v));
    expect(res).toStrictEqual([ver(6)]);
  });

  test("dump", () => {
    expect(new EB().dump()).toStrictEqual({
      op: "and",
      lhs: { op: "true" },
      rhs: { op: "true" },
    });
  });

  test("dump", () => {
    expect(new EB().dump()).toStrictEqual({
      op: "and",
      lhs: { op: "true" },
      rhs: { op: "true" },
    });
  });

  test("multiple ", () => {
    let builder = new EB()
      .where(EB.AND(EB.LT(ver(10)), EB.GT(ver(5))))
      .where(EB.LT(ver(4)));

    const res = [ver(4), ver(6), ver(11)].filter((v) => builder.eval(v));
    expect(res).toStrictEqual([]);
  });

  test("evalInverse eq", () => {
    let builder = new EB().where(EB.EQ(ver(10)));
    const res = [ver(4), ver(10), ver(11)].filter((v) =>
      builder.evalInverse(v),
    );
    expect(res).toStrictEqual([ver(4), ver(11)]);
  });

  test("evalInverse", () => {
    let builder = new EB().where(EB.LT(ver(10)));
    const res = [ver(4), ver(6), ver(11)].filter((v) => builder.evalInverse(v));
    expect(res).toStrictEqual([ver(11)]);
  });

  test("evalInverse multiple", () => {
    let builder = new EB().where(
      EB.OR(
        EB.AND(
          // >5 && <10
          EB.LT(ver(10)),
          EB.GT(ver(5)),
        ),
        EB.AND(
          // >12 && <25
          EB.LT(ver(25)),
          EB.GT(ver(12)),
        ),
      ),
    );

    const res = [ver(4), ver(6), ver(11), ver(13), ver(26)].filter((v) =>
      builder.evalInverse(v),
    );
    expect(res).toStrictEqual([ver(4), ver(11), ver(26)]);
  });

  test("evalInverse multiple with whereOr", () => {
    let builder = new EB()
      .where(
        EB.AND(
          // >5 && <10
          EB.LT(ver(10)),
          EB.GT(ver(5)),
        ),
      )
      .whereOr(
        EB.AND(
          // >12 && <25
          EB.LT(ver(25)),
          EB.GT(ver(12)),
        ),
      );

    const res = [ver(4), ver(6), ver(11), ver(13), ver(26)].filter((v) =>
      builder.evalInverse(v),
    );
    expect(res).toStrictEqual([ver(4), ver(11), ver(26)]);
  });

  test("sort", () => {
    const vals = [ver(4), ver(4), ver(5)];
    expect(EB.sort(vals)).toStrictEqual(vals);
    expect(EB.sort(vals.reverse(), "asc")).toStrictEqual(vals);
    expect(EB.sort(vals, "dsc")).toStrictEqual(vals.reverse());
  });

  test("INVERSE", () => {
    expect(() => EB.INVERSE({ op: "new" })).toThrowError(
      /unexpected operation type/,
    );
  });
});
