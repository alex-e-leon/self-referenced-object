# self-referenced-object [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

Build and resolve objects with self-referencing properties.

I've found this especially useful when defining some kinds of config files in JS.
Specifically you may sometimes want to define properties that either reference or are calculated from other properties in the same config file.
Normally doing so would require adding calculated or self-referencing properties as extra statements after the initial object definition.
This package allows you to define all your properties in a single statement in any order.

## Usage

self-referenced-object behaves just like regular template literal expressions,
except that inside `${}` expressions it allows the use of `this.[key]` to reference other properties inside the same object,
and uses regular strings (`'` or `"`) instead of template strings (`\``).

```js
$ npm install self-referenced-object 

const sro = require('self-referenced-object');

// basic usage
sro({
  a: 'a',
  b: '${this.a}',
});

// calculated values
sro({
  a: 'a',
  b: '${this.a + this.a}',
});

// non-primative types
sro({
  a: [1, 2, 3],
  b: '${(this.a).concat([4])},
});

// nested values
sro({
  a: {
    a: 'a',
  },
  b: '${this.a.a}',
});
```

## Circular references and undefined references

self-referenced-object will throw errors if circular references or undefined references are found.
It uses a backtracking DFS to track circular references.

## Non-string values

The other way in which self-referenced-object differs from regular template strings is it's support for returning non-string values. In order to support self-references that might be numbers, arrays, objects etc. self-referenced-object will avoid casting the value to a string if the template is only a single `${}` expression. Ie in `{ a: [1,2,3], b: "${this.a}" }` b would be an Array, while in `{ a: [1,2,3], b: "${this.a} go" }`, b would be the string `"1,2,3 go"`

## Escape characters

If you need to use `}` inside your template literal expressions, they can be escaped by adding a `\` in front of them just like in regular template literals.

## Security

self-referenced-object evaluates any expressions inside template literals by calling `Function('"use strict"; return \`' + expression + "\`;")()` which is a marginally safer version of `eval` (ie still incredibly unsafe), so don't pass in any untrusted data into template literal expressions.

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/alex-e-leon/self-referenced-object.svg

[build-status]: https://travis-ci.org/alex-e-leon/self-referenced-object

[coverage-badge]: https://img.shields.io/codecov/c/github/alex-e-leon/self-referenced-object.svg

[coverage-status]: https://codecov.io/github/alex-e-leon/self-referenced-object
