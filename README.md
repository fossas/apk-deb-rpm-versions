## `apk-deb-rpm-versions`

Zero-dependency package to parse, compare, sort, and evalute constraint expression of `apk`, `deb`, and `rpm` versions. This,
package is inspired by (and uses test cases from)

- https://github.com/knqyf263/go-deb-version
- https://github.com/knqyf263/go-apk-version
- https://github.com/knqyf263/go-rpm-version

## Installing

```bash
npm install fossas/apk-dep-rpm-versions#master

# you can also pin the library to specific commit or tag
# refer to: https://docs.npmjs.com/cli/v8/commands/npm-install
```

## Example Usage

```ts
import { ApkVersion, DebVersion, RpmVersion, ExpressionBuilder } from 'apk-deb-rpm-versions';

console.log('rpm..', RpmVersion.parse('1.2.4').greaterThan(RpmVersion.parse('1.2.3')));
console.log('deb..', DebVersion.parse('1.2.4').greaterThan(DebVersion.parse('1.2.3')));
console.log('apk..', ApkVersion.parse('1.2.4').greaterThan(ApkVersion.parse('1.2.3')));

let vulnAffected = new ExpressionBuilder().where(
    ExpressionBuilder.OR( 
        ExpressionBuilder.AND( // (>1.2.4 && < 1.2.10)
            ExpressionBuilder.GT(RpmVersion.parse('1.2.4')),
            ExpressionBuilder.LT(RpmVersion.parse('1.2.10')),
        ),
        ExpressionBuilder.AND( // (>2.1.4 && <2.2.20)
            ExpressionBuilder.GT(RpmVersion.parse('2.1.4-r0')),
            ExpressionBuilder.LT(RpmVersion.parse('2.2.20-r11')),
        )
    ),
);

console.log('is 2.1.5 safe?', vulnAffected.evalInverse(RpmVersion.parse('2.1.5')));  // false; affected
console.log('is 2.2.21 safe?', vulnAffected.evalInverse(RpmVersion.parse('2.2.21'))); // true; not affected

const versions = [
    // 1.x
    RpmVersion.parse('1.2.5'),
    RpmVersion.parse('1.2.11'), // safe
    // 2.x
    RpmVersion.parse('2.1.7'), 
    RpmVersion.parse('2.1.5'),
    RpmVersion.parse('2.1.6'),
    RpmVersion.parse('2.2.23'), // safe
    RpmVersion.parse('2.2.20-r10'),
    RpmVersion.parse('2.2.20-r12'), // safe
]

const safeVersions = versions.filter(v => vulnAffected.evalInverse(v));
console.log('safeVersions', safeVersions); // [1.2.11, 2.2.23, 2.2.20-r12]

const safeVersionSorted = ExpressionBuilder.sort(safeVersions);
console.log('maxSafeVersion', safeVersionSorted); // [1.2.11, 2.2.20-r12, 2.2.22]
```

## Contribution

```bash
npm i          # install dependencies (we need vitest as dev dependency)
npm run build  # build
npm run test   # run unit tests
```

You should run `npm run build`, and include `dist` in your commits, and merge.
