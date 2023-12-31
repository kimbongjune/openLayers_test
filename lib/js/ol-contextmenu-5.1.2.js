/**
 * Skipped minification because the original files appears to be already minified.
 * Original file: /npm/ol-contextmenu@5.2.1/dist/ol-contextmenu.iife.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */

  /*!
  * ol-contextmenu - v5.2.1
  * https://github.com/jonataswalker/ol-contextmenu
  * Built: Fri Mar 31 2023 20:27:32 GMT-0300 (Brasilia Standard Time)
  */

  var ContextMenu = (function () {
      "use strict";
      var de = Object.defineProperty;
      var pe = (v, u, g) =>
          u in v
              ? de(v, u, {
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                    value: g,
                })
              : (v[u] = g);
      var h = (v, u, g) => (pe(v, typeof u != "symbol" ? u + "" : u, g), g);
      class v {
          constructor(e) {
              this.propagationStopped,
                  this.defaultPrevented,
                  (this.type = e),
                  (this.target = null);
          }
          preventDefault() {
              this.defaultPrevented = !0;
          }
          stopPropagation() {
              this.propagationStopped = !0;
          }
      }
      const u = v,
          g = { PROPERTYCHANGE: "propertychange" };
      class K {
          constructor() {
              this.disposed = !1;
          }
          dispose() {
              this.disposed || ((this.disposed = !0), this.disposeInternal());
          }
          disposeInternal() {}
      }
      const U = K;
      function M() {}
      function D(s) {
          for (const e in s) delete s[e];
      }
      function z(s) {
          let e;
          for (e in s) return !1;
          return !e;
      }
      class B extends U {
          constructor(e) {
              super(),
                  (this.eventTarget_ = e),
                  (this.pendingRemovals_ = null),
                  (this.dispatching_ = null),
                  (this.listeners_ = null);
          }
          addEventListener(e, t) {
              if (!e || !t) return;
              const n = this.listeners_ || (this.listeners_ = {}),
                  r = n[e] || (n[e] = []);
              r.includes(t) || r.push(t);
          }
          dispatchEvent(e) {
              const t = typeof e == "string",
                  n = t ? e : e.type,
                  r = this.listeners_ && this.listeners_[n];
              if (!r) return;
              const i = t ? new u(e) : e;
              i.target || (i.target = this.eventTarget_ || this);
              const o = this.dispatching_ || (this.dispatching_ = {}),
                  l = this.pendingRemovals_ || (this.pendingRemovals_ = {});
              n in o || ((o[n] = 0), (l[n] = 0)), ++o[n];
              let d;
              for (let c = 0, _ = r.length; c < _; ++c)
                  if (
                      ("handleEvent" in r[c]
                          ? (d = r[c].handleEvent(i))
                          : (d = r[c].call(this, i)),
                      d === !1 || i.propagationStopped)
                  ) {
                      d = !1;
                      break;
                  }
              if (--o[n] === 0) {
                  let c = l[n];
                  for (delete l[n]; c--; ) this.removeEventListener(n, M);
                  delete o[n];
              }
              return d;
          }
          disposeInternal() {
              this.listeners_ && D(this.listeners_);
          }
          getListeners(e) {
              return (this.listeners_ && this.listeners_[e]) || void 0;
          }
          hasListener(e) {
              return this.listeners_
                  ? e
                      ? e in this.listeners_
                      : Object.keys(this.listeners_).length > 0
                  : !1;
          }
          removeEventListener(e, t) {
              const n = this.listeners_ && this.listeners_[e];
              if (n) {
                  const r = n.indexOf(t);
                  r !== -1 &&
                      (this.pendingRemovals_ && e in this.pendingRemovals_
                          ? ((n[r] = M), ++this.pendingRemovals_[e])
                          : (n.splice(r, 1),
                            n.length === 0 && delete this.listeners_[e]));
              }
          }
      }
      const F = B,
          V = {
              CHANGE: "change",
              ERROR: "error",
              BLUR: "blur",
              CLEAR: "clear",
              CONTEXTMENU: "contextmenu",
              CLICK: "click",
              DBLCLICK: "dblclick",
              DRAGENTER: "dragenter",
              DRAGOVER: "dragover",
              DROP: "drop",
              FOCUS: "focus",
              KEYDOWN: "keydown",
              KEYPRESS: "keypress",
              LOAD: "load",
              RESIZE: "resize",
              TOUCHMOVE: "touchmove",
              WHEEL: "wheel",
          };
      function b(s, e, t, n, r) {
          if ((n && n !== s && (t = t.bind(n)), r)) {
              const o = t;
              t = function () {
                  s.removeEventListener(e, t), o.apply(this, arguments);
              };
          }
          const i = { target: s, type: e, listener: t };
          return s.addEventListener(e, t), i;
      }
      function R(s, e, t, n) {
          return b(s, e, t, n, !0);
      }
      function C(s) {
          s &&
              s.target &&
              (s.target.removeEventListener(s.type, s.listener), D(s));
      }
      class L extends F {
          constructor() {
              super(),
                  (this.on = this.onInternal),
                  (this.once = this.onceInternal),
                  (this.un = this.unInternal),
                  (this.revision_ = 0);
          }
          changed() {
              ++this.revision_, this.dispatchEvent(V.CHANGE);
          }
          getRevision() {
              return this.revision_;
          }
          onInternal(e, t) {
              if (Array.isArray(e)) {
                  const n = e.length,
                      r = new Array(n);
                  for (let i = 0; i < n; ++i) r[i] = b(this, e[i], t);
                  return r;
              }
              return b(this, e, t);
          }
          onceInternal(e, t) {
              let n;
              if (Array.isArray(e)) {
                  const r = e.length;
                  n = new Array(r);
                  for (let i = 0; i < r; ++i) n[i] = R(this, e[i], t);
              } else n = R(this, e, t);
              return (t.ol_key = n), n;
          }
          unInternal(e, t) {
              const n = t.ol_key;
              if (n) j(n);
              else if (Array.isArray(e))
                  for (let r = 0, i = e.length; r < i; ++r)
                      this.removeEventListener(e[r], t);
              else this.removeEventListener(e, t);
          }
      }
      L.prototype.on, L.prototype.once, L.prototype.un;
      function j(s) {
          if (Array.isArray(s))
              for (let e = 0, t = s.length; e < t; ++e) C(s[e]);
          else C(s);
      }
      const Y = L;
      let G = 0;
      function Z(s) {
          return s.ol_uid || (s.ol_uid = String(++G));
      }
      class P extends u {
          constructor(e, t, n) {
              super(e), (this.key = t), (this.oldValue = n);
          }
      }
      class W extends Y {
          constructor(e) {
              super(),
                  this.on,
                  this.once,
                  this.un,
                  Z(this),
                  (this.values_ = null),
                  e !== void 0 && this.setProperties(e);
          }
          get(e) {
              let t;
              return (
                  this.values_ &&
                      this.values_.hasOwnProperty(e) &&
                      (t = this.values_[e]),
                  t
              );
          }
          getKeys() {
              return (this.values_ && Object.keys(this.values_)) || [];
          }
          getProperties() {
              return (this.values_ && Object.assign({}, this.values_)) || {};
          }
          hasProperties() {
              return !!this.values_;
          }
          notify(e, t) {
              let n;
              (n = `change:${e}`),
                  this.hasListener(n) && this.dispatchEvent(new P(n, e, t)),
                  (n = g.PROPERTYCHANGE),
                  this.hasListener(n) && this.dispatchEvent(new P(n, e, t));
          }
          addChangeListener(e, t) {
              this.addEventListener(`change:${e}`, t);
          }
          removeChangeListener(e, t) {
              this.removeEventListener(`change:${e}`, t);
          }
          set(e, t, n) {
              const r = this.values_ || (this.values_ = {});
              if (n) r[e] = t;
              else {
                  const i = r[e];
                  (r[e] = t), i !== t && this.notify(e, i);
              }
          }
          setProperties(e, t) {
              for (const n in e) this.set(n, e[n], t);
          }
          applyProperties(e) {
              e.values_ &&
                  Object.assign(this.values_ || (this.values_ = {}), e.values_);
          }
          unset(e, t) {
              if (this.values_ && e in this.values_) {
                  const n = this.values_[e];
                  delete this.values_[e],
                      z(this.values_) && (this.values_ = null),
                      t || this.notify(e, n);
              }
          }
      }
      const X = W,
          q = {
              POSTRENDER: "postrender",
              MOVESTART: "movestart",
              MOVEEND: "moveend",
              LOADSTART: "loadstart",
              LOADEND: "loadend",
          };
      function $(s) {
          return s && s.parentNode ? s.parentNode.removeChild(s) : null;
      }
      class J extends X {
          constructor(e) {
              super();
              const t = e.element;
              t &&
                  !e.target &&
                  !t.style.pointerEvents &&
                  (t.style.pointerEvents = "auto"),
                  (this.element = t || null),
                  (this.target_ = null),
                  (this.map_ = null),
                  (this.listenerKeys = []),
                  e.render && (this.render = e.render),
                  e.target && this.setTarget(e.target);
          }
          disposeInternal() {
              $(this.element), super.disposeInternal();
          }
          getMap() {
              return this.map_;
          }
          setMap(e) {
              this.map_ && $(this.element);
              for (let t = 0, n = this.listenerKeys.length; t < n; ++t)
                  C(this.listenerKeys[t]);
              (this.listenerKeys.length = 0),
                  (this.map_ = e),
                  e &&
                      ((this.target_
                          ? this.target_
                          : e.getOverlayContainerStopEvent()
                      ).appendChild(this.element),
                      this.render !== M &&
                          this.listenerKeys.push(
                              b(e, q.POSTRENDER, this.render, this)
                          ),
                      e.render());
          }
          render(e) {}
          setTarget(e) {
              this.target_ =
                  typeof e == "string" ? document.getElementById(e) : e;
          }
      }
      const Q = J;
      var O = {},
          ee = {
              get exports() {
                  return O;
              },
              set exports(s) {
                  O = s;
              },
          };
      function w() {}
      (w.prototype = {
          on: function (s, e, t) {
              var n = this.e || (this.e = {});
              return (n[s] || (n[s] = [])).push({ fn: e, ctx: t }), this;
          },
          once: function (s, e, t) {
              var n = this;
              function r() {
                  n.off(s, r), e.apply(t, arguments);
              }
              return (r._ = e), this.on(s, r, t);
          },
          emit: function (s) {
              var e = [].slice.call(arguments, 1),
                  t = ((this.e || (this.e = {}))[s] || []).slice(),
                  n = 0,
                  r = t.length;
              for (n; n < r; n++) t[n].fn.apply(t[n].ctx, e);
              return this;
          },
          off: function (s, e) {
              var t = this.e || (this.e = {}),
                  n = t[s],
                  r = [];
              if (n && e)
                  for (var i = 0, o = n.length; i < o; i++)
                      n[i].fn !== e && n[i].fn._ !== e && r.push(n[i]);
              return r.length ? (t[s] = r) : delete t[s], this;
          },
      }),
          (ee.exports = w);
      var te = (O.TinyEmitter = w);
      class ne extends u {
          constructor(e, t, n) {
              super(e),
                  (this.map = t),
                  (this.frameState = n !== void 0 ? n : null);
          }
      }
      const se = ne;
      class ie extends se {
          constructor(e, t, n, r, i, o) {
              super(e, t, i),
                  (this.originalEvent = n),
                  (this.pixel_ = null),
                  (this.coordinate_ = null),
                  (this.dragging = r !== void 0 ? r : !1),
                  (this.activePointers = o);
          }
          get pixel() {
              return (
                  this.pixel_ ||
                      (this.pixel_ = this.map.getEventPixel(
                          this.originalEvent
                      )),
                  this.pixel_
              );
          }
          set pixel(e) {
              this.pixel_ = e;
          }
          get coordinate() {
              return (
                  this.coordinate_ ||
                      (this.coordinate_ = this.map.getCoordinateFromPixel(
                          this.pixel
                      )),
                  this.coordinate_
              );
          }
          set coordinate(e) {
              this.coordinate_ = e;
          }
          preventDefault() {
              super.preventDefault(),
                  "preventDefault" in this.originalEvent &&
                      this.originalEvent.preventDefault();
          }
          stopPropagation() {
              super.stopPropagation(),
                  "stopPropagation" in this.originalEvent &&
                      this.originalEvent.stopPropagation();
          }
      }
      const re = ie;
      var A = ((s) => (
              (s.CONTEXTMENU = "contextmenu"),
              (s.CLICK = "click"),
              (s.DBLCLICK = "dblclick"),
              s
          ))(A || {}),
          f = ((s) => (
              (s.BEFOREOPEN = "beforeopen"),
              (s.OPEN = "open"),
              (s.CLOSE = "close"),
              (s.ADD_MENU_ENTRY = "add-menu-entry"),
              s
          ))(f || {});
      class I extends re {
          constructor(e) {
              super(e.type, e.map, e.originalEvent);
          }
      }
      const oe = {
              width: 150,
              scrollAt: 4,
              eventType: A.CONTEXTMENU,
              defaultItems: !0,
              items: [],
          },
          m = "ol-ctx-menu",
          a = {
              namespace: m,
              container: `${m}-container`,
              separator: `${m}-separator`,
              submenu: `${m}-submenu`,
              hidden: `${m}-hidden`,
              icon: `${m}-icon`,
              zoomIn: `${m}-zoom-in`,
              zoomOut: `${m}-zoom-out`,
              unselectable: "ol-unselectable",
          },
          H = [
              {
                  text: "Zoom In",
                  classname: `${a.zoomIn} ${a.icon}`,
                  callback: (s, e) => {
                      const t = e.getView();
                      t.animate({
                          zoom: Number(t.getZoom()) + 1,
                          duration: 700,
                          center: s.coordinate,
                      });
                  },
              },
              {
                  text: "Zoom Out",
                  classname: `${a.zoomOut} ${a.icon}`,
                  callback: (s, e) => {
                      const t = e.getView();
                      t.animate({
                          zoom: Number(t.getZoom()) - 1,
                          duration: 700,
                          center: s.coordinate,
                      });
                  },
              },
          ];
      function x(s) {
          const e = document.createDocumentFragment(),
              t = document.createElement("div");
          for (t.innerHTML = s; t.firstChild; ) e.append(t.firstChild);
          return e;
      }
      function ae(s) {
          const e = document.importNode(s),
              t = s.offsetWidth;
          e.style.cssText = `position: fixed; top: 0; left: 0; overflow: auto; visibility: hidden; pointer-events: none; height: unset; max-height: unset; width: ${t}px`;
          const n = x("<span>Foo</span>"),
              r = x("<span>Foo</span>"),
              i = document.createElement("li"),
              o = document.createElement("li");
          i.append(n),
              o.append(r),
              e.append(i),
              e.append(o),
              s.parentNode?.append(e);
          const l = e.offsetHeight / 2;
          return s.parentNode?.removeChild(e), l;
      }
      function k({
          parentNode: s,
          item: e,
          isSubmenu: t = !1,
          isInsideSubmenu: n = !1,
          emitter: r,
      }) {
          const i = `_${Math.random().toString(36).slice(2, 11)}`;
          if (typeof e != "string" && "text" in e) {
              const _ = `<span>${e.text}</span>`,
                  y = x(_),
                  E = document.createElement("li");
              (e.classname = e.classname || ""),
                  e.icon &&
                      (e.classname === ""
                          ? (e.classname = a.icon)
                          : e.classname.includes(a.icon) === !1 &&
                            (e.classname += ` ${a.icon}`),
                      E.setAttribute(
                          "style",
                          `background-image:url(${e.icon})`
                      )),
                  (E.id = i),
                  (E.className = e.classname),
                  E.append(y),
                  s.append(E);
              const T = {
                  id: i,
                  isSubmenu: t,
                  isInsideSubmenu: n,
                  isSeparator: !1,
                  callback: "callback" in e ? e.callback : null,
                  data: "data" in e ? e.data : null,
              };
              return r.emit(f.ADD_MENU_ENTRY, T, E), E;
          }
          const o = `<li id="${i}" class="${a.separator}"><hr></li>`,
              l = x(o);
          s.append(l);
          const d = s.lastChild,
              c = {
                  id: i,
                  isSubmenu: !1,
                  isInsideSubmenu: !1,
                  isSeparator: !0,
                  callback: null,
                  data: null,
              };
          return r.emit(f.ADD_MENU_ENTRY, c, d), d;
      }
      function N({
          container: s,
          items: e,
          menuWidth: t,
          isInsideSubmenu: n,
          emitter: r,
      }) {
          e.forEach((i) => {
              if (
                  typeof i != "string" &&
                  "items" in i &&
                  Array.isArray(i.items)
              ) {
                  const o = k({
                      parentNode: s,
                      item: i,
                      isSubmenu: !0,
                      emitter: r,
                  });
                  o.classList.add(a.submenu);
                  const l = document.createElement("ul");
                  l.classList.add(a.container),
                      (l.style.width = `${t}px`),
                      o.append(l),
                      N({
                          emitter: r,
                          menuWidth: t,
                          container: l,
                          items: i.items,
                          isInsideSubmenu: !0,
                      });
              } else
                  k({
                      parentNode: s,
                      item: i,
                      isSubmenu: !1,
                      isInsideSubmenu: n,
                      emitter: r,
                  });
          });
      }
      const fe = "";
      function S(s, e) {
          if (!s) throw new Error(e);
      }
      class le extends Q {
          constructor(t = {}) {
              S(typeof t == "object", "@param `opts` should be object type!");
              const n = document.createElement("div");
              super({ element: n });
              h(this, "map");
              h(this, "emitter", new te());
              h(this, "container");
              h(this, "coordinate", []);
              h(this, "pixel", []);
              h(this, "contextMenuEventListener");
              h(this, "entryCallbackEventListener");
              h(this, "mapMoveListener");
              h(this, "lineHeight", 0);
              h(this, "disabled");
              h(this, "opened");
              h(this, "items", []);
              h(this, "menuEntries", new Map());
              h(this, "options");
              this.options = { ...oe, ...t };
              const r = document.createElement("ul");
              n.append(r),
                  (n.style.width = `${this.options.width}px`),
                  n.classList.add(a.container, a.unselectable, a.hidden),
                  (this.container = n),
                  (this.contextMenuEventListener = (i) => {
                      this.handleContextMenu(i);
                  }),
                  (this.entryCallbackEventListener = (i) => {
                      this.handleEntryCallback(i);
                  }),
                  (this.mapMoveListener = () => {
                      this.handleMapMove();
                  }),
                  (this.disabled = !1),
                  (this.opened = !1),
                  window.addEventListener(
                      "beforeunload",
                      () => {
                          this.removeListeners();
                      },
                      { once: !0 }
                  );
          }
          clear() {
              for (const t of this.menuEntries.keys()) this.removeMenuEntry(t);
              this.container.replaceChildren(),
                  this.container.append(document.createElement("ul"));
          }
          enable() {
              this.disabled = !1;
          }
          disable() {
              this.disabled = !0;
          }
          getDefaultItems() {
              return H;
          }
          countItems() {
              return this.menuEntries.size;
          }
          extend(t) {
              S(Array.isArray(t), "@param `items` should be an Array."),
                  N({
                      items: t,
                      emitter: this.emitter,
                      menuWidth: this.options.width,
                      container: this.container.firstElementChild,
                  });
          }
          closeMenu() {
              (this.opened = !1),
                  this.container.classList.add(a.hidden),
                  this.dispatchEvent(f.CLOSE);
          }
          isOpen() {
              return this.opened;
          }
          updatePosition(t) {
              S(Array.isArray(t), "@param `pixel` should be an Array."),
                  this.isOpen() && ((this.pixel = t), this.positionContainer());
          }
          pop() {
              const t = Array.from(this.menuEntries.keys()).pop();
              t && this.removeMenuEntry(t);
          }
          shift() {
              const t = Array.from(this.menuEntries.keys()).shift();
              t && this.removeMenuEntry(t);
          }
          push(t) {
              t && this.extend([t]);
          }
          setMap(t) {
              if ((super.setMap(t), t)) {
                  (this.map = t),
                      t
                          .getViewport()
                          .addEventListener(
                              this.options.eventType,
                              this.contextMenuEventListener,
                              !1
                          ),
                      t.on("movestart", () => {
                          this.handleMapMove();
                      }),
                      this.emitter.on(
                          f.ADD_MENU_ENTRY,
                          (r, i) => {
                              this.handleAddMenuEntry(r, i);
                          },
                          this
                      ),
                      (this.items = this.options.defaultItems
                          ? this.options.items.concat(H)
                          : this.options.items),
                      N({
                          items: this.items,
                          emitter: this.emitter,
                          menuWidth: this.options.width,
                          container: this.container.firstElementChild,
                      });
                  const n = this.getMenuEntriesLength();
                  this.lineHeight =
                      n > 0
                          ? this.container.offsetHeight / n
                          : ae(this.container);
              } else this.removeListeners(), this.clear();
          }
          removeListeners() {
              this.map
                  .getViewport()
                  .removeEventListener(
                      this.options.eventType,
                      this.contextMenuEventListener,
                      !1
                  ),
                  this.emitter.off(f.ADD_MENU_ENTRY);
          }
          removeMenuEntry(t) {
              let n = document.getElementById(t);
              n?.remove(), (n = null), this.menuEntries.delete(t);
          }
          handleContextMenu(t) {
              (this.coordinate = this.map.getEventCoordinate(t)),
                  (this.pixel = this.map.getEventPixel(t)),
                  this.dispatchEvent(
                      new I({
                          map: this.map,
                          originalEvent: t,
                          type: f.BEFOREOPEN,
                      })
                  ),
                  !this.disabled &&
                      (this.options.eventType === A.CONTEXTMENU &&
                          (t.stopPropagation(), t.preventDefault()),
                      setTimeout(() => {
                          this.openMenu(t);
                      }),
                      t.target?.addEventListener(
                          "pointerdown",
                          (n) => {
                              this.opened &&
                                  (n.stopPropagation(), this.closeMenu());
                          },
                          { once: !0 }
                      ));
          }
          openMenu(t) {
              (this.opened = !0),
                  this.positionContainer(),
                  this.container.classList.remove(a.hidden),
                  this.dispatchEvent(
                      new I({ map: this.map, originalEvent: t, type: f.OPEN })
                  );
          }
          getMenuEntriesLength() {
              return Array.from(this.menuEntries).filter(
                  ([, t]) =>
                      t.isSeparator === !1 &&
                      t.isSubmenu === !1 &&
                      t.isInsideSubmenu === !1
              ).length;
          }
          positionContainer() {
              const t = this.map.getSize() || [0, 0],
                  n = { w: t[0] - this.pixel[0], h: t[1] - this.pixel[1] },
                  r = this.getMenuEntriesLength(),
                  i = {
                      w: this.container.offsetWidth,
                      h: Math.round(this.lineHeight * r),
                  },
                  o = n.w >= i.w ? this.pixel[0] + 5 : this.pixel[0] - i.w;
              (this.container.style.left = `${o}px`),
                  (this.container.style.top =
                      n.h >= i.h
                          ? `${this.pixel[1] - 10}px`
                          : `${this.pixel[1] - i.h}px`),
                  (this.container.style.right = "auto"),
                  (this.container.style.bottom = "auto"),
                  (n.w -= i.w);
              const l = (_) =>
                  Array.from(_.children).filter(
                      (y) =>
                          y.tagName === "LI" && y.classList.contains(a.submenu)
                  );
              let d = 0;
              const c = (_, y) => {
                  (d += 1),
                      l(_).forEach((T) => {
                          const he = y >= i.w ? i.w - 8 : (i.w + 8) * -1,
                              p = T.querySelector(`ul.${a.container}`),
                              ce = Math.round(
                                  this.lineHeight *
                                      Array.from(p.children).filter(
                                          (ue) => ue.tagName === "LI"
                                      ).length
                              );
                          (p.style.left = `${he}px`),
                              (p.style.right = "auto"),
                              (p.style.top =
                                  n.h >= ce + i.h
                                      ? "0"
                                      : `-${p.offsetHeight - 25}px`),
                              (p.style.bottom = "auto"),
                              (p.style.zIndex = String(d)),
                              l(p).length > 0 && c(p, y - i.w);
                      });
              };
              c(this.container.firstElementChild, n.w);
          }
          handleMapMove() {
              this.closeMenu();
          }
          handleEntryCallback(t) {
              t.preventDefault(), t.stopPropagation();
              const n = t.currentTarget,
                  r = this.menuEntries.get(n.id);
              if (!r) return;
              const i = { data: r.data, coordinate: this.coordinate };
              this.closeMenu(), r.callback?.(i, this.map);
          }
          handleAddMenuEntry(t, n) {
              this.menuEntries.set(t.id, t),
                  this.positionContainer(),
                  "callback" in t &&
                      typeof t.callback == "function" &&
                      n.addEventListener(
                          "click",
                          this.entryCallbackEventListener,
                          !1
                      );
          }
      }
      return le;
  })();