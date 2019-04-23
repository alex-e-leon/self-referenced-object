import test from 'ava';
import sro from '../index.js';

test('simple objects', t => {
  t.deepEqual(sro({
    a: 'a',
    b: 'b',
  }), {
    a: 'a',
    b: 'b',
  });
});

test('simple reference', t => {
  t.deepEqual(sro({
    a: 'a',
    b: '${this.a}',
  }), {
    a: 'a',
    b: 'a',
  });
});

test('concat reference', t => {
  t.deepEqual(sro({
    a: 'a',
    b: '${this.a} + ${this.a}',
  }), {
    a: 'a',
    b: 'a + a',
  });
});

test('double reference', t => {
  t.deepEqual(sro({
    a: 'a',
    b: '${this.a}',
    c: '${this.b}',
  }), {
    a: 'a',
    b: 'a',
    c: 'a',
  });
});

test('backwards references', t => {
  t.deepEqual(sro({
    a: '${this.b}',
    b: '${this.c}',
    c: 'c',
  }), {
    a: 'c',
    b: 'c',
    c: 'c',
  });
});

test('array values', t => {
  t.deepEqual(sro({
    a: [1, 2, 3],
    b: '${(this.a).concat([4])}',
  }), {
    a: [1, 2, 3],
    b: [1, 2, 3, 4],
  });
});

test('object values', t => {
  t.deepEqual(sro({
    a: { a: 'a' },
    b: '${Object.assign(this.a, { b: "b"})}',
  }), {
    a: { a: 'a' },
    b: { a: 'a', b: 'b' },
  });
});


test('expressions and calculated values', t => {
  t.deepEqual(sro({
    a: '${this.b + this.c}',
    b: 'b',
    c: 'c',
  }), {
    a: 'bc',
    b: 'b',
    c: 'c',
  });
});

test('deep references', t => {
  t.deepEqual(sro({
    a: {
      a: 'a',
    },
    b: '${this.a.a}',
  }), {
    a: {
      a: 'a',
    },
    b: 'a',
  });
});

test('multiple sro\'s', t => {
  const sro1 = sro({
    a: '${this.b}',
    b: 'b',
  });
  const sro2 = sro({
    a: '${this.b}',
    b: 'b1',
  });

  t.deepEqual(sro1, {
    a: 'b',
    b: 'b',
  });
  t.deepEqual(sro2, {
    a: 'b1',
    b: 'b1',
  });
});

test('complex graph', t => {
  t.deepEqual(sro({
    a: '${this.d}',
    b: '${this.f}',
    c: 'c',
    d: '${this.b}',
    e: '${this.i}',
    f: '${this.c}',
    g: 'g',
    h: '${this.g}',
    i: '${this.j}',
    j: '${this.h}',
    k: '${this.b}',
  }), {
    a: 'c',
    b: 'c',
    c: 'c',
    d: 'c',
    e: 'g',
    f: 'c',
    g: 'g',
    h: 'g',
    i: 'g',
    j: 'g',
    k: 'c',
  });
});

test('undefined references', t => {
  try {
    sro({
      a: '${this.c.a}',
    });
  } catch(e) {
    t.is(e, 'Cannot find self refrencing property c.a in object');
  }
});

test('circular references', t => {
  try {
    sro({
      a: '${this.c}',
      b: '${this.a}',
      c: '${this.b}',
    });
  } catch(e) {
    t.is(e, 'Circular dependency found in self referencing object: ["c","b","a"]');
  }
});
