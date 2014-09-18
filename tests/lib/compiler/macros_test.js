/* global it, before, beforeEach, assert:true, describe, requireApp */
'use strict';
var compile, assert;

if (typeof navigator !== 'undefined') {
  requireApp('sharedtest/test/unit/l10n/lib/compiler/header.js');
} else {
  compile = require('./header.js').compile;
  assert = require('./header.js').assert;
}

describe('Macros', function(){
  var source, args, ctx;
  beforeEach(function() {
    ctx = compile(source);
  });

  describe('referencing macros', function(){

    before(function() {
      args = {
        n: 1
      };
      source = [
        'placeMacro={{ plural }}',
        'placeRealMacro={{ __plural }}'
      ].join('\n');
    });

    it('throws when resolving (not calling) a macro in a complex ' +
       'string', function() {
      assert.strictEqual(ctx.cache.placeMacro.format(ctx, args), '{{ plural }}');
      assert.strictEqual(ctx.cache.placeRealMacro.format(ctx, args),
                         '{{ __plural }}');
    });

  });

  describe('passing arguments', function(){

    before(function() {
      args = {
        n: 1
      };
      source = [
        'foo=Foo',
        'useFoo={{ foo }}',
        'bar={[ plural(n) ]}',
        'bar[one]=One',
        'bar.attr=Attr',

        'passFoo={[ plural(foo) ]}',
        'passFoo[one]=One',

        'passUseFoo={[ plural(useFoo) ]}',
        'passUseFoo[one]=One',

        'passBar={[ plural(bar) ]}',
        'passBar[one]=One',

        'passPlural={[ plural(plural) ]}',
        'passPlural[one]=One',

        'passMissing={[ plural(missing) ]}',
        'passMissing[one]=One',

        'passWatch={[ plural(watch) ]}',
        'passWatch[one]=One',
      ].join('\n');
    });

    it('throws if an entity is passed', function() {
      var value = ctx.cache.passFoo.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

    it('throws if a complex entity is passed', function() {
      var value = ctx.cache.passUseFoo.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

    it('throws if a hash entity is passed', function() {
      var value = ctx.cache.passBar.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

    it('throws if a macro is passed', function() {
      var value = ctx.cache.passPlural.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

    it('throws if a missing entry is passed', function() {
      var value = ctx.cache.passMissing.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

    it('throws if a native function is passed', function() {
      var value = ctx.cache.passWatch.format(ctx, args);
      assert.strictEqual(value, undefined);
    });

  });
});

describe('A simple plural macro', function(){
  var source, ctx;

  beforeEach(function() {
    ctx = compile(source);
    ctx.macros.plural = function(n) {
      // a made-up plural rule:
      // [0, 1) -> other
      // [1, Inf) -> many
      return (n >= 0 && n < 1) ? 'other' : 'many';
    };
  });

  describe('an entity with all plural forms defined', function(){

    before(function() {
      source = [
        'foo={[ plural(n) ]}',
        'foo[zero]=Zero',
        'foo[one]=One',
        'foo[two]=Two',
        'foo[few]=Few',
        'foo[many]=Many',
        'foo[other]=Other'
      ].join('\n');
    });

    it('returns zero for 0', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0});
      assert.strictEqual(value, 'Zero');
    });

    it('returns one for 1', function() {
      var value = ctx.cache.foo.format(ctx, {n: 1});
      assert.strictEqual(value, 'One');
    });

    it('returns two for 2', function() {
      var value = ctx.cache.foo.format(ctx, {n: 2});
      assert.strictEqual(value, 'Two');
    });

    it('returns many for 3', function() {
      var value = ctx.cache.foo.format(ctx, {n: 3});
      assert.strictEqual(value, 'Many');
    });

    it('returns many for 5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 5});
      assert.strictEqual(value, 'Many');
    });

    it('returns other for 0.5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0.5});
      assert.strictEqual(value, 'Other');
    });

  });

  describe('an entity without the zero, one and two forms', function(){

    before(function() {
      source = [
        'foo={[ plural(n) ]}',
        'foo[many]=Many',
        'foo[other]=Other'
      ].join('\n');
    });

    it('returns other for 0', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0});
      assert.strictEqual(value, 'Other');
    });

    it('returns many for 1', function() {
      var value = ctx.cache.foo.format(ctx, {n: 1});
      assert.strictEqual(value, 'Many');
    });

    it('returns many for 2', function() {
      var value = ctx.cache.foo.format(ctx, {n: 2});
      assert.strictEqual(value, 'Many');
    });

    it('returns many for 3', function() {
      var value = ctx.cache.foo.format(ctx, {n: 3});
      assert.strictEqual(value, 'Many');
    });

    it('returns many for 5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 5});
      assert.strictEqual(value, 'Many');
    });

    it('returns other for 0.5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0.5});
      assert.strictEqual(value, 'Other');
    });

  });

  describe('an entity without the many form', function(){

    before(function() {
      source = [
        'foo={[ plural(n) ]}',
        'foo[other]=Other'
      ].join('\n');
    });

    it('returns other for 0', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0});
      assert.strictEqual(value, 'Other');
    });

    it('returns other for 1', function() {
      var value = ctx.cache.foo.format(ctx, {n: 1});
      assert.strictEqual(value, 'Other');
    });

    it('returns other for 2', function() {
      var value = ctx.cache.foo.format(ctx, {n: 2});
      assert.strictEqual(value, 'Other');
    });

    it('returns other for 3', function() {
      var value = ctx.cache.foo.format(ctx, {n: 3});
      assert.strictEqual(value, 'Other');
    });

    it('returns other for 5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 5});
      assert.strictEqual(value, 'Other');
    });

    it('returns other for 0.5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0.5});
      assert.strictEqual(value, 'Other');
    });

  });

  describe('an entity without the other form, but with the one ' +
           'form', function(){

    before(function() {
      source = [
        'foo={[ plural(n) ]}',
        'foo[one]=One'
      ].join('\n');
    });

    it('returns other for 0', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0});
      assert.strictEqual(value, undefined);
    });

    it('returns one for 1', function() {
      var value = ctx.cache.foo.format(ctx, {n: 1});
      assert.strictEqual(value, 'One');
    });

    it('returns other for 2', function() {
      var value = ctx.cache.foo.format(ctx, {n: 2});
      assert.strictEqual(value, undefined);
    });

    it('returns other for 3', function() {
      var value = ctx.cache.foo.format(ctx, {n: 3});
      assert.strictEqual(value, undefined);
    });

    it('returns other for 5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 5});
      assert.strictEqual(value, undefined);
    });

    it('returns other for 0.5', function() {
      var value = ctx.cache.foo.format(ctx, {n: 0.5});
      assert.strictEqual(value, undefined);
    });

  });

});
