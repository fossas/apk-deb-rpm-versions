export type Expression<Version> =
  | { op: "true" }
  | { op: "false" }
  | { op: "lt"; value: Version }
  | { op: "gt"; value: Version }
  | { op: "eq"; value: Version }
  | { op: "and"; lhs: Expression<Version>; rhs: Expression<Version> }
  | { op: "or"; lhs: Expression<Version>; rhs: Expression<Version> };

export interface ComparableVersion<T> {
  lessThan(other: ComparableVersion<T>): boolean;
  greaterThan(other: ComparableVersion<T>): boolean;
  equals(other: ComparableVersion<T>): boolean;
}

export class ExpressionBuilder<T> {
  root: Expression<ComparableVersion<T>> = {
    op: "and",
    lhs: { op: "true" },
    rhs: { op: "true" },
  };

  where(predicate: Expression<ComparableVersion<T>>) {
    this.root = {
      op: "and",
      lhs: predicate,
      rhs: this.root,
    };
    return this;
  }

  whereOr(predicate: Expression<ComparableVersion<T>>) {
    this.root = {
      op: "or",
      lhs: predicate,
      rhs: this.root,
    };
    return this;
  }

  dump() {
    return this.root;
  }

  eval<V>(against: ComparableVersion<V>): boolean {
    return ExpressionBuilder.perform(this.root, against);
  }

  evalInverse<V>(against: ComparableVersion<V>): boolean {
    const inveseExpression = ExpressionBuilder.INVERSE(this.root);
    return ExpressionBuilder.perform(inveseExpression, against);
  }

  static LT<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>> {
    return { op: "lt", value };
  }

  static GT<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>> {
    return { op: "gt", value };
  }

  static EQ<V>(value: ComparableVersion<V>): Expression<ComparableVersion<V>> {
    return { op: "eq", value };
  }

  static AND<V>(
    lhs: Expression<ComparableVersion<V>>,
    rhs: Expression<ComparableVersion<V>>,
  ): Expression<ComparableVersion<V>> {
    return { op: "and", lhs, rhs };
  }

  static OR<V>(
    lhs: Expression<ComparableVersion<V>>,
    rhs: Expression<ComparableVersion<V>>,
  ): Expression<ComparableVersion<V>> {
    return { op: "or", lhs, rhs };
  }

  static INVERSE<V>(
    exp: Expression<ComparableVersion<V>>,
  ): Expression<ComparableVersion<V>> {
    switch (exp.op) {
      case "lt":
        return this.OR(this.GT(exp.value), this.EQ(exp.value));
      case "gt":
        return this.OR(this.LT(exp.value), this.EQ(exp.value));
      case "eq":
        return this.OR(this.GT(exp.value), this.LT(exp.value));
      case "and":
        return this.OR(this.INVERSE(exp.lhs), this.INVERSE(exp.rhs));
      case "or":
        return this.AND(this.INVERSE(exp.lhs), this.INVERSE(exp.rhs));
      case "true":
        return { op: "false" };
    }
    throw new Error(`unexpected operation type: ${exp}`);
  }

  static perform<V>(
    target: Expression<ComparableVersion<V>>,
    against: ComparableVersion<V>,
  ): boolean {
    switch (target.op) {
      case "gt":
        return target.value.lessThan(against);
      case "lt":
        return target.value.greaterThan(against);
      case "eq":
        return target.value.equals(against);
      case "and":
        return (
          this.perform(target.lhs, against) && this.perform(target.rhs, against)
        );
      case "or":
        return (
          this.perform(target.lhs, against) || this.perform(target.rhs, against)
        );
      case "true":
        return true;
      case "false":
        return false;
    }
  }

  static sort<V>(
    target: ComparableVersion<V>[],
    kind: "asc" | "dsc" = "asc",
  ): ComparableVersion<V>[] {
    function compare(a: ComparableVersion<V>, b: ComparableVersion<V>) {
      if (a.lessThan(b)) return -1;
      if (a.greaterThan(b)) return 1;
      return 0;
    }

    let direction = kind === "asc" ? 1 : -1;
    return target.sort((a, b) => direction * compare(a, b));
  }
}
