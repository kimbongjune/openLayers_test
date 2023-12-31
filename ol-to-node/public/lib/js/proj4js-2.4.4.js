!(function (a, b) {
    "object" == typeof exports && "undefined" != typeof module
        ? (module.exports = b())
        : "function" == typeof define && define.amd
        ? define(b)
        : (a.proj4 = b());
})(this, function () {
    "use strict";
    function a(a, b) {
        if (a[b]) return a[b];
        for (
            var c,
                d,
                e = Object.keys(a),
                f = b.toLowerCase().replace(Ub, ""),
                g = -1;
            ++g < e.length;

        )
            if (((c = e[g]), (d = c.toLowerCase().replace(Ub, "")), d === f))
                return a[c];
    }
    function b(a) {
        if ("string" != typeof a) throw new Error("not a string");
        (this.text = a.trim()),
            (this.level = 0),
            (this.place = 0),
            (this.root = null),
            (this.stack = []),
            (this.currentObject = null),
            (this.state = Wb);
    }
    function c(a) {
        var c = new b(a);
        return c.output();
    }
    function d(a, b, c) {
        Array.isArray(b) && (c.unshift(b), (b = null));
        var d = b ? {} : a,
            f = c.reduce(function (a, b) {
                return e(b, a), a;
            }, d);
        b && (a[b] = f);
    }
    function e(a, b) {
        if (!Array.isArray(a)) return void (b[a] = !0);
        var c = a.shift();
        if (("PARAMETER" === c && (c = a.shift()), 1 === a.length))
            return Array.isArray(a[0])
                ? ((b[c] = {}), void e(a[0], b[c]))
                : void (b[c] = a[0]);
        if (!a.length) return void (b[c] = !0);
        if ("TOWGS84" === c) return void (b[c] = a);
        Array.isArray(c) || (b[c] = {});
        var f;
        switch (c) {
            case "UNIT":
            case "PRIMEM":
            case "VERT_DATUM":
                return (
                    (b[c] = { name: a[0].toLowerCase(), convert: a[1] }),
                    void (3 === a.length && e(a[2], b[c]))
                );
            case "SPHEROID":
            case "ELLIPSOID":
                return (
                    (b[c] = { name: a[0], a: a[1], rf: a[2] }),
                    void (4 === a.length && e(a[3], b[c]))
                );
            case "PROJECTEDCRS":
            case "PROJCRS":
            case "GEOGCS":
            case "GEOCCS":
            case "PROJCS":
            case "LOCAL_CS":
            case "GEODCRS":
            case "GEODETICCRS":
            case "GEODETICDATUM":
            case "EDATUM":
            case "ENGINEERINGDATUM":
            case "VERT_CS":
            case "VERTCRS":
            case "VERTICALCRS":
            case "COMPD_CS":
            case "COMPOUNDCRS":
            case "ENGINEERINGCRS":
            case "ENGCRS":
            case "FITTED_CS":
            case "LOCAL_DATUM":
            case "DATUM":
                return (a[0] = ["name", a[0]]), void d(b, c, a);
            default:
                for (f = -1; ++f < a.length; )
                    if (!Array.isArray(a[f])) return e(a, b[c]);
                return d(b, c, a);
        }
    }
    function f(a, b) {
        var c = b[0],
            d = b[1];
        !(c in a) &&
            d in a &&
            ((a[c] = a[d]), 3 === b.length && (a[c] = b[2](a[c])));
    }
    function g(a) {
        return a * fc;
    }
    function h(a) {
        function b(b) {
            var c = a.to_meter || 1;
            return b * c;
        }
        "GEOGCS" === a.type
            ? (a.projName = "longlat")
            : "LOCAL_CS" === a.type
            ? ((a.projName = "identity"), (a.local = !0))
            : "object" == typeof a.PROJECTION
            ? (a.projName = Object.keys(a.PROJECTION)[0])
            : (a.projName = a.PROJECTION),
            a.UNIT &&
                ((a.units = a.UNIT.name.toLowerCase()),
                "metre" === a.units && (a.units = "meter"),
                a.UNIT.convert &&
                    ("GEOGCS" === a.type
                        ? a.DATUM &&
                          a.DATUM.SPHEROID &&
                          (a.to_meter = a.UNIT.convert * a.DATUM.SPHEROID.a)
                        : ((a.to_meter = a.UNIT.convert), 10)));
        var c = a.GEOGCS;
        "GEOGCS" === a.type && (c = a),
            c &&
                (c.DATUM
                    ? (a.datumCode = c.DATUM.name.toLowerCase())
                    : (a.datumCode = c.name.toLowerCase()),
                "d_" === a.datumCode.slice(0, 2) &&
                    (a.datumCode = a.datumCode.slice(2)),
                ("new_zealand_geodetic_datum_1949" !== a.datumCode &&
                    "new_zealand_1949" !== a.datumCode) ||
                    (a.datumCode = "nzgd49"),
                "wgs_1984" === a.datumCode &&
                    ("Mercator_Auxiliary_Sphere" === a.PROJECTION &&
                        (a.sphere = !0),
                    (a.datumCode = "wgs84")),
                "_ferro" === a.datumCode.slice(-6) &&
                    (a.datumCode = a.datumCode.slice(0, -6)),
                "_jakarta" === a.datumCode.slice(-8) &&
                    (a.datumCode = a.datumCode.slice(0, -8)),
                ~a.datumCode.indexOf("belge") && (a.datumCode = "rnb72"),
                c.DATUM &&
                    c.DATUM.SPHEROID &&
                    ((a.ellps = c.DATUM.SPHEROID.name
                        .replace("_19", "")
                        .replace(/[Cc]larke\_18/, "clrk")),
                    "international" === a.ellps.toLowerCase().slice(0, 13) &&
                        (a.ellps = "intl"),
                    (a.a = c.DATUM.SPHEROID.a),
                    (a.rf = parseFloat(c.DATUM.SPHEROID.rf, 10))),
                ~a.datumCode.indexOf("osgb_1936") && (a.datumCode = "osgb36"),
                ~a.datumCode.indexOf("osni_1952") && (a.datumCode = "osni52"),
                (~a.datumCode.indexOf("tm65") ||
                    ~a.datumCode.indexOf("geodetic_datum_of_1965")) &&
                    (a.datumCode = "ire65")),
            a.b && !isFinite(a.b) && (a.b = a.a);
        var d = function (b) {
                return f(a, b);
            },
            e = [
                ["standard_parallel_1", "Standard_Parallel_1"],
                ["standard_parallel_2", "Standard_Parallel_2"],
                ["false_easting", "False_Easting"],
                ["false_northing", "False_Northing"],
                ["central_meridian", "Central_Meridian"],
                ["latitude_of_origin", "Latitude_Of_Origin"],
                ["latitude_of_origin", "Central_Parallel"],
                ["scale_factor", "Scale_Factor"],
                ["k0", "scale_factor"],
                ["latitude_of_center", "Latitude_of_center"],
                ["lat0", "latitude_of_center", g],
                ["longitude_of_center", "Longitude_Of_Center"],
                ["longc", "longitude_of_center", g],
                ["x0", "false_easting", b],
                ["y0", "false_northing", b],
                ["long0", "central_meridian", g],
                ["lat0", "latitude_of_origin", g],
                ["lat0", "standard_parallel_1", g],
                ["lat1", "standard_parallel_1", g],
                ["lat2", "standard_parallel_2", g],
                ["alpha", "azimuth", g],
                ["srsCode", "name"],
            ];
        e.forEach(d),
            a.long0 ||
                !a.longc ||
                ("Albers_Conic_Equal_Area" !== a.projName &&
                    "Lambert_Azimuthal_Equal_Area" !== a.projName) ||
                (a.long0 = a.longc),
            a.lat_ts ||
                !a.lat1 ||
                ("Stereographic_South_Pole" !== a.projName &&
                    "Polar Stereographic (variant B)" !== a.projName) ||
                ((a.lat0 = g(a.lat1 > 0 ? 90 : -90)), (a.lat_ts = a.lat1));
    }
    function i(a) {
        var b = this;
        if (2 === arguments.length) {
            var c = arguments[1];
            "string" == typeof c
                ? "+" === c.charAt(0)
                    ? (i[a] = Vb(arguments[1]))
                    : (i[a] = gc(arguments[1]))
                : (i[a] = c);
        } else if (1 === arguments.length) {
            if (Array.isArray(a))
                return a.map(function (a) {
                    Array.isArray(a) ? i.apply(b, a) : i(a);
                });
            if ("string" == typeof a) {
                if (a in i) return i[a];
            } else
                "EPSG" in a
                    ? (i["EPSG:" + a.EPSG] = a)
                    : "ESRI" in a
                    ? (i["ESRI:" + a.ESRI] = a)
                    : "IAU2000" in a
                    ? (i["IAU2000:" + a.IAU2000] = a)
                    : console.log(a);
            return;
        }
    }
    function j(a) {
        return "string" == typeof a;
    }
    function k(a) {
        return a in i;
    }
    function l(a) {
        return hc.some(function (b) {
            return a.indexOf(b) > -1;
        });
    }
    function m(a) {
        return "+" === a[0];
    }
    function n(a) {
        return j(a) ? (k(a) ? i[a] : l(a) ? gc(a) : m(a) ? Vb(a) : void 0) : a;
    }
    function o() {
        var a = this.b / this.a;
        (this.es = 1 - a * a),
            "x0" in this || (this.x0 = 0),
            "y0" in this || (this.y0 = 0),
            (this.e = Math.sqrt(this.es)),
            this.lat_ts
                ? this.sphere
                    ? (this.k0 = Math.cos(this.lat_ts))
                    : (this.k0 = jc(
                          this.e,
                          Math.sin(this.lat_ts),
                          Math.cos(this.lat_ts)
                      ))
                : this.k0 || (this.k ? (this.k0 = this.k) : (this.k0 = 1));
    }
    function p(a) {
        var b = a.x,
            c = a.y;
        if (c * Ob > 90 && -90 > c * Ob && b * Ob > 180 && -180 > b * Ob)
            return null;
        var d, e;
        if (Math.abs(Math.abs(c) - Ib) <= Mb) return null;
        if (this.sphere)
            (d = this.x0 + this.a * this.k0 * lc(b - this.long0)),
                (e =
                    this.y0 +
                    this.a * this.k0 * Math.log(Math.tan(Pb + 0.5 * c)));
        else {
            var f = Math.sin(c),
                g = mc(this.e, c, f);
            (d = this.x0 + this.a * this.k0 * lc(b - this.long0)),
                (e = this.y0 - this.a * this.k0 * Math.log(g));
        }
        return (a.x = d), (a.y = e), a;
    }
    function q(a) {
        var b,
            c,
            d = a.x - this.x0,
            e = a.y - this.y0;
        if (this.sphere)
            c = Ib - 2 * Math.atan(Math.exp(-e / (this.a * this.k0)));
        else {
            var f = Math.exp(-e / (this.a * this.k0));
            if (((c = nc(this.e, f)), -9999 === c)) return null;
        }
        return (
            (b = lc(this.long0 + d / (this.a * this.k0))),
            (a.x = b),
            (a.y = c),
            a
        );
    }
    function r() {}
    function s(a) {
        return a;
    }
    function t(a, b) {
        var c = uc.length;
        return a.names
            ? ((uc[c] = a),
              a.names.forEach(function (a) {
                  tc[a.toLowerCase()] = c;
              }),
              this)
            : (console.log(b), !0);
    }
    function u(a) {
        if (!a) return !1;
        var b = a.toLowerCase();
        return "undefined" != typeof tc[b] && uc[tc[b]] ? uc[tc[b]] : void 0;
    }
    function v() {
        sc.forEach(t);
    }
    function w(a, b, c, d) {
        var e = a * a,
            f = b * b,
            g = (e - f) / e,
            h = 0;
        d
            ? ((a *= 1 - g * (Jb + g * (Kb + g * Lb))), (e = a * a), (g = 0))
            : (h = Math.sqrt(g));
        var i = (e - f) / f;
        return { es: g, e: h, ep2: i };
    }
    function x(b, c, d, e, f) {
        if (!b) {
            var g = a(wc, e);
            g || (g = xc), (b = g.a), (c = g.b), (d = g.rf);
        }
        return (
            d && !c && (c = (1 - 1 / d) * b),
            (0 === d || Math.abs(b - c) < Mb) && ((f = !0), (c = b)),
            { a: b, b: c, rf: d, sphere: f }
        );
    }
    function y(a, b, c, d, e, f) {
        var g = {};
        return (
            void 0 === a || "none" === a
                ? (g.datum_type = Gb)
                : (g.datum_type = Fb),
            b &&
                ((g.datum_params = b.map(parseFloat)),
                (0 === g.datum_params[0] &&
                    0 === g.datum_params[1] &&
                    0 === g.datum_params[2]) ||
                    (g.datum_type = Db),
                g.datum_params.length > 3 &&
                    ((0 === g.datum_params[3] &&
                        0 === g.datum_params[4] &&
                        0 === g.datum_params[5] &&
                        0 === g.datum_params[6]) ||
                        ((g.datum_type = Eb),
                        (g.datum_params[3] *= Hb),
                        (g.datum_params[4] *= Hb),
                        (g.datum_params[5] *= Hb),
                        (g.datum_params[6] = g.datum_params[6] / 1e6 + 1)))),
            (g.a = c),
            (g.b = d),
            (g.es = e),
            (g.ep2 = f),
            g
        );
    }
    function z(b, c) {
        if (!(this instanceof z)) return new z(b);
        c =
            c ||
            function (a) {
                if (a) throw a;
            };
        var d = n(b);
        if ("object" != typeof d) return void c(b);
        var e = z.projections.get(d.projName);
        if (!e) return void c(b);
        if (d.datumCode && "none" !== d.datumCode) {
            var f = a(yc, d.datumCode);
            f &&
                ((d.datum_params = f.towgs84 ? f.towgs84.split(",") : null),
                (d.ellps = f.ellipse),
                (d.datumName = f.datumName ? f.datumName : d.datumCode));
        }
        (d.k0 = d.k0 || 1),
            (d.axis = d.axis || "enu"),
            (d.ellps = d.ellps || "wgs84");
        var g = x(d.a, d.b, d.rf, d.ellps, d.sphere),
            h = w(g.a, g.b, g.rf, d.R_A),
            i =
                d.datum ||
                y(d.datumCode, d.datum_params, g.a, g.b, h.es, h.ep2);
        ic(this, d),
            ic(this, e),
            (this.a = g.a),
            (this.b = g.b),
            (this.rf = g.rf),
            (this.sphere = g.sphere),
            (this.es = h.es),
            (this.e = h.e),
            (this.ep2 = h.ep2),
            (this.datum = i),
            this.init(),
            c(null, this);
    }
    function A(a, b) {
        return a.datum_type !== b.datum_type
            ? !1
            : a.a !== b.a || Math.abs(a.es - b.es) > 5e-11
            ? !1
            : a.datum_type === Db
            ? a.datum_params[0] === b.datum_params[0] &&
              a.datum_params[1] === b.datum_params[1] &&
              a.datum_params[2] === b.datum_params[2]
            : a.datum_type === Eb
            ? a.datum_params[0] === b.datum_params[0] &&
              a.datum_params[1] === b.datum_params[1] &&
              a.datum_params[2] === b.datum_params[2] &&
              a.datum_params[3] === b.datum_params[3] &&
              a.datum_params[4] === b.datum_params[4] &&
              a.datum_params[5] === b.datum_params[5] &&
              a.datum_params[6] === b.datum_params[6]
            : !0;
    }
    function B(a, b, c) {
        var d,
            e,
            f,
            g,
            h = a.x,
            i = a.y,
            j = a.z ? a.z : 0;
        if (-Ib > i && i > -1.001 * Ib) i = -Ib;
        else if (i > Ib && 1.001 * Ib > i) i = Ib;
        else if (-Ib > i || i > Ib) return null;
        return (
            h > Math.PI && (h -= 2 * Math.PI),
            (e = Math.sin(i)),
            (g = Math.cos(i)),
            (f = e * e),
            (d = c / Math.sqrt(1 - b * f)),
            {
                x: (d + j) * g * Math.cos(h),
                y: (d + j) * g * Math.sin(h),
                z: (d * (1 - b) + j) * e,
            }
        );
    }
    function C(a, b, c, d) {
        var e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            t,
            u = 1e-12,
            v = u * u,
            w = 30,
            x = a.x,
            y = a.y,
            z = a.z ? a.z : 0;
        if (
            ((e = Math.sqrt(x * x + y * y)),
            (f = Math.sqrt(x * x + y * y + z * z)),
            u > e / c)
        ) {
            if (((r = 0), u > f / c))
                return (s = Ib), (t = -d), { x: a.x, y: a.y, z: a.z };
        } else r = Math.atan2(y, x);
        (g = z / f),
            (h = e / f),
            (i = 1 / Math.sqrt(1 - b * (2 - b) * h * h)),
            (l = h * (1 - b) * i),
            (m = g * i),
            (q = 0);
        do
            q++,
                (k = c / Math.sqrt(1 - b * m * m)),
                (t = e * l + z * m - k * (1 - b * m * m)),
                (j = (b * k) / (k + t)),
                (i = 1 / Math.sqrt(1 - j * (2 - j) * h * h)),
                (n = h * (1 - j) * i),
                (o = g * i),
                (p = o * l - n * m),
                (l = n),
                (m = o);
        while (p * p > v && w > q);
        return (s = Math.atan(o / Math.abs(n))), { x: r, y: s, z: t };
    }
    function D(a, b, c) {
        if (b === Db) return { x: a.x + c[0], y: a.y + c[1], z: a.z + c[2] };
        if (b === Eb) {
            var d = c[0],
                e = c[1],
                f = c[2],
                g = c[3],
                h = c[4],
                i = c[5],
                j = c[6];
            return {
                x: j * (a.x - i * a.y + h * a.z) + d,
                y: j * (i * a.x + a.y - g * a.z) + e,
                z: j * (-h * a.x + g * a.y + a.z) + f,
            };
        }
    }
    function E(a, b, c) {
        if (b === Db) return { x: a.x - c[0], y: a.y - c[1], z: a.z - c[2] };
        if (b === Eb) {
            var d = c[0],
                e = c[1],
                f = c[2],
                g = c[3],
                h = c[4],
                i = c[5],
                j = c[6],
                k = (a.x - d) / j,
                l = (a.y - e) / j,
                m = (a.z - f) / j;
            return {
                x: k + i * l - h * m,
                y: -i * k + l + g * m,
                z: h * k - g * l + m,
            };
        }
    }
    function F(a) {
        return a === Db || a === Eb;
    }
    function G(a) {
        if ("function" == typeof Number.isFinite) {
            if (Number.isFinite(a)) return;
            throw new TypeError("coordinates must be finite numbers");
        }
        if ("number" != typeof a || a !== a || !isFinite(a))
            throw new TypeError("coordinates must be finite numbers");
    }
    function H(a, b) {
        return (
            ((a.datum.datum_type === Db || a.datum.datum_type === Eb) &&
                "WGS84" !== b.datumCode) ||
            ((b.datum.datum_type === Db || b.datum.datum_type === Eb) &&
                "WGS84" !== a.datumCode)
        );
    }
    function I(a, b, c) {
        var d;
        return (
            Array.isArray(c) && (c = Bc(c)),
            Cc(c),
            a.datum &&
                b.datum &&
                H(a, b) &&
                ((d = new z("WGS84")), (c = I(a, d, c)), (a = d)),
            "enu" !== a.axis && (c = Ac(a, !1, c)),
            "longlat" === a.projName
                ? (c = { x: c.x * Nb, y: c.y * Nb })
                : (a.to_meter &&
                      (c = { x: c.x * a.to_meter, y: c.y * a.to_meter }),
                  (c = a.inverse(c))),
            a.from_greenwich && (c.x += a.from_greenwich),
            (c = zc(a.datum, b.datum, c)),
            b.from_greenwich && (c = { x: c.x - b.from_greenwich, y: c.y }),
            "longlat" === b.projName
                ? (c = { x: c.x * Ob, y: c.y * Ob })
                : ((c = b.forward(c)),
                  b.to_meter &&
                      (c = { x: c.x / b.to_meter, y: c.y / b.to_meter })),
            "enu" !== b.axis ? Ac(b, !0, c) : c
        );
    }
    function J(a, b, c) {
        var d, e, f;
        return Array.isArray(c)
            ? ((d = I(a, b, c)), 3 === c.length ? [d.x, d.y, d.z] : [d.x, d.y])
            : ((e = I(a, b, c)),
              (f = Object.keys(c)),
              2 === f.length
                  ? e
                  : (f.forEach(function (a) {
                        "x" !== a && "y" !== a && (e[a] = c[a]);
                    }),
                    e));
    }
    function K(a) {
        return a instanceof z ? a : a.oProj ? a.oProj : z(a);
    }
    function L(a, b, c) {
        a = K(a);
        var d,
            e = !1;
        return (
            "undefined" == typeof b
                ? ((b = a), (a = Dc), (e = !0))
                : ("undefined" != typeof b.x || Array.isArray(b)) &&
                  ((c = b), (b = a), (a = Dc), (e = !0)),
            (b = K(b)),
            c
                ? J(a, b, c)
                : ((d = {
                      forward: function (c) {
                          return J(a, b, c);
                      },
                      inverse: function (c) {
                          return J(b, a, c);
                      },
                  }),
                  e && (d.oProj = b),
                  d)
        );
    }
    function M(a, b) {
        return (b = b || 5), U(R({ lat: a[1], lon: a[0] }), b);
    }
    function N(a) {
        var b = S(Y(a.toUpperCase()));
        return b.lat && b.lon
            ? [b.lon, b.lat, b.lon, b.lat]
            : [b.left, b.bottom, b.right, b.top];
    }
    function O(a) {
        var b = S(Y(a.toUpperCase()));
        return b.lat && b.lon
            ? [b.lon, b.lat]
            : [(b.left + b.right) / 2, (b.top + b.bottom) / 2];
    }
    function P(a) {
        return a * (Math.PI / 180);
    }
    function Q(a) {
        return 180 * (a / Math.PI);
    }
    function R(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k = a.lat,
            l = a.lon,
            m = 6378137,
            n = 0.00669438,
            o = 0.9996,
            p = P(k),
            q = P(l);
        (j = Math.floor((l + 180) / 6) + 1),
            180 === l && (j = 60),
            k >= 56 && 64 > k && l >= 3 && 12 > l && (j = 32),
            k >= 72 &&
                84 > k &&
                (l >= 0 && 9 > l
                    ? (j = 31)
                    : l >= 9 && 21 > l
                    ? (j = 33)
                    : l >= 21 && 33 > l
                    ? (j = 35)
                    : l >= 33 && 42 > l && (j = 37)),
            (b = 6 * (j - 1) - 180 + 3),
            (i = P(b)),
            (c = n / (1 - n)),
            (d = m / Math.sqrt(1 - n * Math.sin(p) * Math.sin(p))),
            (e = Math.tan(p) * Math.tan(p)),
            (f = c * Math.cos(p) * Math.cos(p)),
            (g = Math.cos(p) * (q - i)),
            (h =
                m *
                ((1 - n / 4 - (3 * n * n) / 64 - (5 * n * n * n) / 256) * p -
                    ((3 * n) / 8 + (3 * n * n) / 32 + (45 * n * n * n) / 1024) *
                        Math.sin(2 * p) +
                    ((15 * n * n) / 256 + (45 * n * n * n) / 1024) *
                        Math.sin(4 * p) -
                    ((35 * n * n * n) / 3072) * Math.sin(6 * p)));
        var r =
                o *
                    d *
                    (g +
                        ((1 - e + f) * g * g * g) / 6 +
                        ((5 - 18 * e + e * e + 72 * f - 58 * c) *
                            g *
                            g *
                            g *
                            g *
                            g) /
                            120) +
                5e5,
            s =
                o *
                (h +
                    d *
                        Math.tan(p) *
                        ((g * g) / 2 +
                            ((5 - e + 9 * f + 4 * f * f) * g * g * g * g) / 24 +
                            ((61 - 58 * e + e * e + 600 * f - 330 * c) *
                                g *
                                g *
                                g *
                                g *
                                g *
                                g) /
                                720));
        return (
            0 > k && (s += 1e7),
            {
                northing: Math.round(s),
                easting: Math.round(r),
                zoneNumber: j,
                zoneLetter: T(k),
            }
        );
    }
    function S(a) {
        var b = a.northing,
            c = a.easting,
            d = a.zoneLetter,
            e = a.zoneNumber;
        if (0 > e || e > 60) return null;
        var f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p = 0.9996,
            q = 6378137,
            r = 0.00669438,
            s = (1 - Math.sqrt(1 - r)) / (1 + Math.sqrt(1 - r)),
            t = c - 5e5,
            u = b;
        "N" > d && (u -= 1e7),
            (m = 6 * (e - 1) - 180 + 3),
            (f = r / (1 - r)),
            (l = u / p),
            (n =
                l /
                (q * (1 - r / 4 - (3 * r * r) / 64 - (5 * r * r * r) / 256))),
            (o =
                n +
                ((3 * s) / 2 - (27 * s * s * s) / 32) * Math.sin(2 * n) +
                ((21 * s * s) / 16 - (55 * s * s * s * s) / 32) *
                    Math.sin(4 * n) +
                ((151 * s * s * s) / 96) * Math.sin(6 * n)),
            (g = q / Math.sqrt(1 - r * Math.sin(o) * Math.sin(o))),
            (h = Math.tan(o) * Math.tan(o)),
            (i = f * Math.cos(o) * Math.cos(o)),
            (j =
                (q * (1 - r)) /
                Math.pow(1 - r * Math.sin(o) * Math.sin(o), 1.5)),
            (k = t / (g * p));
        var v =
            o -
            ((g * Math.tan(o)) / j) *
                ((k * k) / 2 -
                    ((5 + 3 * h + 10 * i - 4 * i * i - 9 * f) * k * k * k * k) /
                        24 +
                    ((61 +
                        90 * h +
                        298 * i +
                        45 * h * h -
                        252 * f -
                        3 * i * i) *
                        k *
                        k *
                        k *
                        k *
                        k *
                        k) /
                        720);
        v = Q(v);
        var w =
            (k -
                ((1 + 2 * h + i) * k * k * k) / 6 +
                ((5 - 2 * i + 28 * h - 3 * i * i + 8 * f + 24 * h * h) *
                    k *
                    k *
                    k *
                    k *
                    k) /
                    120) /
            Math.cos(o);
        w = m + Q(w);
        var x;
        if (a.accuracy) {
            var y = S({
                northing: a.northing + a.accuracy,
                easting: a.easting + a.accuracy,
                zoneLetter: a.zoneLetter,
                zoneNumber: a.zoneNumber,
            });
            x = { top: y.lat, right: y.lon, bottom: v, left: w };
        } else x = { lat: v, lon: w };
        return x;
    }
    function T(a) {
        var b = "Z";
        return (
            84 >= a && a >= 72
                ? (b = "X")
                : 72 > a && a >= 64
                ? (b = "W")
                : 64 > a && a >= 56
                ? (b = "V")
                : 56 > a && a >= 48
                ? (b = "U")
                : 48 > a && a >= 40
                ? (b = "T")
                : 40 > a && a >= 32
                ? (b = "S")
                : 32 > a && a >= 24
                ? (b = "R")
                : 24 > a && a >= 16
                ? (b = "Q")
                : 16 > a && a >= 8
                ? (b = "P")
                : 8 > a && a >= 0
                ? (b = "N")
                : 0 > a && a >= -8
                ? (b = "M")
                : -8 > a && a >= -16
                ? (b = "L")
                : -16 > a && a >= -24
                ? (b = "K")
                : -24 > a && a >= -32
                ? (b = "J")
                : -32 > a && a >= -40
                ? (b = "H")
                : -40 > a && a >= -48
                ? (b = "G")
                : -48 > a && a >= -56
                ? (b = "F")
                : -56 > a && a >= -64
                ? (b = "E")
                : -64 > a && a >= -72
                ? (b = "D")
                : -72 > a && a >= -80 && (b = "C"),
            b
        );
    }
    function U(a, b) {
        var c = "00000" + a.easting,
            d = "00000" + a.northing;
        return (
            a.zoneNumber +
            a.zoneLetter +
            V(a.easting, a.northing, a.zoneNumber) +
            c.substr(c.length - 5, b) +
            d.substr(d.length - 5, b)
        );
    }
    function V(a, b, c) {
        var d = W(c),
            e = Math.floor(a / 1e5),
            f = Math.floor(b / 1e5) % 20;
        return X(e, f, d);
    }
    function W(a) {
        var b = a % Ec;
        return 0 === b && (b = Ec), b;
    }
    function X(a, b, c) {
        var d = c - 1,
            e = Fc.charCodeAt(d),
            f = Gc.charCodeAt(d),
            g = e + a - 1,
            h = f + b,
            i = !1;
        g > Lc && ((g = g - Lc + Hc - 1), (i = !0)),
            (g === Ic || (Ic > e && g > Ic) || ((g > Ic || Ic > e) && i)) &&
                g++,
            (g === Jc || (Jc > e && g > Jc) || ((g > Jc || Jc > e) && i)) &&
                (g++, g === Ic && g++),
            g > Lc && (g = g - Lc + Hc - 1),
            h > Kc ? ((h = h - Kc + Hc - 1), (i = !0)) : (i = !1),
            (h === Ic || (Ic > f && h > Ic) || ((h > Ic || Ic > f) && i)) &&
                h++,
            (h === Jc || (Jc > f && h > Jc) || ((h > Jc || Jc > f) && i)) &&
                (h++, h === Ic && h++),
            h > Kc && (h = h - Kc + Hc - 1);
        var j = String.fromCharCode(g) + String.fromCharCode(h);
        return j;
    }
    function Y(a) {
        if (a && 0 === a.length) throw "MGRSPoint coverting from nothing";
        for (
            var b, c = a.length, d = null, e = "", f = 0;
            !/[A-Z]/.test((b = a.charAt(f)));

        ) {
            if (f >= 2) throw "MGRSPoint bad conversion from: " + a;
            (e += b), f++;
        }
        var g = parseInt(e, 10);
        if (0 === f || f + 3 > c) throw "MGRSPoint bad conversion from: " + a;
        var h = a.charAt(f++);
        if (
            "A" >= h ||
            "B" === h ||
            "Y" === h ||
            h >= "Z" ||
            "I" === h ||
            "O" === h
        )
            throw "MGRSPoint zone letter " + h + " not handled: " + a;
        d = a.substring(f, (f += 2));
        for (
            var i = W(g), j = Z(d.charAt(0), i), k = $(d.charAt(1), i);
            k < _(h);

        )
            k += 2e6;
        var l = c - f;
        if (l % 2 !== 0)
            throw (
                "MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" +
                a
            );
        var m,
            n,
            o,
            p,
            q,
            r = l / 2,
            s = 0,
            t = 0;
        return (
            r > 0 &&
                ((m = 1e5 / Math.pow(10, r)),
                (n = a.substring(f, f + r)),
                (s = parseFloat(n) * m),
                (o = a.substring(f + r)),
                (t = parseFloat(o) * m)),
            (p = s + j),
            (q = t + k),
            {
                easting: p,
                northing: q,
                zoneLetter: h,
                zoneNumber: g,
                accuracy: m,
            }
        );
    }
    function Z(a, b) {
        for (
            var c = Fc.charCodeAt(b - 1), d = 1e5, e = !1;
            c !== a.charCodeAt(0);

        ) {
            if ((c++, c === Ic && c++, c === Jc && c++, c > Lc)) {
                if (e) throw "Bad character: " + a;
                (c = Hc), (e = !0);
            }
            d += 1e5;
        }
        return d;
    }
    function $(a, b) {
        if (a > "V") throw "MGRSPoint given invalid Northing " + a;
        for (
            var c = Gc.charCodeAt(b - 1), d = 0, e = !1;
            c !== a.charCodeAt(0);

        ) {
            if ((c++, c === Ic && c++, c === Jc && c++, c > Kc)) {
                if (e) throw "Bad character: " + a;
                (c = Hc), (e = !0);
            }
            d += 1e5;
        }
        return d;
    }
    function _(a) {
        var b;
        switch (a) {
            case "C":
                b = 11e5;
                break;
            case "D":
                b = 2e6;
                break;
            case "E":
                b = 28e5;
                break;
            case "F":
                b = 37e5;
                break;
            case "G":
                b = 46e5;
                break;
            case "H":
                b = 55e5;
                break;
            case "J":
                b = 64e5;
                break;
            case "K":
                b = 73e5;
                break;
            case "L":
                b = 82e5;
                break;
            case "M":
                b = 91e5;
                break;
            case "N":
                b = 0;
                break;
            case "P":
                b = 8e5;
                break;
            case "Q":
                b = 17e5;
                break;
            case "R":
                b = 26e5;
                break;
            case "S":
                b = 35e5;
                break;
            case "T":
                b = 44e5;
                break;
            case "U":
                b = 53e5;
                break;
            case "V":
                b = 62e5;
                break;
            case "W":
                b = 7e6;
                break;
            case "X":
                b = 79e5;
                break;
            default:
                b = -1;
        }
        if (b >= 0) return b;
        throw "Invalid zone letter: " + a;
    }
    function Point(a, b, c) {
        if (!(this instanceof Point)) return new Point(a, b, c);
        if (Array.isArray(a))
            (this.x = a[0]), (this.y = a[1]), (this.z = a[2] || 0);
        else if ("object" == typeof a)
            (this.x = a.x), (this.y = a.y), (this.z = a.z || 0);
        else if ("string" == typeof a && "undefined" == typeof b) {
            var d = a.split(",");
            (this.x = parseFloat(d[0], 10)),
                (this.y = parseFloat(d[1], 10)),
                (this.z = parseFloat(d[2], 10) || 0);
        } else (this.x = a), (this.y = b), (this.z = c || 0);
        console.warn(
            "proj4.Point will be removed in version 3, use proj4.toPoint"
        );
    }
    function aa() {
        (this.x0 = void 0 !== this.x0 ? this.x0 : 0),
            (this.y0 = void 0 !== this.y0 ? this.y0 : 0),
            (this.long0 = void 0 !== this.long0 ? this.long0 : 0),
            (this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0),
            this.es &&
                ((this.en = $c(this.es)),
                (this.ml0 = _c(
                    this.lat0,
                    Math.sin(this.lat0),
                    Math.cos(this.lat0),
                    this.en
                )));
    }
    function ba(a) {
        var b,
            c,
            d,
            e = a.x,
            f = a.y,
            g = lc(e - this.long0),
            h = Math.sin(f),
            i = Math.cos(f);
        if (this.es) {
            var j = i * g,
                k = Math.pow(j, 2),
                l = this.ep2 * Math.pow(i, 2),
                m = Math.pow(l, 2),
                n = Math.abs(i) > Mb ? Math.tan(f) : 0,
                o = Math.pow(n, 2),
                p = Math.pow(o, 2);
            (b = 1 - this.es * Math.pow(h, 2)), (j /= Math.sqrt(b));
            var q = _c(f, h, i, this.en);
            (c =
                this.a *
                    (this.k0 *
                        j *
                        (1 +
                            (k / 6) *
                                (1 -
                                    o +
                                    l +
                                    (k / 20) *
                                        (5 -
                                            18 * o +
                                            p +
                                            14 * l -
                                            58 * o * l +
                                            (k / 42) *
                                                (61 +
                                                    179 * p -
                                                    p * o -
                                                    479 * o))))) +
                this.x0),
                (d =
                    this.a *
                        (this.k0 *
                            (q -
                                this.ml0 +
                                ((h * g * j) / 2) *
                                    (1 +
                                        (k / 12) *
                                            (5 -
                                                o +
                                                9 * l +
                                                4 * m +
                                                (k / 30) *
                                                    (61 +
                                                        p -
                                                        58 * o +
                                                        270 * l -
                                                        330 * o * l +
                                                        (k / 56) *
                                                            (1385 +
                                                                543 * p -
                                                                p * o -
                                                                3111 * o)))))) +
                    this.y0);
        } else {
            var r = i * Math.sin(g);
            if (Math.abs(Math.abs(r) - 1) < Mb) return 93;
            if (
                ((c =
                    0.5 * this.a * this.k0 * Math.log((1 + r) / (1 - r)) +
                    this.x0),
                (d = (i * Math.cos(g)) / Math.sqrt(1 - Math.pow(r, 2))),
                (r = Math.abs(d)),
                r >= 1)
            ) {
                if (r - 1 > Mb) return 93;
                d = 0;
            } else d = Math.acos(d);
            0 > f && (d = -d),
                (d = this.a * this.k0 * (d - this.lat0) + this.y0);
        }
        return (a.x = c), (a.y = d), a;
    }
    function ca(a) {
        var b,
            c,
            d,
            e,
            f = (a.x - this.x0) * (1 / this.a),
            g = (a.y - this.y0) * (1 / this.a);
        if (this.es)
            if (
                ((b = this.ml0 + g / this.k0),
                (c = bd(b, this.es, this.en)),
                Math.abs(c) < Ib)
            ) {
                var h = Math.sin(c),
                    i = Math.cos(c),
                    j = Math.abs(i) > Mb ? Math.tan(c) : 0,
                    k = this.ep2 * Math.pow(i, 2),
                    l = Math.pow(k, 2),
                    m = Math.pow(j, 2),
                    n = Math.pow(m, 2);
                b = 1 - this.es * Math.pow(h, 2);
                var o = (f * Math.sqrt(b)) / this.k0,
                    p = Math.pow(o, 2);
                (b *= j),
                    (d =
                        c -
                        ((b * p) / (1 - this.es)) *
                            0.5 *
                            (1 -
                                (p / 12) *
                                    (5 +
                                        3 * m -
                                        9 * k * m +
                                        k -
                                        4 * l -
                                        (p / 30) *
                                            (61 +
                                                90 * m -
                                                252 * k * m +
                                                45 * n +
                                                46 * k -
                                                (p / 56) *
                                                    (1385 +
                                                        3633 * m +
                                                        4095 * n +
                                                        1574 * n * m))))),
                    (e = lc(
                        this.long0 +
                            (o *
                                (1 -
                                    (p / 6) *
                                        (1 +
                                            2 * m +
                                            k -
                                            (p / 20) *
                                                (5 +
                                                    28 * m +
                                                    24 * n +
                                                    8 * k * m +
                                                    6 * k -
                                                    (p / 42) *
                                                        (61 +
                                                            662 * m +
                                                            1320 * n +
                                                            720 * n * m))))) /
                                i
                    ));
            } else (d = Ib * kc(g)), (e = 0);
        else {
            var q = Math.exp(f / this.k0),
                r = 0.5 * (q - 1 / q),
                s = this.lat0 + g / this.k0,
                t = Math.cos(s);
            (b = Math.sqrt((1 - Math.pow(t, 2)) / (1 + Math.pow(r, 2)))),
                (d = Math.asin(b)),
                0 > g && (d = -d),
                (e =
                    0 === r && 0 === t ? 0 : lc(Math.atan2(r, t) + this.long0));
        }
        return (a.x = e), (a.y = d), a;
    }
    function da() {
        if (void 0 === this.es || this.es <= 0)
            throw new Error("incorrect elliptical usage");
        (this.x0 = void 0 !== this.x0 ? this.x0 : 0),
            (this.y0 = void 0 !== this.y0 ? this.y0 : 0),
            (this.long0 = void 0 !== this.long0 ? this.long0 : 0),
            (this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0),
            (this.cgb = []),
            (this.cbg = []),
            (this.utg = []),
            (this.gtu = []);
        var a = this.es / (1 + Math.sqrt(1 - this.es)),
            b = a / (2 - a),
            c = b;
        (this.cgb[0] =
            b *
            (2 +
                b *
                    (-2 / 3 +
                        b *
                            (-2 +
                                b *
                                    (116 / 45 +
                                        b * (26 / 45 + b * (-2854 / 675))))))),
            (this.cbg[0] =
                b *
                (-2 +
                    b *
                        (2 / 3 +
                            b *
                                (4 / 3 +
                                    b *
                                        (-82 / 45 +
                                            b *
                                                (32 / 45 +
                                                    b * (4642 / 4725))))))),
            (c *= b),
            (this.cgb[1] =
                c *
                (7 / 3 +
                    b *
                        (-1.6 +
                            b *
                                (-227 / 45 +
                                    b * (2704 / 315 + b * (2323 / 945)))))),
            (this.cbg[1] =
                c *
                (5 / 3 +
                    b *
                        (-16 / 15 +
                            b *
                                (-13 / 9 +
                                    b * (904 / 315 + b * (-1522 / 945)))))),
            (c *= b),
            (this.cgb[2] =
                c *
                (56 / 15 +
                    b * (-136 / 35 + b * (-1262 / 105 + b * (73814 / 2835))))),
            (this.cbg[2] =
                c *
                (-26 / 15 + b * (34 / 21 + b * (1.6 + b * (-12686 / 2835))))),
            (c *= b),
            (this.cgb[3] =
                c * (4279 / 630 + b * (-332 / 35 + b * (-399572 / 14175)))),
            (this.cbg[3] =
                c * (1237 / 630 + b * (-2.4 + b * (-24832 / 14175)))),
            (c *= b),
            (this.cgb[4] = c * (4174 / 315 + b * (-144838 / 6237))),
            (this.cbg[4] = c * (-734 / 315 + b * (109598 / 31185))),
            (c *= b),
            (this.cgb[5] = c * (601676 / 22275)),
            (this.cbg[5] = c * (444337 / 155925)),
            (c = Math.pow(b, 2)),
            (this.Qn =
                (this.k0 / (1 + b)) *
                (1 + c * (0.25 + c * (1 / 64 + c / 256)))),
            (this.utg[0] =
                b *
                (-0.5 +
                    b *
                        (2 / 3 +
                            b *
                                (-37 / 96 +
                                    b *
                                        (1 / 360 +
                                            b *
                                                (81 / 512 +
                                                    b * (-96199 / 604800))))))),
            (this.gtu[0] =
                b *
                (0.5 +
                    b *
                        (-2 / 3 +
                            b *
                                (5 / 16 +
                                    b *
                                        (41 / 180 +
                                            b *
                                                (-127 / 288 +
                                                    b * (7891 / 37800))))))),
            (this.utg[1] =
                c *
                (-1 / 48 +
                    b *
                        (-1 / 15 +
                            b *
                                (437 / 1440 +
                                    b *
                                        (-46 / 105 +
                                            b * (1118711 / 3870720)))))),
            (this.gtu[1] =
                c *
                (13 / 48 +
                    b *
                        (-0.6 +
                            b *
                                (557 / 1440 +
                                    b *
                                        (281 / 630 +
                                            b * (-1983433 / 1935360)))))),
            (c *= b),
            (this.utg[2] =
                c *
                (-17 / 480 +
                    b * (37 / 840 + b * (209 / 4480 + b * (-5569 / 90720))))),
            (this.gtu[2] =
                c *
                (61 / 240 +
                    b *
                        (-103 / 140 +
                            b * (15061 / 26880 + b * (167603 / 181440))))),
            (c *= b),
            (this.utg[3] =
                c * (-4397 / 161280 + b * (11 / 504 + b * (830251 / 7257600)))),
            (this.gtu[3] =
                c *
                (49561 / 161280 + b * (-179 / 168 + b * (6601661 / 7257600)))),
            (c *= b),
            (this.utg[4] = c * (-4583 / 161280 + b * (108847 / 3991680))),
            (this.gtu[4] = c * (34729 / 80640 + b * (-3418889 / 1995840))),
            (c *= b),
            (this.utg[5] = c * (-20648693 / 638668800)),
            (this.gtu[5] = 0.6650675310896665 * c);
        var d = id(this.cbg, this.lat0);
        this.Zb = -this.Qn * (d + jd(this.gtu, 2 * d));
    }
    function ea(a) {
        var b = lc(a.x - this.long0),
            c = a.y;
        c = id(this.cbg, c);
        var d = Math.sin(c),
            e = Math.cos(c),
            f = Math.sin(b),
            g = Math.cos(b);
        (c = Math.atan2(d, g * e)),
            (b = Math.atan2(f * e, fd(d, e * g))),
            (b = hd(Math.tan(b)));
        var h = ld(this.gtu, 2 * c, 2 * b);
        (c += h[0]), (b += h[1]);
        var i, j;
        return (
            Math.abs(b) <= 2.623395162778
                ? ((i = this.a * (this.Qn * b) + this.x0),
                  (j = this.a * (this.Qn * c + this.Zb) + this.y0))
                : ((i = 1 / 0), (j = 1 / 0)),
            (a.x = i),
            (a.y = j),
            a
        );
    }
    function fa(a) {
        var b = (a.x - this.x0) * (1 / this.a),
            c = (a.y - this.y0) * (1 / this.a);
        (c = (c - this.Zb) / this.Qn), (b /= this.Qn);
        var d, e;
        if (Math.abs(b) <= 2.623395162778) {
            var f = ld(this.utg, 2 * c, 2 * b);
            (c += f[0]), (b += f[1]), (b = Math.atan(ed(b)));
            var g = Math.sin(c),
                h = Math.cos(c),
                i = Math.sin(b),
                j = Math.cos(b);
            (c = Math.atan2(g * j, fd(i, j * h))),
                (b = Math.atan2(i, j * h)),
                (d = lc(b + this.long0)),
                (e = id(this.cgb, c));
        } else (d = 1 / 0), (e = 1 / 0);
        return (a.x = d), (a.y = e), a;
    }
    function ga() {
        var a = od(this.zone, this.long0);
        if (void 0 === a) throw new Error("unknown utm zone");
        (this.lat0 = 0),
            (this.long0 = (6 * Math.abs(a) - 183) * Nb),
            (this.x0 = 5e5),
            (this.y0 = this.utmSouth ? 1e7 : 0),
            (this.k0 = 0.9996),
            nd.init.apply(this),
            (this.forward = nd.forward),
            (this.inverse = nd.inverse);
    }
    function ha() {
        var a = Math.sin(this.lat0),
            b = Math.cos(this.lat0);
        (b *= b),
            (this.rc = Math.sqrt(1 - this.es) / (1 - this.es * a * a)),
            (this.C = Math.sqrt(1 + (this.es * b * b) / (1 - this.es))),
            (this.phic0 = Math.asin(a / this.C)),
            (this.ratexp = 0.5 * this.C * this.e),
            (this.K =
                Math.tan(0.5 * this.phic0 + Pb) /
                (Math.pow(Math.tan(0.5 * this.lat0 + Pb), this.C) *
                    sd(this.e * a, this.ratexp)));
    }
    function ia(a) {
        var b = a.x,
            c = a.y;
        return (
            (a.y =
                2 *
                    Math.atan(
                        this.K *
                            Math.pow(Math.tan(0.5 * c + Pb), this.C) *
                            sd(this.e * Math.sin(c), this.ratexp)
                    ) -
                Ib),
            (a.x = this.C * b),
            a
        );
    }
    function ja(a) {
        for (
            var b = 1e-14,
                c = a.x / this.C,
                d = a.y,
                e = Math.pow(Math.tan(0.5 * d + Pb) / this.K, 1 / this.C),
                f = td;
            f > 0 &&
            ((d =
                2 * Math.atan(e * sd(this.e * Math.sin(a.y), -0.5 * this.e)) -
                Ib),
            !(Math.abs(d - a.y) < b));
            --f
        )
            a.y = d;
        return f ? ((a.x = c), (a.y = d), a) : null;
    }
    function ka() {
        vd.init.apply(this),
            this.rc &&
                ((this.sinc0 = Math.sin(this.phic0)),
                (this.cosc0 = Math.cos(this.phic0)),
                (this.R2 = 2 * this.rc),
                this.title ||
                    (this.title = "Oblique Stereographic Alternative"));
    }
    function la(a) {
        var b, c, d, e;
        return (
            (a.x = lc(a.x - this.long0)),
            vd.forward.apply(this, [a]),
            (b = Math.sin(a.y)),
            (c = Math.cos(a.y)),
            (d = Math.cos(a.x)),
            (e =
                (this.k0 * this.R2) /
                (1 + this.sinc0 * b + this.cosc0 * c * d)),
            (a.x = e * c * Math.sin(a.x)),
            (a.y = e * (this.cosc0 * b - this.sinc0 * c * d)),
            (a.x = this.a * a.x + this.x0),
            (a.y = this.a * a.y + this.y0),
            a
        );
    }
    function ma(a) {
        var b, c, d, e, f;
        if (
            ((a.x = (a.x - this.x0) / this.a),
            (a.y = (a.y - this.y0) / this.a),
            (a.x /= this.k0),
            (a.y /= this.k0),
            (f = Math.sqrt(a.x * a.x + a.y * a.y)))
        ) {
            var g = 2 * Math.atan2(f, this.R2);
            (b = Math.sin(g)),
                (c = Math.cos(g)),
                (e = Math.asin(c * this.sinc0 + (a.y * b * this.cosc0) / f)),
                (d = Math.atan2(
                    a.x * b,
                    f * this.cosc0 * c - a.y * this.sinc0 * b
                ));
        } else (e = this.phic0), (d = 0);
        return (
            (a.x = d),
            (a.y = e),
            vd.inverse.apply(this, [a]),
            (a.x = lc(a.x + this.long0)),
            a
        );
    }
    function na(a, b, c) {
        return (
            (b *= c),
            Math.tan(0.5 * (Ib + a)) * Math.pow((1 - b) / (1 + b), 0.5 * c)
        );
    }
    function oa() {
        (this.coslat0 = Math.cos(this.lat0)),
            (this.sinlat0 = Math.sin(this.lat0)),
            this.sphere
                ? 1 === this.k0 &&
                  !isNaN(this.lat_ts) &&
                  Math.abs(this.coslat0) <= Mb &&
                  (this.k0 = 0.5 * (1 + kc(this.lat0) * Math.sin(this.lat_ts)))
                : (Math.abs(this.coslat0) <= Mb &&
                      (this.lat0 > 0 ? (this.con = 1) : (this.con = -1)),
                  (this.cons = Math.sqrt(
                      Math.pow(1 + this.e, 1 + this.e) *
                          Math.pow(1 - this.e, 1 - this.e)
                  )),
                  1 === this.k0 &&
                      !isNaN(this.lat_ts) &&
                      Math.abs(this.coslat0) <= Mb &&
                      (this.k0 =
                          (0.5 *
                              this.cons *
                              jc(
                                  this.e,
                                  Math.sin(this.lat_ts),
                                  Math.cos(this.lat_ts)
                              )) /
                          mc(
                              this.e,
                              this.con * this.lat_ts,
                              this.con * Math.sin(this.lat_ts)
                          )),
                  (this.ms1 = jc(this.e, this.sinlat0, this.coslat0)),
                  (this.X0 =
                      2 *
                          Math.atan(
                              this.ssfn_(this.lat0, this.sinlat0, this.e)
                          ) -
                      Ib),
                  (this.cosX0 = Math.cos(this.X0)),
                  (this.sinX0 = Math.sin(this.X0)));
    }
    function pa(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h = a.x,
            i = a.y,
            j = Math.sin(i),
            k = Math.cos(i),
            l = lc(h - this.long0);
        return Math.abs(Math.abs(h - this.long0) - Math.PI) <= Mb &&
            Math.abs(i + this.lat0) <= Mb
            ? ((a.x = NaN), (a.y = NaN), a)
            : this.sphere
            ? ((b =
                  (2 * this.k0) /
                  (1 + this.sinlat0 * j + this.coslat0 * k * Math.cos(l))),
              (a.x = this.a * b * k * Math.sin(l) + this.x0),
              (a.y =
                  this.a *
                      b *
                      (this.coslat0 * j - this.sinlat0 * k * Math.cos(l)) +
                  this.y0),
              a)
            : ((c = 2 * Math.atan(this.ssfn_(i, j, this.e)) - Ib),
              (e = Math.cos(c)),
              (d = Math.sin(c)),
              Math.abs(this.coslat0) <= Mb
                  ? ((f = mc(this.e, i * this.con, this.con * j)),
                    (g = (2 * this.a * this.k0 * f) / this.cons),
                    (a.x = this.x0 + g * Math.sin(h - this.long0)),
                    (a.y = this.y0 - this.con * g * Math.cos(h - this.long0)),
                    a)
                  : (Math.abs(this.sinlat0) < Mb
                        ? ((b = (2 * this.a * this.k0) / (1 + e * Math.cos(l))),
                          (a.y = b * d))
                        : ((b =
                              (2 * this.a * this.k0 * this.ms1) /
                              (this.cosX0 *
                                  (1 +
                                      this.sinX0 * d +
                                      this.cosX0 * e * Math.cos(l)))),
                          (a.y =
                              b *
                                  (this.cosX0 * d -
                                      this.sinX0 * e * Math.cos(l)) +
                              this.y0)),
                    (a.x = b * e * Math.sin(l) + this.x0),
                    a));
    }
    function qa(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b,
            c,
            d,
            e,
            f,
            g = Math.sqrt(a.x * a.x + a.y * a.y);
        if (this.sphere) {
            var h = 2 * Math.atan(g / (0.5 * this.a * this.k0));
            return (
                (b = this.long0),
                (c = this.lat0),
                Mb >= g
                    ? ((a.x = b), (a.y = c), a)
                    : ((c = Math.asin(
                          Math.cos(h) * this.sinlat0 +
                              (a.y * Math.sin(h) * this.coslat0) / g
                      )),
                      (b = lc(
                          Math.abs(this.coslat0) < Mb
                              ? this.lat0 > 0
                                  ? this.long0 + Math.atan2(a.x, -1 * a.y)
                                  : this.long0 + Math.atan2(a.x, a.y)
                              : this.long0 +
                                    Math.atan2(
                                        a.x * Math.sin(h),
                                        g * this.coslat0 * Math.cos(h) -
                                            a.y * this.sinlat0 * Math.sin(h)
                                    )
                      )),
                      (a.x = b),
                      (a.y = c),
                      a)
            );
        }
        if (Math.abs(this.coslat0) <= Mb) {
            if (Mb >= g)
                return (
                    (c = this.lat0), (b = this.long0), (a.x = b), (a.y = c), a
                );
            (a.x *= this.con),
                (a.y *= this.con),
                (d = (g * this.cons) / (2 * this.a * this.k0)),
                (c = this.con * nc(this.e, d)),
                (b =
                    this.con *
                    lc(this.con * this.long0 + Math.atan2(a.x, -1 * a.y)));
        } else (e = 2 * Math.atan((g * this.cosX0) / (2 * this.a * this.k0 * this.ms1))), (b = this.long0), Mb >= g ? (f = this.X0) : ((f = Math.asin(Math.cos(e) * this.sinX0 + (a.y * Math.sin(e) * this.cosX0) / g)), (b = lc(this.long0 + Math.atan2(a.x * Math.sin(e), g * this.cosX0 * Math.cos(e) - a.y * this.sinX0 * Math.sin(e))))), (c = -1 * nc(this.e, Math.tan(0.5 * (Ib + f))));
        return (a.x = b), (a.y = c), a;
    }
    function ra() {
        var a = this.lat0;
        this.lambda0 = this.long0;
        var b = Math.sin(a),
            c = this.a,
            d = this.rf,
            e = 1 / d,
            f = 2 * e - Math.pow(e, 2),
            g = (this.e = Math.sqrt(f));
        (this.R = (this.k0 * c * Math.sqrt(1 - f)) / (1 - f * Math.pow(b, 2))),
            (this.alpha = Math.sqrt(
                1 + (f / (1 - f)) * Math.pow(Math.cos(a), 4)
            )),
            (this.b0 = Math.asin(b / this.alpha));
        var h = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)),
            i = Math.log(Math.tan(Math.PI / 4 + a / 2)),
            j = Math.log((1 + g * b) / (1 - g * b));
        this.K = h - this.alpha * i + ((this.alpha * g) / 2) * j;
    }
    function sa(a) {
        var b = Math.log(Math.tan(Math.PI / 4 - a.y / 2)),
            c =
                (this.e / 2) *
                Math.log(
                    (1 + this.e * Math.sin(a.y)) / (1 - this.e * Math.sin(a.y))
                ),
            d = -this.alpha * (b + c) + this.K,
            e = 2 * (Math.atan(Math.exp(d)) - Math.PI / 4),
            f = this.alpha * (a.x - this.lambda0),
            g = Math.atan(
                Math.sin(f) /
                    (Math.sin(this.b0) * Math.tan(e) +
                        Math.cos(this.b0) * Math.cos(f))
            ),
            h = Math.asin(
                Math.cos(this.b0) * Math.sin(e) -
                    Math.sin(this.b0) * Math.cos(e) * Math.cos(f)
            );
        return (
            (a.y =
                (this.R / 2) * Math.log((1 + Math.sin(h)) / (1 - Math.sin(h))) +
                this.y0),
            (a.x = this.R * g + this.x0),
            a
        );
    }
    function ta(a) {
        for (
            var b = a.x - this.x0,
                c = a.y - this.y0,
                d = b / this.R,
                e = 2 * (Math.atan(Math.exp(c / this.R)) - Math.PI / 4),
                f = Math.asin(
                    Math.cos(this.b0) * Math.sin(e) +
                        Math.sin(this.b0) * Math.cos(e) * Math.cos(d)
                ),
                g = Math.atan(
                    Math.sin(d) /
                        (Math.cos(this.b0) * Math.cos(d) -
                            Math.sin(this.b0) * Math.tan(e))
                ),
                h = this.lambda0 + g / this.alpha,
                i = 0,
                j = f,
                k = -1e3,
                l = 0;
            Math.abs(j - k) > 1e-7;

        ) {
            if (++l > 20) return;
            (i =
                (1 / this.alpha) *
                    (Math.log(Math.tan(Math.PI / 4 + f / 2)) - this.K) +
                this.e *
                    Math.log(
                        Math.tan(
                            Math.PI / 4 + Math.asin(this.e * Math.sin(j)) / 2
                        )
                    )),
                (k = j),
                (j = 2 * Math.atan(Math.exp(i)) - Math.PI / 2);
        }
        return (a.x = h), (a.y = j), a;
    }
    function ua() {
        (this.no_off = this.no_off || !1),
            (this.no_rot = this.no_rot || !1),
            isNaN(this.k0) && (this.k0 = 1);
        var a = Math.sin(this.lat0),
            b = Math.cos(this.lat0),
            c = this.e * a;
        (this.bl = Math.sqrt(1 + (this.es / (1 - this.es)) * Math.pow(b, 4))),
            (this.al =
                (this.a * this.bl * this.k0 * Math.sqrt(1 - this.es)) /
                (1 - c * c));
        var d = mc(this.e, this.lat0, a),
            e = (this.bl / b) * Math.sqrt((1 - this.es) / (1 - c * c));
        1 > e * e && (e = 1);
        var f, g;
        if (isNaN(this.longc)) {
            var h = mc(this.e, this.lat1, Math.sin(this.lat1)),
                i = mc(this.e, this.lat2, Math.sin(this.lat2));
            this.lat0 >= 0
                ? (this.el = (e + Math.sqrt(e * e - 1)) * Math.pow(d, this.bl))
                : (this.el = (e - Math.sqrt(e * e - 1)) * Math.pow(d, this.bl));
            var j = Math.pow(h, this.bl),
                k = Math.pow(i, this.bl);
            (f = this.el / j), (g = 0.5 * (f - 1 / f));
            var l = (this.el * this.el - k * j) / (this.el * this.el + k * j),
                m = (k - j) / (k + j),
                n = lc(this.long1 - this.long2);
            (this.long0 =
                0.5 * (this.long1 + this.long2) -
                Math.atan((l * Math.tan(0.5 * this.bl * n)) / m) / this.bl),
                (this.long0 = lc(this.long0));
            var o = lc(this.long1 - this.long0);
            (this.gamma0 = Math.atan(Math.sin(this.bl * o) / g)),
                (this.alpha = Math.asin(e * Math.sin(this.gamma0)));
        } else (f = this.lat0 >= 0 ? e + Math.sqrt(e * e - 1) : e - Math.sqrt(e * e - 1)), (this.el = f * Math.pow(d, this.bl)), (g = 0.5 * (f - 1 / f)), (this.gamma0 = Math.asin(Math.sin(this.alpha) / e)), (this.long0 = this.longc - Math.asin(g * Math.tan(this.gamma0)) / this.bl);
        this.no_off
            ? (this.uc = 0)
            : this.lat0 >= 0
            ? (this.uc =
                  (this.al / this.bl) *
                  Math.atan2(Math.sqrt(e * e - 1), Math.cos(this.alpha)))
            : (this.uc =
                  ((-1 * this.al) / this.bl) *
                  Math.atan2(Math.sqrt(e * e - 1), Math.cos(this.alpha)));
    }
    function va(a) {
        var b,
            c,
            d,
            e = a.x,
            f = a.y,
            g = lc(e - this.long0);
        if (Math.abs(Math.abs(f) - Ib) <= Mb)
            (d = f > 0 ? -1 : 1),
                (c =
                    (this.al / this.bl) *
                    Math.log(Math.tan(Pb + d * this.gamma0 * 0.5))),
                (b = (-1 * d * Ib * this.al) / this.bl);
        else {
            var h = mc(this.e, f, Math.sin(f)),
                i = this.el / Math.pow(h, this.bl),
                j = 0.5 * (i - 1 / i),
                k = 0.5 * (i + 1 / i),
                l = Math.sin(this.bl * g),
                m = (j * Math.sin(this.gamma0) - l * Math.cos(this.gamma0)) / k;
            (c =
                Math.abs(Math.abs(m) - 1) <= Mb
                    ? Number.POSITIVE_INFINITY
                    : (0.5 * this.al * Math.log((1 - m) / (1 + m))) / this.bl),
                (b =
                    Math.abs(Math.cos(this.bl * g)) <= Mb
                        ? this.al * this.bl * g
                        : (this.al *
                              Math.atan2(
                                  j * Math.cos(this.gamma0) +
                                      l * Math.sin(this.gamma0),
                                  Math.cos(this.bl * g)
                              )) /
                          this.bl);
        }
        return (
            this.no_rot
                ? ((a.x = this.x0 + b), (a.y = this.y0 + c))
                : ((b -= this.uc),
                  (a.x =
                      this.x0 +
                      c * Math.cos(this.alpha) +
                      b * Math.sin(this.alpha)),
                  (a.y =
                      this.y0 +
                      b * Math.cos(this.alpha) -
                      c * Math.sin(this.alpha))),
            a
        );
    }
    function wa(a) {
        var b, c;
        this.no_rot
            ? ((c = a.y - this.y0), (b = a.x - this.x0))
            : ((c =
                  (a.x - this.x0) * Math.cos(this.alpha) -
                  (a.y - this.y0) * Math.sin(this.alpha)),
              (b =
                  (a.y - this.y0) * Math.cos(this.alpha) +
                  (a.x - this.x0) * Math.sin(this.alpha)),
              (b += this.uc));
        var d = Math.exp((-1 * this.bl * c) / this.al),
            e = 0.5 * (d - 1 / d),
            f = 0.5 * (d + 1 / d),
            g = Math.sin((this.bl * b) / this.al),
            h = (g * Math.cos(this.gamma0) + e * Math.sin(this.gamma0)) / f,
            i = Math.pow(this.el / Math.sqrt((1 + h) / (1 - h)), 1 / this.bl);
        return (
            Math.abs(h - 1) < Mb
                ? ((a.x = this.long0), (a.y = Ib))
                : Math.abs(h + 1) < Mb
                ? ((a.x = this.long0), (a.y = -1 * Ib))
                : ((a.y = nc(this.e, i)),
                  (a.x = lc(
                      this.long0 -
                          Math.atan2(
                              e * Math.cos(this.gamma0) -
                                  g * Math.sin(this.gamma0),
                              Math.cos((this.bl * b) / this.al)
                          ) /
                              this.bl
                  ))),
            a
        );
    }
    function xa() {
        if (
            (this.lat2 || (this.lat2 = this.lat1),
            this.k0 || (this.k0 = 1),
            (this.x0 = this.x0 || 0),
            (this.y0 = this.y0 || 0),
            !(Math.abs(this.lat1 + this.lat2) < Mb))
        ) {
            var a = this.b / this.a;
            this.e = Math.sqrt(1 - a * a);
            var b = Math.sin(this.lat1),
                c = Math.cos(this.lat1),
                d = jc(this.e, b, c),
                e = mc(this.e, this.lat1, b),
                f = Math.sin(this.lat2),
                g = Math.cos(this.lat2),
                h = jc(this.e, f, g),
                i = mc(this.e, this.lat2, f),
                j = mc(this.e, this.lat0, Math.sin(this.lat0));
            Math.abs(this.lat1 - this.lat2) > Mb
                ? (this.ns = Math.log(d / h) / Math.log(e / i))
                : (this.ns = b),
                isNaN(this.ns) && (this.ns = b),
                (this.f0 = d / (this.ns * Math.pow(e, this.ns))),
                (this.rh = this.a * this.f0 * Math.pow(j, this.ns)),
                this.title || (this.title = "Lambert Conformal Conic");
        }
    }
    function ya(a) {
        var b = a.x,
            c = a.y;
        Math.abs(2 * Math.abs(c) - Math.PI) <= Mb &&
            (c = kc(c) * (Ib - 2 * Mb));
        var d,
            e,
            f = Math.abs(Math.abs(c) - Ib);
        if (f > Mb)
            (d = mc(this.e, c, Math.sin(c))),
                (e = this.a * this.f0 * Math.pow(d, this.ns));
        else {
            if (((f = c * this.ns), 0 >= f)) return null;
            e = 0;
        }
        var g = this.ns * lc(b - this.long0);
        return (
            (a.x = this.k0 * (e * Math.sin(g)) + this.x0),
            (a.y = this.k0 * (this.rh - e * Math.cos(g)) + this.y0),
            a
        );
    }
    function za(a) {
        var b,
            c,
            d,
            e,
            f,
            g = (a.x - this.x0) / this.k0,
            h = this.rh - (a.y - this.y0) / this.k0;
        this.ns > 0
            ? ((b = Math.sqrt(g * g + h * h)), (c = 1))
            : ((b = -Math.sqrt(g * g + h * h)), (c = -1));
        var i = 0;
        if (
            (0 !== b && (i = Math.atan2(c * g, c * h)), 0 !== b || this.ns > 0)
        ) {
            if (
                ((c = 1 / this.ns),
                (d = Math.pow(b / (this.a * this.f0), c)),
                (e = nc(this.e, d)),
                -9999 === e)
            )
                return null;
        } else e = -Ib;
        return (f = lc(i / this.ns + this.long0)), (a.x = f), (a.y = e), a;
    }
    function Aa() {
        (this.a = 6377397.155),
            (this.es = 0.006674372230614),
            (this.e = Math.sqrt(this.es)),
            this.lat0 || (this.lat0 = 0.863937979737193),
            this.long0 || (this.long0 = 0.4334234309119251),
            this.k0 || (this.k0 = 0.9999),
            (this.s45 = 0.785398163397448),
            (this.s90 = 2 * this.s45),
            (this.fi0 = this.lat0),
            (this.e2 = this.es),
            (this.e = Math.sqrt(this.e2)),
            (this.alfa = Math.sqrt(
                1 + (this.e2 * Math.pow(Math.cos(this.fi0), 4)) / (1 - this.e2)
            )),
            (this.uq = 1.04216856380474),
            (this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa)),
            (this.g = Math.pow(
                (1 + this.e * Math.sin(this.fi0)) /
                    (1 - this.e * Math.sin(this.fi0)),
                (this.alfa * this.e) / 2
            )),
            (this.k =
                (Math.tan(this.u0 / 2 + this.s45) /
                    Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa)) *
                this.g),
            (this.k1 = this.k0),
            (this.n0 =
                (this.a * Math.sqrt(1 - this.e2)) /
                (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2))),
            (this.s0 = 1.37008346281555),
            (this.n = Math.sin(this.s0)),
            (this.ro0 = (this.k1 * this.n0) / Math.tan(this.s0)),
            (this.ad = this.s90 - this.uq);
    }
    function Ba(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i = a.x,
            j = a.y,
            k = lc(i - this.long0);
        return (
            (b = Math.pow(
                (1 + this.e * Math.sin(j)) / (1 - this.e * Math.sin(j)),
                (this.alfa * this.e) / 2
            )),
            (c =
                2 *
                (Math.atan(
                    (this.k * Math.pow(Math.tan(j / 2 + this.s45), this.alfa)) /
                        b
                ) -
                    this.s45)),
            (d = -k * this.alfa),
            (e = Math.asin(
                Math.cos(this.ad) * Math.sin(c) +
                    Math.sin(this.ad) * Math.cos(c) * Math.cos(d)
            )),
            (f = Math.asin((Math.cos(c) * Math.sin(d)) / Math.cos(e))),
            (g = this.n * f),
            (h =
                (this.ro0 *
                    Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n)) /
                Math.pow(Math.tan(e / 2 + this.s45), this.n)),
            (a.y = (h * Math.cos(g)) / 1),
            (a.x = (h * Math.sin(g)) / 1),
            this.czech || ((a.y *= -1), (a.x *= -1)),
            a
        );
    }
    function Ca(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j = a.x;
        (a.x = a.y),
            (a.y = j),
            this.czech || ((a.y *= -1), (a.x *= -1)),
            (g = Math.sqrt(a.x * a.x + a.y * a.y)),
            (f = Math.atan2(a.y, a.x)),
            (e = f / Math.sin(this.s0)),
            (d =
                2 *
                (Math.atan(
                    Math.pow(this.ro0 / g, 1 / this.n) *
                        Math.tan(this.s0 / 2 + this.s45)
                ) -
                    this.s45)),
            (b = Math.asin(
                Math.cos(this.ad) * Math.sin(d) -
                    Math.sin(this.ad) * Math.cos(d) * Math.cos(e)
            )),
            (c = Math.asin((Math.cos(d) * Math.sin(e)) / Math.cos(b))),
            (a.x = this.long0 - c / this.alfa),
            (h = b),
            (i = 0);
        var k = 0;
        do
            (a.y =
                2 *
                (Math.atan(
                    Math.pow(this.k, -1 / this.alfa) *
                        Math.pow(Math.tan(b / 2 + this.s45), 1 / this.alfa) *
                        Math.pow(
                            (1 + this.e * Math.sin(h)) /
                                (1 - this.e * Math.sin(h)),
                            this.e / 2
                        )
                ) -
                    this.s45)),
                Math.abs(h - a.y) < 1e-10 && (i = 1),
                (h = a.y),
                (k += 1);
        while (0 === i && 15 > k);
        return k >= 15 ? null : a;
    }
    function Da() {
        this.sphere ||
            ((this.e0 = Jd(this.es)),
            (this.e1 = Kd(this.es)),
            (this.e2 = Ld(this.es)),
            (this.e3 = Md(this.es)),
            (this.ml0 =
                this.a * Id(this.e0, this.e1, this.e2, this.e3, this.lat0)));
    }
    function Ea(a) {
        var b,
            c,
            d = a.x,
            e = a.y;
        if (((d = lc(d - this.long0)), this.sphere))
            (b = this.a * Math.asin(Math.cos(e) * Math.sin(d))),
                (c =
                    this.a *
                    (Math.atan2(Math.tan(e), Math.cos(d)) - this.lat0));
        else {
            var f = Math.sin(e),
                g = Math.cos(e),
                h = Nd(this.a, this.e, f),
                i = Math.tan(e) * Math.tan(e),
                j = d * Math.cos(e),
                k = j * j,
                l = (this.es * g * g) / (1 - this.es),
                m = this.a * Id(this.e0, this.e1, this.e2, this.e3, e);
            (b = h * j * (1 - k * i * (1 / 6 - ((8 - i + 8 * l) * k) / 120))),
                (c =
                    m -
                    this.ml0 +
                    ((h * f) / g) * k * (0.5 + ((5 - i + 6 * l) * k) / 24));
        }
        return (a.x = b + this.x0), (a.y = c + this.y0), a;
    }
    function Fa(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b,
            c,
            d = a.x / this.a,
            e = a.y / this.a;
        if (this.sphere) {
            var f = e + this.lat0;
            (b = Math.asin(Math.sin(f) * Math.cos(d))),
                (c = Math.atan2(Math.tan(d), Math.cos(f)));
        } else {
            var g = this.ml0 / this.a + e,
                h = Pd(g, this.e0, this.e1, this.e2, this.e3);
            if (Math.abs(Math.abs(h) - Ib) <= Mb)
                return (a.x = this.long0), (a.y = Ib), 0 > e && (a.y *= -1), a;
            var i = Nd(this.a, this.e, Math.sin(h)),
                j = ((i * i * i) / this.a / this.a) * (1 - this.es),
                k = Math.pow(Math.tan(h), 2),
                l = (d * this.a) / i,
                m = l * l;
            (b =
                h -
                ((i * Math.tan(h)) / j) *
                    l *
                    l *
                    (0.5 - ((1 + 3 * k) * l * l) / 24)),
                (c =
                    (l * (1 - m * (k / 3 + ((1 + 3 * k) * k * m) / 15))) /
                    Math.cos(h));
        }
        return (a.x = lc(c + this.long0)), (a.y = Od(b)), a;
    }
    function Ga() {
        var a = Math.abs(this.lat0);
        if (
            (Math.abs(a - Ib) < Mb
                ? (this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE)
                : Math.abs(a) < Mb
                ? (this.mode = this.EQUIT)
                : (this.mode = this.OBLIQ),
            this.es > 0)
        ) {
            var b;
            switch (
                ((this.qp = Sd(this.e, 1)),
                (this.mmf = 0.5 / (1 - this.es)),
                (this.apa = Ja(this.es)),
                this.mode)
            ) {
                case this.N_POLE:
                    this.dd = 1;
                    break;
                case this.S_POLE:
                    this.dd = 1;
                    break;
                case this.EQUIT:
                    (this.rq = Math.sqrt(0.5 * this.qp)),
                        (this.dd = 1 / this.rq),
                        (this.xmf = 1),
                        (this.ymf = 0.5 * this.qp);
                    break;
                case this.OBLIQ:
                    (this.rq = Math.sqrt(0.5 * this.qp)),
                        (b = Math.sin(this.lat0)),
                        (this.sinb1 = Sd(this.e, b) / this.qp),
                        (this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1)),
                        (this.dd =
                            Math.cos(this.lat0) /
                            (Math.sqrt(1 - this.es * b * b) *
                                this.rq *
                                this.cosb1)),
                        (this.ymf = (this.xmf = this.rq) / this.dd),
                        (this.xmf *= this.dd);
            }
        } else this.mode === this.OBLIQ && ((this.sinph0 = Math.sin(this.lat0)), (this.cosph0 = Math.cos(this.lat0)));
    }
    function Ha(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l = a.x,
            m = a.y;
        if (((l = lc(l - this.long0)), this.sphere)) {
            if (
                ((f = Math.sin(m)),
                (k = Math.cos(m)),
                (d = Math.cos(l)),
                this.mode === this.OBLIQ || this.mode === this.EQUIT)
            ) {
                if (
                    ((c =
                        this.mode === this.EQUIT
                            ? 1 + k * d
                            : 1 + this.sinph0 * f + this.cosph0 * k * d),
                    Mb >= c)
                )
                    return null;
                (c = Math.sqrt(2 / c)),
                    (b = c * k * Math.sin(l)),
                    (c *=
                        this.mode === this.EQUIT
                            ? f
                            : this.cosph0 * f - this.sinph0 * k * d);
            } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                if (
                    (this.mode === this.N_POLE && (d = -d),
                    Math.abs(m + this.phi0) < Mb)
                )
                    return null;
                (c = Pb - 0.5 * m),
                    (c =
                        2 *
                        (this.mode === this.S_POLE
                            ? Math.cos(c)
                            : Math.sin(c))),
                    (b = c * Math.sin(l)),
                    (c *= d);
            }
        } else {
            switch (
                ((h = 0),
                (i = 0),
                (j = 0),
                (d = Math.cos(l)),
                (e = Math.sin(l)),
                (f = Math.sin(m)),
                (g = Sd(this.e, f)),
                (this.mode !== this.OBLIQ && this.mode !== this.EQUIT) ||
                    ((h = g / this.qp), (i = Math.sqrt(1 - h * h))),
                this.mode)
            ) {
                case this.OBLIQ:
                    j = 1 + this.sinb1 * h + this.cosb1 * i * d;
                    break;
                case this.EQUIT:
                    j = 1 + i * d;
                    break;
                case this.N_POLE:
                    (j = Ib + m), (g = this.qp - g);
                    break;
                case this.S_POLE:
                    (j = m - Ib), (g = this.qp + g);
            }
            if (Math.abs(j) < Mb) return null;
            switch (this.mode) {
                case this.OBLIQ:
                case this.EQUIT:
                    (j = Math.sqrt(2 / j)),
                        (c =
                            this.mode === this.OBLIQ
                                ? this.ymf *
                                  j *
                                  (this.cosb1 * h - this.sinb1 * i * d)
                                : (j = Math.sqrt(2 / (1 + i * d))) *
                                  h *
                                  this.ymf),
                        (b = this.xmf * j * i * e);
                    break;
                case this.N_POLE:
                case this.S_POLE:
                    g >= 0
                        ? ((b = (j = Math.sqrt(g)) * e),
                          (c = d * (this.mode === this.S_POLE ? j : -j)))
                        : (b = c = 0);
            }
        }
        return (a.x = this.a * b + this.x0), (a.y = this.a * c + this.y0), a;
    }
    function Ia(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i = a.x / this.a,
            j = a.y / this.a;
        if (this.sphere) {
            var k,
                l = 0,
                m = 0;
            if (((k = Math.sqrt(i * i + j * j)), (c = 0.5 * k), c > 1))
                return null;
            switch (
                ((c = 2 * Math.asin(c)),
                (this.mode !== this.OBLIQ && this.mode !== this.EQUIT) ||
                    ((m = Math.sin(c)), (l = Math.cos(c))),
                this.mode)
            ) {
                case this.EQUIT:
                    (c = Math.abs(k) <= Mb ? 0 : Math.asin((j * m) / k)),
                        (i *= m),
                        (j = l * k);
                    break;
                case this.OBLIQ:
                    (c =
                        Math.abs(k) <= Mb
                            ? this.phi0
                            : Math.asin(
                                  l * this.sinph0 + (j * m * this.cosph0) / k
                              )),
                        (i *= m * this.cosph0),
                        (j = (l - Math.sin(c) * this.sinph0) * k);
                    break;
                case this.N_POLE:
                    (j = -j), (c = Ib - c);
                    break;
                case this.S_POLE:
                    c -= Ib;
            }
            b =
                0 !== j ||
                (this.mode !== this.EQUIT && this.mode !== this.OBLIQ)
                    ? Math.atan2(i, j)
                    : 0;
        } else {
            if (
                ((h = 0), this.mode === this.OBLIQ || this.mode === this.EQUIT)
            ) {
                if (
                    ((i /= this.dd),
                    (j *= this.dd),
                    (g = Math.sqrt(i * i + j * j)),
                    Mb > g)
                )
                    return (a.x = 0), (a.y = this.phi0), a;
                (e = 2 * Math.asin((0.5 * g) / this.rq)),
                    (d = Math.cos(e)),
                    (i *= e = Math.sin(e)),
                    this.mode === this.OBLIQ
                        ? ((h = d * this.sinb1 + (j * e * this.cosb1) / g),
                          (f = this.qp * h),
                          (j = g * this.cosb1 * d - j * this.sinb1 * e))
                        : ((h = (j * e) / g), (f = this.qp * h), (j = g * d));
            } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                if (
                    (this.mode === this.N_POLE && (j = -j),
                    (f = i * i + j * j),
                    !f)
                )
                    return (a.x = 0), (a.y = this.phi0), a;
                (h = 1 - f / this.qp), this.mode === this.S_POLE && (h = -h);
            }
            (b = Math.atan2(i, j)), (c = Ka(Math.asin(h), this.apa));
        }
        return (a.x = lc(this.long0 + b)), (a.y = c), a;
    }
    function Ja(a) {
        var b,
            c = [];
        return (
            (c[0] = a * Xd),
            (b = a * a),
            (c[0] += b * Yd),
            (c[1] = b * $d),
            (b *= a),
            (c[0] += b * Zd),
            (c[1] += b * _d),
            (c[2] = b * ae),
            c
        );
    }
    function Ka(a, b) {
        var c = a + a;
        return (
            a +
            b[0] * Math.sin(c) +
            b[1] * Math.sin(c + c) +
            b[2] * Math.sin(c + c + c)
        );
    }
    function La() {
        Math.abs(this.lat1 + this.lat2) < Mb ||
            ((this.temp = this.b / this.a),
            (this.es = 1 - Math.pow(this.temp, 2)),
            (this.e3 = Math.sqrt(this.es)),
            (this.sin_po = Math.sin(this.lat1)),
            (this.cos_po = Math.cos(this.lat1)),
            (this.t1 = this.sin_po),
            (this.con = this.sin_po),
            (this.ms1 = jc(this.e3, this.sin_po, this.cos_po)),
            (this.qs1 = Sd(this.e3, this.sin_po, this.cos_po)),
            (this.sin_po = Math.sin(this.lat2)),
            (this.cos_po = Math.cos(this.lat2)),
            (this.t2 = this.sin_po),
            (this.ms2 = jc(this.e3, this.sin_po, this.cos_po)),
            (this.qs2 = Sd(this.e3, this.sin_po, this.cos_po)),
            (this.sin_po = Math.sin(this.lat0)),
            (this.cos_po = Math.cos(this.lat0)),
            (this.t3 = this.sin_po),
            (this.qs0 = Sd(this.e3, this.sin_po, this.cos_po)),
            Math.abs(this.lat1 - this.lat2) > Mb
                ? (this.ns0 =
                      (this.ms1 * this.ms1 - this.ms2 * this.ms2) /
                      (this.qs2 - this.qs1))
                : (this.ns0 = this.con),
            (this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1),
            (this.rh =
                (this.a * Math.sqrt(this.c - this.ns0 * this.qs0)) / this.ns0));
    }
    function Ma(a) {
        var b = a.x,
            c = a.y;
        (this.sin_phi = Math.sin(c)), (this.cos_phi = Math.cos(c));
        var d = Sd(this.e3, this.sin_phi, this.cos_phi),
            e = (this.a * Math.sqrt(this.c - this.ns0 * d)) / this.ns0,
            f = this.ns0 * lc(b - this.long0),
            g = e * Math.sin(f) + this.x0,
            h = this.rh - e * Math.cos(f) + this.y0;
        return (a.x = g), (a.y = h), a;
    }
    function Na(a) {
        var b, c, d, e, f, g;
        return (
            (a.x -= this.x0),
            (a.y = this.rh - a.y + this.y0),
            this.ns0 >= 0
                ? ((b = Math.sqrt(a.x * a.x + a.y * a.y)), (d = 1))
                : ((b = -Math.sqrt(a.x * a.x + a.y * a.y)), (d = -1)),
            (e = 0),
            0 !== b && (e = Math.atan2(d * a.x, d * a.y)),
            (d = (b * this.ns0) / this.a),
            this.sphere
                ? (g = Math.asin((this.c - d * d) / (2 * this.ns0)))
                : ((c = (this.c - d * d) / this.ns0),
                  (g = this.phi1z(this.e3, c))),
            (f = lc(e / this.ns0 + this.long0)),
            (a.x = f),
            (a.y = g),
            a
        );
    }
    function Oa(a, b) {
        var c,
            d,
            e,
            f,
            g,
            h = de(0.5 * b);
        if (Mb > a) return h;
        for (var i = a * a, j = 1; 25 >= j; j++)
            if (
                ((c = Math.sin(h)),
                (d = Math.cos(h)),
                (e = a * c),
                (f = 1 - e * e),
                (g =
                    ((0.5 * f * f) / d) *
                    (b / (1 - i) -
                        c / f +
                        (0.5 / a) * Math.log((1 - e) / (1 + e)))),
                (h += g),
                Math.abs(g) <= 1e-7)
            )
                return h;
        return null;
    }
    function Pa() {
        (this.sin_p14 = Math.sin(this.lat0)),
            (this.cos_p14 = Math.cos(this.lat0)),
            (this.infinity_dist = 1e3 * this.a),
            (this.rc = 1);
    }
    function Qa(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j = a.x,
            k = a.y;
        return (
            (d = lc(j - this.long0)),
            (b = Math.sin(k)),
            (c = Math.cos(k)),
            (e = Math.cos(d)),
            (g = this.sin_p14 * b + this.cos_p14 * c * e),
            (f = 1),
            g > 0 || Math.abs(g) <= Mb
                ? ((h = this.x0 + (this.a * f * c * Math.sin(d)) / g),
                  (i =
                      this.y0 +
                      (this.a * f * (this.cos_p14 * b - this.sin_p14 * c * e)) /
                          g))
                : ((h = this.x0 + this.infinity_dist * c * Math.sin(d)),
                  (i =
                      this.y0 +
                      this.infinity_dist *
                          (this.cos_p14 * b - this.sin_p14 * c * e))),
            (a.x = h),
            (a.y = i),
            a
        );
    }
    function Ra(a) {
        var b, c, d, e, f, g;
        return (
            (a.x = (a.x - this.x0) / this.a),
            (a.y = (a.y - this.y0) / this.a),
            (a.x /= this.k0),
            (a.y /= this.k0),
            (b = Math.sqrt(a.x * a.x + a.y * a.y))
                ? ((e = Math.atan2(b, this.rc)),
                  (c = Math.sin(e)),
                  (d = Math.cos(e)),
                  (g = de(d * this.sin_p14 + (a.y * c * this.cos_p14) / b)),
                  (f = Math.atan2(
                      a.x * c,
                      b * this.cos_p14 * d - a.y * this.sin_p14 * c
                  )),
                  (f = lc(this.long0 + f)))
                : ((g = this.phic0), (f = 0)),
            (a.x = f),
            (a.y = g),
            a
        );
    }
    function Sa() {
        this.sphere ||
            (this.k0 = jc(
                this.e,
                Math.sin(this.lat_ts),
                Math.cos(this.lat_ts)
            ));
    }
    function Ta(a) {
        var b,
            c,
            d = a.x,
            e = a.y,
            f = lc(d - this.long0);
        if (this.sphere)
            (b = this.x0 + this.a * f * Math.cos(this.lat_ts)),
                (c = this.y0 + (this.a * Math.sin(e)) / Math.cos(this.lat_ts));
        else {
            var g = Sd(this.e, Math.sin(e));
            (b = this.x0 + this.a * this.k0 * f),
                (c = this.y0 + (this.a * g * 0.5) / this.k0);
        }
        return (a.x = b), (a.y = c), a;
    }
    function Ua(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b, c;
        return (
            this.sphere
                ? ((b = lc(this.long0 + a.x / this.a / Math.cos(this.lat_ts))),
                  (c = Math.asin((a.y / this.a) * Math.cos(this.lat_ts))))
                : ((c = ie(this.e, (2 * a.y * this.k0) / this.a)),
                  (b = lc(this.long0 + a.x / (this.a * this.k0)))),
            (a.x = b),
            (a.y = c),
            a
        );
    }
    function Va() {
        (this.x0 = this.x0 || 0),
            (this.y0 = this.y0 || 0),
            (this.lat0 = this.lat0 || 0),
            (this.long0 = this.long0 || 0),
            (this.lat_ts = this.lat_ts || 0),
            (this.title =
                this.title || "Equidistant Cylindrical (Plate Carre)"),
            (this.rc = Math.cos(this.lat_ts));
    }
    function Wa(a) {
        var b = a.x,
            c = a.y,
            d = lc(b - this.long0),
            e = Od(c - this.lat0);
        return (
            (a.x = this.x0 + this.a * d * this.rc),
            (a.y = this.y0 + this.a * e),
            a
        );
    }
    function Xa(a) {
        var b = a.x,
            c = a.y;
        return (
            (a.x = lc(this.long0 + (b - this.x0) / (this.a * this.rc))),
            (a.y = Od(this.lat0 + (c - this.y0) / this.a)),
            a
        );
    }
    function Ya() {
        (this.temp = this.b / this.a),
            (this.es = 1 - Math.pow(this.temp, 2)),
            (this.e = Math.sqrt(this.es)),
            (this.e0 = Jd(this.es)),
            (this.e1 = Kd(this.es)),
            (this.e2 = Ld(this.es)),
            (this.e3 = Md(this.es)),
            (this.ml0 =
                this.a * Id(this.e0, this.e1, this.e2, this.e3, this.lat0));
    }
    function Za(a) {
        var b,
            c,
            d,
            e = a.x,
            f = a.y,
            g = lc(e - this.long0);
        if (((d = g * Math.sin(f)), this.sphere))
            Math.abs(f) <= Mb
                ? ((b = this.a * g), (c = -1 * this.a * this.lat0))
                : ((b = (this.a * Math.sin(d)) / Math.tan(f)),
                  (c =
                      this.a *
                      (Od(f - this.lat0) + (1 - Math.cos(d)) / Math.tan(f))));
        else if (Math.abs(f) <= Mb) (b = this.a * g), (c = -1 * this.ml0);
        else {
            var h = Nd(this.a, this.e, Math.sin(f)) / Math.tan(f);
            (b = h * Math.sin(d)),
                (c =
                    this.a * Id(this.e0, this.e1, this.e2, this.e3, f) -
                    this.ml0 +
                    h * (1 - Math.cos(d)));
        }
        return (a.x = b + this.x0), (a.y = c + this.y0), a;
    }
    function $a(a) {
        var b, c, d, e, f, g, h, i, j;
        if (((d = a.x - this.x0), (e = a.y - this.y0), this.sphere))
            if (Math.abs(e + this.a * this.lat0) <= Mb)
                (b = lc(d / this.a + this.long0)), (c = 0);
            else {
                (g = this.lat0 + e / this.a),
                    (h = (d * d) / this.a / this.a + g * g),
                    (i = g);
                var k;
                for (f = ne; f; --f)
                    if (
                        ((k = Math.tan(i)),
                        (j =
                            (-1 *
                                (g * (i * k + 1) - i - 0.5 * (i * i + h) * k)) /
                            ((i - g) / k - 1)),
                        (i += j),
                        Math.abs(j) <= Mb)
                    ) {
                        c = i;
                        break;
                    }
                b = lc(
                    this.long0 +
                        Math.asin((d * Math.tan(i)) / this.a) / Math.sin(c)
                );
            }
        else if (Math.abs(e + this.ml0) <= Mb)
            (c = 0), (b = lc(this.long0 + d / this.a));
        else {
            (g = (this.ml0 + e) / this.a),
                (h = (d * d) / this.a / this.a + g * g),
                (i = g);
            var l, m, n, o, p;
            for (f = ne; f; --f)
                if (
                    ((p = this.e * Math.sin(i)),
                    (l = Math.sqrt(1 - p * p) * Math.tan(i)),
                    (m = this.a * Id(this.e0, this.e1, this.e2, this.e3, i)),
                    (n =
                        this.e0 -
                        2 * this.e1 * Math.cos(2 * i) +
                        4 * this.e2 * Math.cos(4 * i) -
                        6 * this.e3 * Math.cos(6 * i)),
                    (o = m / this.a),
                    (j =
                        (g * (l * o + 1) - o - 0.5 * l * (o * o + h)) /
                        ((this.es * Math.sin(2 * i) * (o * o + h - 2 * g * o)) /
                            (4 * l) +
                            (g - o) * (l * n - 2 / Math.sin(2 * i)) -
                            n)),
                    (i -= j),
                    Math.abs(j) <= Mb)
                ) {
                    c = i;
                    break;
                }
            (l =
                Math.sqrt(1 - this.es * Math.pow(Math.sin(c), 2)) *
                Math.tan(c)),
                (b = lc(
                    this.long0 + Math.asin((d * l) / this.a) / Math.sin(c)
                ));
        }
        return (a.x = b), (a.y = c), a;
    }
    function _a() {
        (this.A = []),
            (this.A[1] = 0.6399175073),
            (this.A[2] = -0.1358797613),
            (this.A[3] = 0.063294409),
            (this.A[4] = -0.02526853),
            (this.A[5] = 0.0117879),
            (this.A[6] = -0.0055161),
            (this.A[7] = 0.0026906),
            (this.A[8] = -0.001333),
            (this.A[9] = 67e-5),
            (this.A[10] = -34e-5),
            (this.B_re = []),
            (this.B_im = []),
            (this.B_re[1] = 0.7557853228),
            (this.B_im[1] = 0),
            (this.B_re[2] = 0.249204646),
            (this.B_im[2] = 0.003371507),
            (this.B_re[3] = -0.001541739),
            (this.B_im[3] = 0.04105856),
            (this.B_re[4] = -0.10162907),
            (this.B_im[4] = 0.01727609),
            (this.B_re[5] = -0.26623489),
            (this.B_im[5] = -0.36249218),
            (this.B_re[6] = -0.6870983),
            (this.B_im[6] = -1.1651967),
            (this.C_re = []),
            (this.C_im = []),
            (this.C_re[1] = 1.3231270439),
            (this.C_im[1] = 0),
            (this.C_re[2] = -0.577245789),
            (this.C_im[2] = -0.007809598),
            (this.C_re[3] = 0.508307513),
            (this.C_im[3] = -0.112208952),
            (this.C_re[4] = -0.15094762),
            (this.C_im[4] = 0.18200602),
            (this.C_re[5] = 1.01418179),
            (this.C_im[5] = 1.64497696),
            (this.C_re[6] = 1.9660549),
            (this.C_im[6] = 2.5127645),
            (this.D = []),
            (this.D[1] = 1.5627014243),
            (this.D[2] = 0.5185406398),
            (this.D[3] = -0.03333098),
            (this.D[4] = -0.1052906),
            (this.D[5] = -0.0368594),
            (this.D[6] = 0.007317),
            (this.D[7] = 0.0122),
            (this.D[8] = 0.00394),
            (this.D[9] = -0.0013);
    }
    function ab(a) {
        var b,
            c = a.x,
            d = a.y,
            e = d - this.lat0,
            f = c - this.long0,
            g = (e / Hb) * 1e-5,
            h = f,
            i = 1,
            j = 0;
        for (b = 1; 10 >= b; b++) (i *= g), (j += this.A[b] * i);
        var k,
            l,
            m = j,
            n = h,
            o = 1,
            p = 0,
            q = 0,
            r = 0;
        for (b = 1; 6 >= b; b++)
            (k = o * m - p * n),
                (l = p * m + o * n),
                (o = k),
                (p = l),
                (q = q + this.B_re[b] * o - this.B_im[b] * p),
                (r = r + this.B_im[b] * o + this.B_re[b] * p);
        return (a.x = r * this.a + this.x0), (a.y = q * this.a + this.y0), a;
    }
    function bb(a) {
        var b,
            c,
            d,
            e = a.x,
            f = a.y,
            g = e - this.x0,
            h = f - this.y0,
            i = h / this.a,
            j = g / this.a,
            k = 1,
            l = 0,
            m = 0,
            n = 0;
        for (b = 1; 6 >= b; b++)
            (c = k * i - l * j),
                (d = l * i + k * j),
                (k = c),
                (l = d),
                (m = m + this.C_re[b] * k - this.C_im[b] * l),
                (n = n + this.C_im[b] * k + this.C_re[b] * l);
        for (var o = 0; o < this.iterations; o++) {
            var p,
                q,
                r = m,
                s = n,
                t = i,
                u = j;
            for (b = 2; 6 >= b; b++)
                (p = r * m - s * n),
                    (q = s * m + r * n),
                    (r = p),
                    (s = q),
                    (t += (b - 1) * (this.B_re[b] * r - this.B_im[b] * s)),
                    (u += (b - 1) * (this.B_im[b] * r + this.B_re[b] * s));
            (r = 1), (s = 0);
            var v = this.B_re[1],
                w = this.B_im[1];
            for (b = 2; 6 >= b; b++)
                (p = r * m - s * n),
                    (q = s * m + r * n),
                    (r = p),
                    (s = q),
                    (v += b * (this.B_re[b] * r - this.B_im[b] * s)),
                    (w += b * (this.B_im[b] * r + this.B_re[b] * s));
            var x = v * v + w * w;
            (m = (t * v + u * w) / x), (n = (u * v - t * w) / x);
        }
        var y = m,
            z = n,
            A = 1,
            B = 0;
        for (b = 1; 9 >= b; b++) (A *= y), (B += this.D[b] * A);
        var C = this.lat0 + B * Hb * 1e5,
            D = this.long0 + z;
        return (a.x = D), (a.y = C), a;
    }
    function cb() {}
    function db(a) {
        var b = a.x,
            c = a.y,
            d = lc(b - this.long0),
            e = this.x0 + this.a * d,
            f =
                this.y0 +
                this.a * Math.log(Math.tan(Math.PI / 4 + c / 2.5)) * 1.25;
        return (a.x = e), (a.y = f), a;
    }
    function eb(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b = lc(this.long0 + a.x / this.a),
            c = 2.5 * (Math.atan(Math.exp((0.8 * a.y) / this.a)) - Math.PI / 4);
        return (a.x = b), (a.y = c), a;
    }
    function fb() {
        this.sphere
            ? ((this.n = 1),
              (this.m = 0),
              (this.es = 0),
              (this.C_y = Math.sqrt((this.m + 1) / this.n)),
              (this.C_x = this.C_y / (this.m + 1)))
            : (this.en = $c(this.es));
    }
    function gb(a) {
        var b,
            c,
            d = a.x,
            e = a.y;
        if (((d = lc(d - this.long0)), this.sphere)) {
            if (this.m)
                for (var f = this.n * Math.sin(e), g = ue; g; --g) {
                    var h =
                        (this.m * e + Math.sin(e) - f) / (this.m + Math.cos(e));
                    if (((e -= h), Math.abs(h) < Mb)) break;
                }
            else e = 1 !== this.n ? Math.asin(this.n * Math.sin(e)) : e;
            (b = this.a * this.C_x * d * (this.m + Math.cos(e))),
                (c = this.a * this.C_y * e);
        } else {
            var i = Math.sin(e),
                j = Math.cos(e);
            (c = this.a * _c(e, i, j, this.en)),
                (b = (this.a * d * j) / Math.sqrt(1 - this.es * i * i));
        }
        return (a.x = b), (a.y = c), a;
    }
    function hb(a) {
        var b, c, d, e;
        return (
            (a.x -= this.x0),
            (d = a.x / this.a),
            (a.y -= this.y0),
            (b = a.y / this.a),
            this.sphere
                ? ((b /= this.C_y),
                  (d /= this.C_x * (this.m + Math.cos(b))),
                  this.m
                      ? (b = de((this.m * b + Math.sin(b)) / this.n))
                      : 1 !== this.n && (b = de(Math.sin(b) / this.n)),
                  (d = lc(d + this.long0)),
                  (b = Od(b)))
                : ((b = bd(a.y / this.a, this.es, this.en)),
                  (e = Math.abs(b)),
                  Ib > e
                      ? ((e = Math.sin(b)),
                        (c =
                            this.long0 +
                            (a.x * Math.sqrt(1 - this.es * e * e)) /
                                (this.a * Math.cos(b))),
                        (d = lc(c)))
                      : Ib > e - Mb && (d = this.long0)),
            (a.x = d),
            (a.y = b),
            a
        );
    }
    function ib() {}
    function jb(a) {
        for (
            var b = a.x,
                c = a.y,
                d = lc(b - this.long0),
                e = c,
                f = Math.PI * Math.sin(c);
            ;

        ) {
            var g = -(e + Math.sin(e) - f) / (1 + Math.cos(e));
            if (((e += g), Math.abs(g) < Mb)) break;
        }
        (e /= 2), Math.PI / 2 - Math.abs(c) < Mb && (d = 0);
        var h = 0.900316316158 * this.a * d * Math.cos(e) + this.x0,
            i = 1.4142135623731 * this.a * Math.sin(e) + this.y0;
        return (a.x = h), (a.y = i), a;
    }
    function kb(a) {
        var b, c;
        (a.x -= this.x0),
            (a.y -= this.y0),
            (c = a.y / (1.4142135623731 * this.a)),
            Math.abs(c) > 0.999999999999 && (c = 0.999999999999),
            (b = Math.asin(c));
        var d = lc(this.long0 + a.x / (0.900316316158 * this.a * Math.cos(b)));
        d < -Math.PI && (d = -Math.PI),
            d > Math.PI && (d = Math.PI),
            (c = (2 * b + Math.sin(2 * b)) / Math.PI),
            Math.abs(c) > 1 && (c = 1);
        var e = Math.asin(c);
        return (a.x = d), (a.y = e), a;
    }
    function lb() {
        Math.abs(this.lat1 + this.lat2) < Mb ||
            ((this.lat2 = this.lat2 || this.lat1),
            (this.temp = this.b / this.a),
            (this.es = 1 - Math.pow(this.temp, 2)),
            (this.e = Math.sqrt(this.es)),
            (this.e0 = Jd(this.es)),
            (this.e1 = Kd(this.es)),
            (this.e2 = Ld(this.es)),
            (this.e3 = Md(this.es)),
            (this.sinphi = Math.sin(this.lat1)),
            (this.cosphi = Math.cos(this.lat1)),
            (this.ms1 = jc(this.e, this.sinphi, this.cosphi)),
            (this.ml1 = Id(this.e0, this.e1, this.e2, this.e3, this.lat1)),
            Math.abs(this.lat1 - this.lat2) < Mb
                ? (this.ns = this.sinphi)
                : ((this.sinphi = Math.sin(this.lat2)),
                  (this.cosphi = Math.cos(this.lat2)),
                  (this.ms2 = jc(this.e, this.sinphi, this.cosphi)),
                  (this.ml2 = Id(
                      this.e0,
                      this.e1,
                      this.e2,
                      this.e3,
                      this.lat2
                  )),
                  (this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1))),
            (this.g = this.ml1 + this.ms1 / this.ns),
            (this.ml0 = Id(this.e0, this.e1, this.e2, this.e3, this.lat0)),
            (this.rh = this.a * (this.g - this.ml0)));
    }
    function mb(a) {
        var b,
            c = a.x,
            d = a.y;
        if (this.sphere) b = this.a * (this.g - d);
        else {
            var e = Id(this.e0, this.e1, this.e2, this.e3, d);
            b = this.a * (this.g - e);
        }
        var f = this.ns * lc(c - this.long0),
            g = this.x0 + b * Math.sin(f),
            h = this.y0 + this.rh - b * Math.cos(f);
        return (a.x = g), (a.y = h), a;
    }
    function nb(a) {
        (a.x -= this.x0), (a.y = this.rh - a.y + this.y0);
        var b, c, d, e;
        this.ns >= 0
            ? ((c = Math.sqrt(a.x * a.x + a.y * a.y)), (b = 1))
            : ((c = -Math.sqrt(a.x * a.x + a.y * a.y)), (b = -1));
        var f = 0;
        if ((0 !== c && (f = Math.atan2(b * a.x, b * a.y)), this.sphere))
            return (
                (e = lc(this.long0 + f / this.ns)),
                (d = Od(this.g - c / this.a)),
                (a.x = e),
                (a.y = d),
                a
            );
        var g = this.g - c / this.a;
        return (
            (d = Pd(g, this.e0, this.e1, this.e2, this.e3)),
            (e = lc(this.long0 + f / this.ns)),
            (a.x = e),
            (a.y = d),
            a
        );
    }
    function ob() {
        this.R = this.a;
    }
    function pb(a) {
        var b,
            c,
            d = a.x,
            e = a.y,
            f = lc(d - this.long0);
        Math.abs(e) <= Mb && ((b = this.x0 + this.R * f), (c = this.y0));
        var g = de(2 * Math.abs(e / Math.PI));
        (Math.abs(f) <= Mb || Math.abs(Math.abs(e) - Ib) <= Mb) &&
            ((b = this.x0),
            (c =
                e >= 0
                    ? this.y0 + Math.PI * this.R * Math.tan(0.5 * g)
                    : this.y0 + Math.PI * this.R * -Math.tan(0.5 * g)));
        var h = 0.5 * Math.abs(Math.PI / f - f / Math.PI),
            i = h * h,
            j = Math.sin(g),
            k = Math.cos(g),
            l = k / (j + k - 1),
            m = l * l,
            n = l * (2 / j - 1),
            o = n * n,
            p =
                (Math.PI *
                    this.R *
                    (h * (l - o) +
                        Math.sqrt(i * (l - o) * (l - o) - (o + i) * (m - o)))) /
                (o + i);
        0 > f && (p = -p), (b = this.x0 + p);
        var q = i + l;
        return (
            (p =
                (Math.PI *
                    this.R *
                    (n * q - h * Math.sqrt((o + i) * (i + 1) - q * q))) /
                (o + i)),
            (c = e >= 0 ? this.y0 + p : this.y0 - p),
            (a.x = b),
            (a.y = c),
            a
        );
    }
    function qb(a) {
        var b, c, d, e, f, g, h, i, j, k, l, m, n;
        return (
            (a.x -= this.x0),
            (a.y -= this.y0),
            (l = Math.PI * this.R),
            (d = a.x / l),
            (e = a.y / l),
            (f = d * d + e * e),
            (g = -Math.abs(e) * (1 + f)),
            (h = g - 2 * e * e + d * d),
            (i = -2 * g + 1 + 2 * e * e + f * f),
            (n =
                (e * e) / i +
                ((2 * h * h * h) / i / i / i - (9 * g * h) / i / i) / 27),
            (j = (g - (h * h) / 3 / i) / i),
            (k = 2 * Math.sqrt(-j / 3)),
            (l = (3 * n) / j / k),
            Math.abs(l) > 1 && (l = l >= 0 ? 1 : -1),
            (m = Math.acos(l) / 3),
            (c =
                a.y >= 0
                    ? (-k * Math.cos(m + Math.PI / 3) - h / 3 / i) * Math.PI
                    : -(-k * Math.cos(m + Math.PI / 3) - h / 3 / i) * Math.PI),
            (b =
                Math.abs(d) < Mb
                    ? this.long0
                    : lc(
                          this.long0 +
                              (Math.PI *
                                  (f -
                                      1 +
                                      Math.sqrt(
                                          1 + 2 * (d * d - e * e) + f * f
                                      ))) /
                                  2 /
                                  d
                      )),
            (a.x = b),
            (a.y = c),
            a
        );
    }
    function rb() {
        (this.sin_p12 = Math.sin(this.lat0)),
            (this.cos_p12 = Math.cos(this.lat0));
    }
    function sb(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            t,
            u,
            v,
            w,
            x,
            y = a.x,
            z = a.y,
            A = Math.sin(a.y),
            B = Math.cos(a.y),
            C = lc(y - this.long0);
        return this.sphere
            ? Math.abs(this.sin_p12 - 1) <= Mb
                ? ((a.x = this.x0 + this.a * (Ib - z) * Math.sin(C)),
                  (a.y = this.y0 - this.a * (Ib - z) * Math.cos(C)),
                  a)
                : Math.abs(this.sin_p12 + 1) <= Mb
                ? ((a.x = this.x0 + this.a * (Ib + z) * Math.sin(C)),
                  (a.y = this.y0 + this.a * (Ib + z) * Math.cos(C)),
                  a)
                : ((s = this.sin_p12 * A + this.cos_p12 * B * Math.cos(C)),
                  (q = Math.acos(s)),
                  (r = q / Math.sin(q)),
                  (a.x = this.x0 + this.a * r * B * Math.sin(C)),
                  (a.y =
                      this.y0 +
                      this.a *
                          r *
                          (this.cos_p12 * A - this.sin_p12 * B * Math.cos(C))),
                  a)
            : ((b = Jd(this.es)),
              (c = Kd(this.es)),
              (d = Ld(this.es)),
              (e = Md(this.es)),
              Math.abs(this.sin_p12 - 1) <= Mb
                  ? ((f = this.a * Id(b, c, d, e, Ib)),
                    (g = this.a * Id(b, c, d, e, z)),
                    (a.x = this.x0 + (f - g) * Math.sin(C)),
                    (a.y = this.y0 - (f - g) * Math.cos(C)),
                    a)
                  : Math.abs(this.sin_p12 + 1) <= Mb
                  ? ((f = this.a * Id(b, c, d, e, Ib)),
                    (g = this.a * Id(b, c, d, e, z)),
                    (a.x = this.x0 + (f + g) * Math.sin(C)),
                    (a.y = this.y0 + (f + g) * Math.cos(C)),
                    a)
                  : ((h = A / B),
                    (i = Nd(this.a, this.e, this.sin_p12)),
                    (j = Nd(this.a, this.e, A)),
                    (k = Math.atan(
                        (1 - this.es) * h +
                            (this.es * i * this.sin_p12) / (j * B)
                    )),
                    (l = Math.atan2(
                        Math.sin(C),
                        this.cos_p12 * Math.tan(k) - this.sin_p12 * Math.cos(C)
                    )),
                    (t =
                        0 === l
                            ? Math.asin(
                                  this.cos_p12 * Math.sin(k) -
                                      this.sin_p12 * Math.cos(k)
                              )
                            : Math.abs(Math.abs(l) - Math.PI) <= Mb
                            ? -Math.asin(
                                  this.cos_p12 * Math.sin(k) -
                                      this.sin_p12 * Math.cos(k)
                              )
                            : Math.asin(
                                  (Math.sin(C) * Math.cos(k)) / Math.sin(l)
                              )),
                    (m = (this.e * this.sin_p12) / Math.sqrt(1 - this.es)),
                    (n =
                        (this.e * this.cos_p12 * Math.cos(l)) /
                        Math.sqrt(1 - this.es)),
                    (o = m * n),
                    (p = n * n),
                    (u = t * t),
                    (v = u * t),
                    (w = v * t),
                    (x = w * t),
                    (q =
                        i *
                        t *
                        (1 -
                            (u * p * (1 - p)) / 6 +
                            (v / 8) * o * (1 - 2 * p) +
                            (w / 120) *
                                (p * (4 - 7 * p) - 3 * m * m * (1 - 7 * p)) -
                            (x / 48) * o)),
                    (a.x = this.x0 + q * Math.sin(l)),
                    (a.y = this.y0 + q * Math.cos(l)),
                    a));
    }
    function tb(a) {
        (a.x -= this.x0), (a.y -= this.y0);
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x;
        if (this.sphere) {
            if (((b = Math.sqrt(a.x * a.x + a.y * a.y)), b > 2 * Ib * this.a))
                return;
            return (
                (c = b / this.a),
                (d = Math.sin(c)),
                (e = Math.cos(c)),
                (f = this.long0),
                Math.abs(b) <= Mb
                    ? (g = this.lat0)
                    : ((g = de(
                          e * this.sin_p12 + (a.y * d * this.cos_p12) / b
                      )),
                      (h = Math.abs(this.lat0) - Ib),
                      (f = lc(
                          Math.abs(h) <= Mb
                              ? this.lat0 >= 0
                                  ? this.long0 + Math.atan2(a.x, -a.y)
                                  : this.long0 - Math.atan2(-a.x, a.y)
                              : this.long0 +
                                    Math.atan2(
                                        a.x * d,
                                        b * this.cos_p12 * e -
                                            a.y * this.sin_p12 * d
                                    )
                      ))),
                (a.x = f),
                (a.y = g),
                a
            );
        }
        return (
            (i = Jd(this.es)),
            (j = Kd(this.es)),
            (k = Ld(this.es)),
            (l = Md(this.es)),
            Math.abs(this.sin_p12 - 1) <= Mb
                ? ((m = this.a * Id(i, j, k, l, Ib)),
                  (b = Math.sqrt(a.x * a.x + a.y * a.y)),
                  (n = m - b),
                  (g = Pd(n / this.a, i, j, k, l)),
                  (f = lc(this.long0 + Math.atan2(a.x, -1 * a.y))),
                  (a.x = f),
                  (a.y = g),
                  a)
                : Math.abs(this.sin_p12 + 1) <= Mb
                ? ((m = this.a * Id(i, j, k, l, Ib)),
                  (b = Math.sqrt(a.x * a.x + a.y * a.y)),
                  (n = b - m),
                  (g = Pd(n / this.a, i, j, k, l)),
                  (f = lc(this.long0 + Math.atan2(a.x, a.y))),
                  (a.x = f),
                  (a.y = g),
                  a)
                : ((b = Math.sqrt(a.x * a.x + a.y * a.y)),
                  (q = Math.atan2(a.x, a.y)),
                  (o = Nd(this.a, this.e, this.sin_p12)),
                  (r = Math.cos(q)),
                  (s = this.e * this.cos_p12 * r),
                  (t = (-s * s) / (1 - this.es)),
                  (u =
                      (3 *
                          this.es *
                          (1 - t) *
                          this.sin_p12 *
                          this.cos_p12 *
                          r) /
                      (1 - this.es)),
                  (v = b / o),
                  (w =
                      v -
                      (t * (1 + t) * Math.pow(v, 3)) / 6 -
                      (u * (1 + 3 * t) * Math.pow(v, 4)) / 24),
                  (x = 1 - (t * w * w) / 2 - (v * w * w * w) / 6),
                  (p = Math.asin(
                      this.sin_p12 * Math.cos(w) +
                          this.cos_p12 * Math.sin(w) * r
                  )),
                  (f = lc(
                      this.long0 +
                          Math.asin((Math.sin(q) * Math.sin(w)) / Math.cos(p))
                  )),
                  (g = Math.atan(
                      ((1 - (this.es * x * this.sin_p12) / Math.sin(p)) *
                          Math.tan(p)) /
                          (1 - this.es)
                  )),
                  (a.x = f),
                  (a.y = g),
                  a)
        );
    }
    function ub() {
        (this.sin_p14 = Math.sin(this.lat0)),
            (this.cos_p14 = Math.cos(this.lat0));
    }
    function vb(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j = a.x,
            k = a.y;
        return (
            (d = lc(j - this.long0)),
            (b = Math.sin(k)),
            (c = Math.cos(k)),
            (e = Math.cos(d)),
            (g = this.sin_p14 * b + this.cos_p14 * c * e),
            (f = 1),
            (g > 0 || Math.abs(g) <= Mb) &&
                ((h = this.a * f * c * Math.sin(d)),
                (i =
                    this.y0 +
                    this.a * f * (this.cos_p14 * b - this.sin_p14 * c * e))),
            (a.x = h),
            (a.y = i),
            a
        );
    }
    function wb(a) {
        var b, c, d, e, f, g, h;
        return (
            (a.x -= this.x0),
            (a.y -= this.y0),
            (b = Math.sqrt(a.x * a.x + a.y * a.y)),
            (c = de(b / this.a)),
            (d = Math.sin(c)),
            (e = Math.cos(c)),
            (g = this.long0),
            Math.abs(b) <= Mb
                ? ((h = this.lat0), (a.x = g), (a.y = h), a)
                : ((h = de(e * this.sin_p14 + (a.y * d * this.cos_p14) / b)),
                  (f = Math.abs(this.lat0) - Ib),
                  Math.abs(f) <= Mb
                      ? ((g = lc(
                            this.lat0 >= 0
                                ? this.long0 + Math.atan2(a.x, -a.y)
                                : this.long0 - Math.atan2(-a.x, a.y)
                        )),
                        (a.x = g),
                        (a.y = h),
                        a)
                      : ((g = lc(
                            this.long0 +
                                Math.atan2(
                                    a.x * d,
                                    b * this.cos_p14 * e -
                                        a.y * this.sin_p14 * d
                                )
                        )),
                        (a.x = g),
                        (a.y = h),
                        a))
        );
    }
    function xb() {
        (this.x0 = this.x0 || 0),
            (this.y0 = this.y0 || 0),
            (this.lat0 = this.lat0 || 0),
            (this.long0 = this.long0 || 0),
            (this.lat_ts = this.lat_ts || 0),
            (this.title = this.title || "Quadrilateralized Spherical Cube"),
            this.lat0 >= Ib - Pb / 2
                ? (this.face = He.TOP)
                : this.lat0 <= -(Ib - Pb / 2)
                ? (this.face = He.BOTTOM)
                : Math.abs(this.long0) <= Pb
                ? (this.face = He.FRONT)
                : Math.abs(this.long0) <= Ib + Pb
                ? (this.face = this.long0 > 0 ? He.RIGHT : He.LEFT)
                : (this.face = He.BACK),
            0 !== this.es &&
                ((this.one_minus_f = 1 - (this.a - this.b) / this.a),
                (this.one_minus_f_squared =
                    this.one_minus_f * this.one_minus_f));
    }
    function yb(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h = { x: 0, y: 0 },
            i = { value: 0 };
        if (
            ((a.x -= this.long0),
            (b =
                0 !== this.es
                    ? Math.atan(this.one_minus_f_squared * Math.tan(a.y))
                    : a.y),
            (c = a.x),
            this.face === He.TOP)
        )
            (e = Ib - b),
                c >= Pb && Ib + Pb >= c
                    ? ((i.value = Ie.AREA_0), (d = c - Ib))
                    : c > Ib + Pb || -(Ib + Pb) >= c
                    ? ((i.value = Ie.AREA_1), (d = c > 0 ? c - Rb : c + Rb))
                    : c > -(Ib + Pb) && -Pb >= c
                    ? ((i.value = Ie.AREA_2), (d = c + Ib))
                    : ((i.value = Ie.AREA_3), (d = c));
        else if (this.face === He.BOTTOM)
            (e = Ib + b),
                c >= Pb && Ib + Pb >= c
                    ? ((i.value = Ie.AREA_0), (d = -c + Ib))
                    : Pb > c && c >= -Pb
                    ? ((i.value = Ie.AREA_1), (d = -c))
                    : -Pb > c && c >= -(Ib + Pb)
                    ? ((i.value = Ie.AREA_2), (d = -c - Ib))
                    : ((i.value = Ie.AREA_3), (d = c > 0 ? -c + Rb : -c - Rb));
        else {
            var j, k, l, m, n, o, p;
            this.face === He.RIGHT
                ? (c = Bb(c, +Ib))
                : this.face === He.BACK
                ? (c = Bb(c, +Rb))
                : this.face === He.LEFT && (c = Bb(c, -Ib)),
                (m = Math.sin(b)),
                (n = Math.cos(b)),
                (o = Math.sin(c)),
                (p = Math.cos(c)),
                (j = n * p),
                (k = n * o),
                (l = m),
                this.face === He.FRONT
                    ? ((e = Math.acos(j)), (d = Ab(e, l, k, i)))
                    : this.face === He.RIGHT
                    ? ((e = Math.acos(k)), (d = Ab(e, l, -j, i)))
                    : this.face === He.BACK
                    ? ((e = Math.acos(-j)), (d = Ab(e, l, -k, i)))
                    : this.face === He.LEFT
                    ? ((e = Math.acos(-k)), (d = Ab(e, l, j, i)))
                    : ((e = d = 0), (i.value = Ie.AREA_0));
        }
        return (
            (g = Math.atan(
                (12 / Rb) * (d + Math.acos(Math.sin(d) * Math.cos(Pb)) - Ib)
            )),
            (f = Math.sqrt(
                (1 - Math.cos(e)) /
                    (Math.cos(g) * Math.cos(g)) /
                    (1 - Math.cos(Math.atan(1 / Math.cos(d))))
            )),
            i.value === Ie.AREA_1
                ? (g += Ib)
                : i.value === Ie.AREA_2
                ? (g += Rb)
                : i.value === Ie.AREA_3 && (g += 1.5 * Rb),
            (h.x = f * Math.cos(g)),
            (h.y = f * Math.sin(g)),
            (h.x = h.x * this.a + this.x0),
            (h.y = h.y * this.a + this.y0),
            (a.x = h.x),
            (a.y = h.y),
            a
        );
    }
    function zb(a) {
        var b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k = { lam: 0, phi: 0 },
            l = { value: 0 };
        if (
            ((a.x = (a.x - this.x0) / this.a),
            (a.y = (a.y - this.y0) / this.a),
            (c = Math.atan(Math.sqrt(a.x * a.x + a.y * a.y))),
            (b = Math.atan2(a.y, a.x)),
            a.x >= 0 && a.x >= Math.abs(a.y)
                ? (l.value = Ie.AREA_0)
                : a.y >= 0 && a.y >= Math.abs(a.x)
                ? ((l.value = Ie.AREA_1), (b -= Ib))
                : a.x < 0 && -a.x >= Math.abs(a.y)
                ? ((l.value = Ie.AREA_2), (b = 0 > b ? b + Rb : b - Rb))
                : ((l.value = Ie.AREA_3), (b += Ib)),
            (j = (Rb / 12) * Math.tan(b)),
            (f = Math.sin(j) / (Math.cos(j) - 1 / Math.sqrt(2))),
            (g = Math.atan(f)),
            (d = Math.cos(b)),
            (e = Math.tan(c)),
            (h =
                1 - d * d * e * e * (1 - Math.cos(Math.atan(1 / Math.cos(g))))),
            -1 > h ? (h = -1) : h > 1 && (h = 1),
            this.face === He.TOP)
        )
            (i = Math.acos(h)),
                (k.phi = Ib - i),
                l.value === Ie.AREA_0
                    ? (k.lam = g + Ib)
                    : l.value === Ie.AREA_1
                    ? (k.lam = 0 > g ? g + Rb : g - Rb)
                    : l.value === Ie.AREA_2
                    ? (k.lam = g - Ib)
                    : (k.lam = g);
        else if (this.face === He.BOTTOM)
            (i = Math.acos(h)),
                (k.phi = i - Ib),
                l.value === Ie.AREA_0
                    ? (k.lam = -g + Ib)
                    : l.value === Ie.AREA_1
                    ? (k.lam = -g)
                    : l.value === Ie.AREA_2
                    ? (k.lam = -g - Ib)
                    : (k.lam = 0 > g ? -g - Rb : -g + Rb);
        else {
            var m, n, o;
            (m = h),
                (j = m * m),
                (o = j >= 1 ? 0 : Math.sqrt(1 - j) * Math.sin(g)),
                (j += o * o),
                (n = j >= 1 ? 0 : Math.sqrt(1 - j)),
                l.value === Ie.AREA_1
                    ? ((j = n), (n = -o), (o = j))
                    : l.value === Ie.AREA_2
                    ? ((n = -n), (o = -o))
                    : l.value === Ie.AREA_3 && ((j = n), (n = o), (o = -j)),
                this.face === He.RIGHT
                    ? ((j = m), (m = -n), (n = j))
                    : this.face === He.BACK
                    ? ((m = -m), (n = -n))
                    : this.face === He.LEFT && ((j = m), (m = n), (n = -j)),
                (k.phi = Math.acos(-o) - Ib),
                (k.lam = Math.atan2(n, m)),
                this.face === He.RIGHT
                    ? (k.lam = Bb(k.lam, -Ib))
                    : this.face === He.BACK
                    ? (k.lam = Bb(k.lam, -Rb))
                    : this.face === He.LEFT && (k.lam = Bb(k.lam, +Ib));
        }
        if (0 !== this.es) {
            var p, q, r;
            (p = k.phi < 0 ? 1 : 0),
                (q = Math.tan(k.phi)),
                (r = this.b / Math.sqrt(q * q + this.one_minus_f_squared)),
                (k.phi = Math.atan(
                    Math.sqrt(this.a * this.a - r * r) / (this.one_minus_f * r)
                )),
                p && (k.phi = -k.phi);
        }
        return (k.lam += this.long0), (a.x = k.lam), (a.y = k.phi), a;
    }
    function Ab(a, b, c, d) {
        var e;
        return (
            Mb > a
                ? ((d.value = Ie.AREA_0), (e = 0))
                : ((e = Math.atan2(b, c)),
                  Math.abs(e) <= Pb
                      ? (d.value = Ie.AREA_0)
                      : e > Pb && Ib + Pb >= e
                      ? ((d.value = Ie.AREA_1), (e -= Ib))
                      : e > Ib + Pb || -(Ib + Pb) >= e
                      ? ((d.value = Ie.AREA_2), (e = e >= 0 ? e - Rb : e + Rb))
                      : ((d.value = Ie.AREA_3), (e += Ib))),
            e
        );
    }
    function Bb(a, b) {
        var c = a + b;
        return -Rb > c ? (c += Qb) : c > +Rb && (c -= Qb), c;
    }
    var Cb = function (a) {
            a(
                "EPSG:4326",
                "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"
            ),
                a(
                    "EPSG:4269",
                    "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"
                ),
                a(
                    "EPSG:3857",
                    "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"
                ),
                (a.WGS84 = a["EPSG:4326"]),
                (a["EPSG:3785"] = a["EPSG:3857"]),
                (a.GOOGLE = a["EPSG:3857"]),
                (a["EPSG:900913"] = a["EPSG:3857"]),
                (a["EPSG:102113"] = a["EPSG:3857"]);
        },
        Db = 1,
        Eb = 2,
        Fb = 4,
        Gb = 5,
        Hb = 484813681109536e-20,
        Ib = Math.PI / 2,
        Jb = 0.16666666666666666,
        Kb = 0.04722222222222222,
        Lb = 0.022156084656084655,
        Mb = 1e-10,
        Nb = 0.017453292519943295,
        Ob = 57.29577951308232,
        Pb = Math.PI / 4,
        Qb = 2 * Math.PI,
        Rb = 3.14159265359,
        Sb = {};
    (Sb.greenwich = 0),
        (Sb.lisbon = -9.131906111111),
        (Sb.paris = 2.337229166667),
        (Sb.bogota = -74.080916666667),
        (Sb.madrid = -3.687938888889),
        (Sb.rome = 12.452333333333),
        (Sb.bern = 7.439583333333),
        (Sb.jakarta = 106.807719444444),
        (Sb.ferro = -17.666666666667),
        (Sb.brussels = 4.367975),
        (Sb.stockholm = 18.058277777778),
        (Sb.athens = 23.7163375),
        (Sb.oslo = 10.722916666667);
    var Tb = { ft: { to_meter: 0.3048 }, "us-ft": { to_meter: 1200 / 3937 } },
        Ub = /[\s_\-\/\(\)]/g,
        Vb = function (b) {
            var c,
                d,
                e,
                f = {},
                g = b
                    .split("+")
                    .map(function (a) {
                        return a.trim();
                    })
                    .filter(function (a) {
                        return a;
                    })
                    .reduce(function (a, b) {
                        var c = b.split("=");
                        return c.push(!0), (a[c[0].toLowerCase()] = c[1]), a;
                    }, {}),
                h = {
                    proj: "projName",
                    datum: "datumCode",
                    rf: function (a) {
                        f.rf = parseFloat(a);
                    },
                    lat_0: function (a) {
                        f.lat0 = a * Nb;
                    },
                    lat_1: function (a) {
                        f.lat1 = a * Nb;
                    },
                    lat_2: function (a) {
                        f.lat2 = a * Nb;
                    },
                    lat_ts: function (a) {
                        f.lat_ts = a * Nb;
                    },
                    lon_0: function (a) {
                        f.long0 = a * Nb;
                    },
                    lon_1: function (a) {
                        f.long1 = a * Nb;
                    },
                    lon_2: function (a) {
                        f.long2 = a * Nb;
                    },
                    alpha: function (a) {
                        f.alpha = parseFloat(a) * Nb;
                    },
                    lonc: function (a) {
                        f.longc = a * Nb;
                    },
                    x_0: function (a) {
                        f.x0 = parseFloat(a);
                    },
                    y_0: function (a) {
                        f.y0 = parseFloat(a);
                    },
                    k_0: function (a) {
                        f.k0 = parseFloat(a);
                    },
                    k: function (a) {
                        f.k0 = parseFloat(a);
                    },
                    a: function (a) {
                        f.a = parseFloat(a);
                    },
                    b: function (a) {
                        f.b = parseFloat(a);
                    },
                    r_a: function () {
                        f.R_A = !0;
                    },
                    zone: function (a) {
                        f.zone = parseInt(a, 10);
                    },
                    south: function () {
                        f.utmSouth = !0;
                    },
                    towgs84: function (a) {
                        f.datum_params = a.split(",").map(function (a) {
                            return parseFloat(a);
                        });
                    },
                    to_meter: function (a) {
                        f.to_meter = parseFloat(a);
                    },
                    units: function (b) {
                        f.units = b;
                        var c = a(Tb, b);
                        c && (f.to_meter = c.to_meter);
                    },
                    from_greenwich: function (a) {
                        f.from_greenwich = a * Nb;
                    },
                    pm: function (b) {
                        var c = a(Sb, b);
                        f.from_greenwich = (c ? c : parseFloat(b)) * Nb;
                    },
                    nadgrids: function (a) {
                        "@null" === a
                            ? (f.datumCode = "none")
                            : (f.nadgrids = a);
                    },
                    axis: function (a) {
                        var b = "ewnsud";
                        3 === a.length &&
                            -1 !== b.indexOf(a.substr(0, 1)) &&
                            -1 !== b.indexOf(a.substr(1, 1)) &&
                            -1 !== b.indexOf(a.substr(2, 1)) &&
                            (f.axis = a);
                    },
                };
            for (c in g)
                (d = g[c]),
                    c in h
                        ? ((e = h[c]),
                          "function" == typeof e ? e(d) : (f[e] = d))
                        : (f[c] = d);
            return (
                "string" == typeof f.datumCode &&
                    "WGS84" !== f.datumCode &&
                    (f.datumCode = f.datumCode.toLowerCase()),
                f
            );
        },
        Wb = 1,
        Xb = 2,
        Yb = 3,
        Zb = 4,
        $b = 5,
        _b = -1,
        ac = /\s/,
        bc = /[A-Za-z]/,
        cc = /[A-Za-z84]/,
        dc = /[,\]]/,
        ec = /[\d\.E\-\+]/;
    (b.prototype.readCharicter = function () {
        var a = this.text[this.place++];
        if (this.state !== Zb)
            for (; ac.test(a); ) {
                if (this.place >= this.text.length) return;
                a = this.text[this.place++];
            }
        switch (this.state) {
            case Wb:
                return this.neutral(a);
            case Xb:
                return this.keyword(a);
            case Zb:
                return this.quoted(a);
            case $b:
                return this.afterquote(a);
            case Yb:
                return this.number(a);
            case _b:
                return;
        }
    }),
        (b.prototype.afterquote = function (a) {
            if ('"' === a) return (this.word += '"'), void (this.state = Zb);
            if (dc.test(a))
                return (this.word = this.word.trim()), void this.afterItem(a);
            throw new Error(
                "havn't handled \"" +
                    a +
                    '" in afterquote yet, index ' +
                    this.place
            );
        }),
        (b.prototype.afterItem = function (a) {
            return "," === a
                ? (null !== this.word && this.currentObject.push(this.word),
                  (this.word = null),
                  void (this.state = Wb))
                : "]" === a
                ? (this.level--,
                  null !== this.word &&
                      (this.currentObject.push(this.word), (this.word = null)),
                  (this.state = Wb),
                  (this.currentObject = this.stack.pop()),
                  void (this.currentObject || (this.state = _b)))
                : void 0;
        }),
        (b.prototype.number = function (a) {
            if (ec.test(a)) return void (this.word += a);
            if (dc.test(a))
                return (
                    (this.word = parseFloat(this.word)), void this.afterItem(a)
                );
            throw new Error(
                "havn't handled \"" + a + '" in number yet, index ' + this.place
            );
        }),
        (b.prototype.quoted = function (a) {
            return '"' === a ? void (this.state = $b) : void (this.word += a);
        }),
        (b.prototype.keyword = function (a) {
            if (cc.test(a)) return void (this.word += a);
            if ("[" === a) {
                var b = [];
                return (
                    b.push(this.word),
                    this.level++,
                    null === this.root
                        ? (this.root = b)
                        : this.currentObject.push(b),
                    this.stack.push(this.currentObject),
                    (this.currentObject = b),
                    void (this.state = Wb)
                );
            }
            if (dc.test(a)) return void this.afterItem(a);
            throw new Error(
                "havn't handled \"" +
                    a +
                    '" in keyword yet, index ' +
                    this.place
            );
        }),
        (b.prototype.neutral = function (a) {
            if (bc.test(a)) return (this.word = a), void (this.state = Xb);
            if ('"' === a) return (this.word = ""), void (this.state = Zb);
            if (ec.test(a)) return (this.word = a), void (this.state = Yb);
            if (dc.test(a)) return void this.afterItem(a);
            throw new Error(
                "havn't handled \"" +
                    a +
                    '" in neutral yet, index ' +
                    this.place
            );
        }),
        (b.prototype.output = function () {
            for (; this.place < this.text.length; ) this.readCharicter();
            if (this.state === _b) return this.root;
            throw new Error(
                'unable to parse string "' +
                    this.text +
                    '". State is ' +
                    this.state
            );
        });
    var fc = 0.017453292519943295,
        gc = function (a) {
            var b = c(a),
                d = b.shift(),
                f = b.shift();
            b.unshift(["name", f]), b.unshift(["type", d]);
            var g = {};
            return e(b, g), h(g), g;
        };
    Cb(i);
    var hc = [
            "PROJECTEDCRS",
            "PROJCRS",
            "GEOGCS",
            "GEOCCS",
            "PROJCS",
            "LOCAL_CS",
            "GEODCRS",
            "GEODETICCRS",
            "GEODETICDATUM",
            "ENGCRS",
            "ENGINEERINGCRS",
        ],
        ic = function (a, b) {
            a = a || {};
            var c, d;
            if (!b) return a;
            for (d in b) (c = b[d]), void 0 !== c && (a[d] = c);
            return a;
        },
        jc = function (a, b, c) {
            var d = a * b;
            return c / Math.sqrt(1 - d * d);
        },
        kc = function (a) {
            return 0 > a ? -1 : 1;
        },
        lc = function (a) {
            return Math.abs(a) <= Rb ? a : a - kc(a) * Qb;
        },
        mc = function (a, b, c) {
            var d = a * c,
                e = 0.5 * a;
            return (
                (d = Math.pow((1 - d) / (1 + d), e)),
                Math.tan(0.5 * (Ib - b)) / d
            );
        },
        nc = function (a, b) {
            for (
                var c, d, e = 0.5 * a, f = Ib - 2 * Math.atan(b), g = 0;
                15 >= g;
                g++
            )
                if (
                    ((c = a * Math.sin(f)),
                    (d =
                        Ib -
                        2 * Math.atan(b * Math.pow((1 - c) / (1 + c), e)) -
                        f),
                    (f += d),
                    Math.abs(d) <= 1e-10)
                )
                    return f;
            return -9999;
        },
        oc = [
            "Mercator",
            "Popular Visualisation Pseudo Mercator",
            "Mercator_1SP",
            "Mercator_Auxiliary_Sphere",
            "merc",
        ],
        pc = { init: o, forward: p, inverse: q, names: oc },
        qc = ["longlat", "identity"],
        rc = { init: r, forward: s, inverse: s, names: qc },
        sc = [pc, rc],
        tc = {},
        uc = [],
        vc = { start: v, add: t, get: u },
        wc = {};
    (wc.MERIT = { a: 6378137, rf: 298.257, ellipseName: "MERIT 1983" }),
        (wc.SGS85 = {
            a: 6378136,
            rf: 298.257,
            ellipseName: "Soviet Geodetic System 85",
        }),
        (wc.GRS80 = {
            a: 6378137,
            rf: 298.257222101,
            ellipseName: "GRS 1980(IUGG, 1980)",
        }),
        (wc.IAU76 = { a: 6378140, rf: 298.257, ellipseName: "IAU 1976" }),
        (wc.airy = { a: 6377563.396, b: 6356256.91, ellipseName: "Airy 1830" }),
        (wc.APL4 = {
            a: 6378137,
            rf: 298.25,
            ellipseName: "Appl. Physics. 1965",
        }),
        (wc.NWL9D = {
            a: 6378145,
            rf: 298.25,
            ellipseName: "Naval Weapons Lab., 1965",
        }),
        (wc.mod_airy = {
            a: 6377340.189,
            b: 6356034.446,
            ellipseName: "Modified Airy",
        }),
        (wc.andrae = {
            a: 6377104.43,
            rf: 300,
            ellipseName: "Andrae 1876 (Den., Iclnd.)",
        }),
        (wc.aust_SA = {
            a: 6378160,
            rf: 298.25,
            ellipseName: "Australian Natl & S. Amer. 1969",
        }),
        (wc.GRS67 = {
            a: 6378160,
            rf: 298.247167427,
            ellipseName: "GRS 67(IUGG 1967)",
        }),
        (wc.bessel = {
            a: 6377397.155,
            rf: 299.1528128,
            ellipseName: "Bessel 1841",
        }),
        (wc.bess_nam = {
            a: 6377483.865,
            rf: 299.1528128,
            ellipseName: "Bessel 1841 (Namibia)",
        }),
        (wc.clrk66 = {
            a: 6378206.4,
            b: 6356583.8,
            ellipseName: "Clarke 1866",
        }),
        (wc.clrk80 = {
            a: 6378249.145,
            rf: 293.4663,
            ellipseName: "Clarke 1880 mod.",
        }),
        (wc.clrk58 = {
            a: 6378293.645208759,
            rf: 294.2606763692654,
            ellipseName: "Clarke 1858",
        }),
        (wc.CPM = {
            a: 6375738.7,
            rf: 334.29,
            ellipseName: "Comm. des Poids et Mesures 1799",
        }),
        (wc.delmbr = {
            a: 6376428,
            rf: 311.5,
            ellipseName: "Delambre 1810 (Belgium)",
        }),
        (wc.engelis = {
            a: 6378136.05,
            rf: 298.2566,
            ellipseName: "Engelis 1985",
        }),
        (wc.evrst30 = {
            a: 6377276.345,
            rf: 300.8017,
            ellipseName: "Everest 1830",
        }),
        (wc.evrst48 = {
            a: 6377304.063,
            rf: 300.8017,
            ellipseName: "Everest 1948",
        }),
        (wc.evrst56 = {
            a: 6377301.243,
            rf: 300.8017,
            ellipseName: "Everest 1956",
        }),
        (wc.evrst69 = {
            a: 6377295.664,
            rf: 300.8017,
            ellipseName: "Everest 1969",
        }),
        (wc.evrstSS = {
            a: 6377298.556,
            rf: 300.8017,
            ellipseName: "Everest (Sabah & Sarawak)",
        }),
        (wc.fschr60 = {
            a: 6378166,
            rf: 298.3,
            ellipseName: "Fischer (Mercury Datum) 1960",
        }),
        (wc.fschr60m = { a: 6378155, rf: 298.3, ellipseName: "Fischer 1960" }),
        (wc.fschr68 = { a: 6378150, rf: 298.3, ellipseName: "Fischer 1968" }),
        (wc.helmert = { a: 6378200, rf: 298.3, ellipseName: "Helmert 1906" }),
        (wc.hough = { a: 6378270, rf: 297, ellipseName: "Hough" }),
        (wc.intl = {
            a: 6378388,
            rf: 297,
            ellipseName: "International 1909 (Hayford)",
        }),
        (wc.kaula = { a: 6378163, rf: 298.24, ellipseName: "Kaula 1961" }),
        (wc.lerch = { a: 6378139, rf: 298.257, ellipseName: "Lerch 1979" }),
        (wc.mprts = { a: 6397300, rf: 191, ellipseName: "Maupertius 1738" }),
        (wc.new_intl = {
            a: 6378157.5,
            b: 6356772.2,
            ellipseName: "New International 1967",
        }),
        (wc.plessis = {
            a: 6376523,
            rf: 6355863,
            ellipseName: "Plessis 1817 (France)",
        }),
        (wc.krass = { a: 6378245, rf: 298.3, ellipseName: "Krassovsky, 1942" }),
        (wc.SEasia = {
            a: 6378155,
            b: 6356773.3205,
            ellipseName: "Southeast Asia",
        }),
        (wc.walbeck = { a: 6376896, b: 6355834.8467, ellipseName: "Walbeck" }),
        (wc.WGS60 = { a: 6378165, rf: 298.3, ellipseName: "WGS 60" }),
        (wc.WGS66 = { a: 6378145, rf: 298.25, ellipseName: "WGS 66" }),
        (wc.WGS7 = { a: 6378135, rf: 298.26, ellipseName: "WGS 72" });
    var xc = (wc.WGS84 = {
        a: 6378137,
        rf: 298.257223563,
        ellipseName: "WGS 84",
    });
    wc.sphere = {
        a: 6370997,
        b: 6370997,
        ellipseName: "Normal Sphere (r=6370997)",
    };
    var yc = {};
    (yc.wgs84 = { towgs84: "0,0,0", ellipse: "WGS84", datumName: "WGS84" }),
        (yc.ch1903 = {
            towgs84: "674.374,15.056,405.346",
            ellipse: "bessel",
            datumName: "swiss",
        }),
        (yc.ggrs87 = {
            towgs84: "-199.87,74.79,246.62",
            ellipse: "GRS80",
            datumName: "Greek_Geodetic_Reference_System_1987",
        }),
        (yc.nad83 = {
            towgs84: "0,0,0",
            ellipse: "GRS80",
            datumName: "North_American_Datum_1983",
        }),
        (yc.nad27 = {
            nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
            ellipse: "clrk66",
            datumName: "North_American_Datum_1927",
        }),
        (yc.potsdam = {
            towgs84: "606.0,23.0,413.0",
            ellipse: "bessel",
            datumName: "Potsdam Rauenberg 1950 DHDN",
        }),
        (yc.carthage = {
            towgs84: "-263.0,6.0,431.0",
            ellipse: "clark80",
            datumName: "Carthage 1934 Tunisia",
        }),
        (yc.hermannskogel = {
            towgs84: "653.0,-212.0,449.0",
            ellipse: "bessel",
            datumName: "Hermannskogel",
        }),
        (yc.osni52 = {
            towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
            ellipse: "airy",
            datumName: "Irish National",
        }),
        (yc.ire65 = {
            towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
            ellipse: "mod_airy",
            datumName: "Ireland 1965",
        }),
        (yc.rassadiran = {
            towgs84: "-133.63,-157.5,-158.62",
            ellipse: "intl",
            datumName: "Rassadiran",
        }),
        (yc.nzgd49 = {
            towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
            ellipse: "intl",
            datumName: "New Zealand Geodetic Datum 1949",
        }),
        (yc.osgb36 = {
            towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
            ellipse: "airy",
            datumName: "Airy 1830",
        }),
        (yc.s_jtsk = {
            towgs84: "589,76,480",
            ellipse: "bessel",
            datumName: "S-JTSK (Ferro)",
        }),
        (yc.beduaram = {
            towgs84: "-106,-87,188",
            ellipse: "clrk80",
            datumName: "Beduaram",
        }),
        (yc.gunung_segara = {
            towgs84: "-403,684,41",
            ellipse: "bessel",
            datumName: "Gunung Segara Jakarta",
        }),
        (yc.rnb72 = {
            towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
            ellipse: "intl",
            datumName: "Reseau National Belge 1972",
        }),
        (z.projections = vc),
        z.projections.start();
    var zc = function (a, b, c) {
            return A(a, b)
                ? c
                : a.datum_type === Gb || b.datum_type === Gb
                ? c
                : a.es !== b.es ||
                  a.a !== b.a ||
                  F(a.datum_type) ||
                  F(b.datum_type)
                ? ((c = B(c, a.es, a.a)),
                  F(a.datum_type) && (c = D(c, a.datum_type, a.datum_params)),
                  F(b.datum_type) && (c = E(c, b.datum_type, b.datum_params)),
                  C(c, b.es, b.a, b.b))
                : c;
        },
        Ac = function (a, b, c) {
            var d,
                e,
                f,
                g = c.x,
                h = c.y,
                i = c.z || 0,
                j = {};
            for (f = 0; 3 > f; f++)
                if (!b || 2 !== f || void 0 !== c.z)
                    switch (
                        (0 === f
                            ? ((d = g), (e = "x"))
                            : 1 === f
                            ? ((d = h), (e = "y"))
                            : ((d = i), (e = "z")),
                        a.axis[f])
                    ) {
                        case "e":
                            j[e] = d;
                            break;
                        case "w":
                            j[e] = -d;
                            break;
                        case "n":
                            j[e] = d;
                            break;
                        case "s":
                            j[e] = -d;
                            break;
                        case "u":
                            void 0 !== c[e] && (j.z = d);
                            break;
                        case "d":
                            void 0 !== c[e] && (j.z = -d);
                            break;
                        default:
                            return null;
                    }
            return j;
        },
        Bc = function (a) {
            var b = { x: a[0], y: a[1] };
            return (
                a.length > 2 && (b.z = a[2]), a.length > 3 && (b.m = a[3]), b
            );
        },
        Cc = function (a) {
            G(a.x), G(a.y);
        },
        Dc = z("WGS84"),
        Ec = 6,
        Fc = "AJSAJS",
        Gc = "AFAFAF",
        Hc = 65,
        Ic = 73,
        Jc = 79,
        Kc = 86,
        Lc = 90,
        Mc = { forward: M, inverse: N, toPoint: O };
    (Point.fromMGRS = function (a) {
        return new Point(O(a));
    }),
        (Point.prototype.toMGRS = function (a) {
            return M([this.x, this.y], a);
        });
    var Nc = "2.4.4",
        Oc = 1,
        Pc = 0.25,
        Qc = 0.046875,
        Rc = 0.01953125,
        Sc = 0.01068115234375,
        Tc = 0.75,
        Uc = 0.46875,
        Vc = 0.013020833333333334,
        Wc = 0.007120768229166667,
        Xc = 0.3645833333333333,
        Yc = 0.005696614583333333,
        Zc = 0.3076171875,
        $c = function (a) {
            var b = [];
            (b[0] = Oc - a * (Pc + a * (Qc + a * (Rc + a * Sc)))),
                (b[1] = a * (Tc - a * (Qc + a * (Rc + a * Sc))));
            var c = a * a;
            return (
                (b[2] = c * (Uc - a * (Vc + a * Wc))),
                (c *= a),
                (b[3] = c * (Xc - a * Yc)),
                (b[4] = c * a * Zc),
                b
            );
        },
        _c = function (a, b, c, d) {
            return (
                (c *= b),
                (b *= b),
                d[0] * a - c * (d[1] + b * (d[2] + b * (d[3] + b * d[4])))
            );
        },
        ad = 20,
        bd = function (a, b, c) {
            for (var d = 1 / (1 - b), e = a, f = ad; f; --f) {
                var g = Math.sin(e),
                    h = 1 - b * g * g;
                if (
                    ((h =
                        (_c(e, g, Math.cos(e), c) - a) *
                        (h * Math.sqrt(h)) *
                        d),
                    (e -= h),
                    Math.abs(h) < Mb)
                )
                    return e;
            }
            return e;
        },
        cd = ["Transverse_Mercator", "Transverse Mercator", "tmerc"],
        dd = { init: aa, forward: ba, inverse: ca, names: cd },
        ed = function (a) {
            var b = Math.exp(a);
            return (b = (b - 1 / b) / 2);
        },
        fd = function (a, b) {
            (a = Math.abs(a)), (b = Math.abs(b));
            var c = Math.max(a, b),
                d = Math.min(a, b) / (c ? c : 1);
            return c * Math.sqrt(1 + Math.pow(d, 2));
        },
        gd = function (a) {
            var b = 1 + a,
                c = b - 1;
            return 0 === c ? a : (a * Math.log(b)) / c;
        },
        hd = function (a) {
            var b = Math.abs(a);
            return (b = gd(b * (1 + b / (fd(1, b) + 1)))), 0 > a ? -b : b;
        },
        id = function (a, b) {
            for (
                var c,
                    d = 2 * Math.cos(2 * b),
                    e = a.length - 1,
                    f = a[e],
                    g = 0;
                --e >= 0;

            )
                (c = -g + d * f + a[e]), (g = f), (f = c);
            return b + c * Math.sin(2 * b);
        },
        jd = function (a, b) {
            for (
                var c, d = 2 * Math.cos(b), e = a.length - 1, f = a[e], g = 0;
                --e >= 0;

            )
                (c = -g + d * f + a[e]), (g = f), (f = c);
            return Math.sin(b) * c;
        },
        kd = function (a) {
            var b = Math.exp(a);
            return (b = (b + 1 / b) / 2);
        },
        ld = function (a, b, c) {
            for (
                var d,
                    e,
                    f = Math.sin(b),
                    g = Math.cos(b),
                    h = ed(c),
                    i = kd(c),
                    j = 2 * g * i,
                    k = -2 * f * h,
                    l = a.length - 1,
                    m = a[l],
                    n = 0,
                    o = 0,
                    p = 0;
                --l >= 0;

            )
                (d = o),
                    (e = n),
                    (o = m),
                    (n = p),
                    (m = -d + j * o - k * n + a[l]),
                    (p = -e + k * o + j * n);
            return (j = f * i), (k = g * h), [j * m - k * p, j * p + k * m];
        },
        md = [
            "Extended_Transverse_Mercator",
            "Extended Transverse Mercator",
            "etmerc",
        ],
        nd = { init: da, forward: ea, inverse: fa, names: md },
        od = function (a, b) {
            if (void 0 === a) {
                if (
                    ((a = Math.floor((30 * (lc(b) + Math.PI)) / Math.PI) + 1),
                    0 > a)
                )
                    return 0;
                if (a > 60) return 60;
            }
            return a;
        },
        pd = "etmerc",
        qd = ["Universal Transverse Mercator System", "utm"],
        rd = { init: ga, names: qd, dependsOn: pd },
        sd = function (a, b) {
            return Math.pow((1 - a) / (1 + a), b);
        },
        td = 20,
        ud = ["gauss"],
        vd = { init: ha, forward: ia, inverse: ja, names: ud },
        wd = [
            "Stereographic_North_Pole",
            "Oblique_Stereographic",
            "Polar_Stereographic",
            "sterea",
            "Oblique Stereographic Alternative",
        ],
        xd = { init: ka, forward: la, inverse: ma, names: wd },
        yd = [
            "stere",
            "Stereographic_South_Pole",
            "Polar Stereographic (variant B)",
        ],
        zd = { init: oa, forward: pa, inverse: qa, names: yd, ssfn_: na },
        Ad = ["somerc"],
        Bd = { init: ra, forward: sa, inverse: ta, names: Ad },
        Cd = [
            "Hotine_Oblique_Mercator",
            "Hotine Oblique Mercator",
            "Hotine_Oblique_Mercator_Azimuth_Natural_Origin",
            "Hotine_Oblique_Mercator_Azimuth_Center",
            "omerc",
        ],
        Dd = { init: ua, forward: va, inverse: wa, names: Cd },
        Ed = [
            "Lambert Tangential Conformal Conic Projection",
            "Lambert_Conformal_Conic",
            "Lambert_Conformal_Conic_2SP",
            "lcc",
        ],
        Fd = { init: xa, forward: ya, inverse: za, names: Ed },
        Gd = ["Krovak", "krovak"],
        Hd = { init: Aa, forward: Ba, inverse: Ca, names: Gd },
        Id = function (a, b, c, d, e) {
            return (
                a * e -
                b * Math.sin(2 * e) +
                c * Math.sin(4 * e) -
                d * Math.sin(6 * e)
            );
        },
        Jd = function (a) {
            return 1 - 0.25 * a * (1 + (a / 16) * (3 + 1.25 * a));
        },
        Kd = function (a) {
            return 0.375 * a * (1 + 0.25 * a * (1 + 0.46875 * a));
        },
        Ld = function (a) {
            return 0.05859375 * a * a * (1 + 0.75 * a);
        },
        Md = function (a) {
            return a * a * a * (35 / 3072);
        },
        Nd = function (a, b, c) {
            var d = b * c;
            return a / Math.sqrt(1 - d * d);
        },
        Od = function (a) {
            return Math.abs(a) < Ib ? a : a - kc(a) * Math.PI;
        },
        Pd = function (a, b, c, d, e) {
            var f, g;
            f = a / b;
            for (var h = 0; 15 > h; h++)
                if (
                    ((g =
                        (a -
                            (b * f -
                                c * Math.sin(2 * f) +
                                d * Math.sin(4 * f) -
                                e * Math.sin(6 * f))) /
                        (b -
                            2 * c * Math.cos(2 * f) +
                            4 * d * Math.cos(4 * f) -
                            6 * e * Math.cos(6 * f))),
                    (f += g),
                    Math.abs(g) <= 1e-10)
                )
                    return f;
            return NaN;
        },
        Qd = ["Cassini", "Cassini_Soldner", "cass"],
        Rd = { init: Da, forward: Ea, inverse: Fa, names: Qd },
        Sd = function (a, b) {
            var c;
            return a > 1e-7
                ? ((c = a * b),
                  (1 - a * a) *
                      (b / (1 - c * c) -
                          (0.5 / a) * Math.log((1 - c) / (1 + c))))
                : 2 * b;
        },
        Td = 1,
        Ud = 2,
        Vd = 3,
        Wd = 4,
        Xd = 0.3333333333333333,
        Yd = 0.17222222222222222,
        Zd = 0.10257936507936508,
        $d = 0.06388888888888888,
        _d = 0.0664021164021164,
        ae = 0.016415012942191543,
        be = [
            "Lambert Azimuthal Equal Area",
            "Lambert_Azimuthal_Equal_Area",
            "laea",
        ],
        ce = {
            init: Ga,
            forward: Ha,
            inverse: Ia,
            names: be,
            S_POLE: Td,
            N_POLE: Ud,
            EQUIT: Vd,
            OBLIQ: Wd,
        },
        de = function (a) {
            return Math.abs(a) > 1 && (a = a > 1 ? 1 : -1), Math.asin(a);
        },
        ee = ["Albers_Conic_Equal_Area", "Albers", "aea"],
        fe = { init: La, forward: Ma, inverse: Na, names: ee, phi1z: Oa },
        ge = ["gnom"],
        he = { init: Pa, forward: Qa, inverse: Ra, names: ge },
        ie = function (a, b) {
            var c = 1 - ((1 - a * a) / (2 * a)) * Math.log((1 - a) / (1 + a));
            if (Math.abs(Math.abs(b) - c) < 1e-6) return 0 > b ? -1 * Ib : Ib;
            for (var d, e, f, g, h = Math.asin(0.5 * b), i = 0; 30 > i; i++)
                if (
                    ((e = Math.sin(h)),
                    (f = Math.cos(h)),
                    (g = a * e),
                    (d =
                        (Math.pow(1 - g * g, 2) / (2 * f)) *
                        (b / (1 - a * a) -
                            e / (1 - g * g) +
                            (0.5 / a) * Math.log((1 - g) / (1 + g)))),
                    (h += d),
                    Math.abs(d) <= 1e-10)
                )
                    return h;
            return NaN;
        },
        je = ["cea"],
        ke = { init: Sa, forward: Ta, inverse: Ua, names: je },
        le = ["Equirectangular", "Equidistant_Cylindrical", "eqc"],
        me = { init: Va, forward: Wa, inverse: Xa, names: le },
        ne = 20,
        oe = ["Polyconic", "poly"],
        pe = { init: Ya, forward: Za, inverse: $a, names: oe },
        qe = ["New_Zealand_Map_Grid", "nzmg"],
        re = { init: _a, forward: ab, inverse: bb, names: qe },
        se = ["Miller_Cylindrical", "mill"],
        te = { init: cb, forward: db, inverse: eb, names: se },
        ue = 20,
        ve = ["Sinusoidal", "sinu"],
        we = { init: fb, forward: gb, inverse: hb, names: ve },
        xe = ["Mollweide", "moll"],
        ye = { init: ib, forward: jb, inverse: kb, names: xe },
        ze = ["Equidistant_Conic", "eqdc"],
        Ae = { init: lb, forward: mb, inverse: nb, names: ze },
        Be = ["Van_der_Grinten_I", "VanDerGrinten", "vandg"],
        Ce = { init: ob, forward: pb, inverse: qb, names: Be },
        De = ["Azimuthal_Equidistant", "aeqd"],
        Ee = { init: rb, forward: sb, inverse: tb, names: De },
        Fe = ["ortho"],
        Ge = { init: ub, forward: vb, inverse: wb, names: Fe },
        He = { FRONT: 1, RIGHT: 2, BACK: 3, LEFT: 4, TOP: 5, BOTTOM: 6 },
        Ie = { AREA_0: 1, AREA_1: 2, AREA_2: 3, AREA_3: 4 },
        Je = [
            "Quadrilateralized Spherical Cube",
            "Quadrilateralized_Spherical_Cube",
            "qsc",
        ],
        Ke = { init: xb, forward: yb, inverse: zb, names: Je },
        Le = function (proj4) {
            proj4.Proj.projections.add(dd),
                proj4.Proj.projections.add(nd),
                proj4.Proj.projections.add(rd),
                proj4.Proj.projections.add(xd),
                proj4.Proj.projections.add(zd),
                proj4.Proj.projections.add(Bd),
                proj4.Proj.projections.add(Dd),
                proj4.Proj.projections.add(Fd),
                proj4.Proj.projections.add(Hd),
                proj4.Proj.projections.add(Rd),
                proj4.Proj.projections.add(ce),
                proj4.Proj.projections.add(fe),
                proj4.Proj.projections.add(he),
                proj4.Proj.projections.add(ke),
                proj4.Proj.projections.add(me),
                proj4.Proj.projections.add(pe),
                proj4.Proj.projections.add(re),
                proj4.Proj.projections.add(te),
                proj4.Proj.projections.add(we),
                proj4.Proj.projections.add(ye),
                proj4.Proj.projections.add(Ae),
                proj4.Proj.projections.add(Ce),
                proj4.Proj.projections.add(Ee),
                proj4.Proj.projections.add(Ge),
                proj4.Proj.projections.add(Ke);
        };
    return (
        (L.defaultDatum = "WGS84"),
        (L.Proj = z),
        (L.WGS84 = new L.Proj("WGS84")),
        (L.Point = Point),
        (L.toPoint = Bc),
        (L.defs = i),
        (L.transform = I),
        (L.mgrs = Mc),
        (L.version = Nc),
        Le(L),
        L
    );
});
