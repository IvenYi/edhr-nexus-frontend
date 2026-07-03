!(function (t, e) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define([], e)
    : 'object' == typeof exports
    ? (exports.LarkSSOSDKWebQRCode = e())
    : (t.LarkSSOSDKWebQRCode = e());
})(this, function () {
  return (function (t) {
    var e = {};
    function r(n) {
      if (e[n]) return e[n].exports;
      var o = (e[n] = { i: n, l: !1, exports: {} });
      return t[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
    }
    return (
      (r.m = t),
      (r.c = e),
      (r.d = function (t, e, n) {
        r.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: n });
      }),
      (r.r = function (t) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      }),
      (r.t = function (t, e) {
        if ((1 & e && (t = r(t)), 8 & e)) return t;
        if (4 & e && 'object' == typeof t && t && t.__esModule) return t;
        var n = Object.create(null);
        if (
          (r.r(n),
          Object.defineProperty(n, 'default', { enumerable: !0, value: t }),
          2 & e && 'string' != typeof t)
        )
          for (var o in t)
            r.d(
              n,
              o,
              function (e) {
                return t[e];
              }.bind(null, o),
            );
        return n;
      }),
      (r.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default;
              }
            : function () {
                return t;
              };
        return r.d(e, 'a', e), e;
      }),
      (r.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }),
      (r.p = ''),
      r((r.s = 73))
    );
  })([
    function (t, e, r) {
      var n = r(46),
        o = n.all;
      t.exports = n.IS_HTMLDDA
        ? function (t) {
            return 'function' == typeof t || t === o;
          }
        : function (t) {
            return 'function' == typeof t;
          };
    },
    function (t, e, r) {
      var n = r(18),
        o = Function.prototype,
        i = o.call,
        a = n && o.bind.bind(i, i);
      t.exports = n
        ? a
        : function (t) {
            return function () {
              return i.apply(t, arguments);
            };
          };
    },
    function (t, e) {
      t.exports = function (t) {
        try {
          return !!t();
        } catch (e) {
          return !0;
        }
      };
    },
    function (t, e, r) {
      var n = r(2);
      t.exports = !n(function () {
        return (
          7 !=
          Object.defineProperty({}, 1, {
            get: function () {
              return 7;
            },
          })[1]
        );
      });
    },
    function (t, e, r) {
      (function (e) {
        var r = function (t) {
          return t && t.Math == Math && t;
        };
        t.exports =
          r('object' == typeof globalThis && globalThis) ||
          r('object' == typeof window && window) ||
          r('object' == typeof self && self) ||
          r('object' == typeof e && e) ||
          (function () {
            return this;
          })() ||
          Function('return this')();
      }).call(this, r(80));
    },
    function (t, e, r) {
      var n = r(4),
        o = r(42),
        i = r(6),
        a = r(43),
        u = r(44),
        s = r(45),
        c = n.Symbol,
        f = o('wks'),
        l = s ? c.for || c : (c && c.withoutSetter) || a;
      t.exports = function (t) {
        return i(f, t) || (f[t] = u && i(c, t) ? c[t] : l('Symbol.' + t)), f[t];
      };
    },
    function (t, e, r) {
      var n = r(1),
        o = r(20),
        i = n({}.hasOwnProperty);
      t.exports =
        Object.hasOwn ||
        function (t, e) {
          return i(o(t), e);
        };
    },
    function (t, e, r) {
      var n = r(18),
        o = Function.prototype.call;
      t.exports = n
        ? o.bind(o)
        : function () {
            return o.apply(o, arguments);
          };
    },
    function (t, e, r) {
      var n = r(9),
        o = String,
        i = TypeError;
      t.exports = function (t) {
        if (n(t)) return t;
        throw i(o(t) + ' is not an object');
      };
    },
    function (t, e, r) {
      var n = r(0),
        o = r(46),
        i = o.all;
      t.exports = o.IS_HTMLDDA
        ? function (t) {
            return 'object' == typeof t ? null !== t : n(t) || t === i;
          }
        : function (t) {
            return 'object' == typeof t ? null !== t : n(t);
          };
    },
    function (t, e, r) {
      var n = r(3),
        o = r(47),
        i = r(49),
        a = r(8),
        u = r(31),
        s = TypeError,
        c = Object.defineProperty,
        f = Object.getOwnPropertyDescriptor;
      e.f = n
        ? i
          ? function (t, e, r) {
              if (
                (a(t),
                (e = u(e)),
                a(r),
                'function' == typeof t &&
                  'prototype' === e &&
                  'value' in r &&
                  'writable' in r &&
                  !r.writable)
              ) {
                var n = f(t, e);
                n &&
                  n.writable &&
                  ((t[e] = r.value),
                  (r = {
                    configurable: 'configurable' in r ? r.configurable : n.configurable,
                    enumerable: 'enumerable' in r ? r.enumerable : n.enumerable,
                    writable: !1,
                  }));
              }
              return c(t, e, r);
            }
          : c
        : function (t, e, r) {
            if ((a(t), (e = u(e)), a(r), o))
              try {
                return c(t, e, r);
              } catch (n) {}
            if ('get' in r || 'set' in r) throw s('Accessors not supported');
            return 'value' in r && (t[e] = r.value), t;
          };
    },
    function (t, e, r) {
      var n = r(26),
        o = r(0),
        i = r(30),
        a = r(5)('toStringTag'),
        u = Object,
        s =
          'Arguments' ==
          i(
            (function () {
              return arguments;
            })(),
          );
      t.exports = n
        ? i
        : function (t) {
            var e, r, n;
            return void 0 === t
              ? 'Undefined'
              : null === t
              ? 'Null'
              : 'string' ==
                typeof (r = (function (t, e) {
                  try {
                    return t[e];
                  } catch (r) {}
                })((e = u(t)), a))
              ? r
              : s
              ? i(e)
              : 'Object' == (n = i(e)) && o(e.callee)
              ? 'Arguments'
              : n;
          };
    },
    function (t, e) {
      t.exports = !0;
    },
    function (t, e, r) {
      var n = r(3),
        o = r(10),
        i = r(14);
      t.exports = n
        ? function (t, e, r) {
            return o.f(t, e, i(1, r));
          }
        : function (t, e, r) {
            return (t[e] = r), t;
          };
    },
    function (t, e) {
      t.exports = function (t, e) {
        return { enumerable: !(1 & t), configurable: !(2 & t), writable: !(4 & t), value: e };
      };
    },
    function (t, e, r) {
      var n = r(56),
        o = r(28);
      t.exports = function (t) {
        return n(o(t));
      };
    },
    function (t, e, r) {
      var n = r(13);
      t.exports = function (t, e, r, o) {
        return o && o.enumerable ? (t[e] = r) : n(t, e, r), t;
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e, r) {
      var n = r(2);
      t.exports = !n(function () {
        var t = function () {}.bind();
        return 'function' != typeof t || t.hasOwnProperty('prototype');
      });
    },
    function (t, e, r) {
      var n = r(11),
        o = String;
      t.exports = function (t) {
        if ('Symbol' === n(t)) throw TypeError('Cannot convert a Symbol value to a string');
        return o(t);
      };
    },
    function (t, e, r) {
      var n = r(28),
        o = Object;
      t.exports = function (t) {
        return o(n(t));
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        a = r(84),
        u = r(4),
        s = r(9),
        c = r(13),
        f = r(6),
        l = r(27),
        h = r(35),
        p = r(36),
        v = u.TypeError,
        g = u.WeakMap;
      if (a || l.state) {
        var d = l.state || (l.state = new g());
        (d.get = d.get),
          (d.has = d.has),
          (d.set = d.set),
          (n = function (t, e) {
            if (d.has(t)) throw v('Object already initialized');
            return (e.facade = t), d.set(t, e), e;
          }),
          (o = function (t) {
            return d.get(t) || {};
          }),
          (i = function (t) {
            return d.has(t);
          });
      } else {
        var y = h('state');
        (p[y] = !0),
          (n = function (t, e) {
            if (f(t, y)) throw v('Object already initialized');
            return (e.facade = t), c(t, y, e), e;
          }),
          (o = function (t) {
            return f(t, y) ? t[y] : {};
          }),
          (i = function (t) {
            return f(t, y);
          });
      }
      t.exports = {
        set: n,
        get: o,
        has: i,
        enforce: function (t) {
          return i(t) ? o(t) : n(t, {});
        },
        getterFor: function (t) {
          return function (e) {
            var r;
            if (!s(e) || (r = o(e)).type !== t)
              throw v('Incompatible receiver, ' + t + ' required');
            return r;
          };
        },
      };
    },
    function (t, e, r) {
      var n = r(0),
        o = r(52),
        i = TypeError;
      t.exports = function (t) {
        if (n(t)) return t;
        throw i(o(t) + ' is not a function');
      };
    },
    function (t, e, r) {
      var n = r(54),
        o = r(22),
        i = r(18),
        a = n(n.bind);
      t.exports = function (t, e) {
        return (
          o(t),
          void 0 === e
            ? t
            : i
            ? a(t, e)
            : function () {
                return t.apply(e, arguments);
              }
        );
      };
    },
    function (t, e, r) {
      var n = r(26),
        o = r(10).f,
        i = r(13),
        a = r(6),
        u = r(97),
        s = r(5)('toStringTag');
      t.exports = function (t, e, r, c) {
        if (t) {
          var f = r ? t : t.prototype;
          a(f, s) || o(f, s, { configurable: !0, value: e }), c && !n && i(f, 'toString', u);
        }
      };
    },
    function (t, e, r) {
      var n = r(79);
      t.exports = function (t) {
        var e = +t;
        return e != e || 0 === e ? 0 : n(e);
      };
    },
    function (t, e, r) {
      var n = {};
      (n[r(5)('toStringTag')] = 'z'), (t.exports = '[object z]' === String(n));
    },
    function (t, e, r) {
      var n = r(4),
        o = r(81),
        i = n['__core-js_shared__'] || o('__core-js_shared__', {});
      t.exports = i;
    },
    function (t, e, r) {
      var n = r(29),
        o = TypeError;
      t.exports = function (t) {
        if (n(t)) throw o("Can't call method on " + t);
        return t;
      };
    },
    function (t, e) {
      t.exports = function (t) {
        return null == t;
      };
    },
    function (t, e, r) {
      var n = r(1),
        o = n({}.toString),
        i = n(''.slice);
      t.exports = function (t) {
        return i(o(t), 8, -1);
      };
    },
    function (t, e, r) {
      var n = r(85),
        o = r(50);
      t.exports = function (t) {
        var e = n(t, 'string');
        return o(e) ? e : e + '';
      };
    },
    function (t, e, r) {
      var n = r(33),
        o = r(4),
        i = r(0),
        a = function (t) {
          return i(t) ? t : void 0;
        };
      t.exports = function (t, e) {
        return arguments.length < 2 ? a(n[t]) || a(o[t]) : (n[t] && n[t][e]) || (o[t] && o[t][e]);
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e, r) {
      var n = r(22),
        o = r(29);
      t.exports = function (t, e) {
        var r = t[e];
        return o(r) ? void 0 : n(r);
      };
    },
    function (t, e, r) {
      var n = r(42),
        o = r(43),
        i = n('keys');
      t.exports = function (t) {
        return i[t] || (i[t] = o(t));
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e, r) {
      'use strict';
      var n = r(4),
        o = r(87),
        i = r(54),
        a = r(0),
        u = r(88).f,
        s = r(89),
        c = r(33),
        f = r(23),
        l = r(13),
        h = r(6),
        p = function (t) {
          var e = function (r, n, i) {
            if (this instanceof e) {
              switch (arguments.length) {
                case 0:
                  return new t();
                case 1:
                  return new t(r);
                case 2:
                  return new t(r, n);
              }
              return new t(r, n, i);
            }
            return o(t, this, arguments);
          };
          return (e.prototype = t.prototype), e;
        };
      t.exports = function (t, e) {
        var r,
          o,
          v,
          g,
          d,
          y,
          m,
          b,
          w,
          x = t.target,
          S = t.global,
          P = t.stat,
          O = t.proto,
          j = S ? n : P ? n[x] : (n[x] || {}).prototype,
          R = S ? c : c[x] || l(c, x, {})[x],
          k = R.prototype;
        for (g in e)
          (o = !(r = s(S ? g : x + (P ? '.' : '#') + g, t.forced)) && j && h(j, g)),
            (y = R[g]),
            o && (m = t.dontCallGetSet ? (w = u(j, g)) && w.value : j[g]),
            (d = o && m ? m : e[g]),
            (o && typeof y == typeof d) ||
              ((b = t.bind && o ? f(d, n) : t.wrap && o ? p(d) : O && a(d) ? i(d) : d),
              (t.sham || (d && d.sham) || (y && y.sham)) && l(b, 'sham', !0),
              l(R, g, b),
              O &&
                (h(c, (v = x + 'Prototype')) || l(c, v, {}),
                l(c[v], g, d),
                t.real && k && (r || !k[g]) && l(k, g, d)));
      };
    },
    function (t, e, r) {
      var n,
        o = r(8),
        i = r(91),
        a = r(61),
        u = r(36),
        s = r(95),
        c = r(48),
        f = r(35),
        l = f('IE_PROTO'),
        h = function () {},
        p = function (t) {
          return '<script>' + t + '</script>';
        },
        v = function (t) {
          t.write(p('')), t.close();
          var e = t.parentWindow.Object;
          return (t = null), e;
        },
        g = function () {
          try {
            n = new ActiveXObject('htmlfile');
          } catch (o) {}
          var t, e;
          g =
            'undefined' != typeof document
              ? document.domain && n
                ? v(n)
                : (((e = c('iframe')).style.display = 'none'),
                  s.appendChild(e),
                  (e.src = String('javascript:')),
                  (t = e.contentWindow.document).open(),
                  t.write(p('document.F=Object')),
                  t.close(),
                  t.F)
              : v(n);
          for (var r = a.length; r--; ) delete g.prototype[a[r]];
          return g();
        };
      (u[l] = !0),
        (t.exports =
          Object.create ||
          function (t, e) {
            var r;
            return (
              null !== t
                ? ((h.prototype = o(t)), (r = new h()), (h.prototype = null), (r[l] = t))
                : (r = g()),
              void 0 === e ? r : i.f(r, e)
            );
          });
    },
    function (t, e, r) {
      var n = r(94);
      t.exports = function (t) {
        return n(t.length);
      };
    },
    function (t, e, r) {
      var n = r(11),
        o = r(34),
        i = r(29),
        a = r(17),
        u = r(5)('iterator');
      t.exports = function (t) {
        if (!i(t)) return o(t, u) || o(t, '@@iterator') || a[n(t)];
      };
    },
    function (t, e, r) {
      var n = r(1),
        o = r(25),
        i = r(19),
        a = r(28),
        u = n(''.charAt),
        s = n(''.charCodeAt),
        c = n(''.slice),
        f = function (t) {
          return function (e, r) {
            var n,
              f,
              l = i(a(e)),
              h = o(r),
              p = l.length;
            return h < 0 || h >= p
              ? t
                ? ''
                : void 0
              : (n = s(l, h)) < 55296 ||
                n > 56319 ||
                h + 1 === p ||
                (f = s(l, h + 1)) < 56320 ||
                f > 57343
              ? t
                ? u(l, h)
                : n
              : t
              ? c(l, h, h + 2)
              : f - 56320 + ((n - 55296) << 10) + 65536;
          };
        };
      t.exports = { codeAt: f(!1), charAt: f(!0) };
    },
    function (t, e, r) {
      var n = r(12),
        o = r(27);
      (t.exports = function (t, e) {
        return o[t] || (o[t] = void 0 !== e ? e : {});
      })('versions', []).push({
        version: '3.29.1',
        mode: n ? 'pure' : 'global',
        copyright: '漏 2014-2023 Denis Pushkarev (zloirock.ru)',
        license: 'https://github.com/zloirock/core-js/blob/v3.29.1/LICENSE',
        source: 'https://github.com/zloirock/core-js',
      });
    },
    function (t, e, r) {
      var n = r(1),
        o = 0,
        i = Math.random(),
        a = n((1).toString);
      t.exports = function (t) {
        return 'Symbol(' + (void 0 === t ? '' : t) + ')_' + a(++o + i, 36);
      };
    },
    function (t, e, r) {
      var n = r(82),
        o = r(2);
      t.exports =
        !!Object.getOwnPropertySymbols &&
        !o(function () {
          var t = Symbol();
          return !String(t) || !(Object(t) instanceof Symbol) || (!Symbol.sham && n && n < 41);
        });
    },
    function (t, e, r) {
      var n = r(44);
      t.exports = n && !Symbol.sham && 'symbol' == typeof Symbol.iterator;
    },
    function (t, e) {
      var r = 'object' == typeof document && document.all,
        n = void 0 === r && void 0 !== r;
      t.exports = { all: r, IS_HTMLDDA: n };
    },
    function (t, e, r) {
      var n = r(3),
        o = r(2),
        i = r(48);
      t.exports =
        !n &&
        !o(function () {
          return (
            7 !=
            Object.defineProperty(i('div'), 'a', {
              get: function () {
                return 7;
              },
            }).a
          );
        });
    },
    function (t, e, r) {
      var n = r(4),
        o = r(9),
        i = n.document,
        a = o(i) && o(i.createElement);
      t.exports = function (t) {
        return a ? i.createElement(t) : {};
      };
    },
    function (t, e, r) {
      var n = r(3),
        o = r(2);
      t.exports =
        n &&
        o(function () {
          return (
            42 !=
            Object.defineProperty(function () {}, 'prototype', { value: 42, writable: !1 })
              .prototype
          );
        });
    },
    function (t, e, r) {
      var n = r(32),
        o = r(0),
        i = r(51),
        a = r(45),
        u = Object;
      t.exports = a
        ? function (t) {
            return 'symbol' == typeof t;
          }
        : function (t) {
            var e = n('Symbol');
            return o(e) && i(e.prototype, u(t));
          };
    },
    function (t, e, r) {
      var n = r(1);
      t.exports = n({}.isPrototypeOf);
    },
    function (t, e) {
      var r = String;
      t.exports = function (t) {
        try {
          return r(t);
        } catch (e) {
          return 'Object';
        }
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(37),
        o = r(7),
        i = r(12),
        a = r(90),
        u = r(0),
        s = r(57),
        c = r(62),
        f = r(98),
        l = r(24),
        h = r(13),
        p = r(16),
        v = r(5),
        g = r(17),
        d = r(58),
        y = a.PROPER,
        m = a.CONFIGURABLE,
        b = d.IteratorPrototype,
        w = d.BUGGY_SAFARI_ITERATORS,
        x = v('iterator'),
        S = function () {
          return this;
        };
      t.exports = function (t, e, r, a, v, d, P) {
        s(r, e, a);
        var O,
          j,
          R,
          k = function (t) {
            if (t === v && E) return E;
            if (!w && t in A) return A[t];
            switch (t) {
              case 'keys':
              case 'values':
              case 'entries':
                return function () {
                  return new r(this, t);
                };
            }
            return function () {
              return new r(this);
            };
          },
          U = e + ' Iterator',
          L = !1,
          A = t.prototype,
          I = A[x] || A['@@iterator'] || (v && A[v]),
          E = (!w && I) || k(v),
          _ = ('Array' == e && A.entries) || I;
        if (
          (_ &&
            (O = c(_.call(new t()))) !== Object.prototype &&
            O.next &&
            (i || c(O) === b || (f ? f(O, b) : u(O[x]) || p(O, x, S)),
            l(O, U, !0, !0),
            i && (g[U] = S)),
          y &&
            'values' == v &&
            I &&
            'values' !== I.name &&
            (!i && m
              ? h(A, 'name', 'values')
              : ((L = !0),
                (E = function () {
                  return o(I, this);
                }))),
          v)
        )
          if (((j = { values: k('values'), keys: d ? E : k('keys'), entries: k('entries') }), P))
            for (R in j) (w || L || !(R in A)) && p(A, R, j[R]);
          else n({ target: e, proto: !0, forced: w || L }, j);
        return (i && !P) || A[x] === E || p(A, x, E, { name: v }), (g[e] = E), j;
      };
    },
    function (t, e, r) {
      var n = r(30),
        o = r(1);
      t.exports = function (t) {
        if ('Function' === n(t)) return o(t);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = {}.propertyIsEnumerable,
        o = Object.getOwnPropertyDescriptor,
        i = o && !n.call({ 1: 2 }, 1);
      e.f = i
        ? function (t) {
            var e = o(this, t);
            return !!e && e.enumerable;
          }
        : n;
    },
    function (t, e, r) {
      var n = r(1),
        o = r(2),
        i = r(30),
        a = Object,
        u = n(''.split);
      t.exports = o(function () {
        return !a('z').propertyIsEnumerable(0);
      })
        ? function (t) {
            return 'String' == i(t) ? u(t, '') : a(t);
          }
        : a;
    },
    function (t, e, r) {
      'use strict';
      var n = r(58).IteratorPrototype,
        o = r(38),
        i = r(14),
        a = r(24),
        u = r(17),
        s = function () {
          return this;
        };
      t.exports = function (t, e, r, c) {
        var f = e + ' Iterator';
        return (t.prototype = o(n, { next: i(+!c, r) })), a(t, f, !1, !0), (u[f] = s), t;
      };
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i,
        a = r(2),
        u = r(0),
        s = r(9),
        c = r(38),
        f = r(62),
        l = r(16),
        h = r(5),
        p = r(12),
        v = h('iterator'),
        g = !1;
      [].keys &&
        ('next' in (i = [].keys()) ? (o = f(f(i))) !== Object.prototype && (n = o) : (g = !0)),
        !s(n) ||
        a(function () {
          var t = {};
          return n[v].call(t) !== t;
        })
          ? (n = {})
          : p && (n = c(n)),
        u(n[v]) ||
          l(n, v, function () {
            return this;
          }),
        (t.exports = { IteratorPrototype: n, BUGGY_SAFARI_ITERATORS: g });
    },
    function (t, e, r) {
      var n = r(92),
        o = r(61);
      t.exports =
        Object.keys ||
        function (t) {
          return n(t, o);
        };
    },
    function (t, e, r) {
      var n = r(25),
        o = Math.max,
        i = Math.min;
      t.exports = function (t, e) {
        var r = n(t);
        return r < 0 ? o(r + e, 0) : i(r, e);
      };
    },
    function (t, e) {
      t.exports = [
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf',
      ];
    },
    function (t, e, r) {
      var n = r(6),
        o = r(0),
        i = r(20),
        a = r(35),
        u = r(96),
        s = a('IE_PROTO'),
        c = Object,
        f = c.prototype;
      t.exports = u
        ? c.getPrototypeOf
        : function (t) {
            var e = i(t);
            if (n(e, s)) return e[s];
            var r = e.constructor;
            return o(r) && e instanceof r ? r.prototype : e instanceof c ? f : null;
          };
    },
    function (t, e) {
      t.exports = function (t, e) {
        return { value: t, done: e };
      };
    },
    function (t, e, r) {
      var n = r(2),
        o = r(5),
        i = r(3),
        a = r(12),
        u = o('iterator');
      t.exports = !n(function () {
        var t = new URL('b?a=1&b=2&c=3', 'http://a'),
          e = t.searchParams,
          r = '';
        return (
          (t.pathname = 'c%20d'),
          e.forEach(function (t, n) {
            e.delete('b'), (r += n + t);
          }),
          (a && !t.toJSON) ||
            (!e.size && (a || !i)) ||
            !e.sort ||
            'http://a/c%20d?a=1&c=3' !== t.href ||
            '3' !== e.get('c') ||
            'a=1' !== String(new URLSearchParams('?a=1')) ||
            !e[u] ||
            'a' !== new URL('https://a@b').username ||
            'b' !== new URLSearchParams(new URLSearchParams('a=b')).get('a') ||
            'xn--e1aybc' !== new URL('http://褌械褋褌').host ||
            '#%D0%B1' !== new URL('http://a#斜').hash ||
            'a1c3' !== r ||
            'x' !== new URL('http://x', void 0).host
        );
      });
    },
    function (t, e, r) {
      var n = r(10);
      t.exports = function (t, e, r) {
        return n.f(t, e, r);
      };
    },
    function (t, e, r) {
      var n = r(51),
        o = TypeError;
      t.exports = function (t, e) {
        if (n(e, t)) return t;
        throw o('Incorrect invocation');
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(31),
        o = r(10),
        i = r(14);
      t.exports = function (t, e, r) {
        var a = n(e);
        a in t ? o.f(t, a, i(0, r)) : (t[a] = r);
      };
    },
    function (t, e, r) {
      var n = r(7),
        o = r(22),
        i = r(8),
        a = r(52),
        u = r(40),
        s = TypeError;
      t.exports = function (t, e) {
        var r = arguments.length < 2 ? u(t) : e;
        if (o(r)) return i(n(r, t));
        throw s(a(t) + ' is not iterable');
      };
    },
    function (t, e, r) {
      var n = r(60),
        o = r(39),
        i = r(67),
        a = Array,
        u = Math.max;
      t.exports = function (t, e, r) {
        for (
          var s = o(t), c = n(e, s), f = n(void 0 === r ? s : r, s), l = a(u(f - c, 0)), h = 0;
          c < f;
          c++, h++
        )
          i(l, h, t[c]);
        return (l.length = h), l;
      };
    },
    function (t, e) {
      var r = TypeError;
      t.exports = function (t, e) {
        if (t < e) throw r('Not enough arguments');
        return t;
      };
    },
    function (t, e, r) {
      'use strict';
      r(110);
      var n = r(37),
        o = r(4),
        i = r(7),
        a = r(1),
        u = r(3),
        s = r(64),
        c = r(16),
        f = r(65),
        l = r(112),
        h = r(24),
        p = r(57),
        v = r(21),
        g = r(66),
        d = r(0),
        y = r(6),
        m = r(23),
        b = r(11),
        w = r(8),
        x = r(9),
        S = r(19),
        P = r(38),
        O = r(14),
        j = r(68),
        R = r(40),
        k = r(70),
        U = r(5),
        L = r(113),
        A = U('iterator'),
        I = v.set,
        E = v.getterFor('URLSearchParams'),
        _ = v.getterFor('URLSearchParamsIterator'),
        T = Object.getOwnPropertyDescriptor,
        q = function (t) {
          if (!u) return o[t];
          var e = T(o, t);
          return e && e.value;
        },
        C = q('fetch'),
        F = q('Request'),
        H = q('Headers'),
        B = F && F.prototype,
        M = H && H.prototype,
        z = o.RegExp,
        D = o.TypeError,
        G = o.decodeURIComponent,
        N = o.encodeURIComponent,
        Q = a(''.charAt),
        W = a([].join),
        $ = a([].push),
        Y = a(''.replace),
        J = a([].shift),
        K = a([].splice),
        X = a(''.split),
        V = a(''.slice),
        Z = /\+/g,
        tt = Array(4),
        et = function (t) {
          return tt[t - 1] || (tt[t - 1] = z('((?:%[\\da-f]{2}){' + t + '})', 'gi'));
        },
        rt = function (t) {
          try {
            return G(t);
          } catch (e) {
            return t;
          }
        },
        nt = function (t) {
          var e = Y(t, Z, ' '),
            r = 4;
          try {
            return G(e);
          } catch (n) {
            for (; r; ) e = Y(e, et(r--), rt);
            return e;
          }
        },
        ot = /[!'()~]|%20/g,
        it = { '!': '%21', "'": '%27', '(': '%28', ')': '%29', '~': '%7E', '%20': '+' },
        at = function (t) {
          return it[t];
        },
        ut = function (t) {
          return Y(N(t), ot, at);
        },
        st = p(
          function (t, e) {
            I(this, { type: 'URLSearchParamsIterator', iterator: j(E(t).entries), kind: e });
          },
          'Iterator',
          function () {
            var t = _(this),
              e = t.kind,
              r = t.iterator.next(),
              n = r.value;
            return (
              r.done ||
                (r.value = 'keys' === e ? n.key : 'values' === e ? n.value : [n.key, n.value]),
              r
            );
          },
          !0,
        ),
        ct = function (t) {
          (this.entries = []),
            (this.url = null),
            void 0 !== t &&
              (x(t)
                ? this.parseObject(t)
                : this.parseQuery('string' == typeof t ? ('?' === Q(t, 0) ? V(t, 1) : t) : S(t)));
        };
      ct.prototype = {
        type: 'URLSearchParams',
        bindURL: function (t) {
          (this.url = t), this.update();
        },
        parseObject: function (t) {
          var e,
            r,
            n,
            o,
            a,
            u,
            s,
            c = R(t);
          if (c)
            for (r = (e = j(t, c)).next; !(n = i(r, e)).done; ) {
              if (
                ((a = (o = j(w(n.value))).next),
                (u = i(a, o)).done || (s = i(a, o)).done || !i(a, o).done)
              )
                throw D('Expected sequence with length 2');
              $(this.entries, { key: S(u.value), value: S(s.value) });
            }
          else for (var f in t) y(t, f) && $(this.entries, { key: f, value: S(t[f]) });
        },
        parseQuery: function (t) {
          if (t)
            for (var e, r, n = X(t, '&'), o = 0; o < n.length; )
              (e = n[o++]).length &&
                ((r = X(e, '=')), $(this.entries, { key: nt(J(r)), value: nt(W(r, '=')) }));
        },
        serialize: function () {
          for (var t, e = this.entries, r = [], n = 0; n < e.length; )
            (t = e[n++]), $(r, ut(t.key) + '=' + ut(t.value));
          return W(r, '&');
        },
        update: function () {
          (this.entries.length = 0), this.parseQuery(this.url.query);
        },
        updateURL: function () {
          this.url && this.url.update();
        },
      };
      var ft = function () {
          g(this, lt);
          var t = arguments.length > 0 ? arguments[0] : void 0,
            e = I(this, new ct(t));
          u || (this.length = e.entries.length);
        },
        lt = ft.prototype;
      if (
        (l(
          lt,
          {
            append: function (t, e) {
              k(arguments.length, 2);
              var r = E(this);
              $(r.entries, { key: S(t), value: S(e) }), u || this.length++, r.updateURL();
            },
            delete: function (t) {
              k(arguments.length, 1);
              for (var e = E(this), r = e.entries, n = S(t), o = 0; o < r.length; )
                r[o].key === n ? K(r, o, 1) : o++;
              u || (this.length = r.length), e.updateURL();
            },
            get: function (t) {
              k(arguments.length, 1);
              for (var e = E(this).entries, r = S(t), n = 0; n < e.length; n++)
                if (e[n].key === r) return e[n].value;
              return null;
            },
            getAll: function (t) {
              k(arguments.length, 1);
              for (var e = E(this).entries, r = S(t), n = [], o = 0; o < e.length; o++)
                e[o].key === r && $(n, e[o].value);
              return n;
            },
            has: function (t) {
              k(arguments.length, 1);
              for (var e = E(this).entries, r = S(t), n = 0; n < e.length; )
                if (e[n++].key === r) return !0;
              return !1;
            },
            set: function (t, e) {
              k(arguments.length, 1);
              for (
                var r, n = E(this), o = n.entries, i = !1, a = S(t), s = S(e), c = 0;
                c < o.length;
                c++
              )
                (r = o[c]).key === a && (i ? K(o, c--, 1) : ((i = !0), (r.value = s)));
              i || $(o, { key: a, value: s }), u || (this.length = o.length), n.updateURL();
            },
            sort: function () {
              var t = E(this);
              L(t.entries, function (t, e) {
                return t.key > e.key ? 1 : -1;
              }),
                t.updateURL();
            },
            forEach: function (t) {
              for (
                var e,
                  r = E(this).entries,
                  n = m(t, arguments.length > 1 ? arguments[1] : void 0),
                  o = 0;
                o < r.length;

              )
                n((e = r[o++]).value, e.key, this);
            },
            keys: function () {
              return new st(this, 'keys');
            },
            values: function () {
              return new st(this, 'values');
            },
            entries: function () {
              return new st(this, 'entries');
            },
          },
          { enumerable: !0 },
        ),
        c(lt, A, lt.entries, { name: 'entries' }),
        c(
          lt,
          'toString',
          function () {
            return E(this).serialize();
          },
          { enumerable: !0 },
        ),
        u &&
          f(lt, 'size', {
            get: function () {
              return E(this).entries.length;
            },
            configurable: !0,
            enumerable: !0,
          }),
        h(ft, 'URLSearchParams'),
        n({ global: !0, constructor: !0, forced: !s }, { URLSearchParams: ft }),
        !s && d(H))
      ) {
        var ht = a(M.has),
          pt = a(M.set),
          vt = function (t) {
            if (x(t)) {
              var e,
                r = t.body;
              if ('URLSearchParams' === b(r))
                return (
                  (e = t.headers ? new H(t.headers) : new H()),
                  ht(e, 'content-type') ||
                    pt(e, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8'),
                  P(t, { body: O(0, S(r)), headers: O(0, e) })
                );
            }
            return t;
          };
        if (
          (d(C) &&
            n(
              { global: !0, enumerable: !0, dontCallGetSet: !0, forced: !0 },
              {
                fetch: function (t) {
                  return C(t, arguments.length > 1 ? vt(arguments[1]) : {});
                },
              },
            ),
          d(F))
        ) {
          var gt = function (t) {
            return g(this, B), new F(t, arguments.length > 1 ? vt(arguments[1]) : {});
          };
          (B.constructor = gt),
            (gt.prototype = B),
            n({ global: !0, constructor: !0, dontCallGetSet: !0, forced: !0 }, { Request: gt });
        }
      }
      t.exports = { URLSearchParams: ft, getState: E };
    },
    function (t, e, r) {
      t.exports = r(74);
    },
    function (t, e, r) {
      'use strict';
      r.r(e);
      var n = r(72),
        o = r.n(n);
      window.QRLogin = function (t) {
        var e = t.id,
          r = t.goto,
          n = t.width,
          i = t.height,
          a = t.style,
          u = '';
        try {
          var s = new o.a(r);
          u = s.origin;
        } catch (h) {}
        var c = /^https:\/\/([\w\-]+\.)+\w+/,
          f = /^https:\/\/([\w\-]+\.)?(feishu(-boe|-pre)?\.cn|larksuite(-boe|-pre)?\.com)/,
          l = f.test(r);
        if (!u) throw new Error('The param "goto" is not valid.');
        return (
          (function () {
            var t,
              o = '';
            o = /suite\/passport/.test(r)
              ? u + '/suite/passport/sso/qr?goto=' + encodeURIComponent(r) + '&sdk_version=1.0.3'
              : u + '/accounts/auth_login/qr?goto=' + encodeURIComponent(r) + '&sdk_version=1.0.3';
            var s = document.createElement('iframe');
            s.setAttribute('width', n),
              s.setAttribute('height', i),
              s.setAttribute('style', a),
              s.setAttribute('src', o),
              null === (t = document.getElementById(e)) || void 0 === t || t.appendChild(s);
          })(),
          {
            matchOrigin: function (t) {
              return l ? f.test(t) : c.test(t);
            },
            matchData: function (t) {
              return !('qrcode' !== (null == t ? void 0 : t.source) || !t.tmp_code);
            },
          }
        );
      };
    },
    function (t, e, r) {
      var n = r(75);
      t.exports = n;
    },
    function (t, e, r) {
      r(76), r(114), r(115), r(116);
      var n = r(33);
      t.exports = n.URL;
    },
    function (t, e, r) {
      r(77);
    },
    function (t, e, r) {
      'use strict';
      r(78);
      var n,
        o = r(37),
        i = r(3),
        a = r(64),
        u = r(4),
        s = r(23),
        c = r(1),
        f = r(16),
        l = r(65),
        h = r(66),
        p = r(6),
        v = r(101),
        g = r(103),
        d = r(69),
        y = r(41).codeAt,
        m = r(109),
        b = r(19),
        w = r(24),
        x = r(70),
        S = r(71),
        P = r(21),
        O = P.set,
        j = P.getterFor('URL'),
        R = S.URLSearchParams,
        k = S.getState,
        U = u.URL,
        L = u.TypeError,
        A = u.parseInt,
        I = Math.floor,
        E = Math.pow,
        _ = c(''.charAt),
        T = c(/./.exec),
        q = c([].join),
        C = c((1).toString),
        F = c([].pop),
        H = c([].push),
        B = c(''.replace),
        M = c([].shift),
        z = c(''.split),
        D = c(''.slice),
        G = c(''.toLowerCase),
        N = c([].unshift),
        Q = /[a-z]/i,
        W = /[\d+-.a-z]/i,
        $ = /\d/,
        Y = /^0x/i,
        J = /^[0-7]+$/,
        K = /^\d+$/,
        X = /^[\da-f]+$/i,
        V = /[\0\t\n\r #%/:<>?@[\\\]^|]/,
        Z = /[\0\t\n\r #/:<>?@[\\\]^|]/,
        tt = /^[\u0000-\u0020]+/,
        et = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/,
        rt = /[\t\n\r]/g,
        nt = function (t) {
          var e, r, n, o;
          if ('number' == typeof t) {
            for (e = [], r = 0; r < 4; r++) N(e, t % 256), (t = I(t / 256));
            return q(e, '.');
          }
          if ('object' == typeof t) {
            for (
              e = '',
                n = (function (t) {
                  for (var e = null, r = 1, n = null, o = 0, i = 0; i < 8; i++)
                    0 !== t[i]
                      ? (o > r && ((e = n), (r = o)), (n = null), (o = 0))
                      : (null === n && (n = i), ++o);
                  return o > r && ((e = n), (r = o)), e;
                })(t),
                r = 0;
              r < 8;
              r++
            )
              (o && 0 === t[r]) ||
                (o && (o = !1),
                n === r
                  ? ((e += r ? ':' : '::'), (o = !0))
                  : ((e += C(t[r], 16)), r < 7 && (e += ':')));
            return '[' + e + ']';
          }
          return t;
        },
        ot = {},
        it = v({}, ot, { ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1 }),
        at = v({}, it, { '#': 1, '?': 1, '{': 1, '}': 1 }),
        ut = v({}, at, {
          '/': 1,
          ':': 1,
          ';': 1,
          '=': 1,
          '@': 1,
          '[': 1,
          '\\': 1,
          ']': 1,
          '^': 1,
          '|': 1,
        }),
        st = function (t, e) {
          var r = y(t, 0);
          return r > 32 && r < 127 && !p(e, t) ? t : encodeURIComponent(t);
        },
        ct = { ftp: 21, file: null, http: 80, https: 443, ws: 80, wss: 443 },
        ft = function (t, e) {
          var r;
          return 2 == t.length && T(Q, _(t, 0)) && (':' == (r = _(t, 1)) || (!e && '|' == r));
        },
        lt = function (t) {
          var e;
          return (
            t.length > 1 &&
            ft(D(t, 0, 2)) &&
            (2 == t.length || '/' === (e = _(t, 2)) || '\\' === e || '?' === e || '#' === e)
          );
        },
        ht = function (t) {
          return '.' === t || '%2e' === G(t);
        },
        pt = {},
        vt = {},
        gt = {},
        dt = {},
        yt = {},
        mt = {},
        bt = {},
        wt = {},
        xt = {},
        St = {},
        Pt = {},
        Ot = {},
        jt = {},
        Rt = {},
        kt = {},
        Ut = {},
        Lt = {},
        At = {},
        It = {},
        Et = {},
        _t = {},
        Tt = function (t, e, r) {
          var n,
            o,
            i,
            a = b(t);
          if (e) {
            if ((o = this.parse(a))) throw L(o);
            this.searchParams = null;
          } else {
            if ((void 0 !== r && (n = new Tt(r, !0)), (o = this.parse(a, null, n)))) throw L(o);
            (i = k(new R())).bindURL(this), (this.searchParams = i);
          }
        };
      Tt.prototype = {
        type: 'URL',
        parse: function (t, e, r) {
          var o,
            i,
            a,
            u,
            s,
            c = this,
            f = e || pt,
            l = 0,
            h = '',
            v = !1,
            y = !1,
            m = !1;
          for (
            t = b(t),
              e ||
                ((c.scheme = ''),
                (c.username = ''),
                (c.password = ''),
                (c.host = null),
                (c.port = null),
                (c.path = []),
                (c.query = null),
                (c.fragment = null),
                (c.cannotBeABaseURL = !1),
                (t = B(t, tt, '')),
                (t = B(t, et, '$1'))),
              t = B(t, rt, ''),
              o = g(t);
            l <= o.length;

          ) {
            switch (((i = o[l]), f)) {
              case pt:
                if (!i || !T(Q, i)) {
                  if (e) return 'Invalid scheme';
                  f = gt;
                  continue;
                }
                (h += G(i)), (f = vt);
                break;
              case vt:
                if (i && (T(W, i) || '+' == i || '-' == i || '.' == i)) h += G(i);
                else {
                  if (':' != i) {
                    if (e) return 'Invalid scheme';
                    (h = ''), (f = gt), (l = 0);
                    continue;
                  }
                  if (
                    e &&
                    (c.isSpecial() != p(ct, h) ||
                      ('file' == h && (c.includesCredentials() || null !== c.port)) ||
                      ('file' == c.scheme && !c.host))
                  )
                    return;
                  if (((c.scheme = h), e))
                    return void (c.isSpecial() && ct[c.scheme] == c.port && (c.port = null));
                  (h = ''),
                    'file' == c.scheme
                      ? (f = Rt)
                      : c.isSpecial() && r && r.scheme == c.scheme
                      ? (f = dt)
                      : c.isSpecial()
                      ? (f = wt)
                      : '/' == o[l + 1]
                      ? ((f = yt), l++)
                      : ((c.cannotBeABaseURL = !0), H(c.path, ''), (f = It));
                }
                break;
              case gt:
                if (!r || (r.cannotBeABaseURL && '#' != i)) return 'Invalid scheme';
                if (r.cannotBeABaseURL && '#' == i) {
                  (c.scheme = r.scheme),
                    (c.path = d(r.path)),
                    (c.query = r.query),
                    (c.fragment = ''),
                    (c.cannotBeABaseURL = !0),
                    (f = _t);
                  break;
                }
                f = 'file' == r.scheme ? Rt : mt;
                continue;
              case dt:
                if ('/' != i || '/' != o[l + 1]) {
                  f = mt;
                  continue;
                }
                (f = xt), l++;
                break;
              case yt:
                if ('/' == i) {
                  f = St;
                  break;
                }
                f = At;
                continue;
              case mt:
                if (((c.scheme = r.scheme), i == n))
                  (c.username = r.username),
                    (c.password = r.password),
                    (c.host = r.host),
                    (c.port = r.port),
                    (c.path = d(r.path)),
                    (c.query = r.query);
                else if ('/' == i || ('\\' == i && c.isSpecial())) f = bt;
                else if ('?' == i)
                  (c.username = r.username),
                    (c.password = r.password),
                    (c.host = r.host),
                    (c.port = r.port),
                    (c.path = d(r.path)),
                    (c.query = ''),
                    (f = Et);
                else {
                  if ('#' != i) {
                    (c.username = r.username),
                      (c.password = r.password),
                      (c.host = r.host),
                      (c.port = r.port),
                      (c.path = d(r.path)),
                      c.path.length--,
                      (f = At);
                    continue;
                  }
                  (c.username = r.username),
                    (c.password = r.password),
                    (c.host = r.host),
                    (c.port = r.port),
                    (c.path = d(r.path)),
                    (c.query = r.query),
                    (c.fragment = ''),
                    (f = _t);
                }
                break;
              case bt:
                if (!c.isSpecial() || ('/' != i && '\\' != i)) {
                  if ('/' != i) {
                    (c.username = r.username),
                      (c.password = r.password),
                      (c.host = r.host),
                      (c.port = r.port),
                      (f = At);
                    continue;
                  }
                  f = St;
                } else f = xt;
                break;
              case wt:
                if (((f = xt), '/' != i || '/' != _(h, l + 1))) continue;
                l++;
                break;
              case xt:
                if ('/' != i && '\\' != i) {
                  f = St;
                  continue;
                }
                break;
              case St:
                if ('@' == i) {
                  v && (h = '%40' + h), (v = !0), (a = g(h));
                  for (var w = 0; w < a.length; w++) {
                    var x = a[w];
                    if (':' != x || m) {
                      var S = st(x, ut);
                      m ? (c.password += S) : (c.username += S);
                    } else m = !0;
                  }
                  h = '';
                } else if (
                  i == n ||
                  '/' == i ||
                  '?' == i ||
                  '#' == i ||
                  ('\\' == i && c.isSpecial())
                ) {
                  if (v && '' == h) return 'Invalid authority';
                  (l -= g(h).length + 1), (h = ''), (f = Pt);
                } else h += i;
                break;
              case Pt:
              case Ot:
                if (e && 'file' == c.scheme) {
                  f = Ut;
                  continue;
                }
                if (':' != i || y) {
                  if (i == n || '/' == i || '?' == i || '#' == i || ('\\' == i && c.isSpecial())) {
                    if (c.isSpecial() && '' == h) return 'Invalid host';
                    if (e && '' == h && (c.includesCredentials() || null !== c.port)) return;
                    if ((u = c.parseHost(h))) return u;
                    if (((h = ''), (f = Lt), e)) return;
                    continue;
                  }
                  '[' == i ? (y = !0) : ']' == i && (y = !1), (h += i);
                } else {
                  if ('' == h) return 'Invalid host';
                  if ((u = c.parseHost(h))) return u;
                  if (((h = ''), (f = jt), e == Ot)) return;
                }
                break;
              case jt:
                if (!T($, i)) {
                  if (
                    i == n ||
                    '/' == i ||
                    '?' == i ||
                    '#' == i ||
                    ('\\' == i && c.isSpecial()) ||
                    e
                  ) {
                    if ('' != h) {
                      var P = A(h, 10);
                      if (P > 65535) return 'Invalid port';
                      (c.port = c.isSpecial() && P === ct[c.scheme] ? null : P), (h = '');
                    }
                    if (e) return;
                    f = Lt;
                    continue;
                  }
                  return 'Invalid port';
                }
                h += i;
                break;
              case Rt:
                if (((c.scheme = 'file'), '/' == i || '\\' == i)) f = kt;
                else {
                  if (!r || 'file' != r.scheme) {
                    f = At;
                    continue;
                  }
                  if (i == n) (c.host = r.host), (c.path = d(r.path)), (c.query = r.query);
                  else if ('?' == i)
                    (c.host = r.host), (c.path = d(r.path)), (c.query = ''), (f = Et);
                  else {
                    if ('#' != i) {
                      lt(q(d(o, l), '')) ||
                        ((c.host = r.host), (c.path = d(r.path)), c.shortenPath()),
                        (f = At);
                      continue;
                    }
                    (c.host = r.host),
                      (c.path = d(r.path)),
                      (c.query = r.query),
                      (c.fragment = ''),
                      (f = _t);
                  }
                }
                break;
              case kt:
                if ('/' == i || '\\' == i) {
                  f = Ut;
                  break;
                }
                r &&
                  'file' == r.scheme &&
                  !lt(q(d(o, l), '')) &&
                  (ft(r.path[0], !0) ? H(c.path, r.path[0]) : (c.host = r.host)),
                  (f = At);
                continue;
              case Ut:
                if (i == n || '/' == i || '\\' == i || '?' == i || '#' == i) {
                  if (!e && ft(h)) f = At;
                  else if ('' == h) {
                    if (((c.host = ''), e)) return;
                    f = Lt;
                  } else {
                    if ((u = c.parseHost(h))) return u;
                    if (('localhost' == c.host && (c.host = ''), e)) return;
                    (h = ''), (f = Lt);
                  }
                  continue;
                }
                h += i;
                break;
              case Lt:
                if (c.isSpecial()) {
                  if (((f = At), '/' != i && '\\' != i)) continue;
                } else if (e || '?' != i)
                  if (e || '#' != i) {
                    if (i != n && ((f = At), '/' != i)) continue;
                  } else (c.fragment = ''), (f = _t);
                else (c.query = ''), (f = Et);
                break;
              case At:
                if (
                  i == n ||
                  '/' == i ||
                  ('\\' == i && c.isSpecial()) ||
                  (!e && ('?' == i || '#' == i))
                ) {
                  if (
                    ('..' === (s = G((s = h))) || '%2e.' === s || '.%2e' === s || '%2e%2e' === s
                      ? (c.shortenPath(), '/' == i || ('\\' == i && c.isSpecial()) || H(c.path, ''))
                      : ht(h)
                      ? '/' == i || ('\\' == i && c.isSpecial()) || H(c.path, '')
                      : ('file' == c.scheme &&
                          !c.path.length &&
                          ft(h) &&
                          (c.host && (c.host = ''), (h = _(h, 0) + ':')),
                        H(c.path, h)),
                    (h = ''),
                    'file' == c.scheme && (i == n || '?' == i || '#' == i))
                  )
                    for (; c.path.length > 1 && '' === c.path[0]; ) M(c.path);
                  '?' == i ? ((c.query = ''), (f = Et)) : '#' == i && ((c.fragment = ''), (f = _t));
                } else h += st(i, at);
                break;
              case It:
                '?' == i
                  ? ((c.query = ''), (f = Et))
                  : '#' == i
                  ? ((c.fragment = ''), (f = _t))
                  : i != n && (c.path[0] += st(i, ot));
                break;
              case Et:
                e || '#' != i
                  ? i != n &&
                    ("'" == i && c.isSpecial()
                      ? (c.query += '%27')
                      : (c.query += '#' == i ? '%23' : st(i, ot)))
                  : ((c.fragment = ''), (f = _t));
                break;
              case _t:
                i != n && (c.fragment += st(i, it));
            }
            l++;
          }
        },
        parseHost: function (t) {
          var e, r, n;
          if ('[' == _(t, 0)) {
            if (']' != _(t, t.length - 1)) return 'Invalid host';
            if (
              !(e = (function (t) {
                var e,
                  r,
                  n,
                  o,
                  i,
                  a,
                  u,
                  s = [0, 0, 0, 0, 0, 0, 0, 0],
                  c = 0,
                  f = null,
                  l = 0,
                  h = function () {
                    return _(t, l);
                  };
                if (':' == h()) {
                  if (':' != _(t, 1)) return;
                  (l += 2), (f = ++c);
                }
                for (; h(); ) {
                  if (8 == c) return;
                  if (':' != h()) {
                    for (e = r = 0; r < 4 && T(X, h()); ) (e = 16 * e + A(h(), 16)), l++, r++;
                    if ('.' == h()) {
                      if (0 == r) return;
                      if (((l -= r), c > 6)) return;
                      for (n = 0; h(); ) {
                        if (((o = null), n > 0)) {
                          if (!('.' == h() && n < 4)) return;
                          l++;
                        }
                        if (!T($, h())) return;
                        for (; T($, h()); ) {
                          if (((i = A(h(), 10)), null === o)) o = i;
                          else {
                            if (0 == o) return;
                            o = 10 * o + i;
                          }
                          if (o > 255) return;
                          l++;
                        }
                        (s[c] = 256 * s[c] + o), (2 != ++n && 4 != n) || c++;
                      }
                      if (4 != n) return;
                      break;
                    }
                    if (':' == h()) {
                      if ((l++, !h())) return;
                    } else if (h()) return;
                    s[c++] = e;
                  } else {
                    if (null !== f) return;
                    l++, (f = ++c);
                  }
                }
                if (null !== f)
                  for (a = c - f, c = 7; 0 != c && a > 0; )
                    (u = s[c]), (s[c--] = s[f + a - 1]), (s[f + --a] = u);
                else if (8 != c) return;
                return s;
              })(D(t, 1, -1)))
            )
              return 'Invalid host';
            this.host = e;
          } else if (this.isSpecial()) {
            if (((t = m(t)), T(V, t))) return 'Invalid host';
            if (
              null ===
              (e = (function (t) {
                var e,
                  r,
                  n,
                  o,
                  i,
                  a,
                  u,
                  s = z(t, '.');
                if ((s.length && '' == s[s.length - 1] && s.length--, (e = s.length) > 4)) return t;
                for (r = [], n = 0; n < e; n++) {
                  if ('' == (o = s[n])) return t;
                  if (
                    ((i = 10),
                    o.length > 1 &&
                      '0' == _(o, 0) &&
                      ((i = T(Y, o) ? 16 : 8), (o = D(o, 8 == i ? 1 : 2))),
                    '' === o)
                  )
                    a = 0;
                  else {
                    if (!T(10 == i ? K : 8 == i ? J : X, o)) return t;
                    a = A(o, i);
                  }
                  H(r, a);
                }
                for (n = 0; n < e; n++)
                  if (((a = r[n]), n == e - 1)) {
                    if (a >= E(256, 5 - e)) return null;
                  } else if (a > 255) return null;
                for (u = F(r), n = 0; n < r.length; n++) u += r[n] * E(256, 3 - n);
                return u;
              })(t))
            )
              return 'Invalid host';
            this.host = e;
          } else {
            if (T(Z, t)) return 'Invalid host';
            for (e = '', r = g(t), n = 0; n < r.length; n++) e += st(r[n], ot);
            this.host = e;
          }
        },
        cannotHaveUsernamePasswordPort: function () {
          return !this.host || this.cannotBeABaseURL || 'file' == this.scheme;
        },
        includesCredentials: function () {
          return '' != this.username || '' != this.password;
        },
        isSpecial: function () {
          return p(ct, this.scheme);
        },
        shortenPath: function () {
          var t = this.path,
            e = t.length;
          !e || ('file' == this.scheme && 1 == e && ft(t[0], !0)) || t.length--;
        },
        serialize: function () {
          var t = this,
            e = t.scheme,
            r = t.username,
            n = t.password,
            o = t.host,
            i = t.port,
            a = t.path,
            u = t.query,
            s = t.fragment,
            c = e + ':';
          return (
            null !== o
              ? ((c += '//'),
                t.includesCredentials() && (c += r + (n ? ':' + n : '') + '@'),
                (c += nt(o)),
                null !== i && (c += ':' + i))
              : 'file' == e && (c += '//'),
            (c += t.cannotBeABaseURL ? a[0] : a.length ? '/' + q(a, '/') : ''),
            null !== u && (c += '?' + u),
            null !== s && (c += '#' + s),
            c
          );
        },
        setHref: function (t) {
          var e = this.parse(t);
          if (e) throw L(e);
          this.searchParams.update();
        },
        getOrigin: function () {
          var t = this.scheme,
            e = this.port;
          if ('blob' == t)
            try {
              return new qt(t.path[0]).origin;
            } catch (r) {
              return 'null';
            }
          return 'file' != t && this.isSpecial()
            ? t + '://' + nt(this.host) + (null !== e ? ':' + e : '')
            : 'null';
        },
        getProtocol: function () {
          return this.scheme + ':';
        },
        setProtocol: function (t) {
          this.parse(b(t) + ':', pt);
        },
        getUsername: function () {
          return this.username;
        },
        setUsername: function (t) {
          var e = g(b(t));
          if (!this.cannotHaveUsernamePasswordPort()) {
            this.username = '';
            for (var r = 0; r < e.length; r++) this.username += st(e[r], ut);
          }
        },
        getPassword: function () {
          return this.password;
        },
        setPassword: function (t) {
          var e = g(b(t));
          if (!this.cannotHaveUsernamePasswordPort()) {
            this.password = '';
            for (var r = 0; r < e.length; r++) this.password += st(e[r], ut);
          }
        },
        getHost: function () {
          var t = this.host,
            e = this.port;
          return null === t ? '' : null === e ? nt(t) : nt(t) + ':' + e;
        },
        setHost: function (t) {
          this.cannotBeABaseURL || this.parse(t, Pt);
        },
        getHostname: function () {
          var t = this.host;
          return null === t ? '' : nt(t);
        },
        setHostname: function (t) {
          this.cannotBeABaseURL || this.parse(t, Ot);
        },
        getPort: function () {
          var t = this.port;
          return null === t ? '' : b(t);
        },
        setPort: function (t) {
          this.cannotHaveUsernamePasswordPort() ||
            ('' == (t = b(t)) ? (this.port = null) : this.parse(t, jt));
        },
        getPathname: function () {
          var t = this.path;
          return this.cannotBeABaseURL ? t[0] : t.length ? '/' + q(t, '/') : '';
        },
        setPathname: function (t) {
          this.cannotBeABaseURL || ((this.path = []), this.parse(t, Lt));
        },
        getSearch: function () {
          var t = this.query;
          return t ? '?' + t : '';
        },
        setSearch: function (t) {
          '' == (t = b(t))
            ? (this.query = null)
            : ('?' == _(t, 0) && (t = D(t, 1)), (this.query = ''), this.parse(t, Et)),
            this.searchParams.update();
        },
        getSearchParams: function () {
          return this.searchParams.facade;
        },
        getHash: function () {
          var t = this.fragment;
          return t ? '#' + t : '';
        },
        setHash: function (t) {
          '' != (t = b(t))
            ? ('#' == _(t, 0) && (t = D(t, 1)), (this.fragment = ''), this.parse(t, _t))
            : (this.fragment = null);
        },
        update: function () {
          this.query = this.searchParams.serialize() || null;
        },
      };
      var qt = function (t) {
          var e = h(this, Ct),
            r = x(arguments.length, 1) > 1 ? arguments[1] : void 0,
            n = O(e, new Tt(t, !1, r));
          i ||
            ((e.href = n.serialize()),
            (e.origin = n.getOrigin()),
            (e.protocol = n.getProtocol()),
            (e.username = n.getUsername()),
            (e.password = n.getPassword()),
            (e.host = n.getHost()),
            (e.hostname = n.getHostname()),
            (e.port = n.getPort()),
            (e.pathname = n.getPathname()),
            (e.search = n.getSearch()),
            (e.searchParams = n.getSearchParams()),
            (e.hash = n.getHash()));
        },
        Ct = qt.prototype,
        Ft = function (t, e) {
          return {
            get: function () {
              return j(this)[t]();
            },
            set:
              e &&
              function (t) {
                return j(this)[e](t);
              },
            configurable: !0,
            enumerable: !0,
          };
        };
      if (
        (i &&
          (l(Ct, 'href', Ft('serialize', 'setHref')),
          l(Ct, 'origin', Ft('getOrigin')),
          l(Ct, 'protocol', Ft('getProtocol', 'setProtocol')),
          l(Ct, 'username', Ft('getUsername', 'setUsername')),
          l(Ct, 'password', Ft('getPassword', 'setPassword')),
          l(Ct, 'host', Ft('getHost', 'setHost')),
          l(Ct, 'hostname', Ft('getHostname', 'setHostname')),
          l(Ct, 'port', Ft('getPort', 'setPort')),
          l(Ct, 'pathname', Ft('getPathname', 'setPathname')),
          l(Ct, 'search', Ft('getSearch', 'setSearch')),
          l(Ct, 'searchParams', Ft('getSearchParams')),
          l(Ct, 'hash', Ft('getHash', 'setHash'))),
        f(
          Ct,
          'toJSON',
          function () {
            return j(this).serialize();
          },
          { enumerable: !0 },
        ),
        f(
          Ct,
          'toString',
          function () {
            return j(this).serialize();
          },
          { enumerable: !0 },
        ),
        U)
      ) {
        var Ht = U.createObjectURL,
          Bt = U.revokeObjectURL;
        Ht && f(qt, 'createObjectURL', s(Ht, U)), Bt && f(qt, 'revokeObjectURL', s(Bt, U));
      }
      w(qt, 'URL'), o({ global: !0, constructor: !0, forced: !a, sham: !i }, { URL: qt });
    },
    function (t, e, r) {
      'use strict';
      var n = r(41).charAt,
        o = r(19),
        i = r(21),
        a = r(53),
        u = r(63),
        s = i.set,
        c = i.getterFor('String Iterator');
      a(
        String,
        'String',
        function (t) {
          s(this, { type: 'String Iterator', string: o(t), index: 0 });
        },
        function () {
          var t,
            e = c(this),
            r = e.string,
            o = e.index;
          return o >= r.length ? u(void 0, !0) : ((t = n(r, o)), (e.index += t.length), u(t, !1));
        },
      );
    },
    function (t, e) {
      var r = Math.ceil,
        n = Math.floor;
      t.exports =
        Math.trunc ||
        function (t) {
          var e = +t;
          return (e > 0 ? n : r)(e);
        };
    },
    function (t, e) {
      var r;
      r = (function () {
        return this;
      })();
      try {
        r = r || new Function('return this')();
      } catch (n) {
        'object' == typeof window && (r = window);
      }
      t.exports = r;
    },
    function (t, e, r) {
      var n = r(4),
        o = Object.defineProperty;
      t.exports = function (t, e) {
        try {
          o(n, t, { value: e, configurable: !0, writable: !0 });
        } catch (r) {
          n[t] = e;
        }
        return e;
      };
    },
    function (t, e, r) {
      var n,
        o,
        i = r(4),
        a = r(83),
        u = i.process,
        s = i.Deno,
        c = (u && u.versions) || (s && s.version),
        f = c && c.v8;
      f && (o = (n = f.split('.'))[0] > 0 && n[0] < 4 ? 1 : +(n[0] + n[1])),
        !o &&
          a &&
          (!(n = a.match(/Edge\/(\d+)/)) || n[1] >= 74) &&
          (n = a.match(/Chrome\/(\d+)/)) &&
          (o = +n[1]),
        (t.exports = o);
    },
    function (t, e) {
      t.exports = ('undefined' != typeof navigator && String(navigator.userAgent)) || '';
    },
    function (t, e, r) {
      var n = r(4),
        o = r(0),
        i = n.WeakMap;
      t.exports = o(i) && /native code/.test(String(i));
    },
    function (t, e, r) {
      var n = r(7),
        o = r(9),
        i = r(50),
        a = r(34),
        u = r(86),
        s = r(5),
        c = TypeError,
        f = s('toPrimitive');
      t.exports = function (t, e) {
        if (!o(t) || i(t)) return t;
        var r,
          s = a(t, f);
        if (s) {
          if ((void 0 === e && (e = 'default'), (r = n(s, t, e)), !o(r) || i(r))) return r;
          throw c("Can't convert object to primitive value");
        }
        return void 0 === e && (e = 'number'), u(t, e);
      };
    },
    function (t, e, r) {
      var n = r(7),
        o = r(0),
        i = r(9),
        a = TypeError;
      t.exports = function (t, e) {
        var r, u;
        if ('string' === e && o((r = t.toString)) && !i((u = n(r, t)))) return u;
        if (o((r = t.valueOf)) && !i((u = n(r, t)))) return u;
        if ('string' !== e && o((r = t.toString)) && !i((u = n(r, t)))) return u;
        throw a("Can't convert object to primitive value");
      };
    },
    function (t, e, r) {
      var n = r(18),
        o = Function.prototype,
        i = o.apply,
        a = o.call;
      t.exports =
        ('object' == typeof Reflect && Reflect.apply) ||
        (n
          ? a.bind(i)
          : function () {
              return a.apply(i, arguments);
            });
    },
    function (t, e, r) {
      var n = r(3),
        o = r(7),
        i = r(55),
        a = r(14),
        u = r(15),
        s = r(31),
        c = r(6),
        f = r(47),
        l = Object.getOwnPropertyDescriptor;
      e.f = n
        ? l
        : function (t, e) {
            if (((t = u(t)), (e = s(e)), f))
              try {
                return l(t, e);
              } catch (r) {}
            if (c(t, e)) return a(!o(i.f, t, e), t[e]);
          };
    },
    function (t, e, r) {
      var n = r(2),
        o = r(0),
        i = /#|\.prototype\./,
        a = function (t, e) {
          var r = s[u(t)];
          return r == f || (r != c && (o(e) ? n(e) : !!e));
        },
        u = (a.normalize = function (t) {
          return String(t).replace(i, '.').toLowerCase();
        }),
        s = (a.data = {}),
        c = (a.NATIVE = 'N'),
        f = (a.POLYFILL = 'P');
      t.exports = a;
    },
    function (t, e, r) {
      var n = r(3),
        o = r(6),
        i = Function.prototype,
        a = n && Object.getOwnPropertyDescriptor,
        u = o(i, 'name'),
        s = u && 'something' === function () {}.name,
        c = u && (!n || (n && a(i, 'name').configurable));
      t.exports = { EXISTS: u, PROPER: s, CONFIGURABLE: c };
    },
    function (t, e, r) {
      var n = r(3),
        o = r(49),
        i = r(10),
        a = r(8),
        u = r(15),
        s = r(59);
      e.f =
        n && !o
          ? Object.defineProperties
          : function (t, e) {
              a(t);
              for (var r, n = u(e), o = s(e), c = o.length, f = 0; c > f; )
                i.f(t, (r = o[f++]), n[r]);
              return t;
            };
    },
    function (t, e, r) {
      var n = r(1),
        o = r(6),
        i = r(15),
        a = r(93).indexOf,
        u = r(36),
        s = n([].push);
      t.exports = function (t, e) {
        var r,
          n = i(t),
          c = 0,
          f = [];
        for (r in n) !o(u, r) && o(n, r) && s(f, r);
        for (; e.length > c; ) o(n, (r = e[c++])) && (~a(f, r) || s(f, r));
        return f;
      };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(60),
        i = r(39),
        a = function (t) {
          return function (e, r, a) {
            var u,
              s = n(e),
              c = i(s),
              f = o(a, c);
            if (t && r != r) {
              for (; c > f; ) if ((u = s[f++]) != u) return !0;
            } else for (; c > f; f++) if ((t || f in s) && s[f] === r) return t || f || 0;
            return !t && -1;
          };
        };
      t.exports = { includes: a(!0), indexOf: a(!1) };
    },
    function (t, e, r) {
      var n = r(25),
        o = Math.min;
      t.exports = function (t) {
        return t > 0 ? o(n(t), 9007199254740991) : 0;
      };
    },
    function (t, e, r) {
      var n = r(32);
      t.exports = n('document', 'documentElement');
    },
    function (t, e, r) {
      var n = r(2);
      t.exports = !n(function () {
        function t() {}
        return (t.prototype.constructor = null), Object.getPrototypeOf(new t()) !== t.prototype;
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(26),
        o = r(11);
      t.exports = n
        ? {}.toString
        : function () {
            return '[object ' + o(this) + ']';
          };
    },
    function (t, e, r) {
      var n = r(99),
        o = r(8),
        i = r(100);
      t.exports =
        Object.setPrototypeOf ||
        ('__proto__' in {}
          ? (function () {
              var t,
                e = !1,
                r = {};
              try {
                (t = n(Object.prototype, '__proto__', 'set'))(r, []), (e = r instanceof Array);
              } catch (a) {}
              return function (r, n) {
                return o(r), i(n), e ? t(r, n) : (r.__proto__ = n), r;
              };
            })()
          : void 0);
    },
    function (t, e, r) {
      var n = r(1),
        o = r(22);
      t.exports = function (t, e, r) {
        try {
          return n(o(Object.getOwnPropertyDescriptor(t, e)[r]));
        } catch (i) {}
      };
    },
    function (t, e, r) {
      var n = r(0),
        o = String,
        i = TypeError;
      t.exports = function (t) {
        if ('object' == typeof t || n(t)) return t;
        throw i("Can't set " + o(t) + ' as a prototype');
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(1),
        i = r(7),
        a = r(2),
        u = r(59),
        s = r(102),
        c = r(55),
        f = r(20),
        l = r(56),
        h = Object.assign,
        p = Object.defineProperty,
        v = o([].concat);
      t.exports =
        !h ||
        a(function () {
          if (
            n &&
            1 !==
              h(
                { b: 1 },
                h(
                  p({}, 'a', {
                    enumerable: !0,
                    get: function () {
                      p(this, 'b', { value: 3, enumerable: !1 });
                    },
                  }),
                  { b: 2 },
                ),
              ).b
          )
            return !0;
          var t = {},
            e = {},
            r = Symbol();
          return (
            (t[r] = 7),
            'abcdefghijklmnopqrst'.split('').forEach(function (t) {
              e[t] = t;
            }),
            7 != h({}, t)[r] || 'abcdefghijklmnopqrst' != u(h({}, e)).join('')
          );
        })
          ? function (t, e) {
              for (var r = f(t), o = arguments.length, a = 1, h = s.f, p = c.f; o > a; )
                for (
                  var g, d = l(arguments[a++]), y = h ? v(u(d), h(d)) : u(d), m = y.length, b = 0;
                  m > b;

                )
                  (g = y[b++]), (n && !i(p, d, g)) || (r[g] = d[g]);
              return r;
            }
          : h;
    },
    function (t, e) {
      e.f = Object.getOwnPropertySymbols;
    },
    function (t, e, r) {
      'use strict';
      var n = r(23),
        o = r(7),
        i = r(20),
        a = r(104),
        u = r(106),
        s = r(107),
        c = r(39),
        f = r(67),
        l = r(68),
        h = r(40),
        p = Array;
      t.exports = function (t) {
        var e = i(t),
          r = s(this),
          v = arguments.length,
          g = v > 1 ? arguments[1] : void 0,
          d = void 0 !== g;
        d && (g = n(g, v > 2 ? arguments[2] : void 0));
        var y,
          m,
          b,
          w,
          x,
          S,
          P = h(e),
          O = 0;
        if (!P || (this === p && u(P)))
          for (y = c(e), m = r ? new this(y) : p(y); y > O; O++)
            (S = d ? g(e[O], O) : e[O]), f(m, O, S);
        else
          for (x = (w = l(e, P)).next, m = r ? new this() : []; !(b = o(x, w)).done; O++)
            (S = d ? a(w, g, [b.value, O], !0) : b.value), f(m, O, S);
        return (m.length = O), m;
      };
    },
    function (t, e, r) {
      var n = r(8),
        o = r(105);
      t.exports = function (t, e, r, i) {
        try {
          return i ? e(n(r)[0], r[1]) : e(r);
        } catch (a) {
          o(t, 'throw', a);
        }
      };
    },
    function (t, e, r) {
      var n = r(7),
        o = r(8),
        i = r(34);
      t.exports = function (t, e, r) {
        var a, u;
        o(t);
        try {
          if (!(a = i(t, 'return'))) {
            if ('throw' === e) throw r;
            return r;
          }
          a = n(a, t);
        } catch (s) {
          (u = !0), (a = s);
        }
        if ('throw' === e) throw r;
        if (u) throw a;
        return o(a), r;
      };
    },
    function (t, e, r) {
      var n = r(5),
        o = r(17),
        i = n('iterator'),
        a = Array.prototype;
      t.exports = function (t) {
        return void 0 !== t && (o.Array === t || a[i] === t);
      };
    },
    function (t, e, r) {
      var n = r(1),
        o = r(2),
        i = r(0),
        a = r(11),
        u = r(32),
        s = r(108),
        c = function () {},
        f = [],
        l = u('Reflect', 'construct'),
        h = /^\s*(?:class|function)\b/,
        p = n(h.exec),
        v = !h.exec(c),
        g = function (t) {
          if (!i(t)) return !1;
          try {
            return l(c, f, t), !0;
          } catch (e) {
            return !1;
          }
        },
        d = function (t) {
          if (!i(t)) return !1;
          switch (a(t)) {
            case 'AsyncFunction':
            case 'GeneratorFunction':
            case 'AsyncGeneratorFunction':
              return !1;
          }
          try {
            return v || !!p(h, s(t));
          } catch (e) {
            return !0;
          }
        };
      (d.sham = !0),
        (t.exports =
          !l ||
          o(function () {
            var t;
            return (
              g(g.call) ||
              !g(Object) ||
              !g(function () {
                t = !0;
              }) ||
              t
            );
          })
            ? d
            : g);
    },
    function (t, e, r) {
      var n = r(1),
        o = r(0),
        i = r(27),
        a = n(Function.toString);
      o(i.inspectSource) ||
        (i.inspectSource = function (t) {
          return a(t);
        }),
        (t.exports = i.inspectSource);
    },
    function (t, e, r) {
      var n = r(1),
        o = /[^\0-\u007E]/,
        i = /[.\u3002\uFF0E\uFF61]/g,
        a = 'Overflow: input needs wider integers to process',
        u = RangeError,
        s = n(i.exec),
        c = Math.floor,
        f = String.fromCharCode,
        l = n(''.charCodeAt),
        h = n([].join),
        p = n([].push),
        v = n(''.replace),
        g = n(''.split),
        d = n(''.toLowerCase),
        y = function (t) {
          return t + 22 + 75 * (t < 26);
        },
        m = function (t, e, r) {
          var n = 0;
          for (t = r ? c(t / 700) : t >> 1, t += c(t / e); t > 455; ) (t = c(t / 35)), (n += 36);
          return c(n + (36 * t) / (t + 38));
        },
        b = function (t) {
          var e,
            r,
            n = [],
            o = (t = (function (t) {
              for (var e = [], r = 0, n = t.length; r < n; ) {
                var o = l(t, r++);
                if (o >= 55296 && o <= 56319 && r < n) {
                  var i = l(t, r++);
                  56320 == (64512 & i)
                    ? p(e, ((1023 & o) << 10) + (1023 & i) + 65536)
                    : (p(e, o), r--);
                } else p(e, o);
              }
              return e;
            })(t)).length,
            i = 128,
            s = 0,
            v = 72;
          for (e = 0; e < t.length; e++) (r = t[e]) < 128 && p(n, f(r));
          var g = n.length,
            d = g;
          for (g && p(n, '-'); d < o; ) {
            var b = 2147483647;
            for (e = 0; e < t.length; e++) (r = t[e]) >= i && r < b && (b = r);
            var w = d + 1;
            if (b - i > c((2147483647 - s) / w)) throw u(a);
            for (s += (b - i) * w, i = b, e = 0; e < t.length; e++) {
              if ((r = t[e]) < i && ++s > 2147483647) throw u(a);
              if (r == i) {
                for (var x = s, S = 36; ; ) {
                  var P = S <= v ? 1 : S >= v + 26 ? 26 : S - v;
                  if (x < P) break;
                  var O = x - P,
                    j = 36 - P;
                  p(n, f(y(P + (O % j)))), (x = c(O / j)), (S += 36);
                }
                p(n, f(y(x))), (v = m(s, w, d == g)), (s = 0), d++;
              }
            }
            s++, i++;
          }
          return h(n, '');
        };
      t.exports = function (t) {
        var e,
          r,
          n = [],
          a = g(v(d(t), i, '.'), '.');
        for (e = 0; e < a.length; e++) (r = a[e]), p(n, s(o, r) ? 'xn--' + b(r) : r);
        return h(n, '.');
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(15),
        o = r(111),
        i = r(17),
        a = r(21),
        u = r(10).f,
        s = r(53),
        c = r(63),
        f = r(12),
        l = r(3),
        h = a.set,
        p = a.getterFor('Array Iterator');
      t.exports = s(
        Array,
        'Array',
        function (t, e) {
          h(this, { type: 'Array Iterator', target: n(t), index: 0, kind: e });
        },
        function () {
          var t = p(this),
            e = t.target,
            r = t.kind,
            n = t.index++;
          return !e || n >= e.length
            ? ((t.target = void 0), c(void 0, !0))
            : c('keys' == r ? n : 'values' == r ? e[n] : [n, e[n]], !1);
        },
        'values',
      );
      var v = (i.Arguments = i.Array);
      if ((o('keys'), o('values'), o('entries'), !f && l && 'values' !== v.name))
        try {
          u(v, 'name', { value: 'values' });
        } catch (g) {}
    },
    function (t, e) {
      t.exports = function () {};
    },
    function (t, e, r) {
      var n = r(16);
      t.exports = function (t, e, r) {
        for (var o in e) r && r.unsafe && t[o] ? (t[o] = e[o]) : n(t, o, e[o], r);
        return t;
      };
    },
    function (t, e, r) {
      var n = r(69),
        o = Math.floor,
        i = function (t, e) {
          var r = t.length,
            s = o(r / 2);
          return r < 8 ? a(t, e) : u(t, i(n(t, 0, s), e), i(n(t, s), e), e);
        },
        a = function (t, e) {
          for (var r, n, o = t.length, i = 1; i < o; ) {
            for (n = i, r = t[i]; n && e(t[n - 1], r) > 0; ) t[n] = t[--n];
            n !== i++ && (t[n] = r);
          }
          return t;
        },
        u = function (t, e, r, n) {
          for (var o = e.length, i = r.length, a = 0, u = 0; a < o || u < i; )
            t[a + u] =
              a < o && u < i ? (n(e[a], r[u]) <= 0 ? e[a++] : r[u++]) : a < o ? e[a++] : r[u++];
          return t;
        };
      t.exports = i;
    },
    function (t, e) {},
    function (t, e, r) {
      r(71);
    },
    function (t, e) {},
  ]);
});
