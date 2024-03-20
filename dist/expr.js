"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionBuilder = void 0;
class ExpressionBuilder {
    constructor() {
        this.root = {
            op: 'and',
            lhs: { op: 'true' },
            rhs: { op: 'true' }
        };
    }
    where(predicate) {
        this.root = {
            'op': 'and',
            lhs: predicate,
            rhs: this.root,
        };
        return this;
    }
    whereOr(predicate) {
        this.root = {
            'op': 'or',
            lhs: predicate,
            rhs: this.root,
        };
        return this;
    }
    dump() {
        return this.root;
    }
    eval(against) {
        return ExpressionBuilder.perform(this.root, against);
    }
    evalInverse(against) {
        const inveseExpression = ExpressionBuilder.INVERSE(this.root);
        return ExpressionBuilder.perform(inveseExpression, against);
    }
    static LT(value) {
        return { op: 'lt', value };
    }
    static GT(value) {
        return { op: 'gt', value };
    }
    static EQ(value) {
        return { op: 'eq', value };
    }
    static AND(lhs, rhs) {
        return { op: 'and', lhs, rhs };
    }
    static OR(lhs, rhs) {
        return { op: 'or', lhs, rhs };
    }
    static INVERSE(exp) {
        switch (exp.op) {
            case 'lt': return this.OR(this.GT(exp.value), this.EQ(exp.value));
            case 'gt': return this.OR(this.LT(exp.value), this.EQ(exp.value));
            case 'eq': return this.OR(this.GT(exp.value), this.LT(exp.value));
            case 'and': return this.OR(this.INVERSE(exp.lhs), this.INVERSE(exp.rhs));
            case 'or': return this.AND(this.INVERSE(exp.lhs), this.INVERSE(exp.rhs));
            case 'true': return { op: 'false' };
        }
        throw new Error(`unexpected operation type: ${exp}`);
    }
    static perform(target, against) {
        switch (target.op) {
            case 'gt': return target.value.lessThan(against);
            case 'lt': return target.value.greaterThan(against);
            case 'eq': return target.value.equals(against);
            case 'and': return this.perform(target.lhs, against) && this.perform(target.rhs, against);
            case 'or': return this.perform(target.lhs, against) || this.perform(target.rhs, against);
            case 'true': return true;
            case 'false': return false;
        }
    }
    static sort(target, kind = 'asc') {
        function compare(a, b) {
            if (a.lessThan(b))
                return -1;
            if (a.greaterThan(b))
                return 1;
            return 0;
        }
        let direction = kind === 'asc' ? 1 : -1;
        return target.sort((a, b) => direction * compare(a, b));
    }
}
exports.ExpressionBuilder = ExpressionBuilder;
