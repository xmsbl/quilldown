function Ot() {
  return {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null
  };
}
let Ae = Ot();
function Vn(n) {
  Ae = n;
}
const Wn = /[&<>"']/, Qu = new RegExp(Wn.source, "g"), Gn = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, Xu = new RegExp(Gn.source, "g"), Yu = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, dn = (n) => Yu[n];
function Q(n, e) {
  if (e) {
    if (Wn.test(n))
      return n.replace(Qu, dn);
  } else if (Gn.test(n))
    return n.replace(Xu, dn);
  return n;
}
const Ju = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
function ei(n) {
  return n.replace(Ju, (e, t) => (t = t.toLowerCase(), t === "colon" ? ":" : t.charAt(0) === "#" ? t.charAt(1) === "x" ? String.fromCharCode(parseInt(t.substring(2), 16)) : String.fromCharCode(+t.substring(1)) : ""));
}
const ti = /(^|[^\[])\^/g;
function M(n, e) {
  let t = typeof n == "string" ? n : n.source;
  e = e || "";
  const u = {
    replace: (i, r) => {
      let a = typeof r == "string" ? r : r.source;
      return a = a.replace(ti, "$1"), t = t.replace(i, a), u;
    },
    getRegex: () => new RegExp(t, e)
  };
  return u;
}
function fn(n) {
  try {
    n = encodeURI(n).replace(/%25/g, "%");
  } catch {
    return null;
  }
  return n;
}
const De = { exec: () => null };
function hn(n, e) {
  const t = n.replace(/\|/g, (r, a, s) => {
    let o = !1, c = a;
    for (; --c >= 0 && s[c] === "\\"; )
      o = !o;
    return o ? "|" : " |";
  }), u = t.split(/ \|/);
  let i = 0;
  if (u[0].trim() || u.shift(), u.length > 0 && !u[u.length - 1].trim() && u.pop(), e)
    if (u.length > e)
      u.splice(e);
    else
      for (; u.length < e; )
        u.push("");
  for (; i < u.length; i++)
    u[i] = u[i].trim().replace(/\\\|/g, "|");
  return u;
}
function ze(n, e, t) {
  const u = n.length;
  if (u === 0)
    return "";
  let i = 0;
  for (; i < u && n.charAt(u - i - 1) === e; )
    i++;
  return n.slice(0, u - i);
}
function ni(n, e) {
  if (n.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let u = 0; u < n.length; u++)
    if (n[u] === "\\")
      u++;
    else if (n[u] === e[0])
      t++;
    else if (n[u] === e[1] && (t--, t < 0))
      return u;
  return -1;
}
function pn(n, e, t, u) {
  const i = e.href, r = e.title ? Q(e.title) : null, a = n[1].replace(/\\([\[\]])/g, "$1");
  if (n[0].charAt(0) !== "!") {
    u.state.inLink = !0;
    const s = {
      type: "link",
      raw: t,
      href: i,
      title: r,
      text: a,
      tokens: u.inlineTokens(a)
    };
    return u.state.inLink = !1, s;
  }
  return {
    type: "image",
    raw: t,
    href: i,
    title: r,
    text: Q(a)
  };
}
function ui(n, e) {
  const t = n.match(/^(\s+)(?:```)/);
  if (t === null)
    return e;
  const u = t[1];
  return e.split(`
`).map((i) => {
    const r = i.match(/^\s+/);
    if (r === null)
      return i;
    const [a] = r;
    return a.length >= u.length ? i.slice(u.length) : i;
  }).join(`
`);
}
class Qe {
  options;
  rules;
  // set by the lexer
  lexer;
  // set by the lexer
  constructor(e) {
    this.options = e || Ae;
  }
  space(e) {
    const t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return {
        type: "space",
        raw: t[0]
      };
  }
  code(e) {
    const t = this.rules.block.code.exec(e);
    if (t) {
      const u = t[0].replace(/^ {1,4}/gm, "");
      return {
        type: "code",
        raw: t[0],
        codeBlockStyle: "indented",
        text: this.options.pedantic ? u : ze(u, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const u = t[0], i = ui(u, t[3] || "");
      return {
        type: "code",
        raw: u,
        lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
        text: i
      };
    }
  }
  heading(e) {
    const t = this.rules.block.heading.exec(e);
    if (t) {
      let u = t[2].trim();
      if (/#$/.test(u)) {
        const i = ze(u, "#");
        (this.options.pedantic || !i || / $/.test(i)) && (u = i.trim());
      }
      return {
        type: "heading",
        raw: t[0],
        depth: t[1].length,
        text: u,
        tokens: this.lexer.inline(u)
      };
    }
  }
  hr(e) {
    const t = this.rules.block.hr.exec(e);
    if (t)
      return {
        type: "hr",
        raw: t[0]
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let u = t[0].replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g, `
    $1`);
      u = ze(u.replace(/^ *>[ \t]?/gm, ""), `
`);
      const i = this.lexer.state.top;
      this.lexer.state.top = !0;
      const r = this.lexer.blockTokens(u);
      return this.lexer.state.top = i, {
        type: "blockquote",
        raw: t[0],
        tokens: r,
        text: u
      };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let u = t[1].trim();
      const i = u.length > 1, r = {
        type: "list",
        raw: "",
        ordered: i,
        start: i ? +u.slice(0, -1) : "",
        loose: !1,
        items: []
      };
      u = i ? `\\d{1,9}\\${u.slice(-1)}` : `\\${u}`, this.options.pedantic && (u = i ? u : "[*+-]");
      const a = new RegExp(`^( {0,3}${u})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      let s = "", o = "", c = !1;
      for (; e; ) {
        let d = !1;
        if (!(t = a.exec(e)) || this.rules.block.hr.test(e))
          break;
        s = t[0], e = e.substring(s.length);
        let l = t[2].split(`
`, 1)[0].replace(/^\t+/, (G) => " ".repeat(3 * G.length)), p = e.split(`
`, 1)[0], w = 0;
        this.options.pedantic ? (w = 2, o = l.trimStart()) : (w = t[2].search(/[^ ]/), w = w > 4 ? 1 : w, o = l.slice(w), w += t[1].length);
        let A = !1;
        if (!l && /^ *$/.test(p) && (s += p + `
`, e = e.substring(p.length + 1), d = !0), !d) {
          const G = new RegExp(`^ {0,${Math.min(3, w - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), ae = new RegExp(`^ {0,${Math.min(3, w - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), z = new RegExp(`^ {0,${Math.min(3, w - 1)}}(?:\`\`\`|~~~)`), ee = new RegExp(`^ {0,${Math.min(3, w - 1)}}#`);
          for (; e; ) {
            const K = e.split(`
`, 1)[0];
            if (p = K, this.options.pedantic && (p = p.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ")), z.test(p) || ee.test(p) || G.test(p) || ae.test(e))
              break;
            if (p.search(/[^ ]/) >= w || !p.trim())
              o += `
` + p.slice(w);
            else {
              if (A || l.search(/[^ ]/) >= 4 || z.test(l) || ee.test(l) || ae.test(l))
                break;
              o += `
` + p;
            }
            !A && !p.trim() && (A = !0), s += K + `
`, e = e.substring(K.length + 1), l = p.slice(w);
          }
        }
        r.loose || (c ? r.loose = !0 : /\n *\n *$/.test(s) && (c = !0));
        let R = null, T;
        this.options.gfm && (R = /^\[[ xX]\] /.exec(o), R && (T = R[0] !== "[ ] ", o = o.replace(/^\[[ xX]\] +/, ""))), r.items.push({
          type: "list_item",
          raw: s,
          task: !!R,
          checked: T,
          loose: !1,
          text: o,
          tokens: []
        }), r.raw += s;
      }
      r.items[r.items.length - 1].raw = s.trimEnd(), r.items[r.items.length - 1].text = o.trimEnd(), r.raw = r.raw.trimEnd();
      for (let d = 0; d < r.items.length; d++)
        if (this.lexer.state.top = !1, r.items[d].tokens = this.lexer.blockTokens(r.items[d].text, []), !r.loose) {
          const l = r.items[d].tokens.filter((w) => w.type === "space"), p = l.length > 0 && l.some((w) => /\n.*\n/.test(w.raw));
          r.loose = p;
        }
      if (r.loose)
        for (let d = 0; d < r.items.length; d++)
          r.items[d].loose = !0;
      return r;
    }
  }
  html(e) {
    const t = this.rules.block.html.exec(e);
    if (t)
      return {
        type: "html",
        block: !0,
        raw: t[0],
        pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
        text: t[0]
      };
  }
  def(e) {
    const t = this.rules.block.def.exec(e);
    if (t) {
      const u = t[1].toLowerCase().replace(/\s+/g, " "), i = t[2] ? t[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return {
        type: "def",
        tag: u,
        raw: t[0],
        href: i,
        title: r
      };
    }
  }
  table(e) {
    const t = this.rules.block.table.exec(e);
    if (!t || !/[:|]/.test(t[2]))
      return;
    const u = hn(t[1]), i = t[2].replace(/^\||\| *$/g, "").split("|"), r = t[3] && t[3].trim() ? t[3].replace(/\n[ \t]*$/, "").split(`
`) : [], a = {
      type: "table",
      raw: t[0],
      header: [],
      align: [],
      rows: []
    };
    if (u.length === i.length) {
      for (const s of i)
        /^ *-+: *$/.test(s) ? a.align.push("right") : /^ *:-+: *$/.test(s) ? a.align.push("center") : /^ *:-+ *$/.test(s) ? a.align.push("left") : a.align.push(null);
      for (const s of u)
        a.header.push({
          text: s,
          tokens: this.lexer.inline(s)
        });
      for (const s of r)
        a.rows.push(hn(s, a.header.length).map((o) => ({
          text: o,
          tokens: this.lexer.inline(o)
        })));
      return a;
    }
  }
  lheading(e) {
    const t = this.rules.block.lheading.exec(e);
    if (t)
      return {
        type: "heading",
        raw: t[0],
        depth: t[2].charAt(0) === "=" ? 1 : 2,
        text: t[1],
        tokens: this.lexer.inline(t[1])
      };
  }
  paragraph(e) {
    const t = this.rules.block.paragraph.exec(e);
    if (t) {
      const u = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return {
        type: "paragraph",
        raw: t[0],
        text: u,
        tokens: this.lexer.inline(u)
      };
    }
  }
  text(e) {
    const t = this.rules.block.text.exec(e);
    if (t)
      return {
        type: "text",
        raw: t[0],
        text: t[0],
        tokens: this.lexer.inline(t[0])
      };
  }
  escape(e) {
    const t = this.rules.inline.escape.exec(e);
    if (t)
      return {
        type: "escape",
        raw: t[0],
        text: Q(t[1])
      };
  }
  tag(e) {
    const t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && /^<a /i.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && /^<\/a>/i.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
        type: "html",
        raw: t[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: !1,
        text: t[0]
      };
  }
  link(e) {
    const t = this.rules.inline.link.exec(e);
    if (t) {
      const u = t[2].trim();
      if (!this.options.pedantic && /^</.test(u)) {
        if (!/>$/.test(u))
          return;
        const a = ze(u.slice(0, -1), "\\");
        if ((u.length - a.length) % 2 === 0)
          return;
      } else {
        const a = ni(t[2], "()");
        if (a > -1) {
          const o = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + a;
          t[2] = t[2].substring(0, a), t[0] = t[0].substring(0, o).trim(), t[3] = "";
        }
      }
      let i = t[2], r = "";
      if (this.options.pedantic) {
        const a = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(i);
        a && (i = a[1], r = a[3]);
      } else
        r = t[3] ? t[3].slice(1, -1) : "";
      return i = i.trim(), /^</.test(i) && (this.options.pedantic && !/>$/.test(u) ? i = i.slice(1) : i = i.slice(1, -1)), pn(t, {
        href: i && i.replace(this.rules.inline.anyPunctuation, "$1"),
        title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
      }, t[0], this.lexer);
    }
  }
  reflink(e, t) {
    let u;
    if ((u = this.rules.inline.reflink.exec(e)) || (u = this.rules.inline.nolink.exec(e))) {
      const i = (u[2] || u[1]).replace(/\s+/g, " "), r = t[i.toLowerCase()];
      if (!r) {
        const a = u[0].charAt(0);
        return {
          type: "text",
          raw: a,
          text: a
        };
      }
      return pn(u, r, u[0], this.lexer);
    }
  }
  emStrong(e, t, u = "") {
    let i = this.rules.inline.emStrongLDelim.exec(e);
    if (!i || i[3] && u.match(/[\p{L}\p{N}]/u))
      return;
    if (!(i[1] || i[2] || "") || !u || this.rules.inline.punctuation.exec(u)) {
      const a = [...i[0]].length - 1;
      let s, o, c = a, d = 0;
      const l = i[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (l.lastIndex = 0, t = t.slice(-1 * e.length + a); (i = l.exec(t)) != null; ) {
        if (s = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !s)
          continue;
        if (o = [...s].length, i[3] || i[4]) {
          c += o;
          continue;
        } else if ((i[5] || i[6]) && a % 3 && !((a + o) % 3)) {
          d += o;
          continue;
        }
        if (c -= o, c > 0)
          continue;
        o = Math.min(o, o + c + d);
        const p = [...i[0]][0].length, w = e.slice(0, a + i.index + p + o);
        if (Math.min(a, o) % 2) {
          const R = w.slice(1, -1);
          return {
            type: "em",
            raw: w,
            text: R,
            tokens: this.lexer.inlineTokens(R)
          };
        }
        const A = w.slice(2, -2);
        return {
          type: "strong",
          raw: w,
          text: A,
          tokens: this.lexer.inlineTokens(A)
        };
      }
    }
  }
  codespan(e) {
    const t = this.rules.inline.code.exec(e);
    if (t) {
      let u = t[2].replace(/\n/g, " ");
      const i = /[^ ]/.test(u), r = /^ /.test(u) && / $/.test(u);
      return i && r && (u = u.substring(1, u.length - 1)), u = Q(u, !0), {
        type: "codespan",
        raw: t[0],
        text: u
      };
    }
  }
  br(e) {
    const t = this.rules.inline.br.exec(e);
    if (t)
      return {
        type: "br",
        raw: t[0]
      };
  }
  del(e) {
    const t = this.rules.inline.del.exec(e);
    if (t)
      return {
        type: "del",
        raw: t[0],
        text: t[2],
        tokens: this.lexer.inlineTokens(t[2])
      };
  }
  autolink(e) {
    const t = this.rules.inline.autolink.exec(e);
    if (t) {
      let u, i;
      return t[2] === "@" ? (u = Q(t[1]), i = "mailto:" + u) : (u = Q(t[1]), i = u), {
        type: "link",
        raw: t[0],
        text: u,
        href: i,
        tokens: [
          {
            type: "text",
            raw: u,
            text: u
          }
        ]
      };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let u, i;
      if (t[2] === "@")
        u = Q(t[0]), i = "mailto:" + u;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        u = Q(t[0]), t[1] === "www." ? i = "http://" + t[0] : i = t[0];
      }
      return {
        type: "link",
        raw: t[0],
        text: u,
        href: i,
        tokens: [
          {
            type: "text",
            raw: u,
            text: u
          }
        ]
      };
    }
  }
  inlineText(e) {
    const t = this.rules.inline.text.exec(e);
    if (t) {
      let u;
      return this.lexer.state.inRawBlock ? u = t[0] : u = Q(t[0]), {
        type: "text",
        raw: t[0],
        text: u
      };
    }
  }
}
const ii = /^(?: *(?:\n|$))+/, ri = /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/, ai = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Oe = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, si = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Kn = /(?:[*+-]|\d{1,9}[.)])/, Zn = M(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g, Kn).replace(/blockCode/g, / {4}/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).getRegex(), Pt = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, oi = /^[^\n]+/, Ht = /(?!\s*\])(?:\\.|[^\[\]\\])+/, ci = M(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label", Ht).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), li = M(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Kn).getRegex(), ut = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", zt = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, di = M("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))", "i").replace("comment", zt).replace("tag", ut).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Qn = M(Pt).replace("hr", Oe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ut).getRegex(), fi = M(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Qn).getRegex(), Ut = {
  blockquote: fi,
  code: ri,
  def: ci,
  fences: ai,
  heading: si,
  hr: Oe,
  html: di,
  lheading: Zn,
  list: li,
  newline: ii,
  paragraph: Qn,
  table: De,
  text: oi
}, mn = M("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", Oe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ut).getRegex(), hi = {
  ...Ut,
  table: mn,
  paragraph: M(Pt).replace("hr", Oe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", mn).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ut).getRegex()
}, pi = {
  ...Ut,
  html: M(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", zt).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: De,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: M(Pt).replace("hr", Oe).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Zn).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Xn = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, mi = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Yn = /^( {2,}|\\)\n(?!\s*$)/, bi = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Pe = "\\p{P}\\p{S}", gi = M(/^((?![*_])[\spunctuation])/, "u").replace(/punctuation/g, Pe).getRegex(), xi = /\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g, ki = M(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/, "u").replace(/punct/g, Pe).getRegex(), wi = M("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])", "gu").replace(/punct/g, Pe).getRegex(), yi = M("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])", "gu").replace(/punct/g, Pe).getRegex(), vi = M(/\\([punct])/, "gu").replace(/punct/g, Pe).getRegex(), Ei = M(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Ai = M(zt).replace("(?:-->|$)", "-->").getRegex(), Ci = M("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Ai).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Xe = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, Si = M(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label", Xe).replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Jn = M(/^!?\[(label)\]\[(ref)\]/).replace("label", Xe).replace("ref", Ht).getRegex(), eu = M(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ht).getRegex(), Ti = M("reflink|nolink(?!\\()", "g").replace("reflink", Jn).replace("nolink", eu).getRegex(), Ft = {
  _backpedal: De,
  // only used for GFM url
  anyPunctuation: vi,
  autolink: Ei,
  blockSkip: xi,
  br: Yn,
  code: mi,
  del: De,
  emStrongLDelim: ki,
  emStrongRDelimAst: wi,
  emStrongRDelimUnd: yi,
  escape: Xn,
  link: Si,
  nolink: eu,
  punctuation: gi,
  reflink: Jn,
  reflinkSearch: Ti,
  tag: Ci,
  text: bi,
  url: De
}, Ni = {
  ...Ft,
  link: M(/^!?\[(label)\]\((.*?)\)/).replace("label", Xe).getRegex(),
  reflink: M(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Xe).getRegex()
}, Tt = {
  ...Ft,
  escape: M(Xn).replace("])", "~|])").getRegex(),
  url: M(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, _i = {
  ...Tt,
  br: M(Yn).replace("{2,}", "*").getRegex(),
  text: M(Tt.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Ue = {
  normal: Ut,
  gfm: hi,
  pedantic: pi
}, $e = {
  normal: Ft,
  gfm: Tt,
  breaks: _i,
  pedantic: Ni
};
class ue {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || Ae, this.options.tokenizer = this.options.tokenizer || new Qe(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const t = {
      block: Ue.normal,
      inline: $e.normal
    };
    this.options.pedantic ? (t.block = Ue.pedantic, t.inline = $e.pedantic) : this.options.gfm && (t.block = Ue.gfm, this.options.breaks ? t.inline = $e.breaks : t.inline = $e.gfm), this.tokenizer.rules = t;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: Ue,
      inline: $e
    };
  }
  /**
   * Static Lex Method
   */
  static lex(e, t) {
    return new ue(t).lex(e);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(e, t) {
    return new ue(t).inlineTokens(e);
  }
  /**
   * Preprocessing
   */
  lex(e) {
    e = e.replace(/\r\n|\r/g, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      const u = this.inlineQueue[t];
      this.inlineTokens(u.src, u.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = []) {
    this.options.pedantic ? e = e.replace(/\t/g, "    ").replace(/^ +$/gm, "") : e = e.replace(/^( *)(\t+)/gm, (s, o, c) => o + "    ".repeat(c.length));
    let u, i, r, a;
    for (; e; )
      if (!(this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((s) => (u = s.call({ lexer: this }, e, t)) ? (e = e.substring(u.raw.length), t.push(u), !0) : !1))) {
        if (u = this.tokenizer.space(e)) {
          e = e.substring(u.raw.length), u.raw.length === 1 && t.length > 0 ? t[t.length - 1].raw += `
` : t.push(u);
          continue;
        }
        if (u = this.tokenizer.code(e)) {
          e = e.substring(u.raw.length), i = t[t.length - 1], i && (i.type === "paragraph" || i.type === "text") ? (i.raw += `
` + u.raw, i.text += `
` + u.text, this.inlineQueue[this.inlineQueue.length - 1].src = i.text) : t.push(u);
          continue;
        }
        if (u = this.tokenizer.fences(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.heading(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.hr(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.blockquote(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.list(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.html(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.def(e)) {
          e = e.substring(u.raw.length), i = t[t.length - 1], i && (i.type === "paragraph" || i.type === "text") ? (i.raw += `
` + u.raw, i.text += `
` + u.raw, this.inlineQueue[this.inlineQueue.length - 1].src = i.text) : this.tokens.links[u.tag] || (this.tokens.links[u.tag] = {
            href: u.href,
            title: u.title
          });
          continue;
        }
        if (u = this.tokenizer.table(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.lheading(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (r = e, this.options.extensions && this.options.extensions.startBlock) {
          let s = 1 / 0;
          const o = e.slice(1);
          let c;
          this.options.extensions.startBlock.forEach((d) => {
            c = d.call({ lexer: this }, o), typeof c == "number" && c >= 0 && (s = Math.min(s, c));
          }), s < 1 / 0 && s >= 0 && (r = e.substring(0, s + 1));
        }
        if (this.state.top && (u = this.tokenizer.paragraph(r))) {
          i = t[t.length - 1], a && i.type === "paragraph" ? (i.raw += `
` + u.raw, i.text += `
` + u.text, this.inlineQueue.pop(), this.inlineQueue[this.inlineQueue.length - 1].src = i.text) : t.push(u), a = r.length !== e.length, e = e.substring(u.raw.length);
          continue;
        }
        if (u = this.tokenizer.text(e)) {
          e = e.substring(u.raw.length), i = t[t.length - 1], i && i.type === "text" ? (i.raw += `
` + u.raw, i.text += `
` + u.text, this.inlineQueue.pop(), this.inlineQueue[this.inlineQueue.length - 1].src = i.text) : t.push(u);
          continue;
        }
        if (e) {
          const s = "Infinite loop on byte: " + e.charCodeAt(0);
          if (this.options.silent) {
            console.error(s);
            break;
          } else
            throw new Error(s);
        }
      }
    return this.state.top = !0, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(e, t = []) {
    let u, i, r, a = e, s, o, c;
    if (this.tokens.links) {
      const d = Object.keys(this.tokens.links);
      if (d.length > 0)
        for (; (s = this.tokenizer.rules.inline.reflinkSearch.exec(a)) != null; )
          d.includes(s[0].slice(s[0].lastIndexOf("[") + 1, -1)) && (a = a.slice(0, s.index) + "[" + "a".repeat(s[0].length - 2) + "]" + a.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (s = this.tokenizer.rules.inline.blockSkip.exec(a)) != null; )
      a = a.slice(0, s.index) + "[" + "a".repeat(s[0].length - 2) + "]" + a.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    for (; (s = this.tokenizer.rules.inline.anyPunctuation.exec(a)) != null; )
      a = a.slice(0, s.index) + "++" + a.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; e; )
      if (o || (c = ""), o = !1, !(this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((d) => (u = d.call({ lexer: this }, e, t)) ? (e = e.substring(u.raw.length), t.push(u), !0) : !1))) {
        if (u = this.tokenizer.escape(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.tag(e)) {
          e = e.substring(u.raw.length), i = t[t.length - 1], i && u.type === "text" && i.type === "text" ? (i.raw += u.raw, i.text += u.text) : t.push(u);
          continue;
        }
        if (u = this.tokenizer.link(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.reflink(e, this.tokens.links)) {
          e = e.substring(u.raw.length), i = t[t.length - 1], i && u.type === "text" && i.type === "text" ? (i.raw += u.raw, i.text += u.text) : t.push(u);
          continue;
        }
        if (u = this.tokenizer.emStrong(e, a, c)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.codespan(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.br(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.del(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (u = this.tokenizer.autolink(e)) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (!this.state.inLink && (u = this.tokenizer.url(e))) {
          e = e.substring(u.raw.length), t.push(u);
          continue;
        }
        if (r = e, this.options.extensions && this.options.extensions.startInline) {
          let d = 1 / 0;
          const l = e.slice(1);
          let p;
          this.options.extensions.startInline.forEach((w) => {
            p = w.call({ lexer: this }, l), typeof p == "number" && p >= 0 && (d = Math.min(d, p));
          }), d < 1 / 0 && d >= 0 && (r = e.substring(0, d + 1));
        }
        if (u = this.tokenizer.inlineText(r)) {
          e = e.substring(u.raw.length), u.raw.slice(-1) !== "_" && (c = u.raw.slice(-1)), o = !0, i = t[t.length - 1], i && i.type === "text" ? (i.raw += u.raw, i.text += u.text) : t.push(u);
          continue;
        }
        if (e) {
          const d = "Infinite loop on byte: " + e.charCodeAt(0);
          if (this.options.silent) {
            console.error(d);
            break;
          } else
            throw new Error(d);
        }
      }
    return t;
  }
}
class Ye {
  options;
  constructor(e) {
    this.options = e || Ae;
  }
  code(e, t, u) {
    const i = (t || "").match(/^\S*/)?.[0];
    return e = e.replace(/\n$/, "") + `
`, i ? '<pre><code class="language-' + Q(i) + '">' + (u ? e : Q(e, !0)) + `</code></pre>
` : "<pre><code>" + (u ? e : Q(e, !0)) + `</code></pre>
`;
  }
  blockquote(e) {
    return `<blockquote>
${e}</blockquote>
`;
  }
  html(e, t) {
    return e;
  }
  heading(e, t, u) {
    return `<h${t}>${e}</h${t}>
`;
  }
  hr() {
    return `<hr>
`;
  }
  list(e, t, u) {
    const i = t ? "ol" : "ul", r = t && u !== 1 ? ' start="' + u + '"' : "";
    return "<" + i + r + `>
` + e + "</" + i + `>
`;
  }
  listitem(e, t, u) {
    return `<li>${e}</li>
`;
  }
  checkbox(e) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph(e) {
    return `<p>${e}</p>
`;
  }
  table(e, t) {
    return t && (t = `<tbody>${t}</tbody>`), `<table>
<thead>
` + e + `</thead>
` + t + `</table>
`;
  }
  tablerow(e) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e, t) {
    const u = t.header ? "th" : "td";
    return (t.align ? `<${u} align="${t.align}">` : `<${u}>`) + e + `</${u}>
`;
  }
  /**
   * span level renderer
   */
  strong(e) {
    return `<strong>${e}</strong>`;
  }
  em(e) {
    return `<em>${e}</em>`;
  }
  codespan(e) {
    return `<code>${e}</code>`;
  }
  br() {
    return "<br>";
  }
  del(e) {
    return `<del>${e}</del>`;
  }
  link(e, t, u) {
    const i = fn(e);
    if (i === null)
      return u;
    e = i;
    let r = '<a href="' + e + '"';
    return t && (r += ' title="' + t + '"'), r += ">" + u + "</a>", r;
  }
  image(e, t, u) {
    const i = fn(e);
    if (i === null)
      return u;
    e = i;
    let r = `<img src="${e}" alt="${u}"`;
    return t && (r += ` title="${t}"`), r += ">", r;
  }
  text(e) {
    return e;
  }
}
class jt {
  // no need for block level renderers
  strong(e) {
    return e;
  }
  em(e) {
    return e;
  }
  codespan(e) {
    return e;
  }
  del(e) {
    return e;
  }
  html(e) {
    return e;
  }
  text(e) {
    return e;
  }
  link(e, t, u) {
    return "" + u;
  }
  image(e, t, u) {
    return "" + u;
  }
  br() {
    return "";
  }
}
class ie {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || Ae, this.options.renderer = this.options.renderer || new Ye(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.textRenderer = new jt();
  }
  /**
   * Static Parse Method
   */
  static parse(e, t) {
    return new ie(t).parse(e);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(e, t) {
    return new ie(t).parseInline(e);
  }
  /**
   * Parse Loop
   */
  parse(e, t = !0) {
    let u = "";
    for (let i = 0; i < e.length; i++) {
      const r = e[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[r.type]) {
        const a = r, s = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (s !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(a.type)) {
          u += s || "";
          continue;
        }
      }
      switch (r.type) {
        case "space":
          continue;
        case "hr": {
          u += this.renderer.hr();
          continue;
        }
        case "heading": {
          const a = r;
          u += this.renderer.heading(this.parseInline(a.tokens), a.depth, ei(this.parseInline(a.tokens, this.textRenderer)));
          continue;
        }
        case "code": {
          const a = r;
          u += this.renderer.code(a.text, a.lang, !!a.escaped);
          continue;
        }
        case "table": {
          const a = r;
          let s = "", o = "";
          for (let d = 0; d < a.header.length; d++)
            o += this.renderer.tablecell(this.parseInline(a.header[d].tokens), { header: !0, align: a.align[d] });
          s += this.renderer.tablerow(o);
          let c = "";
          for (let d = 0; d < a.rows.length; d++) {
            const l = a.rows[d];
            o = "";
            for (let p = 0; p < l.length; p++)
              o += this.renderer.tablecell(this.parseInline(l[p].tokens), { header: !1, align: a.align[p] });
            c += this.renderer.tablerow(o);
          }
          u += this.renderer.table(s, c);
          continue;
        }
        case "blockquote": {
          const a = r, s = this.parse(a.tokens);
          u += this.renderer.blockquote(s);
          continue;
        }
        case "list": {
          const a = r, s = a.ordered, o = a.start, c = a.loose;
          let d = "";
          for (let l = 0; l < a.items.length; l++) {
            const p = a.items[l], w = p.checked, A = p.task;
            let R = "";
            if (p.task) {
              const T = this.renderer.checkbox(!!w);
              c ? p.tokens.length > 0 && p.tokens[0].type === "paragraph" ? (p.tokens[0].text = T + " " + p.tokens[0].text, p.tokens[0].tokens && p.tokens[0].tokens.length > 0 && p.tokens[0].tokens[0].type === "text" && (p.tokens[0].tokens[0].text = T + " " + p.tokens[0].tokens[0].text)) : p.tokens.unshift({
                type: "text",
                text: T + " "
              }) : R += T + " ";
            }
            R += this.parse(p.tokens, c), d += this.renderer.listitem(R, A, !!w);
          }
          u += this.renderer.list(d, s, o);
          continue;
        }
        case "html": {
          const a = r;
          u += this.renderer.html(a.text, a.block);
          continue;
        }
        case "paragraph": {
          const a = r;
          u += this.renderer.paragraph(this.parseInline(a.tokens));
          continue;
        }
        case "text": {
          let a = r, s = a.tokens ? this.parseInline(a.tokens) : a.text;
          for (; i + 1 < e.length && e[i + 1].type === "text"; )
            a = e[++i], s += `
` + (a.tokens ? this.parseInline(a.tokens) : a.text);
          u += t ? this.renderer.paragraph(s) : s;
          continue;
        }
        default: {
          const a = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return u;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(e, t) {
    t = t || this.renderer;
    let u = "";
    for (let i = 0; i < e.length; i++) {
      const r = e[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[r.type]) {
        const a = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (a !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          u += a || "";
          continue;
        }
      }
      switch (r.type) {
        case "escape": {
          const a = r;
          u += t.text(a.text);
          break;
        }
        case "html": {
          const a = r;
          u += t.html(a.text);
          break;
        }
        case "link": {
          const a = r;
          u += t.link(a.href, a.title, this.parseInline(a.tokens, t));
          break;
        }
        case "image": {
          const a = r;
          u += t.image(a.href, a.title, a.text);
          break;
        }
        case "strong": {
          const a = r;
          u += t.strong(this.parseInline(a.tokens, t));
          break;
        }
        case "em": {
          const a = r;
          u += t.em(this.parseInline(a.tokens, t));
          break;
        }
        case "codespan": {
          const a = r;
          u += t.codespan(a.text);
          break;
        }
        case "br": {
          u += t.br();
          break;
        }
        case "del": {
          const a = r;
          u += t.del(this.parseInline(a.tokens, t));
          break;
        }
        case "text": {
          const a = r;
          u += t.text(a.text);
          break;
        }
        default: {
          const a = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return u;
  }
}
class We {
  options;
  constructor(e) {
    this.options = e || Ae;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(e) {
    return e;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(e) {
    return e;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(e) {
    return e;
  }
}
class Vt {
  defaults = Ot();
  options = this.setOptions;
  parse = this.#e(ue.lex, ie.parse);
  parseInline = this.#e(ue.lexInline, ie.parseInline);
  Parser = ie;
  Renderer = Ye;
  TextRenderer = jt;
  Lexer = ue;
  Tokenizer = Qe;
  Hooks = We;
  constructor(...e) {
    this.use(...e);
  }
  /**
   * Run callback for every token
   */
  walkTokens(e, t) {
    let u = [];
    for (const i of e)
      switch (u = u.concat(t.call(this, i)), i.type) {
        case "table": {
          const r = i;
          for (const a of r.header)
            u = u.concat(this.walkTokens(a.tokens, t));
          for (const a of r.rows)
            for (const s of a)
              u = u.concat(this.walkTokens(s.tokens, t));
          break;
        }
        case "list": {
          const r = i;
          u = u.concat(this.walkTokens(r.items, t));
          break;
        }
        default: {
          const r = i;
          this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((a) => {
            const s = r[a].flat(1 / 0);
            u = u.concat(this.walkTokens(s, t));
          }) : r.tokens && (u = u.concat(this.walkTokens(r.tokens, t)));
        }
      }
    return u;
  }
  use(...e) {
    const t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((u) => {
      const i = { ...u };
      if (i.async = this.defaults.async || i.async || !1, u.extensions && (u.extensions.forEach((r) => {
        if (!r.name)
          throw new Error("extension name required");
        if ("renderer" in r) {
          const a = t.renderers[r.name];
          a ? t.renderers[r.name] = function(...s) {
            let o = r.renderer.apply(this, s);
            return o === !1 && (o = a.apply(this, s)), o;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          const a = t[r.level];
          a ? a.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), i.extensions = t), u.renderer) {
        const r = this.defaults.renderer || new Ye(this.defaults);
        for (const a in u.renderer) {
          if (!(a in r))
            throw new Error(`renderer '${a}' does not exist`);
          if (a === "options")
            continue;
          const s = a, o = u.renderer[s], c = r[s];
          r[s] = (...d) => {
            let l = o.apply(r, d);
            return l === !1 && (l = c.apply(r, d)), l || "";
          };
        }
        i.renderer = r;
      }
      if (u.tokenizer) {
        const r = this.defaults.tokenizer || new Qe(this.defaults);
        for (const a in u.tokenizer) {
          if (!(a in r))
            throw new Error(`tokenizer '${a}' does not exist`);
          if (["options", "rules", "lexer"].includes(a))
            continue;
          const s = a, o = u.tokenizer[s], c = r[s];
          r[s] = (...d) => {
            let l = o.apply(r, d);
            return l === !1 && (l = c.apply(r, d)), l;
          };
        }
        i.tokenizer = r;
      }
      if (u.hooks) {
        const r = this.defaults.hooks || new We();
        for (const a in u.hooks) {
          if (!(a in r))
            throw new Error(`hook '${a}' does not exist`);
          if (a === "options")
            continue;
          const s = a, o = u.hooks[s], c = r[s];
          We.passThroughHooks.has(a) ? r[s] = (d) => {
            if (this.defaults.async)
              return Promise.resolve(o.call(r, d)).then((p) => c.call(r, p));
            const l = o.call(r, d);
            return c.call(r, l);
          } : r[s] = (...d) => {
            let l = o.apply(r, d);
            return l === !1 && (l = c.apply(r, d)), l;
          };
        }
        i.hooks = r;
      }
      if (u.walkTokens) {
        const r = this.defaults.walkTokens, a = u.walkTokens;
        i.walkTokens = function(s) {
          let o = [];
          return o.push(a.call(this, s)), r && (o = o.concat(r.call(this, s))), o;
        };
      }
      this.defaults = { ...this.defaults, ...i };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return ue.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return ie.parse(e, t ?? this.defaults);
  }
  #e(e, t) {
    return (u, i) => {
      const r = { ...i }, a = { ...this.defaults, ...r };
      this.defaults.async === !0 && r.async === !1 && (a.silent || console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."), a.async = !0);
      const s = this.#t(!!a.silent, !!a.async);
      if (typeof u > "u" || u === null)
        return s(new Error("marked(): input parameter is undefined or null"));
      if (typeof u != "string")
        return s(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(u) + ", string expected"));
      if (a.hooks && (a.hooks.options = a), a.async)
        return Promise.resolve(a.hooks ? a.hooks.preprocess(u) : u).then((o) => e(o, a)).then((o) => a.hooks ? a.hooks.processAllTokens(o) : o).then((o) => a.walkTokens ? Promise.all(this.walkTokens(o, a.walkTokens)).then(() => o) : o).then((o) => t(o, a)).then((o) => a.hooks ? a.hooks.postprocess(o) : o).catch(s);
      try {
        a.hooks && (u = a.hooks.preprocess(u));
        let o = e(u, a);
        a.hooks && (o = a.hooks.processAllTokens(o)), a.walkTokens && this.walkTokens(o, a.walkTokens);
        let c = t(o, a);
        return a.hooks && (c = a.hooks.postprocess(c)), c;
      } catch (o) {
        return s(o);
      }
    };
  }
  #t(e, t) {
    return (u) => {
      if (u.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const i = "<p>An error occurred:</p><pre>" + Q(u.message + "", !0) + "</pre>";
        return t ? Promise.resolve(i) : i;
      }
      if (t)
        return Promise.reject(u);
      throw u;
    };
  }
}
const Ee = new Vt();
function B(n, e) {
  return Ee.parse(n, e);
}
B.options = B.setOptions = function(n) {
  return Ee.setOptions(n), B.defaults = Ee.defaults, Vn(B.defaults), B;
};
B.getDefaults = Ot;
B.defaults = Ae;
B.use = function(...n) {
  return Ee.use(...n), B.defaults = Ee.defaults, Vn(B.defaults), B;
};
B.walkTokens = function(n, e) {
  return Ee.walkTokens(n, e);
};
B.parseInline = Ee.parseInline;
B.Parser = ie;
B.parser = ie.parse;
B.Renderer = Ye;
B.TextRenderer = jt;
B.Lexer = ue;
B.lexer = ue.lex;
B.Tokenizer = Qe;
B.Hooks = We;
B.parse = B;
B.options;
B.setOptions;
B.use;
B.walkTokens;
B.parseInline;
ie.parse;
ue.lex;
const tu = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((n) => n.charCodeAt(0))
), nu = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((n) => n.charCodeAt(0))
);
var lt;
const Li = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]), Nt = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (lt = String.fromCodePoint) !== null && lt !== void 0 ? lt : function(n) {
    let e = "";
    return n > 65535 && (n -= 65536, e += String.fromCharCode(n >>> 10 & 1023 | 55296), n = 56320 | n & 1023), e += String.fromCharCode(n), e;
  }
);
function Ri(n) {
  var e;
  return n >= 55296 && n <= 57343 || n > 1114111 ? 65533 : (e = Li.get(n)) !== null && e !== void 0 ? e : n;
}
var F;
(function(n) {
  n[n.NUM = 35] = "NUM", n[n.SEMI = 59] = "SEMI", n[n.EQUALS = 61] = "EQUALS", n[n.ZERO = 48] = "ZERO", n[n.NINE = 57] = "NINE", n[n.LOWER_A = 97] = "LOWER_A", n[n.LOWER_F = 102] = "LOWER_F", n[n.LOWER_X = 120] = "LOWER_X", n[n.LOWER_Z = 122] = "LOWER_Z", n[n.UPPER_A = 65] = "UPPER_A", n[n.UPPER_F = 70] = "UPPER_F", n[n.UPPER_Z = 90] = "UPPER_Z";
})(F || (F = {}));
const Ii = 32;
var me;
(function(n) {
  n[n.VALUE_LENGTH = 49152] = "VALUE_LENGTH", n[n.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", n[n.JUMP_TABLE = 127] = "JUMP_TABLE";
})(me || (me = {}));
function _t(n) {
  return n >= F.ZERO && n <= F.NINE;
}
function $i(n) {
  return n >= F.UPPER_A && n <= F.UPPER_F || n >= F.LOWER_A && n <= F.LOWER_F;
}
function qi(n) {
  return n >= F.UPPER_A && n <= F.UPPER_Z || n >= F.LOWER_A && n <= F.LOWER_Z || _t(n);
}
function Di(n) {
  return n === F.EQUALS || qi(n);
}
var U;
(function(n) {
  n[n.EntityStart = 0] = "EntityStart", n[n.NumericStart = 1] = "NumericStart", n[n.NumericDecimal = 2] = "NumericDecimal", n[n.NumericHex = 3] = "NumericHex", n[n.NamedEntity = 4] = "NamedEntity";
})(U || (U = {}));
var te;
(function(n) {
  n[n.Legacy = 0] = "Legacy", n[n.Strict = 1] = "Strict", n[n.Attribute = 2] = "Attribute";
})(te || (te = {}));
class uu {
  constructor(e, t, u) {
    this.decodeTree = e, this.emitCodePoint = t, this.errors = u, this.state = U.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = te.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(e) {
    this.decodeMode = e, this.state = U.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(e, t) {
    switch (this.state) {
      case U.EntityStart:
        return e.charCodeAt(t) === F.NUM ? (this.state = U.NumericStart, this.consumed += 1, this.stateNumericStart(e, t + 1)) : (this.state = U.NamedEntity, this.stateNamedEntity(e, t));
      case U.NumericStart:
        return this.stateNumericStart(e, t);
      case U.NumericDecimal:
        return this.stateNumericDecimal(e, t);
      case U.NumericHex:
        return this.stateNumericHex(e, t);
      case U.NamedEntity:
        return this.stateNamedEntity(e, t);
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(e, t) {
    return t >= e.length ? -1 : (e.charCodeAt(t) | Ii) === F.LOWER_X ? (this.state = U.NumericHex, this.consumed += 1, this.stateNumericHex(e, t + 1)) : (this.state = U.NumericDecimal, this.stateNumericDecimal(e, t));
  }
  addToNumericResult(e, t, u, i) {
    if (t !== u) {
      const r = u - t;
      this.result = this.result * Math.pow(i, r) + parseInt(e.substr(t, r), i), this.consumed += r;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(e, t) {
    const u = t;
    for (; t < e.length; ) {
      const i = e.charCodeAt(t);
      if (_t(i) || $i(i))
        t += 1;
      else
        return this.addToNumericResult(e, u, t, 16), this.emitNumericEntity(i, 3);
    }
    return this.addToNumericResult(e, u, t, 16), -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(e, t) {
    const u = t;
    for (; t < e.length; ) {
      const i = e.charCodeAt(t);
      if (_t(i))
        t += 1;
      else
        return this.addToNumericResult(e, u, t, 10), this.emitNumericEntity(i, 2);
    }
    return this.addToNumericResult(e, u, t, 10), -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(e, t) {
    var u;
    if (this.consumed <= t)
      return (u = this.errors) === null || u === void 0 || u.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
    if (e === F.SEMI)
      this.consumed += 1;
    else if (this.decodeMode === te.Strict)
      return 0;
    return this.emitCodePoint(Ri(this.result), this.consumed), this.errors && (e !== F.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(e, t) {
    const { decodeTree: u } = this;
    let i = u[this.treeIndex], r = (i & me.VALUE_LENGTH) >> 14;
    for (; t < e.length; t++, this.excess++) {
      const a = e.charCodeAt(t);
      if (this.treeIndex = Bi(u, i, this.treeIndex + Math.max(1, r), a), this.treeIndex < 0)
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === te.Attribute && // We shouldn't have consumed any characters after the entity,
        (r === 0 || // And there should be no invalid characters.
        Di(a)) ? 0 : this.emitNotTerminatedNamedEntity();
      if (i = u[this.treeIndex], r = (i & me.VALUE_LENGTH) >> 14, r !== 0) {
        if (a === F.SEMI)
          return this.emitNamedEntityData(this.treeIndex, r, this.consumed + this.excess);
        this.decodeMode !== te.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var e;
    const { result: t, decodeTree: u } = this, i = (u[t] & me.VALUE_LENGTH) >> 14;
    return this.emitNamedEntityData(t, i, this.consumed), (e = this.errors) === null || e === void 0 || e.missingSemicolonAfterCharacterReference(), this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(e, t, u) {
    const { decodeTree: i } = this;
    return this.emitCodePoint(t === 1 ? i[e] & ~me.VALUE_LENGTH : i[e + 1], u), t === 3 && this.emitCodePoint(i[e + 2], u), u;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var e;
    switch (this.state) {
      case U.NamedEntity:
        return this.result !== 0 && (this.decodeMode !== te.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      // Otherwise, emit a numeric entity if we have one.
      case U.NumericDecimal:
        return this.emitNumericEntity(0, 2);
      case U.NumericHex:
        return this.emitNumericEntity(0, 3);
      case U.NumericStart:
        return (e = this.errors) === null || e === void 0 || e.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
      case U.EntityStart:
        return 0;
    }
  }
}
function iu(n) {
  let e = "";
  const t = new uu(n, (u) => e += Nt(u));
  return function(i, r) {
    let a = 0, s = 0;
    for (; (s = i.indexOf("&", s)) >= 0; ) {
      e += i.slice(a, s), t.startEntity(r);
      const c = t.write(
        i,
        // Skip the "&"
        s + 1
      );
      if (c < 0) {
        a = s + t.end();
        break;
      }
      a = s + c, s = c === 0 ? a + 1 : a;
    }
    const o = e + i.slice(a);
    return e = "", o;
  };
}
function Bi(n, e, t, u) {
  const i = (e & me.BRANCH_LENGTH) >> 7, r = e & me.JUMP_TABLE;
  if (i === 0)
    return r !== 0 && u === r ? t : -1;
  if (r) {
    const o = u - r;
    return o < 0 || o >= i ? -1 : n[t + o] - 1;
  }
  let a = t, s = a + i - 1;
  for (; a <= s; ) {
    const o = a + s >>> 1, c = n[o];
    if (c < u)
      a = o + 1;
    else if (c > u)
      s = o - 1;
    else
      return n[o + i];
  }
  return -1;
}
iu(tu);
iu(nu);
var E;
(function(n) {
  n[n.Tab = 9] = "Tab", n[n.NewLine = 10] = "NewLine", n[n.FormFeed = 12] = "FormFeed", n[n.CarriageReturn = 13] = "CarriageReturn", n[n.Space = 32] = "Space", n[n.ExclamationMark = 33] = "ExclamationMark", n[n.Number = 35] = "Number", n[n.Amp = 38] = "Amp", n[n.SingleQuote = 39] = "SingleQuote", n[n.DoubleQuote = 34] = "DoubleQuote", n[n.Dash = 45] = "Dash", n[n.Slash = 47] = "Slash", n[n.Zero = 48] = "Zero", n[n.Nine = 57] = "Nine", n[n.Semi = 59] = "Semi", n[n.Lt = 60] = "Lt", n[n.Eq = 61] = "Eq", n[n.Gt = 62] = "Gt", n[n.Questionmark = 63] = "Questionmark", n[n.UpperA = 65] = "UpperA", n[n.LowerA = 97] = "LowerA", n[n.UpperF = 70] = "UpperF", n[n.LowerF = 102] = "LowerF", n[n.UpperZ = 90] = "UpperZ", n[n.LowerZ = 122] = "LowerZ", n[n.LowerX = 120] = "LowerX", n[n.OpeningSquareBracket = 91] = "OpeningSquareBracket";
})(E || (E = {}));
var g;
(function(n) {
  n[n.Text = 1] = "Text", n[n.BeforeTagName = 2] = "BeforeTagName", n[n.InTagName = 3] = "InTagName", n[n.InSelfClosingTag = 4] = "InSelfClosingTag", n[n.BeforeClosingTagName = 5] = "BeforeClosingTagName", n[n.InClosingTagName = 6] = "InClosingTagName", n[n.AfterClosingTagName = 7] = "AfterClosingTagName", n[n.BeforeAttributeName = 8] = "BeforeAttributeName", n[n.InAttributeName = 9] = "InAttributeName", n[n.AfterAttributeName = 10] = "AfterAttributeName", n[n.BeforeAttributeValue = 11] = "BeforeAttributeValue", n[n.InAttributeValueDq = 12] = "InAttributeValueDq", n[n.InAttributeValueSq = 13] = "InAttributeValueSq", n[n.InAttributeValueNq = 14] = "InAttributeValueNq", n[n.BeforeDeclaration = 15] = "BeforeDeclaration", n[n.InDeclaration = 16] = "InDeclaration", n[n.InProcessingInstruction = 17] = "InProcessingInstruction", n[n.BeforeComment = 18] = "BeforeComment", n[n.CDATASequence = 19] = "CDATASequence", n[n.InSpecialComment = 20] = "InSpecialComment", n[n.InCommentLike = 21] = "InCommentLike", n[n.BeforeSpecialS = 22] = "BeforeSpecialS", n[n.BeforeSpecialT = 23] = "BeforeSpecialT", n[n.SpecialStartSequence = 24] = "SpecialStartSequence", n[n.InSpecialTag = 25] = "InSpecialTag", n[n.InEntity = 26] = "InEntity";
})(g || (g = {}));
function de(n) {
  return n === E.Space || n === E.NewLine || n === E.Tab || n === E.FormFeed || n === E.CarriageReturn;
}
function Fe(n) {
  return n === E.Slash || n === E.Gt || de(n);
}
function Mi(n) {
  return n >= E.LowerA && n <= E.LowerZ || n >= E.UpperA && n <= E.UpperZ;
}
var ne;
(function(n) {
  n[n.NoValue = 0] = "NoValue", n[n.Unquoted = 1] = "Unquoted", n[n.Single = 2] = "Single", n[n.Double = 3] = "Double";
})(ne || (ne = {}));
const j = {
  Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
  // CDATA[
  CdataEnd: new Uint8Array([93, 93, 62]),
  // ]]>
  CommentEnd: new Uint8Array([45, 45, 62]),
  // `-->`
  ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
  // `<\/script`
  StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
  // `</style`
  TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101]),
  // `</title`
  TextareaEnd: new Uint8Array([
    60,
    47,
    116,
    101,
    120,
    116,
    97,
    114,
    101,
    97
  ])
  // `</textarea`
};
class Oi {
  constructor({ xmlMode: e = !1, decodeEntities: t = !0 }, u) {
    this.cbs = u, this.state = g.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.entityStart = 0, this.baseState = g.Text, this.isSpecial = !1, this.running = !0, this.offset = 0, this.currentSequence = void 0, this.sequenceIndex = 0, this.xmlMode = e, this.decodeEntities = t, this.entityDecoder = new uu(e ? nu : tu, (i, r) => this.emitCodePoint(i, r));
  }
  reset() {
    this.state = g.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.baseState = g.Text, this.currentSequence = void 0, this.running = !0, this.offset = 0;
  }
  write(e) {
    this.offset += this.buffer.length, this.buffer = e, this.parse();
  }
  end() {
    this.running && this.finish();
  }
  pause() {
    this.running = !1;
  }
  resume() {
    this.running = !0, this.index < this.buffer.length + this.offset && this.parse();
  }
  stateText(e) {
    e === E.Lt || !this.decodeEntities && this.fastForwardTo(E.Lt) ? (this.index > this.sectionStart && this.cbs.ontext(this.sectionStart, this.index), this.state = g.BeforeTagName, this.sectionStart = this.index) : this.decodeEntities && e === E.Amp && this.startEntity();
  }
  stateSpecialStartSequence(e) {
    const t = this.sequenceIndex === this.currentSequence.length;
    if (!(t ? (
      // If we are at the end of the sequence, make sure the tag name has ended
      Fe(e)
    ) : (
      // Otherwise, do a case-insensitive comparison
      (e | 32) === this.currentSequence[this.sequenceIndex]
    )))
      this.isSpecial = !1;
    else if (!t) {
      this.sequenceIndex++;
      return;
    }
    this.sequenceIndex = 0, this.state = g.InTagName, this.stateInTagName(e);
  }
  /** Look for an end tag. For <title> tags, also decode entities. */
  stateInSpecialTag(e) {
    if (this.sequenceIndex === this.currentSequence.length) {
      if (e === E.Gt || de(e)) {
        const t = this.index - this.currentSequence.length;
        if (this.sectionStart < t) {
          const u = this.index;
          this.index = t, this.cbs.ontext(this.sectionStart, t), this.index = u;
        }
        this.isSpecial = !1, this.sectionStart = t + 2, this.stateInClosingTagName(e);
        return;
      }
      this.sequenceIndex = 0;
    }
    (e | 32) === this.currentSequence[this.sequenceIndex] ? this.sequenceIndex += 1 : this.sequenceIndex === 0 ? this.currentSequence === j.TitleEnd ? this.decodeEntities && e === E.Amp && this.startEntity() : this.fastForwardTo(E.Lt) && (this.sequenceIndex = 1) : this.sequenceIndex = +(e === E.Lt);
  }
  stateCDATASequence(e) {
    e === j.Cdata[this.sequenceIndex] ? ++this.sequenceIndex === j.Cdata.length && (this.state = g.InCommentLike, this.currentSequence = j.CdataEnd, this.sequenceIndex = 0, this.sectionStart = this.index + 1) : (this.sequenceIndex = 0, this.state = g.InDeclaration, this.stateInDeclaration(e));
  }
  /**
   * When we wait for one specific character, we can speed things up
   * by skipping through the buffer until we find it.
   *
   * @returns Whether the character was found.
   */
  fastForwardTo(e) {
    for (; ++this.index < this.buffer.length + this.offset; )
      if (this.buffer.charCodeAt(this.index - this.offset) === e)
        return !0;
    return this.index = this.buffer.length + this.offset - 1, !1;
  }
  /**
   * Comments and CDATA end with `-->` and `]]>`.
   *
   * Their common qualities are:
   * - Their end sequences have a distinct character they start with.
   * - That character is then repeated, so we have to check multiple repeats.
   * - All characters but the start character of the sequence can be skipped.
   */
  stateInCommentLike(e) {
    e === this.currentSequence[this.sequenceIndex] ? ++this.sequenceIndex === this.currentSequence.length && (this.currentSequence === j.CdataEnd ? this.cbs.oncdata(this.sectionStart, this.index, 2) : this.cbs.oncomment(this.sectionStart, this.index, 2), this.sequenceIndex = 0, this.sectionStart = this.index + 1, this.state = g.Text) : this.sequenceIndex === 0 ? this.fastForwardTo(this.currentSequence[0]) && (this.sequenceIndex = 1) : e !== this.currentSequence[this.sequenceIndex - 1] && (this.sequenceIndex = 0);
  }
  /**
   * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
   *
   * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
   * We allow anything that wouldn't end the tag.
   */
  isTagStartChar(e) {
    return this.xmlMode ? !Fe(e) : Mi(e);
  }
  startSpecial(e, t) {
    this.isSpecial = !0, this.currentSequence = e, this.sequenceIndex = t, this.state = g.SpecialStartSequence;
  }
  stateBeforeTagName(e) {
    if (e === E.ExclamationMark)
      this.state = g.BeforeDeclaration, this.sectionStart = this.index + 1;
    else if (e === E.Questionmark)
      this.state = g.InProcessingInstruction, this.sectionStart = this.index + 1;
    else if (this.isTagStartChar(e)) {
      const t = e | 32;
      this.sectionStart = this.index, this.xmlMode ? this.state = g.InTagName : t === j.ScriptEnd[2] ? this.state = g.BeforeSpecialS : t === j.TitleEnd[2] ? this.state = g.BeforeSpecialT : this.state = g.InTagName;
    } else e === E.Slash ? this.state = g.BeforeClosingTagName : (this.state = g.Text, this.stateText(e));
  }
  stateInTagName(e) {
    Fe(e) && (this.cbs.onopentagname(this.sectionStart, this.index), this.sectionStart = -1, this.state = g.BeforeAttributeName, this.stateBeforeAttributeName(e));
  }
  stateBeforeClosingTagName(e) {
    de(e) || (e === E.Gt ? this.state = g.Text : (this.state = this.isTagStartChar(e) ? g.InClosingTagName : g.InSpecialComment, this.sectionStart = this.index));
  }
  stateInClosingTagName(e) {
    (e === E.Gt || de(e)) && (this.cbs.onclosetag(this.sectionStart, this.index), this.sectionStart = -1, this.state = g.AfterClosingTagName, this.stateAfterClosingTagName(e));
  }
  stateAfterClosingTagName(e) {
    (e === E.Gt || this.fastForwardTo(E.Gt)) && (this.state = g.Text, this.sectionStart = this.index + 1);
  }
  stateBeforeAttributeName(e) {
    e === E.Gt ? (this.cbs.onopentagend(this.index), this.isSpecial ? (this.state = g.InSpecialTag, this.sequenceIndex = 0) : this.state = g.Text, this.sectionStart = this.index + 1) : e === E.Slash ? this.state = g.InSelfClosingTag : de(e) || (this.state = g.InAttributeName, this.sectionStart = this.index);
  }
  stateInSelfClosingTag(e) {
    e === E.Gt ? (this.cbs.onselfclosingtag(this.index), this.state = g.Text, this.sectionStart = this.index + 1, this.isSpecial = !1) : de(e) || (this.state = g.BeforeAttributeName, this.stateBeforeAttributeName(e));
  }
  stateInAttributeName(e) {
    (e === E.Eq || Fe(e)) && (this.cbs.onattribname(this.sectionStart, this.index), this.sectionStart = this.index, this.state = g.AfterAttributeName, this.stateAfterAttributeName(e));
  }
  stateAfterAttributeName(e) {
    e === E.Eq ? this.state = g.BeforeAttributeValue : e === E.Slash || e === E.Gt ? (this.cbs.onattribend(ne.NoValue, this.sectionStart), this.sectionStart = -1, this.state = g.BeforeAttributeName, this.stateBeforeAttributeName(e)) : de(e) || (this.cbs.onattribend(ne.NoValue, this.sectionStart), this.state = g.InAttributeName, this.sectionStart = this.index);
  }
  stateBeforeAttributeValue(e) {
    e === E.DoubleQuote ? (this.state = g.InAttributeValueDq, this.sectionStart = this.index + 1) : e === E.SingleQuote ? (this.state = g.InAttributeValueSq, this.sectionStart = this.index + 1) : de(e) || (this.sectionStart = this.index, this.state = g.InAttributeValueNq, this.stateInAttributeValueNoQuotes(e));
  }
  handleInAttributeValue(e, t) {
    e === t || !this.decodeEntities && this.fastForwardTo(t) ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(t === E.DoubleQuote ? ne.Double : ne.Single, this.index + 1), this.state = g.BeforeAttributeName) : this.decodeEntities && e === E.Amp && this.startEntity();
  }
  stateInAttributeValueDoubleQuotes(e) {
    this.handleInAttributeValue(e, E.DoubleQuote);
  }
  stateInAttributeValueSingleQuotes(e) {
    this.handleInAttributeValue(e, E.SingleQuote);
  }
  stateInAttributeValueNoQuotes(e) {
    de(e) || e === E.Gt ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(ne.Unquoted, this.index), this.state = g.BeforeAttributeName, this.stateBeforeAttributeName(e)) : this.decodeEntities && e === E.Amp && this.startEntity();
  }
  stateBeforeDeclaration(e) {
    e === E.OpeningSquareBracket ? (this.state = g.CDATASequence, this.sequenceIndex = 0) : this.state = e === E.Dash ? g.BeforeComment : g.InDeclaration;
  }
  stateInDeclaration(e) {
    (e === E.Gt || this.fastForwardTo(E.Gt)) && (this.cbs.ondeclaration(this.sectionStart, this.index), this.state = g.Text, this.sectionStart = this.index + 1);
  }
  stateInProcessingInstruction(e) {
    (e === E.Gt || this.fastForwardTo(E.Gt)) && (this.cbs.onprocessinginstruction(this.sectionStart, this.index), this.state = g.Text, this.sectionStart = this.index + 1);
  }
  stateBeforeComment(e) {
    e === E.Dash ? (this.state = g.InCommentLike, this.currentSequence = j.CommentEnd, this.sequenceIndex = 2, this.sectionStart = this.index + 1) : this.state = g.InDeclaration;
  }
  stateInSpecialComment(e) {
    (e === E.Gt || this.fastForwardTo(E.Gt)) && (this.cbs.oncomment(this.sectionStart, this.index, 0), this.state = g.Text, this.sectionStart = this.index + 1);
  }
  stateBeforeSpecialS(e) {
    const t = e | 32;
    t === j.ScriptEnd[3] ? this.startSpecial(j.ScriptEnd, 4) : t === j.StyleEnd[3] ? this.startSpecial(j.StyleEnd, 4) : (this.state = g.InTagName, this.stateInTagName(e));
  }
  stateBeforeSpecialT(e) {
    const t = e | 32;
    t === j.TitleEnd[3] ? this.startSpecial(j.TitleEnd, 4) : t === j.TextareaEnd[3] ? this.startSpecial(j.TextareaEnd, 4) : (this.state = g.InTagName, this.stateInTagName(e));
  }
  startEntity() {
    this.baseState = this.state, this.state = g.InEntity, this.entityStart = this.index, this.entityDecoder.startEntity(this.xmlMode ? te.Strict : this.baseState === g.Text || this.baseState === g.InSpecialTag ? te.Legacy : te.Attribute);
  }
  stateInEntity() {
    const e = this.entityDecoder.write(this.buffer, this.index - this.offset);
    e >= 0 ? (this.state = this.baseState, e === 0 && (this.index = this.entityStart)) : this.index = this.offset + this.buffer.length - 1;
  }
  /**
   * Remove data that has already been consumed from the buffer.
   */
  cleanup() {
    this.running && this.sectionStart !== this.index && (this.state === g.Text || this.state === g.InSpecialTag && this.sequenceIndex === 0 ? (this.cbs.ontext(this.sectionStart, this.index), this.sectionStart = this.index) : (this.state === g.InAttributeValueDq || this.state === g.InAttributeValueSq || this.state === g.InAttributeValueNq) && (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = this.index));
  }
  shouldContinue() {
    return this.index < this.buffer.length + this.offset && this.running;
  }
  /**
   * Iterates through the buffer, calling the function corresponding to the current state.
   *
   * States that are more likely to be hit are higher up, as a performance improvement.
   */
  parse() {
    for (; this.shouldContinue(); ) {
      const e = this.buffer.charCodeAt(this.index - this.offset);
      switch (this.state) {
        case g.Text: {
          this.stateText(e);
          break;
        }
        case g.SpecialStartSequence: {
          this.stateSpecialStartSequence(e);
          break;
        }
        case g.InSpecialTag: {
          this.stateInSpecialTag(e);
          break;
        }
        case g.CDATASequence: {
          this.stateCDATASequence(e);
          break;
        }
        case g.InAttributeValueDq: {
          this.stateInAttributeValueDoubleQuotes(e);
          break;
        }
        case g.InAttributeName: {
          this.stateInAttributeName(e);
          break;
        }
        case g.InCommentLike: {
          this.stateInCommentLike(e);
          break;
        }
        case g.InSpecialComment: {
          this.stateInSpecialComment(e);
          break;
        }
        case g.BeforeAttributeName: {
          this.stateBeforeAttributeName(e);
          break;
        }
        case g.InTagName: {
          this.stateInTagName(e);
          break;
        }
        case g.InClosingTagName: {
          this.stateInClosingTagName(e);
          break;
        }
        case g.BeforeTagName: {
          this.stateBeforeTagName(e);
          break;
        }
        case g.AfterAttributeName: {
          this.stateAfterAttributeName(e);
          break;
        }
        case g.InAttributeValueSq: {
          this.stateInAttributeValueSingleQuotes(e);
          break;
        }
        case g.BeforeAttributeValue: {
          this.stateBeforeAttributeValue(e);
          break;
        }
        case g.BeforeClosingTagName: {
          this.stateBeforeClosingTagName(e);
          break;
        }
        case g.AfterClosingTagName: {
          this.stateAfterClosingTagName(e);
          break;
        }
        case g.BeforeSpecialS: {
          this.stateBeforeSpecialS(e);
          break;
        }
        case g.BeforeSpecialT: {
          this.stateBeforeSpecialT(e);
          break;
        }
        case g.InAttributeValueNq: {
          this.stateInAttributeValueNoQuotes(e);
          break;
        }
        case g.InSelfClosingTag: {
          this.stateInSelfClosingTag(e);
          break;
        }
        case g.InDeclaration: {
          this.stateInDeclaration(e);
          break;
        }
        case g.BeforeDeclaration: {
          this.stateBeforeDeclaration(e);
          break;
        }
        case g.BeforeComment: {
          this.stateBeforeComment(e);
          break;
        }
        case g.InProcessingInstruction: {
          this.stateInProcessingInstruction(e);
          break;
        }
        case g.InEntity: {
          this.stateInEntity();
          break;
        }
      }
      this.index++;
    }
    this.cleanup();
  }
  finish() {
    this.state === g.InEntity && (this.entityDecoder.end(), this.state = this.baseState), this.handleTrailingData(), this.cbs.onend();
  }
  /** Handle any trailing data. */
  handleTrailingData() {
    const e = this.buffer.length + this.offset;
    this.sectionStart >= e || (this.state === g.InCommentLike ? this.currentSequence === j.CdataEnd ? this.cbs.oncdata(this.sectionStart, e, 0) : this.cbs.oncomment(this.sectionStart, e, 0) : this.state === g.InTagName || this.state === g.BeforeAttributeName || this.state === g.BeforeAttributeValue || this.state === g.AfterAttributeName || this.state === g.InAttributeName || this.state === g.InAttributeValueSq || this.state === g.InAttributeValueDq || this.state === g.InAttributeValueNq || this.state === g.InClosingTagName || this.cbs.ontext(this.sectionStart, e));
  }
  emitCodePoint(e, t) {
    this.baseState !== g.Text && this.baseState !== g.InSpecialTag ? (this.sectionStart < this.entityStart && this.cbs.onattribdata(this.sectionStart, this.entityStart), this.sectionStart = this.entityStart + t, this.index = this.sectionStart - 1, this.cbs.onattribentity(e)) : (this.sectionStart < this.entityStart && this.cbs.ontext(this.sectionStart, this.entityStart), this.sectionStart = this.entityStart + t, this.index = this.sectionStart - 1, this.cbs.ontextentity(e, this.sectionStart));
  }
}
const Se = /* @__PURE__ */ new Set([
  "input",
  "option",
  "optgroup",
  "select",
  "button",
  "datalist",
  "textarea"
]), q = /* @__PURE__ */ new Set(["p"]), bn = /* @__PURE__ */ new Set(["thead", "tbody"]), gn = /* @__PURE__ */ new Set(["dd", "dt"]), xn = /* @__PURE__ */ new Set(["rt", "rp"]), Pi = /* @__PURE__ */ new Map([
  ["tr", /* @__PURE__ */ new Set(["tr", "th", "td"])],
  ["th", /* @__PURE__ */ new Set(["th"])],
  ["td", /* @__PURE__ */ new Set(["thead", "th", "td"])],
  ["body", /* @__PURE__ */ new Set(["head", "link", "script"])],
  ["li", /* @__PURE__ */ new Set(["li"])],
  ["p", q],
  ["h1", q],
  ["h2", q],
  ["h3", q],
  ["h4", q],
  ["h5", q],
  ["h6", q],
  ["select", Se],
  ["input", Se],
  ["output", Se],
  ["button", Se],
  ["datalist", Se],
  ["textarea", Se],
  ["option", /* @__PURE__ */ new Set(["option"])],
  ["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])],
  ["dd", gn],
  ["dt", gn],
  ["address", q],
  ["article", q],
  ["aside", q],
  ["blockquote", q],
  ["details", q],
  ["div", q],
  ["dl", q],
  ["fieldset", q],
  ["figcaption", q],
  ["figure", q],
  ["footer", q],
  ["form", q],
  ["header", q],
  ["hr", q],
  ["main", q],
  ["nav", q],
  ["ol", q],
  ["pre", q],
  ["section", q],
  ["table", q],
  ["ul", q],
  ["rt", xn],
  ["rp", xn],
  ["tbody", bn],
  ["tfoot", bn]
]), Hi = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]), kn = /* @__PURE__ */ new Set(["math", "svg"]), wn = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignobject",
  "desc",
  "title"
]), zi = /\s|\//;
class Ui {
  constructor(e, t = {}) {
    var u, i, r, a, s, o;
    this.options = t, this.startIndex = 0, this.endIndex = 0, this.openTagStart = 0, this.tagname = "", this.attribname = "", this.attribvalue = "", this.attribs = null, this.stack = [], this.buffers = [], this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1, this.cbs = e ?? {}, this.htmlMode = !this.options.xmlMode, this.lowerCaseTagNames = (u = t.lowerCaseTags) !== null && u !== void 0 ? u : this.htmlMode, this.lowerCaseAttributeNames = (i = t.lowerCaseAttributeNames) !== null && i !== void 0 ? i : this.htmlMode, this.recognizeSelfClosing = (r = t.recognizeSelfClosing) !== null && r !== void 0 ? r : !this.htmlMode, this.tokenizer = new ((a = t.Tokenizer) !== null && a !== void 0 ? a : Oi)(this.options, this), this.foreignContext = [!this.htmlMode], (o = (s = this.cbs).onparserinit) === null || o === void 0 || o.call(s, this);
  }
  // Tokenizer event handlers
  /** @internal */
  ontext(e, t) {
    var u, i;
    const r = this.getSlice(e, t);
    this.endIndex = t - 1, (i = (u = this.cbs).ontext) === null || i === void 0 || i.call(u, r), this.startIndex = t;
  }
  /** @internal */
  ontextentity(e, t) {
    var u, i;
    this.endIndex = t - 1, (i = (u = this.cbs).ontext) === null || i === void 0 || i.call(u, Nt(e)), this.startIndex = t;
  }
  /**
   * Checks if the current tag is a void element. Override this if you want
   * to specify your own additional void elements.
   */
  isVoidElement(e) {
    return this.htmlMode && Hi.has(e);
  }
  /** @internal */
  onopentagname(e, t) {
    this.endIndex = t;
    let u = this.getSlice(e, t);
    this.lowerCaseTagNames && (u = u.toLowerCase()), this.emitOpenTag(u);
  }
  emitOpenTag(e) {
    var t, u, i, r;
    this.openTagStart = this.startIndex, this.tagname = e;
    const a = this.htmlMode && Pi.get(e);
    if (a)
      for (; this.stack.length > 0 && a.has(this.stack[0]); ) {
        const s = this.stack.shift();
        (u = (t = this.cbs).onclosetag) === null || u === void 0 || u.call(t, s, !0);
      }
    this.isVoidElement(e) || (this.stack.unshift(e), this.htmlMode && (kn.has(e) ? this.foreignContext.unshift(!0) : wn.has(e) && this.foreignContext.unshift(!1))), (r = (i = this.cbs).onopentagname) === null || r === void 0 || r.call(i, e), this.cbs.onopentag && (this.attribs = {});
  }
  endOpenTag(e) {
    var t, u;
    this.startIndex = this.openTagStart, this.attribs && ((u = (t = this.cbs).onopentag) === null || u === void 0 || u.call(t, this.tagname, this.attribs, e), this.attribs = null), this.cbs.onclosetag && this.isVoidElement(this.tagname) && this.cbs.onclosetag(this.tagname, !0), this.tagname = "";
  }
  /** @internal */
  onopentagend(e) {
    this.endIndex = e, this.endOpenTag(!1), this.startIndex = e + 1;
  }
  /** @internal */
  onclosetag(e, t) {
    var u, i, r, a, s, o, c, d;
    this.endIndex = t;
    let l = this.getSlice(e, t);
    if (this.lowerCaseTagNames && (l = l.toLowerCase()), this.htmlMode && (kn.has(l) || wn.has(l)) && this.foreignContext.shift(), this.isVoidElement(l))
      this.htmlMode && l === "br" && ((a = (r = this.cbs).onopentagname) === null || a === void 0 || a.call(r, "br"), (o = (s = this.cbs).onopentag) === null || o === void 0 || o.call(s, "br", {}, !0), (d = (c = this.cbs).onclosetag) === null || d === void 0 || d.call(c, "br", !1));
    else {
      const p = this.stack.indexOf(l);
      if (p !== -1)
        for (let w = 0; w <= p; w++) {
          const A = this.stack.shift();
          (i = (u = this.cbs).onclosetag) === null || i === void 0 || i.call(u, A, w !== p);
        }
      else this.htmlMode && l === "p" && (this.emitOpenTag("p"), this.closeCurrentTag(!0));
    }
    this.startIndex = t + 1;
  }
  /** @internal */
  onselfclosingtag(e) {
    this.endIndex = e, this.recognizeSelfClosing || this.foreignContext[0] ? (this.closeCurrentTag(!1), this.startIndex = e + 1) : this.onopentagend(e);
  }
  closeCurrentTag(e) {
    var t, u;
    const i = this.tagname;
    this.endOpenTag(e), this.stack[0] === i && ((u = (t = this.cbs).onclosetag) === null || u === void 0 || u.call(t, i, !e), this.stack.shift());
  }
  /** @internal */
  onattribname(e, t) {
    this.startIndex = e;
    const u = this.getSlice(e, t);
    this.attribname = this.lowerCaseAttributeNames ? u.toLowerCase() : u;
  }
  /** @internal */
  onattribdata(e, t) {
    this.attribvalue += this.getSlice(e, t);
  }
  /** @internal */
  onattribentity(e) {
    this.attribvalue += Nt(e);
  }
  /** @internal */
  onattribend(e, t) {
    var u, i;
    this.endIndex = t, (i = (u = this.cbs).onattribute) === null || i === void 0 || i.call(u, this.attribname, this.attribvalue, e === ne.Double ? '"' : e === ne.Single ? "'" : e === ne.NoValue ? void 0 : null), this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname) && (this.attribs[this.attribname] = this.attribvalue), this.attribvalue = "";
  }
  getInstructionName(e) {
    const t = e.search(zi);
    let u = t < 0 ? e : e.substr(0, t);
    return this.lowerCaseTagNames && (u = u.toLowerCase()), u;
  }
  /** @internal */
  ondeclaration(e, t) {
    this.endIndex = t;
    const u = this.getSlice(e, t);
    if (this.cbs.onprocessinginstruction) {
      const i = this.getInstructionName(u);
      this.cbs.onprocessinginstruction(`!${i}`, `!${u}`);
    }
    this.startIndex = t + 1;
  }
  /** @internal */
  onprocessinginstruction(e, t) {
    this.endIndex = t;
    const u = this.getSlice(e, t);
    if (this.cbs.onprocessinginstruction) {
      const i = this.getInstructionName(u);
      this.cbs.onprocessinginstruction(`?${i}`, `?${u}`);
    }
    this.startIndex = t + 1;
  }
  /** @internal */
  oncomment(e, t, u) {
    var i, r, a, s;
    this.endIndex = t, (r = (i = this.cbs).oncomment) === null || r === void 0 || r.call(i, this.getSlice(e, t - u)), (s = (a = this.cbs).oncommentend) === null || s === void 0 || s.call(a), this.startIndex = t + 1;
  }
  /** @internal */
  oncdata(e, t, u) {
    var i, r, a, s, o, c, d, l, p, w;
    this.endIndex = t;
    const A = this.getSlice(e, t - u);
    !this.htmlMode || this.options.recognizeCDATA ? ((r = (i = this.cbs).oncdatastart) === null || r === void 0 || r.call(i), (s = (a = this.cbs).ontext) === null || s === void 0 || s.call(a, A), (c = (o = this.cbs).oncdataend) === null || c === void 0 || c.call(o)) : ((l = (d = this.cbs).oncomment) === null || l === void 0 || l.call(d, `[CDATA[${A}]]`), (w = (p = this.cbs).oncommentend) === null || w === void 0 || w.call(p)), this.startIndex = t + 1;
  }
  /** @internal */
  onend() {
    var e, t;
    if (this.cbs.onclosetag) {
      this.endIndex = this.startIndex;
      for (let u = 0; u < this.stack.length; u++)
        this.cbs.onclosetag(this.stack[u], !0);
    }
    (t = (e = this.cbs).onend) === null || t === void 0 || t.call(e);
  }
  /**
   * Resets the parser to a blank state, ready to parse a new HTML document
   */
  reset() {
    var e, t, u, i;
    (t = (e = this.cbs).onreset) === null || t === void 0 || t.call(e), this.tokenizer.reset(), this.tagname = "", this.attribname = "", this.attribs = null, this.stack.length = 0, this.startIndex = 0, this.endIndex = 0, (i = (u = this.cbs).onparserinit) === null || i === void 0 || i.call(u, this), this.buffers.length = 0, this.foreignContext.length = 0, this.foreignContext.unshift(!this.htmlMode), this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1;
  }
  /**
   * Resets the parser, then parses a complete document and
   * pushes it to the handler.
   *
   * @param data Document to parse.
   */
  parseComplete(e) {
    this.reset(), this.end(e);
  }
  getSlice(e, t) {
    for (; e - this.bufferOffset >= this.buffers[0].length; )
      this.shiftBuffer();
    let u = this.buffers[0].slice(e - this.bufferOffset, t - this.bufferOffset);
    for (; t - this.bufferOffset > this.buffers[0].length; )
      this.shiftBuffer(), u += this.buffers[0].slice(0, t - this.bufferOffset);
    return u;
  }
  shiftBuffer() {
    this.bufferOffset += this.buffers[0].length, this.writeIndex--, this.buffers.shift();
  }
  /**
   * Parses a chunk of data and calls the corresponding callbacks.
   *
   * @param chunk Chunk to parse.
   */
  write(e) {
    var t, u;
    if (this.ended) {
      (u = (t = this.cbs).onerror) === null || u === void 0 || u.call(t, new Error(".write() after done!"));
      return;
    }
    this.buffers.push(e), this.tokenizer.running && (this.tokenizer.write(e), this.writeIndex++);
  }
  /**
   * Parses the end of the buffer and clears the stack, calls onend.
   *
   * @param chunk Optional final chunk to parse.
   */
  end(e) {
    var t, u;
    if (this.ended) {
      (u = (t = this.cbs).onerror) === null || u === void 0 || u.call(t, new Error(".end() after done!"));
      return;
    }
    e && this.write(e), this.ended = !0, this.tokenizer.end();
  }
  /**
   * Pauses parsing. The parser won't emit events until `resume` is called.
   */
  pause() {
    this.tokenizer.pause();
  }
  /**
   * Resumes parsing after `pause` was called.
   */
  resume() {
    for (this.tokenizer.resume(); this.tokenizer.running && this.writeIndex < this.buffers.length; )
      this.tokenizer.write(this.buffers[this.writeIndex++]);
    this.ended && this.tokenizer.end();
  }
  /**
   * Alias of `write`, for backwards compatibility.
   *
   * @param chunk Chunk to parse.
   * @deprecated
   */
  parseChunk(e) {
    this.write(e);
  }
  /**
   * Alias of `end`, for backwards compatibility.
   *
   * @param chunk Optional final chunk to parse.
   * @deprecated
   */
  done(e) {
    this.end(e);
  }
}
var I;
(function(n) {
  n.Root = "root", n.Text = "text", n.Directive = "directive", n.Comment = "comment", n.Script = "script", n.Style = "style", n.Tag = "tag", n.CDATA = "cdata", n.Doctype = "doctype";
})(I || (I = {}));
function Fi(n) {
  return n.type === I.Tag || n.type === I.Script || n.type === I.Style;
}
const ji = I.Root, Vi = I.Text, Wi = I.Directive, Gi = I.Comment, Ki = I.Script, Zi = I.Style, Qi = I.Tag, Xi = I.CDATA, Yi = I.Doctype;
let ru = class {
  constructor() {
    this.parent = null, this.prev = null, this.next = null, this.startIndex = null, this.endIndex = null;
  }
  // Read-write aliases for properties
  /**
   * Same as {@link parent}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get parentNode() {
    return this.parent;
  }
  set parentNode(e) {
    this.parent = e;
  }
  /**
   * Same as {@link prev}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get previousSibling() {
    return this.prev;
  }
  set previousSibling(e) {
    this.prev = e;
  }
  /**
   * Same as {@link next}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nextSibling() {
    return this.next;
  }
  set nextSibling(e) {
    this.next = e;
  }
  /**
   * Clone this node, and optionally its children.
   *
   * @param recursive Clone child nodes as well.
   * @returns A clone of the node.
   */
  cloneNode(e = !1) {
    return du(this, e);
  }
};
class Wt extends ru {
  /**
   * @param data The content of the data node
   */
  constructor(e) {
    super(), this.data = e;
  }
  /**
   * Same as {@link data}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nodeValue() {
    return this.data;
  }
  set nodeValue(e) {
    this.data = e;
  }
}
class Lt extends Wt {
  constructor() {
    super(...arguments), this.type = I.Text;
  }
  get nodeType() {
    return 3;
  }
}
class au extends Wt {
  constructor() {
    super(...arguments), this.type = I.Comment;
  }
  get nodeType() {
    return 8;
  }
}
class su extends Wt {
  constructor(e, t) {
    super(t), this.name = e, this.type = I.Directive;
  }
  get nodeType() {
    return 1;
  }
}
class Gt extends ru {
  /**
   * @param children Children of the node. Only certain node types can have children.
   */
  constructor(e) {
    super(), this.children = e;
  }
  // Aliases
  /** First child of the node. */
  get firstChild() {
    var e;
    return (e = this.children[0]) !== null && e !== void 0 ? e : null;
  }
  /** Last child of the node. */
  get lastChild() {
    return this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }
  /**
   * Same as {@link children}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get childNodes() {
    return this.children;
  }
  set childNodes(e) {
    this.children = e;
  }
}
class ou extends Gt {
  constructor() {
    super(...arguments), this.type = I.CDATA;
  }
  get nodeType() {
    return 4;
  }
}
class Rt extends Gt {
  constructor() {
    super(...arguments), this.type = I.Root;
  }
  get nodeType() {
    return 9;
  }
}
let cu = class extends Gt {
  /**
   * @param name Name of the tag, eg. `div`, `span`.
   * @param attribs Object mapping attribute names to attribute values.
   * @param children Children of the node.
   */
  constructor(e, t, u = [], i = e === "script" ? I.Script : e === "style" ? I.Style : I.Tag) {
    super(u), this.name = e, this.attribs = t, this.type = i;
  }
  get nodeType() {
    return 1;
  }
  // DOM Level 1 aliases
  /**
   * Same as {@link name}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get tagName() {
    return this.name;
  }
  set tagName(e) {
    this.name = e;
  }
  get attributes() {
    return Object.keys(this.attribs).map((e) => {
      var t, u;
      return {
        name: e,
        value: this.attribs[e],
        namespace: (t = this["x-attribsNamespace"]) === null || t === void 0 ? void 0 : t[e],
        prefix: (u = this["x-attribsPrefix"]) === null || u === void 0 ? void 0 : u[e]
      };
    });
  }
};
function Te(n) {
  return Fi(n);
}
function Ji(n) {
  return n.type === I.CDATA;
}
function lu(n) {
  return n.type === I.Text;
}
function er(n) {
  return n.type === I.Comment;
}
function tr(n) {
  return n.type === I.Directive;
}
function nr(n) {
  return n.type === I.Root;
}
function ur(n) {
  return Object.prototype.hasOwnProperty.call(n, "children");
}
function du(n, e = !1) {
  let t;
  if (lu(n))
    t = new Lt(n.data);
  else if (er(n))
    t = new au(n.data);
  else if (Te(n)) {
    const u = e ? dt(n.children) : [], i = new cu(n.name, { ...n.attribs }, u);
    u.forEach((r) => r.parent = i), n.namespace != null && (i.namespace = n.namespace), n["x-attribsNamespace"] && (i["x-attribsNamespace"] = { ...n["x-attribsNamespace"] }), n["x-attribsPrefix"] && (i["x-attribsPrefix"] = { ...n["x-attribsPrefix"] }), t = i;
  } else if (Ji(n)) {
    const u = e ? dt(n.children) : [], i = new ou(u);
    u.forEach((r) => r.parent = i), t = i;
  } else if (nr(n)) {
    const u = e ? dt(n.children) : [], i = new Rt(u);
    u.forEach((r) => r.parent = i), n["x-mode"] && (i["x-mode"] = n["x-mode"]), t = i;
  } else if (tr(n)) {
    const u = new su(n.name, n.data);
    n["x-name"] != null && (u["x-name"] = n["x-name"], u["x-publicId"] = n["x-publicId"], u["x-systemId"] = n["x-systemId"]), t = u;
  } else
    throw new Error(`Not implemented yet: ${n.type}`);
  return t.startIndex = n.startIndex, t.endIndex = n.endIndex, n.sourceCodeLocation != null && (t.sourceCodeLocation = n.sourceCodeLocation), t;
}
function dt(n) {
  const e = n.map((t) => du(t, !0));
  for (let t = 1; t < e.length; t++)
    e[t].prev = e[t - 1], e[t - 1].next = e[t];
  return e;
}
const yn = {
  withStartIndices: !1,
  withEndIndices: !1,
  xmlMode: !1
};
class ir {
  /**
   * @param callback Called once parsing has completed.
   * @param options Settings for the handler.
   * @param elementCB Callback whenever a tag is closed.
   */
  constructor(e, t, u) {
    this.dom = [], this.root = new Rt(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null, typeof t == "function" && (u = t, t = yn), typeof e == "object" && (t = e, e = void 0), this.callback = e ?? null, this.options = t ?? yn, this.elementCB = u ?? null;
  }
  onparserinit(e) {
    this.parser = e;
  }
  // Resets the handler back to starting state
  onreset() {
    this.dom = [], this.root = new Rt(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null;
  }
  // Signals the handler that parsing is done
  onend() {
    this.done || (this.done = !0, this.parser = null, this.handleCallback(null));
  }
  onerror(e) {
    this.handleCallback(e);
  }
  onclosetag() {
    this.lastNode = null;
    const e = this.tagStack.pop();
    this.options.withEndIndices && (e.endIndex = this.parser.endIndex), this.elementCB && this.elementCB(e);
  }
  onopentag(e, t) {
    const u = this.options.xmlMode ? I.Tag : void 0, i = new cu(e, t, void 0, u);
    this.addNode(i), this.tagStack.push(i);
  }
  ontext(e) {
    const { lastNode: t } = this;
    if (t && t.type === I.Text)
      t.data += e, this.options.withEndIndices && (t.endIndex = this.parser.endIndex);
    else {
      const u = new Lt(e);
      this.addNode(u), this.lastNode = u;
    }
  }
  oncomment(e) {
    if (this.lastNode && this.lastNode.type === I.Comment) {
      this.lastNode.data += e;
      return;
    }
    const t = new au(e);
    this.addNode(t), this.lastNode = t;
  }
  oncommentend() {
    this.lastNode = null;
  }
  oncdatastart() {
    const e = new Lt(""), t = new ou([e]);
    this.addNode(t), e.parent = t, this.lastNode = e;
  }
  oncdataend() {
    this.lastNode = null;
  }
  onprocessinginstruction(e, t) {
    const u = new su(e, t);
    this.addNode(u);
  }
  handleCallback(e) {
    if (typeof this.callback == "function")
      this.callback(e, this.dom);
    else if (e)
      throw e;
  }
  addNode(e) {
    const t = this.tagStack[this.tagStack.length - 1], u = t.children[t.children.length - 1];
    this.options.withStartIndices && (e.startIndex = this.parser.startIndex), this.options.withEndIndices && (e.endIndex = this.parser.endIndex), t.children.push(e), u && (e.prev = u, u.next = e), e.parent = t, this.lastNode = null;
  }
}
const vn = /["&'<>$\x80-\uFFFF]/g, rr = /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [39, "&apos;"],
  [60, "&lt;"],
  [62, "&gt;"]
]), ar = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null ? (n, e) => n.codePointAt(e) : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    (n, e) => (n.charCodeAt(e) & 64512) === 55296 ? (n.charCodeAt(e) - 55296) * 1024 + n.charCodeAt(e + 1) - 56320 + 65536 : n.charCodeAt(e)
  )
);
function fu(n) {
  let e = "", t = 0, u;
  for (; (u = vn.exec(n)) !== null; ) {
    const i = u.index, r = n.charCodeAt(i), a = rr.get(r);
    a !== void 0 ? (e += n.substring(t, i) + a, t = i + 1) : (e += `${n.substring(t, i)}&#x${ar(n, i).toString(16)};`, t = vn.lastIndex += +((r & 64512) === 55296));
  }
  return e + n.substr(t);
}
function hu(n, e) {
  return function(u) {
    let i, r = 0, a = "";
    for (; i = n.exec(u); )
      r !== i.index && (a += u.substring(r, i.index)), a += e.get(i[0].charCodeAt(0)), r = i.index + 1;
    return a + u.substring(r);
  };
}
const sr = hu(/["&\u00A0]/g, /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [160, "&nbsp;"]
])), or = hu(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
  [38, "&amp;"],
  [60, "&lt;"],
  [62, "&gt;"],
  [160, "&nbsp;"]
])), cr = new Map([
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "clipPath",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "glyphRef",
  "linearGradient",
  "radialGradient",
  "textPath"
].map((n) => [n.toLowerCase(), n])), lr = new Map([
  "definitionURL",
  "attributeName",
  "attributeType",
  "baseFrequency",
  "baseProfile",
  "calcMode",
  "clipPathUnits",
  "diffuseConstant",
  "edgeMode",
  "filterUnits",
  "glyphRef",
  "gradientTransform",
  "gradientUnits",
  "kernelMatrix",
  "kernelUnitLength",
  "keyPoints",
  "keySplines",
  "keyTimes",
  "lengthAdjust",
  "limitingConeAngle",
  "markerHeight",
  "markerUnits",
  "markerWidth",
  "maskContentUnits",
  "maskUnits",
  "numOctaves",
  "pathLength",
  "patternContentUnits",
  "patternTransform",
  "patternUnits",
  "pointsAtX",
  "pointsAtY",
  "pointsAtZ",
  "preserveAlpha",
  "preserveAspectRatio",
  "primitiveUnits",
  "refX",
  "refY",
  "repeatCount",
  "repeatDur",
  "requiredExtensions",
  "requiredFeatures",
  "specularConstant",
  "specularExponent",
  "spreadMethod",
  "startOffset",
  "stdDeviation",
  "stitchTiles",
  "surfaceScale",
  "systemLanguage",
  "tableValues",
  "targetX",
  "targetY",
  "textLength",
  "viewBox",
  "viewTarget",
  "xChannelSelector",
  "yChannelSelector",
  "zoomAndPan"
].map((n) => [n.toLowerCase(), n])), dr = /* @__PURE__ */ new Set([
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
]);
function fr(n) {
  return n.replace(/"/g, "&quot;");
}
function hr(n, e) {
  var t;
  if (!n)
    return;
  const u = ((t = e.encodeEntities) !== null && t !== void 0 ? t : e.decodeEntities) === !1 ? fr : e.xmlMode || e.encodeEntities !== "utf8" ? fu : sr;
  return Object.keys(n).map((i) => {
    var r, a;
    const s = (r = n[i]) !== null && r !== void 0 ? r : "";
    return e.xmlMode === "foreign" && (i = (a = lr.get(i)) !== null && a !== void 0 ? a : i), !e.emptyAttrs && !e.xmlMode && s === "" ? i : `${i}="${u(s)}"`;
  }).join(" ");
}
const En = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function it(n, e = {}) {
  const t = "length" in n ? n : [n];
  let u = "";
  for (let i = 0; i < t.length; i++)
    u += pr(t[i], e);
  return u;
}
function pr(n, e) {
  switch (n.type) {
    case ji:
      return it(n.children, e);
    // @ts-expect-error We don't use `Doctype` yet
    case Yi:
    case Wi:
      return xr(n);
    case Gi:
      return yr(n);
    case Xi:
      return wr(n);
    case Ki:
    case Zi:
    case Qi:
      return gr(n, e);
    case Vi:
      return kr(n, e);
  }
}
const mr = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignObject",
  "desc",
  "title"
]), br = /* @__PURE__ */ new Set(["svg", "math"]);
function gr(n, e) {
  var t;
  e.xmlMode === "foreign" && (n.name = (t = cr.get(n.name)) !== null && t !== void 0 ? t : n.name, n.parent && mr.has(n.parent.name) && (e = { ...e, xmlMode: !1 })), !e.xmlMode && br.has(n.name) && (e = { ...e, xmlMode: "foreign" });
  let u = `<${n.name}`;
  const i = hr(n.attribs, e);
  return i && (u += ` ${i}`), n.children.length === 0 && (e.xmlMode ? (
    // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
    e.selfClosingTags !== !1
  ) : (
    // User explicitly asked for self-closing tags, even in HTML mode
    e.selfClosingTags && En.has(n.name)
  )) ? (e.xmlMode || (u += " "), u += "/>") : (u += ">", n.children.length > 0 && (u += it(n.children, e)), (e.xmlMode || !En.has(n.name)) && (u += `</${n.name}>`)), u;
}
function xr(n) {
  return `<${n.data}>`;
}
function kr(n, e) {
  var t;
  let u = n.data || "";
  return ((t = e.encodeEntities) !== null && t !== void 0 ? t : e.decodeEntities) !== !1 && !(!e.xmlMode && n.parent && dr.has(n.parent.name)) && (u = e.xmlMode || e.encodeEntities !== "utf8" ? fu(u) : or(u)), u;
}
function wr(n) {
  return `<![CDATA[${n.children[0].data}]]>`;
}
function yr(n) {
  return `<!--${n.data}-->`;
}
function vr(n, e) {
  const t = [], u = [Array.isArray(e) ? e : [e]], i = [0];
  for (; ; ) {
    if (i[0] >= u[0].length) {
      if (u.length === 1)
        return t;
      u.shift(), i.shift();
      continue;
    }
    const r = u[0][i[0]++];
    Te(r) && n(r) && t.push(r), ur(r) && r.children.length > 0 && (i.unshift(0), u.unshift(r.children));
  }
}
function pu(n, e) {
  const t = new ir(void 0, e);
  return new Ui(t, e).end(n), t.root;
}
const An = /* @__PURE__ */ new Set([
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "mark",
  "sub",
  "sup",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "input",
  // task-list checkboxes only (filtered below)
  "span",
  "div"
]), mu = /* @__PURE__ */ new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "link",
  "meta",
  "noscript",
  "base",
  "template",
  "frame",
  "frameset",
  "applet"
]), Er = /* @__PURE__ */ new Set(["class", "id", "dir", "title", "data-checked", "data-task"]), Cn = {
  a: /* @__PURE__ */ new Set(["href", "target", "rel"]),
  img: /* @__PURE__ */ new Set(["src", "alt", "width", "height"]),
  input: /* @__PURE__ */ new Set(["type", "checked", "disabled"]),
  td: /* @__PURE__ */ new Set(["colspan", "rowspan", "align"]),
  th: /* @__PURE__ */ new Set(["colspan", "rowspan", "align"]),
  ol: /* @__PURE__ */ new Set(["start"]),
  code: /* @__PURE__ */ new Set(["class"])
  // language-xxx for highlighting hooks
}, Ar = /* @__PURE__ */ new Set(["href", "src"]);
function Cr(n) {
  const e = n.replace(/[\u0000-\u001f]/g, "").trim().toLowerCase();
  return !(e.startsWith("javascript:") || e.startsWith("data:text/html") || e.startsWith("vbscript:"));
}
function Sr(n) {
  if (!n || !n.tags?.length && !n.attributes)
    return { tags: An, attrs: Cn };
  const e = new Set(An);
  for (const u of n.tags ?? []) {
    const i = u.toLowerCase();
    mu.has(i) || e.add(i);
  }
  const t = { ...Cn };
  for (const [u, i] of Object.entries(n.attributes ?? {})) {
    const r = u.toLowerCase();
    t[r] = /* @__PURE__ */ new Set([...t[r] ?? [], ...i.map((a) => a.toLowerCase())]);
  }
  return { tags: e, attrs: t };
}
function Tr(n, e) {
  const t = n.name.toLowerCase();
  if (mu.has(t)) return [];
  if (!e.tags.has(t))
    return It(n.children, e);
  if (t === "input" && n.attribs.type !== "checkbox") return [];
  const u = e.attrs[t];
  for (const i of Object.keys(n.attribs)) {
    const r = Er.has(i) || u && u.has(i);
    if (i.startsWith("on") || !r) {
      delete n.attribs[i];
      continue;
    }
    Ar.has(i) && !Cr(n.attribs[i]) && delete n.attribs[i];
  }
  return t === "a" && n.attribs.target === "_blank" && (n.attribs.rel = "noopener noreferrer"), n.children = It(n.children, e), [n];
}
function It(n, e) {
  const t = [];
  for (const u of n)
    Te(u) ? t.push(...Tr(u, e)) : lu(u) && t.push(u);
  return t;
}
function Kt(n, e) {
  const t = Sr(e), u = pu(n ?? "", { decodeEntities: !0 }), i = It(u.children, t);
  return it(i, { encodeEntities: "utf8", emptyAttrs: !0 });
}
function Zt(n = [], e) {
  const t = new Vt({ gfm: !0, breaks: !1 });
  for (const u of n) t.use(u);
  return (u, i = {}) => {
    const r = String(t.parse(u ?? "", { async: !1 }));
    if (i.sanitize === !1) return r;
    const a = Kt(r, e);
    return i.decorateTasks === !1 ? a : _r(a);
  };
}
const Nr = /* @__PURE__ */ (() => {
  let n = null;
  return (e, t) => (n ??= Zt())(e, t);
})();
function Qt(n, e = {}) {
  return Nr(n, e);
}
function Sn(n, e) {
  const t = (n.attribs.class ?? "").split(/\s+/).filter(Boolean);
  t.includes(e) || t.push(e), n.attribs.class = t.join(" ");
}
function _r(n) {
  const e = pu(n ?? "", { decodeEntities: !0 }), t = vr(
    (u) => u.name === "input" && u.attribs.type === "checkbox",
    e.children
  );
  for (const u of t) {
    let i = null;
    const r = u.parent;
    if (r && Te(r) && (r.name === "li" ? i = r : r.name === "p" && r.parent && Te(r.parent) && r.parent.name === "li" && (i = r.parent)), !i) continue;
    delete u.attribs.disabled, Sn(i, "task-list-item"), i.attribs["data-task"] = "checked" in u.attribs ? "done" : "todo";
    const a = i.parent;
    a && Te(a) && (a.name === "ul" || a.name === "ol") && Sn(a, "contains-task-list");
  }
  return it(e.children, { encodeEntities: "utf8", emptyAttrs: !0 });
}
function Lr(n) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e];
    for (var u in t)
      Object.prototype.hasOwnProperty.call(t, u) && (n[u] = t[u]);
  }
  return n;
}
function $t(n, e) {
  return Array(e + 1).join(n);
}
function bu(n) {
  return n.replace(/^\n*/, "");
}
function gu(n) {
  for (var e = n.length; e > 0 && n[e - 1] === `
`; ) e--;
  return n.substring(0, e);
}
function xu(n) {
  return gu(bu(n));
}
var Rr = ["ADDRESS", "ARTICLE", "ASIDE", "AUDIO", "BLOCKQUOTE", "BODY", "CANVAS", "CENTER", "DD", "DIR", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "HTML", "ISINDEX", "LI", "MAIN", "MENU", "NAV", "NOFRAMES", "NOSCRIPT", "OL", "OUTPUT", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL"];
function Xt(n) {
  return Yt(n, Rr);
}
var ku = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
function wu(n) {
  return Yt(n, ku);
}
function Ir(n) {
  return vu(n, ku);
}
var yu = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
function $r(n) {
  return Yt(n, yu);
}
function qr(n) {
  return vu(n, yu);
}
function Yt(n, e) {
  return e.indexOf(n.nodeName) >= 0;
}
function vu(n, e) {
  return n.getElementsByTagName && e.some(function(t) {
    return n.getElementsByTagName(t).length;
  });
}
var Dr = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "]];
function Eu(n) {
  return Dr.reduce(function(e, t) {
    return e.replace(t[0], t[1]);
  }, n);
}
var W = {};
W.paragraph = {
  filter: "p",
  replacement: function(n) {
    return `

` + n + `

`;
  }
};
W.lineBreak = {
  filter: "br",
  replacement: function(n, e, t) {
    return t.br + `
`;
  }
};
W.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function(n, e, t) {
    var u = Number(e.nodeName.charAt(1));
    if (t.headingStyle === "setext" && u < 3) {
      var i = $t(u === 1 ? "=" : "-", n.length);
      return `

` + n + `
` + i + `

`;
    } else
      return `

` + $t("#", u) + " " + n + `

`;
  }
};
W.blockquote = {
  filter: "blockquote",
  replacement: function(n) {
    return n = xu(n).replace(/^/gm, "> "), `

` + n + `

`;
  }
};
W.list = {
  filter: ["ul", "ol"],
  replacement: function(n, e) {
    var t = e.parentNode;
    return t.nodeName === "LI" && t.lastElementChild === e ? `
` + n : `

` + n + `

`;
  }
};
W.listItem = {
  filter: "li",
  replacement: function(n, e, t) {
    var u = t.bulletListMarker + "   ", i = e.parentNode;
    if (i.nodeName === "OL") {
      var r = i.getAttribute("start"), a = Array.prototype.indexOf.call(i.children, e);
      u = (r ? Number(r) + a : a + 1) + ".  ";
    }
    var s = /\n$/.test(n);
    return n = xu(n) + (s ? `
` : ""), n = n.replace(/\n/gm, `
` + " ".repeat(u.length)), u + n + (e.nextSibling ? `
` : "");
  }
};
W.indentedCodeBlock = {
  filter: function(n, e) {
    return e.codeBlockStyle === "indented" && n.nodeName === "PRE" && n.firstChild && n.firstChild.nodeName === "CODE";
  },
  replacement: function(n, e, t) {
    return `

    ` + e.firstChild.textContent.replace(/\n/g, `
    `) + `

`;
  }
};
W.fencedCodeBlock = {
  filter: function(n, e) {
    return e.codeBlockStyle === "fenced" && n.nodeName === "PRE" && n.firstChild && n.firstChild.nodeName === "CODE";
  },
  replacement: function(n, e, t) {
    for (var u = e.firstChild.getAttribute("class") || "", i = (u.match(/language-(\S+)/) || [null, ""])[1], r = e.firstChild.textContent, a = t.fence.charAt(0), s = 3, o = new RegExp("^" + a + "{3,}", "gm"), c; c = o.exec(r); )
      c[0].length >= s && (s = c[0].length + 1);
    var d = $t(a, s);
    return `

` + d + i + `
` + r.replace(/\n$/, "") + `
` + d + `

`;
  }
};
W.horizontalRule = {
  filter: "hr",
  replacement: function(n, e, t) {
    return `

` + t.hr + `

`;
  }
};
W.inlineLink = {
  filter: function(n, e) {
    return e.linkStyle === "inlined" && n.nodeName === "A" && n.getAttribute("href");
  },
  replacement: function(n, e) {
    var t = Jt(e.getAttribute("href")), u = en(Je(e.getAttribute("title"))), i = u ? ' "' + u + '"' : "";
    return "[" + n + "](" + t + i + ")";
  }
};
W.referenceLink = {
  filter: function(n, e) {
    return e.linkStyle === "referenced" && n.nodeName === "A" && n.getAttribute("href");
  },
  replacement: function(n, e, t) {
    var u = Jt(e.getAttribute("href")), i = Je(e.getAttribute("title"));
    i && (i = ' "' + en(i) + '"');
    var r, a;
    switch (t.linkReferenceStyle) {
      case "collapsed":
        r = "[" + n + "][]", a = "[" + n + "]: " + u + i;
        break;
      case "shortcut":
        r = "[" + n + "]", a = "[" + n + "]: " + u + i;
        break;
      default:
        var s = this.references.length + 1;
        r = "[" + n + "][" + s + "]", a = "[" + s + "]: " + u + i;
    }
    return this.references.push(a), r;
  },
  references: [],
  append: function(n) {
    var e = "";
    return this.references.length && (e = `

` + this.references.join(`
`) + `

`, this.references = []), e;
  }
};
W.emphasis = {
  filter: ["em", "i"],
  replacement: function(n, e, t) {
    return n.trim() ? t.emDelimiter + n + t.emDelimiter : "";
  }
};
W.strong = {
  filter: ["strong", "b"],
  replacement: function(n, e, t) {
    return n.trim() ? t.strongDelimiter + n + t.strongDelimiter : "";
  }
};
W.code = {
  filter: function(n) {
    var e = n.previousSibling || n.nextSibling, t = n.parentNode.nodeName === "PRE" && !e;
    return n.nodeName === "CODE" && !t;
  },
  replacement: function(n) {
    if (!n) return "";
    n = n.replace(/\r?\n|\r/g, " ");
    for (var e = /^`|^ .*?[^ ].* $|`$/.test(n) ? " " : "", t = "`", u = n.match(/`+/gm) || []; u.indexOf(t) !== -1; ) t = t + "`";
    return t + e + n + e + t;
  }
};
W.image = {
  filter: "img",
  replacement: function(n, e) {
    var t = Eu(Je(e.getAttribute("alt"))), u = Jt(e.getAttribute("src") || ""), i = Je(e.getAttribute("title")), r = i ? ' "' + en(i) + '"' : "";
    return u ? "![" + t + "](" + u + r + ")" : "";
  }
};
function Je(n) {
  return n ? n.replace(/(\n+\s*)+/g, `
`) : "";
}
function Jt(n) {
  var e = n.replace(/([<>()])/g, "\\$1");
  return e.indexOf(" ") >= 0 ? "<" + e + ">" : e;
}
function en(n) {
  return n.replace(/"/g, '\\"');
}
function Au(n) {
  this.options = n, this._keep = [], this._remove = [], this.blankRule = {
    replacement: n.blankReplacement
  }, this.keepReplacement = n.keepReplacement, this.defaultRule = {
    replacement: n.defaultReplacement
  }, this.array = [];
  for (var e in n.rules) this.array.push(n.rules[e]);
}
Au.prototype = {
  add: function(n, e) {
    this.array.unshift(e);
  },
  keep: function(n) {
    this._keep.unshift({
      filter: n,
      replacement: this.keepReplacement
    });
  },
  remove: function(n) {
    this._remove.unshift({
      filter: n,
      replacement: function() {
        return "";
      }
    });
  },
  forNode: function(n) {
    if (n.isBlank) return this.blankRule;
    var e;
    return (e = ft(this.array, n, this.options)) || (e = ft(this._keep, n, this.options)) || (e = ft(this._remove, n, this.options)) ? e : this.defaultRule;
  },
  forEach: function(n) {
    for (var e = 0; e < this.array.length; e++) n(this.array[e], e);
  }
};
function ft(n, e, t) {
  for (var u = 0; u < n.length; u++) {
    var i = n[u];
    if (Br(i, e, t)) return i;
  }
}
function Br(n, e, t) {
  var u = n.filter;
  if (typeof u == "string") {
    if (u === e.nodeName.toLowerCase()) return !0;
  } else if (Array.isArray(u)) {
    if (u.indexOf(e.nodeName.toLowerCase()) > -1) return !0;
  } else if (typeof u == "function") {
    if (u.call(n, e, t)) return !0;
  } else
    throw new TypeError("`filter` needs to be a string, array, or function");
}
function Mr(n) {
  var e = n.element, t = n.isBlock, u = n.isVoid, i = n.isPre || function(l) {
    return l.nodeName === "PRE";
  };
  if (!(!e.firstChild || i(e))) {
    for (var r = null, a = !1, s = null, o = Tn(s, e, i); o !== e; ) {
      if (o.nodeType === 3 || o.nodeType === 4) {
        var c = o.data.replace(/[ \r\n\t]+/g, " ");
        if ((!r || / $/.test(r.data)) && !a && c[0] === " " && (c = c.substr(1)), !c) {
          o = ht(o);
          continue;
        }
        o.data = c, r = o;
      } else if (o.nodeType === 1)
        t(o) || o.nodeName === "BR" ? (r && (r.data = r.data.replace(/ $/, "")), r = null, a = !1) : u(o) || i(o) ? (r = null, a = !0) : r && (a = !1);
      else {
        o = ht(o);
        continue;
      }
      var d = Tn(s, o, i);
      s = o, o = d;
    }
    r && (r.data = r.data.replace(/ $/, ""), r.data || ht(r));
  }
}
function ht(n) {
  var e = n.nextSibling || n.parentNode;
  return n.parentNode.removeChild(n), e;
}
function Tn(n, e, t) {
  return n && n.parentNode === e || t(e) ? e.nextSibling || e.parentNode : e.firstChild || e.nextSibling || e.parentNode;
}
var tn = typeof window < "u" ? window : {};
function Or() {
  var n = tn.DOMParser, e = !1;
  try {
    new n().parseFromString("", "text/html") && (e = !0);
  } catch {
  }
  return e;
}
function Pr() {
  var n = function() {
  };
  return Hr() ? n.prototype.parseFromString = function(e) {
    var t = new window.ActiveXObject("htmlfile");
    return t.designMode = "on", t.open(), t.write(e), t.close(), t;
  } : n.prototype.parseFromString = function(e) {
    var t = document.implementation.createHTMLDocument("");
    return t.open(), t.write(e), t.close(), t;
  }, n;
}
function Hr() {
  var n = !1;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch {
    tn.ActiveXObject && (n = !0);
  }
  return n;
}
var zr = Or() ? tn.DOMParser : Pr();
function Ur(n, e) {
  var t;
  if (typeof n == "string") {
    var u = Fr().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + n + "</x-turndown>",
      "text/html"
    );
    t = u.getElementById("turndown-root");
  } else
    t = n.cloneNode(!0);
  return Mr({
    element: t,
    isBlock: Xt,
    isVoid: wu,
    isPre: e.preformattedCode ? jr : null
  }), t;
}
var pt;
function Fr() {
  return pt = pt || new zr(), pt;
}
function jr(n) {
  return n.nodeName === "PRE" || n.nodeName === "CODE";
}
function Vr(n, e) {
  return n.isBlock = Xt(n), n.isCode = n.nodeName === "CODE" || n.parentNode.isCode, n.isBlank = Wr(n), n.flankingWhitespace = Gr(n, e), n;
}
function Wr(n) {
  return !wu(n) && !$r(n) && /^\s*$/i.test(n.textContent) && !Ir(n) && !qr(n);
}
function Gr(n, e) {
  if (n.isBlock || e.preformattedCode && n.isCode)
    return {
      leading: "",
      trailing: ""
    };
  var t = Kr(n.textContent);
  return t.leadingAscii && Nn("left", n, e) && (t.leading = t.leadingNonAscii), t.trailingAscii && Nn("right", n, e) && (t.trailing = t.trailingNonAscii), {
    leading: t.leading,
    trailing: t.trailing
  };
}
function Kr(n) {
  var e = n.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: e[1],
    // whole string for whitespace-only strings
    leadingAscii: e[2],
    leadingNonAscii: e[3],
    trailing: e[4],
    // empty for whitespace-only strings
    trailingNonAscii: e[5],
    trailingAscii: e[6]
  };
}
function Nn(n, e, t) {
  var u, i, r;
  return n === "left" ? (u = e.previousSibling, i = / $/) : (u = e.nextSibling, i = /^ /), u && (u.nodeType === 3 ? r = i.test(u.nodeValue) : t.preformattedCode && u.nodeName === "CODE" ? r = !1 : u.nodeType === 1 && !Xt(u) && (r = i.test(u.textContent))), r;
}
var Zr = Array.prototype.reduce;
function et(n) {
  if (!(this instanceof et)) return new et(n);
  var e = {
    rules: W,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: !1,
    blankReplacement: function(t, u) {
      return u.isBlock ? `

` : "";
    },
    keepReplacement: function(t, u) {
      return u.isBlock ? `

` + u.outerHTML + `

` : u.outerHTML;
    },
    defaultReplacement: function(t, u) {
      return u.isBlock ? `

` + t + `

` : t;
    }
  };
  this.options = Lr({}, e, n), this.rules = new Au(this.options);
}
et.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: function(n) {
    if (!Yr(n))
      throw new TypeError(n + " is not a string, or an element/document/fragment node.");
    if (n === "") return "";
    var e = Cu.call(this, new Ur(n, this.options));
    return Qr.call(this, e);
  },
  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */
  use: function(n) {
    if (Array.isArray(n))
      for (var e = 0; e < n.length; e++) this.use(n[e]);
    else if (typeof n == "function")
      n(this);
    else
      throw new TypeError("plugin must be a Function or an Array of Functions");
    return this;
  },
  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  addRule: function(n, e) {
    return this.rules.add(n, e), this;
  },
  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  keep: function(n) {
    return this.rules.keep(n), this;
  },
  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  remove: function(n) {
    return this.rules.remove(n), this;
  },
  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */
  escape: function(n) {
    return Eu(n);
  }
};
function Cu(n) {
  var e = this;
  return Zr.call(n.childNodes, function(t, u) {
    u = new Vr(u, e.options);
    var i = "";
    return u.nodeType === 3 ? i = u.isCode ? u.nodeValue : e.escape(u.nodeValue) : u.nodeType === 1 && (i = Xr.call(e, u)), Su(t, i);
  }, "");
}
function Qr(n) {
  var e = this;
  return this.rules.forEach(function(t) {
    typeof t.append == "function" && (n = Su(n, t.append(e.options)));
  }), n.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
function Xr(n) {
  var e = this.rules.forNode(n), t = Cu.call(this, n), u = n.flankingWhitespace;
  return (u.leading || u.trailing) && (t = t.trim()), u.leading + e.replacement(t, n, this.options) + u.trailing;
}
function Su(n, e) {
  var t = gu(n), u = bu(e), i = Math.max(n.length - t.length, e.length - u.length), r = `

`.substring(0, i);
  return t + r + u;
}
function Yr(n) {
  return n != null && (typeof n == "string" || n.nodeType && (n.nodeType === 1 || n.nodeType === 9 || n.nodeType === 11));
}
var he = {}, _n;
function Jr() {
  if (_n) return he;
  _n = 1, Object.defineProperty(he, "__esModule", { value: !0 });
  var n = /highlight-(?:text|source)-([a-z0-9]+)/;
  function e(m) {
    m.addRule("highlightedCodeBlock", {
      filter: function(b) {
        var x = b.firstChild;
        return b.nodeName === "DIV" && n.test(b.className) && x && x.nodeName === "PRE";
      },
      replacement: function(b, x, S) {
        var L = x.className || "", Z = (L.match(n) || [null, ""])[1];
        return `

` + S.fence + Z + `
` + x.firstChild.textContent + `
` + S.fence + `

`;
      }
    });
  }
  function t(m) {
    m.addRule("strikethrough", {
      filter: ["del", "s", "strike"],
      replacement: function(b) {
        return "~~" + b + "~~";
      }
    });
  }
  var u = Array.prototype.indexOf, i = Array.prototype.every, r = {}, a = { left: ":---", right: "---:", center: ":---:" };
  let s = null, o = null;
  const c = /* @__PURE__ */ new WeakMap();
  function d(m) {
    return m ? (m.getAttribute("align") || m.style.textAlign || "").toLowerCase() : "";
  }
  function l(m) {
    return m ? a[m] : "---";
  }
  function p(m, b) {
    for (var x = {
      left: 0,
      right: 0,
      center: 0,
      "": 0
    }, S = "", L = 0; L < m.rows.length; ++L) {
      var Z = m.rows[L];
      if (b < Z.childNodes.length) {
        var ce = d(Z.childNodes[b]);
        ++x[ce], x[ce] > x[S] && (S = ce);
      }
    }
    return S;
  }
  r.tableCell = {
    filter: ["th", "td"],
    replacement: function(m, b) {
      return oe(h(b)) ? m : R(m, b);
    }
  }, r.tableRow = {
    filter: "tr",
    replacement: function(m, b) {
      const x = h(b);
      if (oe(x)) return m;
      var S = "";
      if (w(b)) {
        const ce = v(x);
        for (var L = 0; L < ce; L++) {
          const we = L < b.childNodes.length ? b.childNodes[L] : null;
          var Z = l(p(x, L));
          S += R(Z, we, L);
        }
      }
      return `
` + m + (S ? `
` + S : "");
    }
  }, r.table = {
    filter: function(m, b) {
      return m.nodeName === "TABLE";
    },
    replacement: function(m, b) {
      if (se(b, o)) {
        let we = b.outerHTML, Ie = f(b);
        return Ie === null || !Ie.classList.contains("joplin-table-wrapper") ? `

<div class="joplin-table-wrapper">${we}</div>

` : we;
      } else {
        if (oe(b)) return m;
        m = m.replace(/\n+/g, `
`);
        var x = m.trim().split(`
`);
        x.length >= 2 && (x = x[1]);
        var S = /\| :?---/.test(x), L = v(b), Z = "";
        if (L && !S) {
          Z = "|" + "     |".repeat(L) + `
|`;
          for (var ce = 0; ce < L; ++ce)
            Z += " " + l(p(b, ce)) + " |";
        }
        const we = b.querySelector ? b.querySelector("caption") : b.caption, Ie = we && we.textContent || "", Ku = Ie ? `${Ie}

` : "", Zu = `${Z}${m}`.trimStart();
        return `

${Ku}${Zu}

`;
      }
    }
  }, r.tableCaption = {
    filter: ["caption"],
    replacement: () => ""
  }, r.tableColgroup = {
    filter: ["colgroup", "col"],
    replacement: () => ""
  }, r.tableSection = {
    filter: ["thead", "tbody", "tfoot"],
    replacement: function(m) {
      return m;
    }
  };
  function w(m) {
    var b = m.parentNode;
    return b.nodeName === "THEAD" || b.firstChild === m && (b.nodeName === "TABLE" || A(b)) && i.call(m.childNodes, function(x) {
      return x.nodeName === "TH";
    });
  }
  function A(m) {
    var b = m.previousSibling;
    return m.nodeName === "TBODY" && (!b || b.nodeName === "THEAD" && /^\s*$/i.test(b.textContent));
  }
  function R(m, b = null, x = null) {
    x === null && (x = u.call(b.parentNode.childNodes, b));
    var S = " ";
    x === 0 && (S = "| ");
    let L = m.trim().replace(/\n\r/g, "<br>").replace(/\n/g, "<br>");
    for (L = L.replace(/\|+/g, "\\|"); L.length < 3; ) L += " ";
    return b && (L = k(L, b, " ")), S + L + " |";
  }
  function T(m) {
    if (!m.childNodes) return !1;
    for (let b = 0; b < m.childNodes.length; b++) {
      const x = m.childNodes[b];
      if (x.nodeName === "TABLE" || T(x)) return !0;
    }
    return !1;
  }
  const G = (m, b) => {
    if (!m.childNodes) return !1;
    for (let x = 0; x < m.childNodes.length; x++) {
      const S = m.childNodes[x];
      if (b === "code" && s && s(S) || b.includes(S.nodeName) || G(S, b)) return !0;
    }
    return !1;
  }, ae = [
    "background-color",
    "background",
    "border-color",
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-style",
    "border-width",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "float",
    "margin-left",
    "margin-right"
  ], z = [
    "bgcolor",
    "bordercolor",
    "background"
  ], ee = (m) => {
    if (!m || !m.getAttribute) return !1;
    const b = m.getAttribute("style");
    if (!b) return !1;
    const x = b.split(";").map((S) => S.split(":")[0].trim().toLowerCase()).filter((S) => S.length > 0);
    for (let S = 0; S < x.length; S++)
      if (ae.includes(x[S])) return !0;
    return !1;
  }, K = (m, b) => {
    if (!m || !m.getAttribute) return !1;
    const x = m.getAttribute(b);
    if (x === null) return !1;
    const S = `${x}`.trim().toLowerCase();
    return !(!S || S === "0" || S === "0px");
  }, Ce = (m) => {
    if (!m || !m.getAttribute) return !1;
    for (let b = 0; b < z.length; b++) {
      const x = m.getAttribute(z[b]);
      if (x !== null && `${x}`.trim() !== "") return !0;
    }
    return !!(m.nodeName === "TABLE" && (K(m, "cellpadding") || K(m, "cellspacing")));
  }, xe = (m) => ee(m) || Ce(m), ke = (m) => {
    if (xe(m)) return !0;
    const b = m.rows;
    if (!b) return !1;
    for (let x = 0; x < b.length; x++) {
      const S = b[x];
      if (xe(S)) return !0;
      for (let L = 0; L < S.childNodes.length; L++) {
        const Z = S.childNodes[L];
        if ((Z.nodeName === "TD" || Z.nodeName === "TH") && xe(Z))
          return !0;
      }
    }
    return !1;
  }, se = (m, b) => {
    const x = [
      "UL",
      "OL",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "HR",
      "BLOCKQUOTE"
    ];
    return b.preserveNestedTables && x.push("TABLE"), G(m, "code") || G(m, x) || b.preserveTableStyles && ke(m);
  };
  function oe(m) {
    const b = c.get(m);
    if (b !== void 0) return b;
    const x = y(m);
    return c.set(m, x), x;
  }
  function y(m) {
    return !!(!m || !m.rows || m.rows.length === 1 && m.rows[0].childNodes.length <= 1 || T(m));
  }
  function f(m) {
    let b = m.parentNode;
    for (; b.nodeName !== "DIV"; )
      if (b = b.parentNode, !b) return null;
    return b;
  }
  function h(m) {
    let b = m.parentNode;
    for (; b.nodeName !== "TABLE"; )
      if (b = b.parentNode, !b) return null;
    return b;
  }
  function k(m, b, x) {
    const S = b.getAttribute("colspan") || 1;
    for (let L = 1; L < S; L++)
      m += " | " + x.repeat(3);
    return m;
  }
  function v(m) {
    let b = 0;
    for (let x = 0; x < m.rows.length; x++) {
      const L = m.rows[x].childNodes.length;
      L > b && (b = L);
    }
    return b;
  }
  function N(m) {
    s = m.isCodeBlock, o = m.options, m.keep(function(x) {
      return !!(x.nodeName === "TABLE" && se(x, m.options));
    });
    for (var b in r) m.addRule(b, r[b]);
  }
  function C(m) {
    m.addRule("taskListItems", {
      filter: function(b) {
        const x = b.parentNode, S = x.parentNode, L = !!S && S.nodeName === "LI";
        return (b.type === "checkbox" || b.getAttribute("role") === "checkbox") && (x.nodeName === "LI" || x.nodeName === "LABEL" && L || x.nodeName === "SPAN" && L);
      },
      replacement: function(b, x) {
        return ((x.nodeName === "INPUT" ? x.checked : x.getAttribute("aria-checked") === "true") ? "[x]" : "[ ]") + " ";
      }
    });
  }
  function $(m) {
    m.use([
      e,
      t,
      N,
      C
    ]);
  }
  return he.gfm = $, he.highlightedCodeBlock = e, he.strikethrough = t, he.tables = N, he.taskListItems = C, he;
}
var ea = Jr();
function ta(n = []) {
  const e = new et({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    // Backslash hard breaks (CommonMark). Turndown's default two-space break
    // would be destroyed by the trailing-whitespace tidy below — and invisibly
    // fragile in editors that trim on save.
    br: "\\"
  });
  e.use(ea.gfm);
  const t = e.escape.bind(e);
  e.escape = (u) => t(u).replace(/</g, "\\<").replace(/&(?=[a-zA-Z][a-zA-Z0-9]*;|#\d+;|#x[0-9a-fA-F]+;)/g, "&amp;"), e.addRule("stripEmptyParagraphs", {
    filter: (u) => u.nodeName === "P" && u.textContent?.trim() === "" && u.querySelector("img") === null,
    replacement: () => ""
  }), e.keep(["mark"]), e.addRule("dropTrailingBreaks", {
    filter: (u) => {
      if (u.nodeName !== "BR") return !1;
      const i = u.parentNode;
      if (!i || !/^(P|H[1-6]|LI|BLOCKQUOTE)$/.test(i.nodeName)) return !1;
      for (let r = u.nextSibling; r; r = r.nextSibling)
        if (r.nodeType === 1 || r.nodeType === 3 && r.data.split("​").join("").trim() !== "") return !1;
      return !0;
    },
    replacement: () => ""
  }), e.addRule("cellLineBreaks", {
    filter: (u) => u.nodeName === "BR" && !!u.parentNode && /^(TD|TH)$/.test(u.parentNode.nodeName),
    replacement: (u, i) => i.parentNode.childNodes.length === 1 ? "" : "<br>"
  }), e.addRule("skipPendingImages", {
    filter: (u) => u.nodeName === "IMG" && u.getAttribute("data-uploading") != null,
    replacement: () => ""
  });
  for (const u of n) u(e);
  return e;
}
function na(n) {
  const e = n.split("​").join("").split(`
`), t = [];
  let u = null, i = 0;
  for (let r of e) {
    const a = /^(\s*)(`{3,}|~{3,})/.exec(r);
    if (a) {
      const s = a[2][0], o = a[2].length;
      if (!u) {
        u = { char: s, len: o, indent: a[1].length }, r = r.replace(/[ \t]+$/, ""), t.push(r), i = 0;
        continue;
      }
      if (s === u.char && o >= u.len && r.trim() === a[2]) {
        u = null, t.push(r), i = 0;
        continue;
      }
    }
    if (u) {
      t.push(r);
      continue;
    }
    if (r = r.replace(/ /g, " ").replace(/^(\s*)([-*+])[ \t]+/, "$1$2 ").replace(/^(\s*)(\d+)\.[ \t]+/, "$1$2. ").replace(/^(\s*(?:[-*+]|\d+\.) \[[ xX]\])[ \t]+/, "$1 ").replace(/[ \t]+$/, ""), r === "") {
      if (i += 1, i >= 2) continue;
    } else
      i = 0;
    t.push(r);
  }
  return t.join(`
`).trim();
}
function Tu(n = []) {
  const e = ta(n);
  return (t) => na(e.turndown(ua(t || "")));
}
function ua(n) {
  return n.split("​").join("");
}
const ia = (
  /* lazily */
  /* @__PURE__ */ (() => {
    let n = null;
    return (e) => (n ??= Tu())(e);
  })()
);
function Nu(n) {
  return ia(n);
}
function O() {
  return typeof window < "u" ? window.getSelection() : null;
}
function H() {
  const n = O();
  return n && n.rangeCount > 0 ? n.getRangeAt(0) : null;
}
function je(n) {
  const e = O();
  if (!e || e.rangeCount === 0) return !1;
  const t = e.anchorNode;
  return !!t && (n === t || n.contains(t));
}
function Le(n, e, t) {
  let u = n;
  for (; u && u !== e; ) {
    if (u.nodeType === 1 && t(u)) return u;
    u = u.parentNode;
  }
  return null;
}
function D(n) {
  const e = H();
  if (!e) return null;
  let t = e.startContainer;
  if (t === n) {
    const u = n.childNodes[e.startOffset] || n.lastChild;
    return u && u.nodeType === 1 ? u : null;
  }
  for (; t && t.parentNode !== n; ) t = t.parentNode;
  return t && t.nodeType === 1 ? t : null;
}
function ge(n) {
  const e = H();
  return e ? Le(e.startContainer, n, (t) => t.tagName === "LI") : null;
}
function pe(n) {
  if (!n) return "other";
  switch (n.tagName) {
    case "P":
      return "paragraph";
    case "H1":
      return "heading1";
    case "H2":
      return "heading2";
    case "H3":
      return "heading3";
    case "H4":
      return "heading4";
    case "H5":
      return "heading5";
    case "H6":
      return "heading6";
    case "BLOCKQUOTE":
      return "blockquote";
    case "PRE":
      return "codeBlock";
    case "UL":
      return n.classList.contains("contains-task-list") ? "taskList" : "bulletList";
    case "OL":
      return "orderedList";
    default:
      return "other";
  }
}
function rt(n) {
  const e = H();
  if (!e) return "";
  const t = e.cloneRange();
  return t.selectNodeContents(n), t.setEnd(e.startContainer, e.startOffset), t.toString();
}
function _u(n) {
  return rt(n).length === 0;
}
function Lu(n) {
  const e = D(n);
  if (!e) return null;
  const t = ge(n) ?? e, u = H();
  if (!u || !t.contains(u.startContainer)) return null;
  const i = u.cloneRange();
  i.selectNodeContents(t), i.setEnd(u.startContainer, u.startOffset);
  let r = "";
  const a = (s) => {
    for (const o of Array.from(s.childNodes))
      o.nodeName === "BR" ? r = "" : o.nodeType === Node.TEXT_NODE ? r += o.data : a(o);
  };
  return a(i.cloneContents()), {
    line: t,
    text: r.replace(/\u00a0/g, " ").split("​").join("")
  };
}
function _(n) {
  const e = O();
  if (!e) return;
  const t = document.createRange();
  t.selectNodeContents(n), t.collapse(!0), e.removeAllRanges(), e.addRange(t);
}
function J(n) {
  const e = O();
  if (!e) return;
  const t = document.createRange();
  t.selectNodeContents(n), t.collapse(!1), e.removeAllRanges(), e.addRange(t);
}
function He(n) {
  const e = O();
  if (!e) return;
  const t = document.createRange();
  t.setStartAfter(n), t.collapse(!0), e.removeAllRanges(), e.addRange(t);
}
function Me() {
  const n = H();
  if (!n) return null;
  const e = n.getClientRects();
  if (e.length > 0) return e[e.length - 1];
  const t = n.getBoundingClientRect();
  return t.width === 0 && t.height === 0 && t.x === 0 && t.y === 0 ? null : t;
}
function at(n, e) {
  const t = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  let u = e, i = null, r = null, a = 0, s = t.nextNode();
  for (; s; ) {
    if (i || (i = s), s.data.length >= u) {
      r = s, a = u;
      break;
    }
    u -= s.data.length, s = t.nextNode();
  }
  if (!i || !r) return;
  const o = document.createRange();
  o.setStart(i, 0), o.setEnd(r, a), o.deleteContents();
}
const nn = "​";
function Y(n) {
  Array.from(n.childNodes).some(
    (u) => u.nodeType === Node.ELEMENT_NODE || u.nodeType === Node.TEXT_NODE && u.data.split("​").join("").length > 0
  ) || (n.textContent = "", n.appendChild(document.createElement("br")));
}
function ra(n) {
  const e = O();
  if (!e || e.rangeCount === 0) return null;
  const t = e.getRangeAt(0);
  if (!n.contains(t.endContainer) && t.endContainer !== n) return null;
  const u = t.cloneRange();
  return u.selectNodeContents(n), u.setEnd(t.endContainer, t.endOffset), u.toString().split(nn).join("").length;
}
function aa(n, e) {
  const t = O();
  if (!t) return;
  const u = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  let i = e, r = null, a = u.nextNode();
  for (; a; ) {
    const s = a.data.split(nn).join("").length;
    if (i <= s) {
      const o = document.createRange();
      o.setStart(a, Math.min(i, a.data.length)), o.collapse(!0), t.removeAllRanges(), t.addRange(o);
      return;
    }
    i -= s, r = a, a = u.nextNode();
  }
  if (r) {
    const s = document.createRange();
    s.setStart(r, r.data.length), s.collapse(!0), t.removeAllRanges(), t.addRange(s);
  } else
    _(n);
}
function X(n, e = {}, t) {
  const u = document.createElement(n);
  for (const [i, r] of Object.entries(e)) u.setAttribute(i, r);
  return t !== void 0 && (u.innerHTML = t), u;
}
function Ru(n, e) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const u = t.getRangeAt(0);
  if (!u.collapsed || !n.contains(u.startContainer) || u.startContainer.nodeType !== Node.TEXT_NODE) return null;
  const i = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), r = [];
  let a;
  for (; a = i.nextNode(); ) r.push(a);
  let s = u.startContainer, o = u.startOffset, c = e;
  for (; ; ) {
    const l = s.data;
    for (; o > 0 && c > 0; )
      o -= 1, l[o] !== nn && (c -= 1);
    if (c === 0) break;
    const p = r.indexOf(s) - 1;
    if (p < 0) return null;
    s = r[p], o = s.data.length;
  }
  const d = document.createRange();
  return d.setStart(s, o), d.setEnd(u.startContainer, u.startOffset), d;
}
const tt = "​";
function Ne(n, e) {
  for (; n.firstChild; ) e.appendChild(n.firstChild);
}
const sa = /^(P|H[1-6]|UL|OL|BLOCKQUOTE|PRE|HR)$/;
function oa(n, e) {
  const t = D(n);
  if (!t) return;
  const u = t.tagName === e ? "P" : e;
  if (t.tagName === u) return;
  const i = document.createElement(u);
  Ne(t, i), Y(i), t.replaceWith(i), J(i);
}
function ca(n) {
  const e = D(n);
  if (!e) return;
  if (e.tagName === "BLOCKQUOTE") {
    const u = document.createDocumentFragment();
    if (e.children.length > 0 && Array.from(e.children).every((r) => sa.test(r.tagName)))
      Ne(e, u);
    else {
      const r = document.createElement("p");
      Ne(e, r), Y(r), u.appendChild(r);
    }
    e.replaceWith(u);
    return;
  }
  const t = document.createElement("blockquote");
  Ne(e, t), Y(t), e.replaceWith(t), J(t);
}
function mt(n, e) {
  const t = D(n);
  if (!t) return;
  if (t.tagName === "UL" || t.tagName === "OL") {
    if (e.task && t.tagName === "UL" && !t.classList.contains("contains-task-list")) {
      t.classList.add("contains-task-list"), t.querySelectorAll(":scope > li").forEach((r) => qt(r));
      return;
    }
    la(t);
    return;
  }
  const u = document.createElement(e.ordered ? "ol" : "ul"), i = document.createElement("li");
  Ne(t, i), Y(i), u.appendChild(i), e.task && (u.classList.add("contains-task-list"), qt(i)), t.replaceWith(u), J(i);
}
function la(n) {
  const e = document.createDocumentFragment();
  n.querySelectorAll(":scope > li").forEach((t) => {
    t.querySelector(':scope > input[type="checkbox"]')?.remove();
    const u = document.createElement("p");
    Ne(t, u), Y(u), e.appendChild(u);
  }), n.replaceWith(e);
}
function qt(n, e = !1) {
  if (n.classList.add("task-list-item"), n.setAttribute("data-task", e ? "done" : "todo"), !n.querySelector(':scope > input[type="checkbox"]')) {
    const t = X("input", { type: "checkbox" });
    t.checked = e, e && t.setAttribute("checked", ""), n.prepend(t);
  }
}
function da(n) {
  const e = D(n) || n.lastElementChild, t = document.createElement("hr"), u = X("p", {}, "<br>");
  e ? (e.after(t), t.after(u), (e.textContent ?? "").trim() === "" && e.tagName === "P" && e.remove()) : n.append(t, u), _(u);
}
function fa(n) {
  const e = D(n);
  if (!e) return;
  if (e.tagName === "PRE") {
    const i = X("p");
    i.textContent = (e.textContent || "").split(tt).join(""), i.textContent || (i.innerHTML = "<br>"), e.replaceWith(i), J(i);
    return;
  }
  const t = document.createElement("pre"), u = document.createElement("code");
  u.textContent = e.textContent || "", u.textContent || u.appendChild(document.createTextNode(tt)), t.appendChild(u), e.replaceWith(t), J(u);
}
function ha(n, e) {
  const t = Math.max(1, Math.min(e?.rows ?? 3, 50)), u = Math.max(1, Math.min(e?.cols ?? 3, 12)), i = document.createElement("table"), r = document.createElement("thead"), a = document.createElement("tr");
  for (let l = 0; l < u; l++) {
    const p = document.createElement("th");
    p.appendChild(document.createElement("br")), a.appendChild(p);
  }
  r.appendChild(a), i.appendChild(r);
  const s = document.createElement("tbody");
  for (let l = 0; l < t - 1; l++) {
    const p = document.createElement("tr");
    for (let w = 0; w < u; w++) {
      const A = document.createElement("td");
      A.appendChild(document.createElement("br")), p.appendChild(A);
    }
    s.appendChild(p);
  }
  i.appendChild(s);
  const o = D(n) || n.lastElementChild, c = X("p", {}, "<br>");
  o ? (o.after(i), i.after(c), o.tagName === "P" && (o.textContent ?? "").split(tt).join("").trim() === "" && !o.querySelector("img,input,hr") && o.remove()) : n.append(i, c);
  const d = i.querySelector("th, td");
  d && _(d);
}
function pa(n, e) {
  if (!e?.src) return;
  const t = D(n) || n.lastElementChild, u = document.createElement("p"), i = X("img", { src: e.src, alt: e.alt ?? "" });
  u.appendChild(i);
  const r = X("p", {}, "<br>");
  t ? (t.after(u), u.after(r), (t.textContent ?? "").split(tt).join("").trim() === "" && t.tagName === "P" && t.remove()) : n.append(u, r), _(r);
}
function Iu(n, e) {
  const t = e.toUpperCase(), u = H();
  if (!u) return;
  const i = Le(u.startContainer, n, (r) => r.tagName === t);
  if (i) {
    $u(i);
    return;
  }
  u.collapsed || ga(u, e);
}
function Dt(n, e) {
  const t = e.toUpperCase(), u = H();
  return u ? !!Le(u.startContainer, n, (i) => i.tagName === t) : !1;
}
function ma(n, e) {
  const t = H();
  if (!t) return;
  const u = Le(t.startContainer, n, (i) => i.tagName === "A");
  if (e == null || e === "") {
    if (u) {
      const i = O();
      if (i) {
        const r = document.createRange();
        r.selectNodeContents(u), i.removeAllRanges(), i.addRange(r);
      }
      document.execCommand("unlink");
    }
    return;
  }
  if (u) {
    u.setAttribute("href", e);
    return;
  }
  if (t.collapsed) {
    const i = X("a", { href: e }, e);
    t.insertNode(i), J(i);
    return;
  }
  document.execCommand("createLink", !1, e);
}
function ba(n) {
  document.execCommand("removeFormat");
  const e = H(), t = e && Le(e.startContainer, n, (u) => u.tagName === "CODE");
  t && $u(t);
}
function ga(n, e) {
  const t = document.createElement(e);
  try {
    n.surroundContents(t);
  } catch {
    t.appendChild(n.extractContents()), n.insertNode(t);
  }
  const u = O();
  if (u) {
    u.removeAllRanges();
    const i = document.createRange();
    i.selectNodeContents(t), u.addRange(i);
  }
}
function $u(n) {
  const e = n.parentNode;
  if (!e) return;
  const t = document.createRange();
  t.selectNodeContents(n);
  const u = t.extractContents(), i = u.firstChild, r = u.lastChild;
  e.replaceChild(u, n);
  const a = O();
  if (a && i && r) {
    const s = document.createRange();
    s.setStartBefore(i), s.setEndAfter(r), a.removeAllRanges(), a.addRange(s);
  }
}
function bt(n) {
  try {
    return document.queryCommandState(n);
  } catch {
    return !1;
  }
}
function ye(n, e) {
  return {
    run: (t) => oa(t.root, n),
    isActive: (t) => pe(D(t.root)) === e
  };
}
const un = {
  bold: { run: () => {
    document.execCommand("bold");
  }, isActive: () => bt("bold") },
  italic: { run: () => {
    document.execCommand("italic");
  }, isActive: () => bt("italic") },
  strike: { run: () => {
    document.execCommand("strikeThrough");
  }, isActive: () => bt("strikeThrough") },
  code: {
    run: (n) => Iu(n.root, "code"),
    isActive: (n) => Dt(n.root, "code")
  },
  link: {
    run: (n, e) => ma(n.root, e?.href),
    isActive: (n) => Dt(n.root, "a")
  },
  clear: { run: (n) => ba(n.root) },
  paragraph: ye("P", "paragraph"),
  heading1: ye("H1", "heading1"),
  heading2: ye("H2", "heading2"),
  heading3: ye("H3", "heading3"),
  heading4: ye("H4", "heading4"),
  heading5: ye("H5", "heading5"),
  heading6: ye("H6", "heading6"),
  bulletList: {
    run: (n) => mt(n.root, { ordered: !1 }),
    isActive: (n) => pe(D(n.root)) === "bulletList"
  },
  orderedList: {
    run: (n) => mt(n.root, { ordered: !0 }),
    isActive: (n) => pe(D(n.root)) === "orderedList"
  },
  taskList: {
    run: (n) => mt(n.root, { ordered: !1, task: !0 }),
    isActive: (n) => pe(D(n.root)) === "taskList"
  },
  blockquote: {
    run: (n) => ca(n.root),
    isActive: (n) => pe(D(n.root)) === "blockquote"
  },
  codeBlock: {
    run: (n) => fa(n.root),
    isActive: (n) => pe(D(n.root)) === "codeBlock"
  },
  divider: { run: (n) => da(n.root) },
  // The caret-safe logic lives on the editor instance (it must capture the
  // caret BEFORE focusing); the command is the registry entry point.
  insertText: { run: (n, e) => n.editor.insertText(e?.text ?? "") },
  image: { run: (n, e) => pa(n.root, e) },
  table: {
    run: (n, e) => ha(n.root, e),
    isActive: (n) => D(n.root)?.tagName === "TABLE"
  }
};
function qu(n) {
  return { root: n };
}
function xa(n, e, t) {
  n.focus();
  const u = un[e];
  u && u.run(qu(n), t);
}
function oo(n, e) {
  const t = un[e];
  return t?.isActive ? t.isActive(qu(n)) : !1;
}
class ka {
  constructor(e) {
    this.editorRoot = e, this.layer = document.createElement("div"), this.layer.className = "ew ew-layer", document.body.appendChild(this.layer);
  }
  layer;
  active = null;
  // ── Selection preservation ────────────────────────────────────────────────
  savedRange = null;
  saveSelection() {
    const e = H();
    this.savedRange = e && (this.editorRoot.contains(e.startContainer) || e.startContainer === this.editorRoot) ? e.cloneRange() : null;
  }
  /** Restore the selection saved when the popover opened. Safe to call twice. */
  restoreSelection() {
    if (!this.savedRange) return;
    const e = O();
    e && (e.removeAllRanges(), e.addRange(this.savedRange.cloneRange()));
  }
  // ── Popover ───────────────────────────────────────────────────────────────
  popover(e) {
    this.closeAll(), this.saveSelection();
    const t = document.createElement("div");
    t.className = "ew-popover", t.setAttribute("contenteditable", "false"), this.layer.appendChild(t);
    let u = !1;
    const i = () => {
      u || (u = !0, o?.(), t.remove(), document.removeEventListener("pointerdown", r, !0), document.removeEventListener("keydown", a, !0), window.removeEventListener("scroll", s, !0), this.active?.el === t && (this.active = null), e.onClose?.());
    };
    t.addEventListener("mousedown", (c) => {
      const d = c.target;
      /^(INPUT|TEXTAREA|SELECT)$/.test(d.tagName) || c.preventDefault();
    });
    const r = (c) => {
      t.contains(c.target) || i();
    }, a = (c) => {
      c.key === "Escape" && (c.preventDefault(), c.stopPropagation(), i());
    }, s = (c) => {
      t.contains(c.target) || i();
    };
    setTimeout(() => {
      u || (document.addEventListener("pointerdown", r, !0), document.addEventListener("keydown", a, !0), window.addEventListener("scroll", s, !0));
    }, 0), nt(t, e.anchor, e.placement ?? "below");
    const o = e.render(t, i) ?? void 0;
    return nt(t, e.anchor, e.placement ?? "below"), this.active = { el: t, cleanup: i }, { close: i, el: t };
  }
  // ── Menu (keyboard-navigable list) ────────────────────────────────────────
  menu(e) {
    return this.popover({
      anchor: e.anchor,
      onClose: e.onClose,
      render: (t, u) => {
        t.classList.add("ew-menu"), t.setAttribute("role", "menu");
        const i = e.items.filter((l) => !l.disabled);
        let r = 0;
        const a = [];
        let s = !1;
        t.addEventListener("mousemove", () => {
          s = !0;
        }, { once: !0 });
        let o;
        for (const l of e.items) {
          if (l.group && l.group !== o) {
            const A = document.createElement("div");
            A.className = "ew-menu__group", A.textContent = l.group, t.appendChild(A), o = l.group;
          }
          const p = document.createElement("button");
          p.type = "button", p.className = "ew-menu__item" + (l.danger ? " is-danger" : ""), p.setAttribute("role", "menuitem"), p.id = `ew-menu-${l.id}`, p.disabled = !!l.disabled;
          const w = document.createElement("span");
          if (w.className = "ew-menu__title", w.textContent = l.title, p.appendChild(w), l.hint) {
            const A = document.createElement("span");
            A.className = "ew-menu__hint", A.textContent = l.hint, p.appendChild(A);
          }
          p.addEventListener("mouseenter", () => {
            if (!s) return;
            const A = i.indexOf(l);
            A >= 0 && (r = A, c());
          }), p.addEventListener("click", (A) => {
            A.preventDefault(), u(), l.action();
          }), t.appendChild(p), l.disabled || a.push(p);
        }
        const c = () => {
          a.forEach((l, p) => l.classList.toggle("is-active", p === r)), st(t, a[r]);
        };
        c();
        const d = (l) => {
          if (l.key === "ArrowDown")
            l.preventDefault(), l.stopPropagation(), r = (r + 1) % i.length, c();
          else if (l.key === "ArrowUp")
            l.preventDefault(), l.stopPropagation(), r = (r - 1 + i.length) % i.length, c();
          else if (l.key === "Enter") {
            l.preventDefault(), l.stopPropagation();
            const p = i[r];
            u(), p?.action();
          }
        };
        return document.addEventListener("keydown", d, !0), () => document.removeEventListener("keydown", d, !0);
      }
    });
  }
  // ── Toast ─────────────────────────────────────────────────────────────────
  notify(e) {
    const t = document.createElement("div");
    t.className = "ew-toast", t.setAttribute("role", "status"), t.textContent = e, this.layer.appendChild(t), requestAnimationFrame(() => t.classList.add("is-visible")), setTimeout(() => {
      t.classList.remove("is-visible"), setTimeout(() => t.remove(), 300);
    }, 2e3);
  }
  closeAll() {
    this.active?.cleanup(), this.active = null, this.savedRange = null;
  }
  destroy() {
    this.closeAll(), this.layer.remove();
  }
}
function Du(n, e) {
  const t = document.createElement("form");
  t.className = "ew-popover__form";
  const u = /* @__PURE__ */ new Map();
  for (const a of e.fields) {
    const s = document.createElement("input");
    s.type = "text", s.name = a.name, s.placeholder = a.placeholder, s.value = a.value ?? "", s.setAttribute("aria-label", a.label), s.className = "ew-popover__input", u.set(a.name, s), t.appendChild(s);
  }
  const i = document.createElement("div");
  i.className = "ew-popover__actions";
  const r = document.createElement("button");
  r.type = "submit", r.className = "ew-popover__btn ew-popover__btn--primary", r.textContent = e.submitLabel, i.appendChild(r);
  for (const a of e.actions ?? []) {
    const s = document.createElement("button");
    s.type = "button", s.className = "ew-popover__btn" + (a.danger ? " is-danger" : ""), s.textContent = a.label, s.addEventListener("click", (o) => {
      o.preventDefault(), a.onPick();
    }), i.appendChild(s);
  }
  t.appendChild(i), t.addEventListener("submit", (a) => {
    a.preventDefault();
    const s = {};
    u.forEach((o, c) => {
      s[c] = o.value.trim();
    }), e.onSubmit(s);
  }), n.appendChild(t), setTimeout(() => u.values().next().value?.focus(), 0);
}
function wa(n, e = 56) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return;
  const u = t.getRangeAt(0);
  if (!n.contains(u.startContainer)) return;
  let i = u.getBoundingClientRect();
  if (i.height === 0) {
    const d = (u.startContainer.nodeType === 1 ? u.startContainer : u.startContainer.parentElement)?.getBoundingClientRect();
    if (!d || d.height === 0) return;
    i = d;
  }
  const r = n.getBoundingClientRect(), a = Math.max(0, Math.min(e, (r.height - i.height) / 2)), s = i.bottom - (r.bottom - a), o = r.top + a - i.top;
  s > 0 ? n.scrollTop += s : o > 0 && (n.scrollTop -= o);
}
function st(n, e) {
  if (!e) return;
  const t = e.offsetTop, u = t + e.offsetHeight;
  t < n.scrollTop ? n.scrollTop = t : u > n.scrollTop + n.clientHeight && (n.scrollTop = u - n.clientHeight);
}
function nt(n, e, t) {
  const u = e instanceof HTMLElement ? e.getBoundingClientRect() : e, { width: i, height: r } = n.getBoundingClientRect(), a = 6, s = 8, o = document.documentElement.clientWidth, c = document.documentElement.clientHeight, d = Math.max(s, Math.min(u.left, o - i - s)), l = u.top - a - r, p = u.bottom + a, w = l >= s, A = p + r <= c - s;
  let R = t === "above" ? w || !A ? l : p : A || !w ? p : l;
  R = Math.max(s, Math.min(R, c - r - s)), n.style.left = `${Math.round(d + window.scrollX)}px`, n.style.top = `${Math.round(R + window.scrollY)}px`;
}
function Bt(n, e) {
  const t = n.ui, u = H(), i = e ?? (u ? Le(u.startContainer, n.root, (s) => s.tagName === "A") : null);
  if (!i && (!u || u.collapsed)) return !1;
  const r = i?.getBoundingClientRect() ?? Me();
  if (!r) return !1;
  const a = i?.getAttribute("href") ?? "";
  return n.ui.popover({
    anchor: r,
    placement: "below",
    render(s, o) {
      s.classList.add("ew-link-popover"), Du(s, {
        fields: [{ name: "href", label: "Link URL", placeholder: "Paste or type a link…", value: a }],
        submitLabel: i ? "Save" : "Link",
        actions: i ? [
          {
            label: "Open",
            onPick: () => {
              const c = i.getAttribute("href");
              c && window.open(c, "_blank", "noopener");
            }
          },
          {
            label: "Remove",
            danger: !0,
            onPick: () => {
              o(), t.restoreSelection(), n.exec("link", { href: null });
            }
          }
        ] : [],
        onSubmit(c) {
          o(), t.restoreSelection(), n.exec("link", { href: c.href || null });
        }
      });
    }
  }), !0;
}
function le(n, e, t) {
  return {
    id: `turn-${n}`,
    title: e,
    group: "Turn into",
    when: (u, i) => i.tagName !== "TABLE" && i.tagName !== "FIGURE",
    run: (u, i) => {
      _(i), u.exec(t);
    }
  };
}
function ya(n) {
  const e = Me() ?? D(n.root)?.getBoundingClientRect();
  if (!e) return;
  const t = n.ui;
  n.ui.popover({
    anchor: e,
    placement: "below",
    render(u, i) {
      const r = document.createElement("input");
      r.type = "file", r.accept = "image/*", r.multiple = !0, r.style.display = "none", r.setAttribute("data-testid", "ew-image-file"), r.addEventListener("change", () => {
        const a = Array.from(r.files ?? []), s = u.querySelector('input[name="alt"]')?.value.trim();
        i(), a.length && (t.restoreSelection(), n.editor.insertImages(a, { alt: s || void 0 }));
      }), Du(u, {
        fields: [
          { name: "src", label: "Image URL", placeholder: "Paste an image URL…" },
          { name: "alt", label: "Alt text", placeholder: "Describe the image (alt text)" }
        ],
        submitLabel: "Insert image",
        actions: [{ label: "Upload…", onPick: () => r.click() }],
        onSubmit(a) {
          i(), a.src && (t.restoreSelection(), n.exec("image", { src: a.src, alt: a.alt || void 0 }));
        }
      }), u.appendChild(r);
    }
  });
}
function ot() {
  return {
    name: "core",
    priority: 0,
    commands: un,
    inputRules: [
      // Block rules — `apply: command` inherits the convert-first → strip →
      // re-anchor sequence (see input-rules.ts).
      { kind: "block", trigger: /^# $/, apply: "heading1" },
      { kind: "block", trigger: /^## $/, apply: "heading2" },
      { kind: "block", trigger: /^### $/, apply: "heading3" },
      { kind: "block", trigger: /^#### $/, apply: "heading4" },
      { kind: "block", trigger: /^##### $/, apply: "heading5" },
      { kind: "block", trigger: /^###### $/, apply: "heading6" },
      { kind: "block", trigger: /^> $/, apply: "blockquote" },
      { kind: "block", trigger: /^[-*] $/, apply: "bulletList" },
      { kind: "block", trigger: /^\d+\. $/, apply: "orderedList" },
      { kind: "block", trigger: /^\[[ xX]?\] $/, apply: "taskList" },
      {
        // Fenced code — INSTANT on the third backtick (Notion parity); the
        // optional space keeps the old "``` " gesture working. The block must
        // be EMPTIED first: toggleCodeBlock copies the block text into the
        // <code>, and the trigger must not ride in.
        kind: "block",
        trigger: /^``` ?$/,
        apply: (n, e, t) => (n.dom.deleteLeadingChars(t, e[0].length), n.exec("codeBlock"), !0)
      },
      {
        // Divider — INSTANT on the third dash (Notion parity). Same
        // delete-first ordering: insertDivider removes the current block only
        // when it is already empty.
        kind: "block",
        trigger: /^-{3}$/,
        apply: (n, e, t) => (n.dom.deleteLeadingChars(t, e[0].length), n.exec("divider"), !0)
      },
      {
        // Divider, space-triggered variants. "___ " and "*** " are NOT
        // instant — typing "***bold italic***" must stay possible.
        kind: "block",
        trigger: /^(-{3}|_{3}|\*{3}) $/,
        apply: (n, e, t) => (n.dom.deleteLeadingChars(t, e[0].length), n.exec("divider"), !0)
      },
      // Inline rules — the lookbehinds keep guard chars out of the match.
      { kind: "inline", trigger: /\*\*([^*\n]+)\*\*$/, apply: "strong" },
      { kind: "inline", trigger: /~~([^~\n]+)~~$/, apply: "del" },
      { kind: "inline", trigger: /`([^`\n]+)`$/, apply: "code" },
      { kind: "inline", trigger: /(?<![*\\])\*([^*\n]+)\*$/, apply: "em" },
      { kind: "inline", trigger: /(?<![_\w])_([^_\n]+)_$/, apply: "em" }
    ],
    keymap: {
      "Mod-b": "bold",
      "Mod-i": "italic",
      "Mod-Shift-e": "code",
      "Mod-Shift-7": "orderedList",
      "Mod-Shift-8": "bulletList",
      "Mod-Shift-9": "taskList",
      "Mod-k": (n) => Bt(n),
      // Notion parity: Enter on a paragraph that is exactly "---"/"___"/"***"
      // converts it to a divider (the space-triggered rule handles "--- ").
      // Returning false falls through to the structural Enter engine.
      Enter: (n) => {
        const e = n.dom.currentBlock();
        if (!e || e.tagName !== "P") return !1;
        const t = (e.textContent ?? "").split("​").join("").replace(/ /g, " ").trim();
        return /^(-{3,}|_{3,}|\*{3,})$/.test(t) ? (n.transact(() => {
          n.dom.deleteLeadingChars(e, (e.textContent ?? "").length), n.exec("divider");
        }), !0) : !1;
      }
    },
    slashItems: [
      { id: "paragraph", title: "Text", hint: "Plain paragraph", keywords: ["text", "paragraph", "body"], group: "Basic blocks", command: "paragraph" },
      { id: "heading1", title: "Heading 1", hint: "Large section title", keywords: ["h1", "heading", "title", "big"], group: "Basic blocks", command: "heading1" },
      { id: "heading2", title: "Heading 2", hint: "Medium heading", keywords: ["h2", "heading", "subtitle"], group: "Basic blocks", command: "heading2" },
      { id: "heading3", title: "Heading 3", hint: "Small heading", keywords: ["h3", "heading"], group: "Basic blocks", command: "heading3" },
      { id: "bulletList", title: "Bulleted list", hint: "A simple bullet list", keywords: ["bullet", "unordered", "ul", "list"], group: "Basic blocks", command: "bulletList" },
      { id: "orderedList", title: "Numbered list", hint: "A numbered list", keywords: ["number", "ordered", "ol", "list"], group: "Basic blocks", command: "orderedList" },
      { id: "taskList", title: "To-do list", hint: "Track tasks with checkboxes", keywords: ["todo", "task", "check", "checkbox"], group: "Basic blocks", command: "taskList" },
      { id: "blockquote", title: "Quote", hint: "Capture a quote", keywords: ["quote", "blockquote", "cite"], group: "Basic blocks", command: "blockquote" },
      { id: "codeBlock", title: "Code", hint: "Fenced code block", keywords: ["code", "pre", "fence", "snippet"], group: "Basic blocks", command: "codeBlock" },
      { id: "divider", title: "Divider", hint: "Visual separator", keywords: ["divider", "hr", "rule", "line", "separator"], group: "Basic blocks", command: "divider" },
      { id: "image", title: "Image", hint: "Upload, paste, or embed from a URL", keywords: ["image", "img", "picture", "photo", "media", "upload"], group: "Media", run: ya },
      { id: "table", title: "Table", hint: "3×3 table (Tab to move, Tab at the end adds a row)", keywords: ["table", "grid", "rows", "columns"], group: "Media", command: "table", payload: { rows: 3, cols: 3 } },
      { id: "heading4", title: "Heading 4", hint: "Sub-sub heading", keywords: ["h4", "heading"], group: "Advanced", command: "heading4" },
      { id: "heading5", title: "Heading 5", hint: "Rarely needed", keywords: ["h5", "heading"], group: "Advanced", command: "heading5" },
      { id: "heading6", title: "Heading 6", hint: "The smallest heading", keywords: ["h6", "heading"], group: "Advanced", command: "heading6" }
    ],
    toolbarItems: [
      { id: "bold", label: "B", title: "Bold  (⌘B)", command: "bold" },
      { id: "italic", label: "I", title: "Italic  (⌘I)", command: "italic" },
      { id: "strike", label: "S", title: "Strikethrough", command: "strike" },
      { id: "code", label: "</>", title: "Inline code", command: "code" },
      { id: "link", label: "🔗", title: "Link  (⌘K)", run: (n) => {
        Bt(n);
      } },
      { id: "heading1", label: "H1", title: "Heading 1", command: "heading1" },
      { id: "heading2", label: "H2", title: "Heading 2", command: "heading2" },
      { id: "blockquote", label: "❝", title: "Quote", command: "blockquote" },
      { id: "bulletList", label: "•–", title: "Bulleted list", command: "bulletList" },
      { id: "orderedList", label: "1.", title: "Numbered list", command: "orderedList" },
      { id: "codeBlock", label: "{ }", title: "Code block", command: "codeBlock" }
    ],
    blockMenuItems: [
      le("paragraph", "Text", "paragraph"),
      le("heading1", "Heading 1", "heading1"),
      le("heading2", "Heading 2", "heading2"),
      le("heading3", "Heading 3", "heading3"),
      le("bulletList", "Bulleted list", "bulletList"),
      le("orderedList", "Numbered list", "orderedList"),
      le("taskList", "To-do list", "taskList"),
      le("blockquote", "Quote", "blockquote"),
      le("codeBlock", "Code", "codeBlock"),
      {
        id: "duplicate",
        title: "Duplicate",
        group: "Actions",
        run: (n, e) => {
          const t = n.markdown.serialize(e.outerHTML), u = document.createElement("div");
          u.innerHTML = n.markdown.parse(t);
          const i = u.firstElementChild;
          i && (e.after(i), J(i));
        }
      },
      {
        id: "copy-markdown",
        title: "Copy as Markdown",
        group: "Actions",
        run: (n, e) => {
          const t = n.markdown.serialize(e.outerHTML);
          navigator.clipboard?.writeText(t).then(
            () => n.ui.notify("Copied as Markdown"),
            () => n.ui.notify("Copy failed")
          );
        }
      },
      {
        id: "delete",
        title: "Delete",
        group: "Actions",
        danger: !0,
        run: (n, e) => {
          const t = e.nextElementSibling ?? e.previousElementSibling;
          e.remove(), t && _(t);
        }
      }
    ]
  };
}
const va = 100, Ln = "core";
function re(n) {
  if (!n.name || !/^[a-z][a-z0-9-]*(:[a-z0-9-]+)?$/i.test(n.name))
    throw new Error(`[edodo-write] plugin name "${n.name}" must be a kebab-case identifier`);
  for (const e of Object.keys(n.keymap ?? {})) Bu(e, n.name);
  return Object.freeze({ ...n });
}
function Bu(n, e) {
  const t = n.split("-"), u = t.pop(), i = { mod: !1, ctrl: !1, alt: !1, shift: !1, key: "" };
  if (!u) throw new Error(`[edodo-write] plugin "${e}": empty key string "${n}"`);
  for (const r of t)
    switch (r.toLowerCase()) {
      case "mod":
        i.mod = !0;
        break;
      case "ctrl":
        i.ctrl = !0;
        break;
      case "alt":
        i.alt = !0;
        break;
      case "shift":
        i.shift = !0;
        break;
      default:
        throw new Error(`[edodo-write] plugin "${e}": unknown modifier "${r}" in "${n}"`);
    }
  return i.key = u.length === 1 ? u.toLowerCase() : u, i;
}
function Ea(n, e) {
  const t = e.metaKey || e.ctrlKey;
  if (n.mod) {
    if (!t) return !1;
  } else if (n.ctrl) {
    if (!e.ctrlKey || e.metaKey) return !1;
  } else if (t)
    return !1;
  return n.alt !== e.altKey || n.shift !== e.shiftKey ? !1 : !!((e.key.length === 1 ? e.key.toLowerCase() : e.key) === n.key || /^\d$/.test(n.key) && e.code === `Digit${n.key}`);
}
function rn(n, e = []) {
  const t = new Set(e), u = /* @__PURE__ */ new Map(), i = {
    commands: /* @__PURE__ */ new Map(),
    blockRules: [],
    inlineRules: [],
    keymap: [],
    slashItems: [],
    toolbarItems: [],
    blockMenuItems: [],
    markedExtensions: [],
    turndownExtensions: [],
    sanitize: void 0,
    plugins: n
  }, r = { slash: /* @__PURE__ */ new Map(), toolbar: /* @__PURE__ */ new Map(), blockMenu: /* @__PURE__ */ new Map() };
  let a = 0;
  for (const s of n) {
    if (u.has(s.name))
      throw new Error(`[edodo-write] duplicate plugin name "${s.name}"`);
    u.set(s.name, s.name);
    const o = s.priority ?? (s.name === Ln ? 0 : va), c = (l) => t.has(l) && s.name === Ln;
    for (const [l, p] of Object.entries(s.commands ?? {})) {
      if (c(l)) continue;
      const w = i.commands.get(l);
      if (w)
        throw new Error(
          `[edodo-write] command "${l}" registered by both "${w.plugin}" and "${s.name}"`
        );
      i.commands.set(l, { spec: p, plugin: s.name });
    }
    for (const l of s.inputRules ?? [])
      typeof l.apply == "string" && c(l.apply) || (l.kind === "block" ? i.blockRules.push({ ...l, plugin: s.name }) : i.inlineRules.push({ ...l, plugin: s.name }));
    for (const [l, p] of Object.entries(s.keymap ?? {}))
      typeof p == "string" && c(p) || i.keymap.push({
        descriptor: Bu(l, s.name),
        binding: p,
        plugin: s.name,
        priority: o,
        order: a++
      });
    const d = (l, p, w, A) => {
      for (const R of l ?? []) {
        if (c(R.id) || R.command && c(R.command)) continue;
        const T = w.get(R.id);
        if (T)
          throw new Error(`[edodo-write] ${A} item "${R.id}" registered by both "${T}" and "${s.name}"`);
        w.set(R.id, s.name), p.push(R);
      }
    };
    if (d(s.slashItems, i.slashItems, r.slash, "slash"), d(s.toolbarItems, i.toolbarItems, r.toolbar, "toolbar"), d(s.blockMenuItems, i.blockMenuItems, r.blockMenu, "block-menu"), s.markdown?.marked && i.markedExtensions.push(...s.markdown.marked), s.markdown?.turndown && i.turndownExtensions.push(s.markdown.turndown), s.sanitize) {
      const l = { ...i.sanitize?.attributes ?? {} };
      for (const [p, w] of Object.entries(s.sanitize.attributes ?? {}))
        l[p] = [.../* @__PURE__ */ new Set([...l[p] ?? [], ...w])];
      i.sanitize = {
        tags: [.../* @__PURE__ */ new Set([...i.sanitize?.tags ?? [], ...s.sanitize.tags ?? []])],
        attributes: l
      };
    }
  }
  return i.keymap.sort((s, o) => o.priority - s.priority || s.order - o.order), i;
}
function V(n, e, t) {
  try {
    return t();
  } catch (u) {
    console.error(`[edodo-write] plugin "${n}" failed in ${e}:`, u);
    return;
  }
}
const Ge = "​";
function Aa(n, e, t) {
  if (!e || !t) {
    const r = La();
    e ??= r.rules, t ??= r.ctxFor(n);
  }
  const u = D(n);
  if (!u) return !1;
  const i = u.tagName;
  if (i !== "PRE") {
    const r = rt(u).replace(/ /g, " ");
    for (const a of e.block) {
      if (!(a.within ?? ["P"]).includes(i)) continue;
      const o = a.trigger.exec(r);
      if (!o) continue;
      if (V(a.plugin, "inputRules", () => typeof a.apply == "string" ? (Ca(n, a.apply, r.length, t), !0) : a.apply(t, o, u))) return !0;
    }
  }
  return i === "PRE" ? !1 : Sa(e.inline);
}
function Ca(n, e, t, u) {
  const i = rt(D(n) ?? n).replace(/ /g, " "), r = e === "taskList" && /\[[xX]\]/.test(i);
  u.transact(() => {
    u.exec(e);
    const a = ge(n) || D(n);
    a && (at(a, t), Mu(a)), r && _a(n);
  });
}
function Sa(n, e) {
  const t = H();
  if (!t || !t.collapsed) return !1;
  let u = t.startContainer, i = t.startOffset;
  if (u.nodeType !== Node.TEXT_NODE) {
    const a = i > 0 ? u.childNodes[i - 1] : null;
    if (a && a.nodeType === Node.TEXT_NODE)
      u = a, i = a.data.length;
    else
      return !1;
  }
  const r = u.data.slice(0, i);
  for (const a of n) {
    const s = a.trigger.exec(r);
    if (!s) continue;
    const o = i - s[0].length;
    if (o < 0) continue;
    if (V(a.plugin, "inputRules", () => {
      const d = typeof a.apply == "string" ? Ta(a.apply, s[1] ?? s[0]) : a.apply(s);
      return Na(u, o, i, d), !0;
    })) return !0;
  }
  return !1;
}
function Ta(n, e) {
  const t = document.createElement(n);
  return t.textContent = e, t;
}
function Na(n, e, t, u) {
  const i = document.createRange();
  i.setStart(n, e), i.setEnd(n, t), i.deleteContents(), i.insertNode(u);
  const r = document.createTextNode(Ge);
  u.parentNode?.insertBefore(r, u.nextSibling);
  const a = O();
  if (a) {
    const s = document.createRange();
    s.setStart(r, 1), s.collapse(!0), a.removeAllRanges(), a.addRange(s);
  }
}
function Mu(n) {
  const e = n.querySelector(':scope > input[type="checkbox"]');
  if (e) {
    let u = e.nextSibling;
    (!u || u.nodeType !== Node.TEXT_NODE) && (u = document.createTextNode(Ge), e.after(u));
    const i = O();
    if (i) {
      const r = document.createRange();
      r.setStart(u, u.length), r.collapse(!0), i.removeAllRanges(), i.addRange(r);
    }
    return;
  }
  if (n.tagName === "PRE") {
    const u = n.querySelector("code") ?? n;
    u.firstChild || u.appendChild(document.createTextNode(Ge));
    const i = O();
    if (i && u.lastChild) {
      const r = document.createRange();
      r.selectNodeContents(u), r.collapse(!1), i.removeAllRanges(), i.addRange(r);
    }
    return;
  }
  !((n.textContent ?? "").split(Ge).join("").length > 0) && !n.querySelector("*") && n.replaceChildren(document.createElement("br")), _(n);
}
function _a(n) {
  const e = ge(n);
  if (!e) return;
  const t = e.querySelector('input[type="checkbox"]');
  t && (t.checked = !0, t.setAttribute("checked", "")), e.setAttribute("data-task", "done");
}
let Ve = null;
function La() {
  if (Ve) return Ve;
  const n = rn([ot()]);
  return Ve = {
    rules: { block: n.blockRules, inline: n.inlineRules },
    ctxFor: (e) => ({
      root: e,
      exec: (t, u) => (xa(e, t, u), !0),
      transact: (t) => t(),
      dom: {
        deleteLeadingChars: (t, u) => at(t, u)
      }
    })
  }, Ve;
}
const Re = "​";
function Ra(n, e, t, u, i) {
  for (const a of u) {
    if (!Ea(a.descriptor, e)) continue;
    if (V(a.plugin, "keymap", () => typeof a.binding == "string" ? i.exec(a.binding) : a.binding(i, e)))
      return e.preventDefault(), !0;
  }
  if (t.submit && e.key === "Enter" && !e.isComposing && !e.altKey && !e.shiftKey) {
    const a = e.metaKey || e.ctrlKey;
    if (t.submit.on === "mod-enter" ? a : a || !Ia(n))
      return e.preventDefault(), t.submit.fire(), !0;
  }
  if ((e.metaKey || e.ctrlKey) && !e.altKey) {
    const a = e.key.toLowerCase();
    if (a === "z" && !e.shiftKey)
      return e.preventDefault(), t.undo(), !0;
    if (a === "z" && e.shiftKey || a === "y")
      return e.preventDefault(), t.redo(), !0;
    if (a === "u" && !e.shiftKey)
      return e.preventDefault(), !0;
  }
  return e.key === "Enter" && !e.shiftKey && $a(n) || e.key === "Enter" && e.shiftKey && Pa(n) || e.key === "Backspace" && Ha(n) || e.key === "Tab" && Ka(n, e.shiftKey) ? (e.preventDefault(), t.notify(), !0) : !1;
}
function Ia(n) {
  const t = H()?.startContainer ?? null, u = t instanceof Element ? t : t?.parentElement ?? null;
  return !u || !n.contains(u) ? !1 : u.closest("li, pre") !== null;
}
function $a(n) {
  const e = D(n);
  if (!e) return !1;
  if (e.tagName === "PRE")
    return Pu(), !0;
  if (e.tagName === "TABLE") {
    const u = Ou(n);
    if (u) {
      const r = Va(u);
      if (r)
        return _(r), !0;
    }
    const i = document.createElement("p");
    return i.innerHTML = "<br>", e.after(i), _(i), !0;
  }
  if (e.tagName === "FIGURE") {
    const u = document.createElement("p");
    return u.innerHTML = "<br>", e.after(u), _(u), !0;
  }
  const t = ge(n);
  return t && t.parentElement && /^(UL|OL)$/.test(t.parentElement.tagName) ? (Oa(t) ? Ma(n, t) : Da(t), !0) : (qa(e), !0);
}
function qa(n) {
  const e = H();
  if (!e) return;
  const t = document.createRange();
  t.setStart(e.endContainer, e.endOffset), t.setEnd(n, n.childNodes.length);
  const u = t.extractContents(), i = /^(H[1-6]|BLOCKQUOTE)$/.test(n.tagName) ? "p" : n.tagName.toLowerCase(), r = [];
  let a = null;
  for (const o of Array.from(u.childNodes))
    if (o.nodeType === 1 && /^(P|H[1-6]|BLOCKQUOTE)$/.test(o.tagName)) {
      const c = document.createElement("p");
      for (; o.firstChild; ) c.appendChild(o.firstChild);
      r.push(c), a = null;
    } else
      a || (a = document.createElement(i), r.push(a)), a.appendChild(o);
  r.length === 0 && r.push(document.createElement(i)), r.forEach((o) => Y(o)), Y(n);
  let s = n;
  for (const o of r)
    s.after(o), s = o;
  _(r[0]);
}
function Da(n) {
  const e = H();
  if (!e) return;
  const t = document.createRange();
  t.setStart(e.endContainer, e.endOffset), t.setEnd(n, n.childNodes.length);
  const u = t.extractContents(), i = document.createElement("li");
  if (i.appendChild(u), i.querySelectorAll(':scope > input[type="checkbox"]').forEach((r) => r.remove()), Y(n), n.after(i), n.classList.contains("task-list-item")) {
    qt(i, !1);
    const r = i.querySelector('input[type="checkbox"]');
    if (r) {
      He(r), Ba(i);
      return;
    }
  }
  Y(i), _(i);
}
function Ba(n) {
  const e = n.querySelector('input[type="checkbox"]');
  e && (!e.nextSibling || e.nextSibling.nodeType !== Node.TEXT_NODE) && e.after(document.createTextNode(Re));
}
function Ma(n, e) {
  const t = e.parentElement, u = document.createElement("p");
  u.innerHTML = "<br>", e.remove(), t.after(u), t.querySelector("li") || t.remove(), _(u);
}
function Oa(n) {
  return (n.textContent ?? "").split(Re).join("").trim() === "" && !n.querySelector("ul,ol");
}
function Pa(n) {
  const e = D(n);
  if (!e) return !1;
  if (e.tagName === "PRE")
    return Pu(), !0;
  const t = H();
  if (!t) return !1;
  t.deleteContents();
  const u = document.createElement("br");
  t.insertNode(u);
  const i = document.createTextNode(Re);
  return u.after(i), He(i), !0;
}
function Ha(n) {
  const e = O();
  if (!e || !e.isCollapsed) return !1;
  const t = D(n);
  if (!t) return !1;
  const u = ge(n);
  return u && za(u) ? (Ua(n, u), !0) : _u(t) ? ["H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"].includes(t.tagName) || t.tagName === "PRE" && (t.textContent ?? "").split(Re).join("").trim() === "" ? (Rn(t), !0) : t.tagName === "P" ? Fa(t) : !1 : !1;
}
function za(n) {
  const e = H();
  if (!e) return !1;
  const t = e.cloneRange();
  return t.selectNodeContents(n), t.setEnd(e.startContainer, e.startOffset), t.toString().split(Re).join("").length === 0;
}
function Rn(n) {
  const e = document.createElement("p");
  for (; n.firstChild; ) e.appendChild(n.firstChild);
  Y(e), n.replaceWith(e), _(e);
}
function Ua(n, e) {
  const t = e.parentElement, u = t.parentElement;
  if (u && u.tagName === "LI") {
    u.after(e), t.querySelector("li") || t.remove(), _(e);
    return;
  }
  const i = document.createElement("p");
  for (e.querySelector(':scope > input[type="checkbox"]')?.remove(); e.firstChild; ) i.appendChild(e.firstChild);
  Y(i);
  const r = [];
  for (let a = e.nextElementSibling; a; a = a.nextElementSibling) r.push(a);
  if (e.remove(), t.after(i), r.length) {
    const a = document.createElement(t.tagName.toLowerCase());
    t.classList.contains("contains-task-list") && a.classList.add("contains-task-list"), r.forEach((s) => a.appendChild(s)), i.after(a);
  }
  t.querySelector("li") || t.remove(), _(i);
}
function Fa(n) {
  const e = n.previousElementSibling;
  if (!e) return !1;
  if (e.tagName === "HR" || e.tagName === "FIGURE")
    return e.remove(), !0;
  if (e.tagName === "PRE") return !1;
  if (e.tagName === "TABLE") return !0;
  let t = e;
  /^(UL|OL)$/.test(e.tagName) && (t = e.querySelector("li:last-child") || e);
  const u = t.lastChild;
  if (!((n.textContent ?? "").trim() === ""))
    for (; n.firstChild; ) t.appendChild(n.firstChild);
  return n.remove(), u ? He(u) : _(t), !0;
}
function Ou(n) {
  const e = H();
  if (!e) return null;
  let t = e.startContainer;
  for (; t && t !== n; ) {
    if (t.nodeType === 1 && /^(TD|TH)$/.test(t.tagName))
      return t;
    t = t.parentNode;
  }
  return null;
}
function ja(n) {
  return Array.from(n.querySelectorAll("td, th"));
}
function Va(n) {
  const e = n.closest("tr"), t = n.closest("table");
  if (!e || !t) return null;
  const u = Array.from(t.querySelectorAll("tr")), i = u.indexOf(e), r = Array.from(e.children).indexOf(n);
  return u[i + 1]?.children[r] ?? null;
}
function Wa(n) {
  const e = n.querySelector("tbody") ?? n, t = n.querySelector("tr")?.children.length ?? 1, u = document.createElement("tr");
  for (let i = 0; i < t; i++) {
    const r = document.createElement("td");
    r.appendChild(document.createElement("br")), u.appendChild(r);
  }
  return e.appendChild(u), u.firstElementChild;
}
function Ga(n, e) {
  const t = Ou(n);
  if (!t) return !1;
  const u = t.closest("table"), i = ja(u), r = i.indexOf(t);
  return e ? (r <= 0 || J(i[r - 1]), !0) : r === i.length - 1 ? (_(Wa(u)), !0) : (_(i[r + 1]), !0);
}
function Ka(n, e) {
  if (Ga(n, e)) return !0;
  const t = ge(n);
  if (!t) return !1;
  const u = t.parentElement;
  if (e) {
    const a = u.parentElement;
    return a && a.tagName === "LI" ? (a.after(t), u.querySelector("li") || u.remove(), _(t), !0) : !1;
  }
  const i = t.previousElementSibling;
  if (!i || i.tagName !== "LI") return !1;
  let r = i.querySelector(":scope > ul, :scope > ol");
  return r || (r = document.createElement(u.tagName.toLowerCase()), i.appendChild(r)), r.appendChild(t), _(t), !0;
}
function Pu() {
  const n = H();
  if (!n) return;
  n.deleteContents();
  const e = document.createTextNode(`
` + Re);
  n.insertNode(e);
  const t = O();
  if (t) {
    const u = document.createRange();
    u.setStart(e, 1), u.collapse(!0), t.removeAllRanges(), t.addRange(u);
  }
}
function Hu(n, e, t) {
  const u = /* @__PURE__ */ new Map();
  for (const i of e) {
    const r = document.createElement("button");
    r.type = "button", r.className = "ew-toolbar__btn", r.dataset.cmd = i.id, r.textContent = i.label, r.title = i.title, r.setAttribute("aria-label", i.title), r.addEventListener("click", (a) => {
      a.preventDefault(), V("toolbar", `item "${i.id}"`, () => {
        i.run ? i.run(t) : i.command && t.exec(i.command, i.payload);
      });
    }), u.set(i.id, r), n.appendChild(r);
  }
  return u;
}
function zu(n, e, t, u) {
  for (const i of n) {
    const r = e.get(i.id);
    if (!r) continue;
    const a = i.isActive ? !!V("toolbar", `isActive "${i.id}"`, () => i.isActive(t, u)) : !!(i.command && t.marks[i.command]);
    r.classList.toggle("is-active", a);
  }
}
class Za {
  constructor(e, t) {
    this.items = e, this.ctx = t, this.el = document.createElement("div"), this.el.className = "ew ew-toolbar", this.el.setAttribute("role", "toolbar"), this.el.addEventListener("mousedown", (u) => u.preventDefault()), this.buttons = Hu(this.el, e, t), document.body.appendChild(this.el);
  }
  el;
  buttons;
  update(e) {
    if (!e || e.collapsed || e.empty || !e.rect) {
      this.hide();
      return;
    }
    zu(this.items, this.buttons, e, this.ctx), this.show(e.rect);
  }
  /**
   * Sit over the selection, dropping below it when there is no room above —
   * selecting the first line of a document used to push the toolbar off the
   * top of the window. `position` (ui.ts) owns the flip-and-clamp for every
   * floating panel; the only thing special here is that the toolbar centres
   * on the selection rather than starting at its left edge, so it is handed
   * a zero-width rect at the selection's midpoint.
   */
  show(e) {
    this.el.classList.add("is-visible");
    const { width: t } = this.el.getBoundingClientRect(), u = e.left + e.width / 2 - t / 2;
    nt(
      this.el,
      new DOMRect(u, e.top, 0, e.height),
      "above"
    );
  }
  hide() {
    this.el.classList.remove("is-visible");
  }
  destroy() {
    this.el.remove();
  }
}
class Qa {
  /** Docked INSIDE the editor host, before the content element. */
  constructor(e, t, u, i) {
    this.items = e, this.ctx = t, this.el = document.createElement("div"), this.el.className = "ew-fixed-toolbar", this.el.setAttribute("role", "toolbar"), this.el.addEventListener("mousedown", (r) => r.preventDefault()), this.buttons = Hu(this.el, e, t), u.insertBefore(this.el, i);
  }
  el;
  buttons;
  /** Reflects formatting AT THE CARET too — a docked bar is visible while
   *  typing, so unlike the floating bar it never requires a selection. */
  update(e) {
    if (!e) {
      for (const t of this.buttons.values()) t.classList.remove("is-active");
      return;
    }
    zu(this.items, this.buttons, e, this.ctx);
  }
  setEnabled(e) {
    this.el.classList.toggle("ew-fixed-toolbar--disabled", !e);
    for (const t of this.buttons.values()) t.disabled = !e;
  }
  destroy() {
    this.el.remove();
  }
}
const Xa = "​";
class Ya {
  constructor(e, t, u) {
    this.root = e, this.items = t, this.ctx = u, this.el = document.createElement("div"), this.el.className = "ew ew-slash", this.el.setAttribute("role", "listbox"), this.el.addEventListener("mousedown", (i) => i.preventDefault()), this.list = document.createElement("div"), this.list.className = "ew-slash__list", this.el.appendChild(this.list), document.body.appendChild(this.el);
  }
  el;
  list;
  open = !1;
  query = "";
  index = 0;
  filtered = [];
  anchor = null;
  mouseArmed = !1;
  get isOpen() {
    return this.open;
  }
  /** Called on every `input`; opens/updates/closes based on the caret block. */
  sync() {
    const e = D(this.root), t = ge(this.root), u = t ?? e;
    if (!u || !t && e.tagName !== "P") {
      this.close();
      return;
    }
    const i = (u.textContent ?? "").split(Xa).join(""), r = /^\/(.*)$/.exec(i);
    if (!r || /\n/.test(r[1])) {
      this.close();
      return;
    }
    this.anchor = u, this.query = r[1].toLowerCase(), this.openOrUpdate();
  }
  matches(e) {
    if (e.when && !V("slash", "when", () => e.when(this.ctx))) return !1;
    if (!this.query) return !0;
    const t = [e.title.toLowerCase(), ...e.keywords ?? []];
    return this.query.split(/\s+/).filter(Boolean).every(
      (u) => t.some((i) => i.includes(u))
    );
  }
  openOrUpdate() {
    if (this.filtered = this.items.filter((e) => this.matches(e)), this.filtered.length === 0) {
      this.close();
      return;
    }
    this.index = 0, this.mouseArmed = !1, this.el.addEventListener("mousemove", () => {
      this.mouseArmed = !0;
    }, { once: !0 }), this.render(), this.open = !0, this.el.classList.add("is-visible"), this.position();
  }
  render() {
    this.list.textContent = "";
    let e;
    this.filtered.forEach((t, u) => {
      const i = t.group ?? "Blocks";
      if (i !== e) {
        const s = document.createElement("div");
        s.className = "ew-slash__group", s.textContent = i, this.list.appendChild(s), e = i;
      }
      const r = document.createElement("button");
      r.type = "button", r.className = "ew-slash__item" + (u === this.index ? " is-active" : ""), r.setAttribute("role", "option"), r.setAttribute("aria-selected", u === this.index ? "true" : "false"), r.id = `ew-slash-${t.id}`;
      const a = document.createElement("span");
      if (a.className = "ew-slash__title", a.textContent = t.title, r.appendChild(a), t.hint) {
        const s = document.createElement("span");
        s.className = "ew-slash__hint", s.textContent = t.hint, r.appendChild(s);
      }
      r.addEventListener("mouseenter", () => {
        this.mouseArmed && (this.index = u, this.highlight());
      }), r.addEventListener("click", (s) => {
        s.preventDefault(), this.choose(t);
      }), this.list.appendChild(r);
    }), this.updateActiveDescendant();
  }
  highlight() {
    Array.from(this.list.querySelectorAll(".ew-slash__item")).forEach((e, t) => {
      e.classList.toggle("is-active", t === this.index), e.setAttribute("aria-selected", t === this.index ? "true" : "false");
    }), this.updateActiveDescendant(), st(this.el, this.list.querySelectorAll(".ew-slash__item")[this.index]);
  }
  updateActiveDescendant() {
    const e = this.filtered[this.index];
    e && this.el.setAttribute("aria-activedescendant", `ew-slash-${e.id}`);
  }
  /**
   * Drop out of the caret, flipping above it near the bottom of the window.
   * Shared with every other floating panel (ui.ts `position`) rather than
   * hand-rolled here: the hand-rolled version clamped the menu horizontally
   * and not vertically, so on the last line of a fixed-height editor pane —
   * which is where a writer reaches for `/` most often — the menu was placed
   * entirely below the fold and looked like it had failed to open.
   *
   * Only ever called while the menu is visible, because `position` measures
   * it to decide which side fits.
   */
  position() {
    const e = Me();
    e && nt(this.el, e, "below");
  }
  /** Returns true when the keydown was consumed by the open menu. */
  onKeyDown(e) {
    return this.open ? e.key === "ArrowDown" ? (e.preventDefault(), this.index = (this.index + 1) % this.filtered.length, this.highlight(), !0) : e.key === "ArrowUp" ? (e.preventDefault(), this.index = (this.index - 1 + this.filtered.length) % this.filtered.length, this.highlight(), !0) : e.key === "Enter" || e.key === "Tab" ? (e.preventDefault(), this.choose(this.filtered[this.index]), !0) : e.key === "Escape" ? (e.preventDefault(), this.close(), !0) : !1 : !1;
  }
  choose(e) {
    const t = this.anchor;
    if (this.close(), !t || !e) return;
    const u = t.textContent ?? "";
    at(t, u.length), Mu(t), e.command ? this.ctx.exec(e.command, e.payload) : e.run && V("slash", `item "${e.id}"`, () => e.run(this.ctx));
  }
  close() {
    this.open && (this.open = !1, this.el.classList.remove("is-visible"));
  }
  destroy() {
    this.el.remove();
  }
}
class Ja {
  constructor(e, t, u) {
    this.root = e, this.host = t, this.deps = u, this.handle = document.createElement("div"), this.handle.className = "ew-block-handle", this.handle.contentEditable = "false", this.handle.innerHTML = '<button type="button" class="ew-bh-add" title="Insert block below" aria-label="Insert block below">+</button><button type="button" class="ew-bh-drag" title="Drag to move, click for menu" aria-label="Drag to move, click for menu">⣿</button>', this.handle.style.display = "none", this.line = document.createElement("div"), this.line.className = "ew-drop-line", this.line.style.display = "none", t.appendChild(this.handle), t.appendChild(this.line), this.handle.querySelector(".ew-bh-add").addEventListener("mousedown", (r) => r.preventDefault()), this.handle.querySelector(".ew-bh-add").addEventListener("click", (r) => {
      r.preventDefault(), this.hovered && this.deps.onInsertAfter(this.hovered);
    }), this.handle.querySelector(".ew-bh-drag").addEventListener("pointerdown", (r) => this.dragStart(r)), e.addEventListener("mousemove", this.onRootMove), e.addEventListener("scroll", this.onRootScroll, { passive: !0 }), t.addEventListener("mouseleave", this.onRootLeave), this.handle.addEventListener("mouseenter", () => {
      this.raf && (cancelAnimationFrame(this.raf), this.raf = 0);
    });
  }
  handle;
  line;
  hovered = null;
  dragging = null;
  ghost = null;
  dropBefore = null;
  raf = 0;
  enabled = !0;
  onRootMove = (e) => this.trackHover(e);
  onRootLeave = () => {
    this.dragging || this.hide();
  };
  // Inner scroll (fill layout) moves blocks under the host-anchored handle —
  // a stale handle acts on the WRONG block. Hide; the next hover re-arms.
  onRootScroll = () => {
    this.dragging || this.hide();
  };
  onDocPointerMove = (e) => this.dragMove(e);
  onDocPointerUp = (e) => this.dragEnd(e);
  /** Read-only support: disabling hides the gutter and inert-s hover + drag. */
  setEnabled(e) {
    this.enabled = e, e || (this.hide(), this.dragging && this.dragEnd(new PointerEvent("pointerup")));
  }
  // ── Hover tracking ─────────────────────────────────────────────────────────
  trackHover(e) {
    this.enabled && (this.dragging || this.raf || (this.raf = requestAnimationFrame(() => {
      if (this.raf = 0, !this.enabled) return;
      const t = this.blockFrom(e.target);
      t && t !== this.hovered && (this.hovered = t, this.position(t));
    })));
  }
  blockFrom(e) {
    let t = e;
    for (; t && t.parentNode !== this.root; ) t = t.parentNode;
    return t && t.nodeType === 1 && t.parentNode === this.root ? t : null;
  }
  position(e) {
    const t = e.getBoundingClientRect(), u = this.host.getBoundingClientRect();
    this.handle.style.display = "flex";
    const i = t.top - u.top + Math.max(0, (es(e) - 22) / 2);
    this.handle.style.top = `${Math.round(i)}px`;
    const r = t.left - u.left - this.handle.offsetWidth - 2;
    this.handle.style.left = `${Math.round(Math.max(0, r))}px`;
  }
  hide() {
    this.raf && (cancelAnimationFrame(this.raf), this.raf = 0), this.handle.style.display = "none", this.hovered = null;
  }
  // ── Drag ─────────────────────────────────────────────────────────────────
  dragStart(e) {
    if (!this.enabled || !this.hovered) return;
    e.preventDefault(), this.dragging = this.hovered, this.moved = !1, this.startX = e.clientX, this.startY = e.clientY, this.dragging.classList.add("ew-block-dragging"), document.body.classList.add("ew-dragging-active");
    const t = this.dragging.getBoundingClientRect();
    this.ghost = this.dragging.cloneNode(!0), this.ghost.className = "ew-drag-ghost ew-content", this.ghost.style.width = `${t.width}px`, this.ghost.style.left = `${t.left}px`, this.ghost.style.top = `${t.top}px`, this.ghost.style.display = "none", document.body.appendChild(this.ghost), this.ghostOffsetY = e.clientY - t.top, document.addEventListener("pointermove", this.onDocPointerMove), document.addEventListener("pointerup", this.onDocPointerUp);
  }
  ghostOffsetY = 0;
  moved = !1;
  startX = 0;
  startY = 0;
  dragMove(e) {
    if (!this.dragging || (e.preventDefault(), !this.moved && Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 4))
      return;
    this.moved = !0, this.ghost && (this.ghost.style.display = "", this.ghost.style.top = `${e.clientY - this.ghostOffsetY}px`);
    const t = e.clientY, u = Array.from(this.root.children).filter((r) => r !== this.dragging);
    let i = null;
    for (const r of u) {
      const a = r.getBoundingClientRect();
      if (t < a.top + a.height / 2) {
        i = r;
        break;
      }
    }
    this.dropBefore = i, this.showLine(i);
  }
  showLine(e) {
    const t = this.host.getBoundingClientRect(), u = this.root.getBoundingClientRect();
    let i;
    if (e)
      i = e.getBoundingClientRect().top - t.top;
    else {
      const r = this.root.lastElementChild;
      i = r ? r.getBoundingClientRect().bottom - t.top : 0;
    }
    this.line.style.display = "block", this.line.style.top = `${Math.round(i) - 1}px`, this.line.style.left = `${Math.round(u.left - t.left)}px`, this.line.style.width = `${Math.round(u.width)}px`;
  }
  dragEnd(e) {
    document.removeEventListener("pointermove", this.onDocPointerMove), document.removeEventListener("pointerup", this.onDocPointerUp);
    const t = this.dragging;
    if (this.line.style.display = "none", document.body.classList.remove("ew-dragging-active"), this.ghost?.remove(), this.ghost = null, t) {
      if (t.classList.remove("ew-block-dragging"), !this.moved) {
        this.dragging = null, this.dropBefore = null, this.deps.onMenu(t, this.handle);
        return;
      }
      const u = this.dropBefore;
      u !== t && (u ? this.root.insertBefore(t, u) : this.root.appendChild(t), this.deps.onChange());
    }
    this.dragging = null, this.dropBefore = null, this.hide();
  }
  destroy() {
    this.root.removeEventListener("mousemove", this.onRootMove), this.root.removeEventListener("scroll", this.onRootScroll), this.host.removeEventListener("mouseleave", this.onRootLeave), document.removeEventListener("pointermove", this.onDocPointerMove), document.removeEventListener("pointerup", this.onDocPointerUp), this.handle.remove(), this.line.remove(), this.ghost?.remove(), this.raf && cancelAnimationFrame(this.raf);
  }
}
function es(n) {
  const e = getComputedStyle(n), t = parseFloat(e.lineHeight);
  return Number.isFinite(t) ? t : parseFloat(e.fontSize) * 1.5;
}
const ts = 120;
class ns {
  constructor(e, t, u) {
    this.root = e, this.host = t, this.deps = u;
    const i = (r, a, s) => {
      const o = document.createElement("button");
      return o.type = "button", o.className = `ew-table-handle ${r}`, o.textContent = a, o.title = s, o.setAttribute("aria-label", s), o.setAttribute("contenteditable", "false"), o.style.display = "none", o.addEventListener("mousedown", (c) => c.preventDefault()), o.addEventListener("mouseenter", () => this.cancelHide()), t.appendChild(o), o;
    };
    this.colHandle = i("ew-th-col", "⋯", "Column options"), this.rowHandle = i("ew-th-row", "⋮", "Row options"), this.addCol = i("ew-th-addcol", "+", "Add column"), this.addRow = i("ew-th-addrow", "+", "Add row"), this.colHandle.addEventListener("click", (r) => {
      r.preventDefault(), this.openColumnMenu();
    }), this.rowHandle.addEventListener("click", (r) => {
      r.preventDefault(), this.openRowMenu();
    }), this.addCol.addEventListener("click", (r) => {
      r.preventDefault();
      const a = this.table;
      if (!a) return;
      const s = a.querySelector("tr")?.children.length ?? 0;
      this.deps.commit(() => gt(a, s - 1, "right")), this.reposition();
    }), this.addRow.addEventListener("click", (r) => {
      r.preventDefault();
      const a = this.table;
      a && (this.deps.commit(() => {
        const s = a.querySelectorAll("tr");
        xt(a, s[s.length - 1], "below");
      }), this.reposition());
    }), e.addEventListener("mousemove", this.onRootMove), e.addEventListener("mouseleave", this.onRootLeave), e.addEventListener("scroll", this.onRootScroll, { passive: !0 });
  }
  colHandle;
  rowHandle;
  addCol;
  addRow;
  table = null;
  colIndex = 0;
  row = null;
  enabled = !0;
  menuOpen = !1;
  hideTimer = null;
  raf = 0;
  onRootMove = (e) => this.trackHover(e);
  onRootLeave = () => this.scheduleHide();
  // Inner scroll (fill layout) moves the table under the host-anchored pills —
  // stale pills float over the wrong cells (or the docked toolbar). Hide now.
  onRootScroll = () => {
    this.cancelHide(), this.hide();
  };
  setEnabled(e) {
    this.enabled = e, e || this.hide();
  }
  destroy() {
    this.root.removeEventListener("mousemove", this.onRootMove), this.root.removeEventListener("mouseleave", this.onRootLeave), this.root.removeEventListener("scroll", this.onRootScroll), this.raf && cancelAnimationFrame(this.raf), this.hideTimer && clearTimeout(this.hideTimer), this.colHandle.remove(), this.rowHandle.remove(), this.addCol.remove(), this.addRow.remove();
  }
  // ── Hover tracking ─────────────────────────────────────────────────────────
  trackHover(e) {
    if (!this.enabled || this.menuOpen || this.raf) return;
    const t = e.target;
    this.raf = requestAnimationFrame(() => {
      if (this.raf = 0, !this.enabled) return;
      const u = t?.closest?.("td, th"), i = u?.closest("table");
      if (!u || !i || !this.root.contains(i)) {
        this.scheduleHide();
        return;
      }
      this.cancelHide(), this.table = i, this.row = u.closest("tr"), this.colIndex = Array.from(u.parentElement?.children ?? []).indexOf(u), this.reposition();
    });
  }
  reposition() {
    const e = this.table, t = this.row;
    if (!e || !t) return;
    const u = this.host.getBoundingClientRect(), i = e.getBoundingClientRect(), a = e.querySelector("tr")?.children[this.colIndex];
    if (a) {
      const o = a.getBoundingClientRect();
      this.colHandle.style.display = "flex", this.colHandle.style.left = `${Math.round(o.left - u.left + o.width / 2 - 14)}px`, this.colHandle.style.top = `${Math.round(i.top - u.top - 9)}px`;
    }
    const s = t.getBoundingClientRect();
    this.rowHandle.style.display = "flex", this.rowHandle.style.left = `${Math.round(i.left - u.left - 9)}px`, this.rowHandle.style.top = `${Math.round(s.top - u.top + s.height / 2 - 14)}px`, this.addCol.style.display = "flex", this.addCol.style.left = `${Math.round(i.right - u.left - 4)}px`, this.addCol.style.top = `${Math.round(i.top - u.top + i.height / 2 - 14)}px`, this.addRow.style.display = "flex", this.addRow.style.left = `${Math.round(i.left - u.left + i.width / 2 - 14)}px`, this.addRow.style.top = `${Math.round(i.bottom - u.top - 4)}px`;
  }
  scheduleHide() {
    this.menuOpen || (this.cancelHide(), this.hideTimer = setTimeout(() => this.hide(), ts));
  }
  cancelHide() {
    this.hideTimer && (clearTimeout(this.hideTimer), this.hideTimer = null);
  }
  hide() {
    this.raf && (cancelAnimationFrame(this.raf), this.raf = 0), this.colHandle.style.display = "none", this.rowHandle.style.display = "none", this.addCol.style.display = "none", this.addRow.style.display = "none";
  }
  // ── Menus ──────────────────────────────────────────────────────────────────
  openColumnMenu() {
    const e = this.table;
    if (!e) return;
    const t = this.colIndex, u = e.querySelector("tr")?.children.length ?? 0;
    this.menuOpen = !0, this.deps.ui.menu({
      anchor: this.colHandle,
      onClose: () => {
        this.menuOpen = !1, this.scheduleHide();
      },
      items: [
        { id: "col-insert-left", title: "Insert left", action: () => this.deps.commit(() => gt(e, t, "left")) },
        { id: "col-insert-right", title: "Insert right", action: () => this.deps.commit(() => gt(e, t, "right")) },
        { id: "col-move-left", title: "Move left", disabled: t === 0, action: () => this.deps.commit(() => In(e, t, -1)) },
        { id: "col-move-right", title: "Move right", disabled: t >= u - 1, action: () => this.deps.commit(() => In(e, t, 1)) },
        { id: "col-clear", title: "Clear contents", action: () => this.deps.commit(() => rs(e, t)) },
        {
          id: "col-delete",
          title: "Delete column",
          danger: !0,
          disabled: u <= 1,
          action: () => this.deps.commit(() => is(e, t))
        }
      ]
    });
  }
  openRowMenu() {
    const e = this.table, t = this.row;
    if (!e || !t) return;
    const u = _e(t);
    this.menuOpen = !0, this.deps.ui.menu({
      anchor: this.rowHandle,
      onClose: () => {
        this.menuOpen = !1, this.scheduleHide();
      },
      items: [
        {
          id: "row-insert-above",
          title: "Insert above",
          disabled: u,
          action: () => this.deps.commit(() => xt(e, t, "above"))
        },
        { id: "row-insert-below", title: "Insert below", action: () => this.deps.commit(() => xt(e, t, "below")) },
        {
          id: "row-move-up",
          title: "Move up",
          disabled: u || us(t),
          action: () => this.deps.commit(() => $n(t, -1))
        },
        {
          id: "row-move-down",
          title: "Move down",
          disabled: u || !t.nextElementSibling,
          action: () => this.deps.commit(() => $n(t, 1))
        },
        { id: "row-clear", title: "Clear contents", action: () => this.deps.commit(() => ss(t)) },
        {
          id: "row-delete",
          title: u ? "Delete row (header is required)" : "Delete row",
          danger: !0,
          disabled: u,
          action: () => this.deps.commit(() => as(e, t))
        }
      ]
    });
  }
}
function _e(n) {
  return !!n.closest("thead") || n.querySelector("th") != null;
}
function us(n) {
  return !n.previousElementSibling;
}
function Uu(n) {
  const e = document.createElement(n);
  return e.appendChild(document.createElement("br")), e;
}
function gt(n, e, t) {
  const u = t === "left" ? e : e + 1;
  let i = null;
  n.querySelectorAll("tr").forEach((r) => {
    const a = _e(r), s = Uu(a ? "th" : "td"), o = r.children[u];
    o ? r.insertBefore(s, o) : r.appendChild(s), i || (i = s);
  }), i && _(i);
}
function is(n, e) {
  const t = n.querySelector("tr")?.children.length ?? 0;
  if (t <= 1) return;
  n.querySelectorAll("tr").forEach((i) => i.children[e]?.remove());
  const u = n.querySelector("tr")?.children[Math.min(e, t - 2)];
  u && _(u);
}
function In(n, e, t) {
  const u = n.querySelector("tr")?.children.length ?? 0, i = e + t;
  if (i < 0 || i >= u) return;
  n.querySelectorAll("tr").forEach((a) => {
    const s = a.children[e], o = a.children[i];
    !s || !o || (t === -1 ? a.insertBefore(s, o) : a.insertBefore(s, o.nextSibling));
  });
  const r = n.querySelector("tr")?.children[i];
  r && _(r);
}
function rs(n, e) {
  n.querySelectorAll("tr").forEach((u) => {
    const i = u.children[e];
    i && (i.textContent = "", i.appendChild(document.createElement("br")));
  });
  const t = n.querySelector("tr")?.children[e];
  t && _(t);
}
function xt(n, e, t) {
  const u = n.querySelector("tr")?.children.length ?? 1, i = document.createElement("tr");
  for (let r = 0; r < u; r++) i.appendChild(Uu("td"));
  _e(e) ? (n.querySelector("tbody") ?? n.appendChild(document.createElement("tbody"))).prepend(i) : t === "above" ? e.before(i) : e.after(i), _(i.firstElementChild);
}
function as(n, e) {
  if (_e(e)) return;
  const t = (e.nextElementSibling ?? e.previousElementSibling ?? n.querySelector("tr"))?.querySelector("td, th");
  e.remove(), t && _(t);
}
function $n(n, e) {
  if (!_e(n)) {
    if (e === -1) {
      const t = n.previousElementSibling;
      if (!t || _e(t)) return;
      t.before(n);
    } else {
      const t = n.nextElementSibling;
      if (!t) return;
      t.after(n);
    }
    _(n.firstElementChild);
  }
}
function ss(n) {
  Array.from(n.children).forEach((e) => {
    e.textContent = "", e.appendChild(document.createElement("br"));
  }), _(n.firstElementChild);
}
const an = {
  parse: Qt,
  serialize: Nu,
  sanitize: Kt
};
function os(n) {
  const e = n.trim();
  return /^https?:\/\/\S+$/i.test(e) ? e : null;
}
function qn(n, e, t = an) {
  const u = O();
  if (!u || u.isCollapsed || !n.clipboardData) return !1;
  const i = u.getRangeAt(0), r = document.createElement("div");
  r.appendChild(i.cloneContents());
  const a = t.serialize(r.innerHTML), s = t.parse(a, { decorateTasks: !1 });
  return n.clipboardData.setData("text/plain", a), n.clipboardData.setData("text/html", s), n.preventDefault(), e && i.deleteContents(), !0;
}
function cs(n, e, t = an) {
  if (!e.clipboardData) return !1;
  const u = e.clipboardData.getData("text/html"), i = e.clipboardData.getData("text/plain");
  e.preventDefault();
  const r = O(), a = os(i);
  if (a && r && !r.isCollapsed && (!u || !u.trim()))
    return document.execCommand("createLink", !1, a), !0;
  let s;
  return u && u.trim() ? s = t.serialize(t.sanitize(u)) : s = i, s && Mt(n, s, t), !0;
}
function Mt(n, e, t = an) {
  const u = document.createElement("div");
  u.innerHTML = t.parse(e);
  const i = Array.from(u.children);
  if (i.length === 0) {
    Dn(Array.from(u.childNodes));
    return;
  }
  if (i.length === 1 && i[0].tagName === "P") {
    Dn(Array.from(i[0].childNodes));
    return;
  }
  ls(n, i);
}
function Dn(n) {
  const e = H();
  if (!e) return;
  e.deleteContents();
  const t = document.createDocumentFragment();
  n.forEach((i) => t.appendChild(i.cloneNode(!0)));
  const u = t.lastChild;
  e.insertNode(t), u && He(u);
}
function ls(n, e) {
  const t = D(n), u = e.map((o) => o.cloneNode(!0));
  if (!t) {
    u.forEach((o) => n.appendChild(o)), u.length && J(u[u.length - 1]);
    return;
  }
  const i = H();
  let r = null, a = (t.textContent ?? "").trim() === "";
  if (i) {
    const o = document.createRange();
    o.setStart(i.endContainer, i.endOffset), o.setEnd(t, t.childNodes.length), r = o.extractContents(), a = (t.textContent ?? "").trim() === "";
  }
  let s = t;
  for (const o of u)
    s.after(o), s = o;
  if (r && (r.textContent ?? "").trim() !== "") {
    const o = document.createElement("p");
    o.appendChild(r), s.after(o);
  }
  a && t.remove(), J(s);
}
function kt(n) {
  return /^image\//.test(n.type);
}
const ds = 5 * 1024 * 1024, wt = 2048;
async function fs(n) {
  if (n.size > ds)
    throw new Error(
      `"${n.name}" is ${(n.size / 1024 / 1024).toFixed(1)} MB — too large to embed as a data URL. Configure \`uploadImage\` to store images externally (see docs/IMAGE_HOSTING.md).`
    );
  const e = await hs(n);
  return { src: await ps(e, n.type).catch(() => null) ?? e };
}
function hs(n) {
  return new Promise((e, t) => {
    const u = new FileReader();
    u.onload = () => e(String(u.result)), u.onerror = () => t(u.error ?? new Error("could not read file")), u.readAsDataURL(n);
  });
}
async function ps(n, e) {
  if (!/^image\/(png|jpeg|webp)$/.test(e) || typeof document > "u") return null;
  const t = document.createElement("canvas");
  try {
    if (typeof t.getContext != "function" || !t.getContext("2d")) return null;
  } catch {
    return null;
  }
  const u = await new Promise((a, s) => {
    const o = new Image();
    o.onload = () => a(o), o.onerror = () => s(new Error("could not decode image")), o.src = n;
  });
  if (u.width <= wt && u.height <= wt) return null;
  const i = wt / Math.max(u.width, u.height), r = document.createElement("canvas");
  return r.width = Math.round(u.width * i), r.height = Math.round(u.height * i), r.getContext("2d").drawImage(u, 0, 0, r.width, r.height), r.toDataURL(e, 0.85);
}
const ms = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function bs(n) {
  try {
    if (typeof URL < "u" && typeof URL.createObjectURL == "function")
      return URL.createObjectURL(n);
  } catch {
  }
  return ms;
}
function gs(n) {
  if (n && n.startsWith("blob:"))
    try {
      URL.revokeObjectURL(n);
    } catch {
    }
}
function xs(n) {
  return (n.name || "image").replace(/\.[a-z0-9]+$/i, "");
}
const ct = "​", Fu = /* @__PURE__ */ new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "BLOCKQUOTE",
  "PRE",
  "HR",
  "TABLE",
  "FIGURE"
]), ks = "<p><br></p>";
function fe(n) {
  return (n.textContent ?? "").split(ct).join("");
}
function yt(n, e) {
  let t = n;
  for (; t && t !== e; ) {
    if (t.hasAttribute("data-widget") || t.hasAttribute("data-math") || t.getAttribute("contenteditable") === "false")
      return !0;
    t = t.parentElement;
  }
  return !1;
}
function Bn(n) {
  return n.nodeType === Node.TEXT_NODE ? !0 : n.nodeType !== Node.ELEMENT_NODE ? !1 : !Fu.has(n.tagName) && n.tagName !== "DIV" && n.tagName !== "LI";
}
function Ke(n) {
  Array.from(n.childNodes).some(
    (t) => t.nodeType === Node.ELEMENT_NODE || t.nodeType === Node.TEXT_NODE && t.data.split(ct).join("").length > 0
  ) || (n.textContent = "", n.appendChild(document.createElement("br")));
}
function Mn(n) {
  n.querySelectorAll("span[style], font").forEach((t) => {
    if (yt(t, n)) return;
    const u = t.parentNode;
    if (u) {
      for (; t.firstChild; ) u.insertBefore(t.firstChild, t);
      u.removeChild(t);
    }
  }), n.querySelectorAll("[style]").forEach((t) => {
    yt(t, n) || t.removeAttribute("style");
  });
  let e = n.firstChild;
  for (; e; ) {
    const t = e.nextSibling;
    if (e.nodeType === Node.TEXT_NODE && fe(e).trim() === "") {
      n.removeChild(e), e = t;
      continue;
    }
    if (Bn(e)) {
      const u = document.createElement("p");
      n.insertBefore(u, e);
      let i = e;
      for (; i && Bn(i); ) {
        const r = i.nextSibling;
        u.appendChild(i), i = r;
      }
      e = u.nextSibling;
      continue;
    }
    if (e.nodeType === Node.ELEMENT_NODE) {
      const u = e;
      if (u.tagName === "DIV") {
        if (Array.from(u.children).some((a) => Fu.has(a.tagName) || a.tagName === "DIV")) {
          const a = u.firstChild;
          for (; u.firstChild; ) n.insertBefore(u.firstChild, u);
          u.remove(), e = a ?? t;
          continue;
        }
        const r = document.createElement("p");
        for (; u.firstChild; ) r.appendChild(u.firstChild);
        u.replaceWith(r), e = t;
        continue;
      }
    }
    e = t;
  }
  n.querySelectorAll(
    "p p, p h1, p h2, p h3, p h4, p h5, p h6, h1 p, h2 p, h3 p, h4 p, h5 p, h6 p"
  ).forEach((t) => {
    if (yt(t, n)) return;
    const u = t.parentNode;
    if (u) {
      for (; t.firstChild; ) u.insertBefore(t.firstChild, t);
      u.removeChild(t);
    }
  });
  for (const t of Array.from(n.children))
    switch (t.tagName) {
      case "UL":
      case "OL": {
        if (!t.querySelector("li")) {
          t.remove();
          break;
        }
        t.querySelectorAll("li").forEach((u) => ys(u));
        break;
      }
      case "PRE": {
        let u = t.querySelector(":scope > code");
        if (!u) {
          for (u = document.createElement("code"); t.firstChild; ) u.appendChild(t.firstChild);
          t.appendChild(u);
        }
        fe(u) === "" && !u.firstChild && u.appendChild(document.createTextNode(ct));
        break;
      }
      case "HR":
        break;
      case "BLOCKQUOTE": {
        t.querySelectorAll(":scope > p").forEach((u) => Ke(u)), Ke(t);
        break;
      }
      case "TABLE": {
        t.querySelectorAll("td, th").forEach((u) => {
          u.firstChild || u.appendChild(document.createElement("br"));
        });
        break;
      }
      case "FIGURE":
        t.setAttribute("contenteditable", "false");
        break;
      default:
        Ke(t);
    }
  return n.children.length === 0 ? (n.innerHTML = ks, !0) : !1;
}
function ws(n) {
  return fe(n).trim() !== "" ? !1 : !n.querySelector("img,hr,input,table,pre,figure");
}
function ys(n) {
  const e = n.querySelector(':scope > input[type="checkbox"]');
  if (e) {
    n.firstChild !== e && n.prepend(e), (!e.nextSibling || e.nextSibling.nodeType !== Node.TEXT_NODE) && e.after(document.createTextNode(ct)), n.classList.add("task-list-item"), n.hasAttribute("data-task") || n.setAttribute("data-task", e.checked ? "done" : "todo");
    return;
  }
  !!n.querySelector(":scope > ul, :scope > ol") || Ke(n);
}
const vt = "<p><br></p>", vs = 300;
function On(n) {
  return n === void 0 || n === !0 ? { mode: "floating" } : n === !1 ? { mode: "none" } : typeof n == "string" ? { mode: n } : { mode: n.mode, items: n.items };
}
const Es = "​";
class co {
  host;
  content;
  opts;
  toolbarCfg;
  registry;
  pipeline;
  uploader;
  rules;
  ctx;
  ui;
  toolbar = null;
  fixedToolbar = null;
  slash = null;
  blockHandles = null;
  tableControls = null;
  pluginCleanups = [];
  listeners = {
    change: /* @__PURE__ */ new Set(),
    selection: /* @__PURE__ */ new Set(),
    focus: /* @__PURE__ */ new Set(),
    blur: /* @__PURE__ */ new Set(),
    submit: /* @__PURE__ */ new Set()
  };
  changeTimer = null;
  applying = !1;
  destroyed = !1;
  transactionDepth = 0;
  // Undo/redo: a stack of Markdown snapshots.
  history = [];
  historyIndex = -1;
  restoring = !1;
  onInput = (e) => this.handleInput(e);
  onBeforeInput = (e) => this.handleBeforeInput(e);
  onCompositionEnd = () => {
    this.opts.readOnly || this.handleInput();
  };
  // isComposing: during IME composition, keys belong to the IME (Firefox and
  // Safari deliver the REAL key with isComposing=true; Chrome masks it as
  // "Process"). Dispatching would let Enter/Backspace mutate the document
  // under an active composition — the same contract input rules follow.
  onKeyDown = (e) => {
    !this.opts.readOnly && !e.isComposing && this.handleKey(e);
  };
  onSelectionChange = () => this.handleSelectionChange();
  onFocus = () => this.emit("focus");
  onBlur = () => {
    this.slash?.close(), this.toolbar?.hide(), this.emit("blur");
  };
  // Inner scroll (the content is its own scroller in fill layout) moves the
  // text out from under position-anchored UI; the page never fires this.
  onContentScroll = () => {
    this.slash?.close(), this.toolbar?.hide();
  };
  onClick = (e) => this.handleClick(e);
  onCopy = (e) => {
    qn(e, !1, this.pipeline);
  };
  onCut = (e) => {
    if (this.opts.readOnly) {
      e.preventDefault();
      return;
    }
    qn(e, !0, this.pipeline) && (ws(this.content) && (this.content.innerHTML = vt, _(this.content.firstElementChild)), this.afterMutation());
  };
  onPaste = (e) => {
    if (this.opts.readOnly) {
      e.preventDefault();
      return;
    }
    const t = Array.from(e.clipboardData?.files ?? []).filter(kt);
    if (t.length) {
      e.preventDefault(), this.insertImages(t);
      return;
    }
    cs(this.content, e, this.pipeline) && this.afterMutation();
  };
  onDragOver = (e) => {
    this.opts.readOnly || !e.dataTransfer || Array.from(e.dataTransfer.types).includes("Files") && (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
  };
  onDrop = (e) => {
    if (this.opts.readOnly) return;
    const t = Array.from(e.dataTransfer?.files ?? []).filter(kt);
    t.length && (e.preventDefault(), this.placeCaretAtPoint(e.clientX, e.clientY), this.insertImages(t));
  };
  constructor(e, t = {}) {
    this.host = e, this.opts = {
      placeholder: t.placeholder ?? "Write something, or type “/” for commands…",
      slashMenu: t.slashMenu ?? !0,
      spellcheck: t.spellcheck ?? !0,
      readOnly: t.readOnly ?? !1,
      submitOn: t.submitOn ?? !1
    }, this.toolbarCfg = On(t.toolbar), this.uploader = t.uploadImage, this.registry = rn([ot(), ...t.plugins ?? []], t.exclude);
    const u = Zt(this.registry.markedExtensions, this.registry.sanitize), i = Tu(this.registry.turndownExtensions);
    this.pipeline = {
      parse: u,
      serialize: i,
      sanitize: (r) => Kt(r, this.registry.sanitize)
    }, this.rules = {
      block: this.registry.blockRules,
      inline: this.registry.inlineRules
    }, e.classList.add("ew"), e.classList.toggle("ew--fill", (t.layout ?? "page") === "fill"), t.className && e.classList.add(...t.className.split(/\s+/).filter(Boolean)), this.content = document.createElement("div"), this.content.className = "ew-content", this.content.setAttribute("contenteditable", this.opts.readOnly ? "false" : "true"), this.content.spellcheck = this.opts.spellcheck, this.content.setAttribute("role", "textbox"), this.content.setAttribute("aria-multiline", "true"), t.ariaLabel && this.content.setAttribute("aria-label", t.ariaLabel), this.content.dataset.placeholder = this.opts.placeholder, e.appendChild(this.content), this.ui = new ka(this.content), this.ctx = this.buildContext(), this.setMarkdown(t.value ?? "", { silent: !0 }), this.seedHistory(), t.onChange && this.on("change", t.onChange), t.onSubmit && this.on("submit", () => t.onSubmit(this)), this.buildToolbar(), this.opts.slashMenu && (this.slash = new Ya(this.content, this.registry.slashItems, this.ctx)), this.blockHandles = new Ja(this.content, this.host, {
      onChange: () => this.afterMutation(),
      onInsertAfter: (r) => this.insertParagraphAfter(r),
      onMenu: (r, a) => this.openBlockMenu(r, a)
    }), this.blockHandles.setEnabled(!this.opts.readOnly), this.tableControls = new ns(this.content, this.host, {
      commit: (r) => {
        this.transact(r), this.focus();
      },
      ui: this.ui
    }), this.tableControls.setEnabled(!this.opts.readOnly), this.content.addEventListener("beforeinput", this.onBeforeInput), this.content.addEventListener("scroll", this.onContentScroll, { passive: !0 }), this.content.addEventListener("input", this.onInput), this.content.addEventListener("compositionend", this.onCompositionEnd), this.content.addEventListener("keydown", this.onKeyDown), this.content.addEventListener("focus", this.onFocus), this.content.addEventListener("blur", this.onBlur), this.content.addEventListener("copy", this.onCopy), this.content.addEventListener("cut", this.onCut), this.content.addEventListener("paste", this.onPaste), this.content.addEventListener("dragover", this.onDragOver), this.content.addEventListener("drop", this.onDrop), document.addEventListener("selectionchange", this.onSelectionChange), this.content.addEventListener("click", this.onClick), this.runPluginSetups(), t.autofocus && !this.opts.readOnly && this.focus();
  }
  // ── Public API ───────────────────────────────────────────────────────────
  getMarkdown() {
    return this.pipeline.serialize(this.content.innerHTML);
  }
  setMarkdown(e, t = {}) {
    const u = this.pipeline.parse(e ?? "");
    this.content.innerHTML = u.trim() || vt, Mn(this.content), this.updatePlaceholder(), t.silent || (this.recordHistory(), this.scheduleChange());
  }
  getHTML() {
    return this.content.innerHTML;
  }
  isEmpty() {
    return fe(this.content).trim() === "" && !this.content.querySelector("img,hr,input,pre");
  }
  focus() {
    this.content.focus();
  }
  blur() {
    this.content.blur();
  }
  /** Execute a registered command. Returns false when unregistered/refused. */
  exec(e, ...t) {
    if (this.opts.readOnly) return !1;
    const u = this.registry.commands.get(e);
    return u ? (this.content.focus(), this.transact(
      () => V(u.plugin, `command "${e}"`, () => u.spec.run(this.ctx, t[0]))
    ) !== !1) : (console.warn(`[edodo-write] unknown command "${e}"`), !1);
  }
  /**
   * Insert text at the caret as ONE undo step + ONE change event. Caret-safe
   * and non-destructive: with the caret inside the editor the text lands at the
   * caret; with the caret elsewhere (a dictation button, a placeholder sidebar)
   * the editor is focused and the text is appended as a NEW paragraph — never
   * fused onto the prior line. The text is treated as Markdown. Returns false
   * when read-only or given empty text.
   */
  insertText(e) {
    if (this.opts.readOnly || this.destroyed || !e) return !1;
    const t = je(this.content), u = t ? H()?.cloneRange() ?? null : null;
    return this.transact(() => {
      if (this.content.focus(), t && u) {
        const i = O();
        i?.removeAllRanges(), i?.addRange(u);
      } else {
        const i = X("p", {}, "<br>");
        this.content.appendChild(i), _(i);
      }
      return Mt(this.content, e, this.pipeline), !0;
    });
  }
  /**
   * Insert image files (from paste, drop, or a file picker) at the caret.
   * Each file shows a pending placeholder immediately, then the configured
   * `uploadImage` (or the data-URL fallback) resolves its final `src`.
   * Deleting a placeholder while its upload is in flight cancels that image.
   * Resolves when every upload has settled. Non-image files are ignored.
   */
  async insertImages(e, t = {}) {
    if (this.opts.readOnly || this.destroyed) return;
    const u = Array.from(e).filter(kt);
    if (!u.length) return;
    let i = this.uploader;
    i || (i = (a) => fs(a), this.warnedFallbackUpload || (this.warnedFallbackUpload = !0, console.info(
      "[edodo-write] no uploadImage configured — images are embedded as data: URLs in the Markdown. Fine for small documents; see docs/IMAGE_HOSTING.md for real hosting."
    )));
    const r = u.map((a) => ({ file: a, placeholder: this.insertPendingImage(a, t.alt) }));
    this.afterMutation(), await Promise.all(r.map(async ({ file: a, placeholder: s }) => {
      const o = s.getAttribute("src");
      try {
        const c = await i(a, this), d = typeof c == "string" ? { src: c } : c;
        if (!d?.src) throw new Error("uploadImage resolved without a src");
        if (this.destroyed || !s.isConnected) return;
        s.setAttribute("src", d.src), d.alt && s.setAttribute("alt", d.alt), s.removeAttribute("data-uploading");
      } catch (c) {
        if (console.error("[edodo-write] image upload failed:", c), !this.destroyed && s.isConnected) {
          const d = s.closest("p");
          s.remove(), d && fe(d).trim() === "" && !d.querySelector("img,input") && d.remove(), this.ui.notify("Image upload failed");
        }
      } finally {
        gs(o), this.destroyed || this.afterMutation();
      }
    }));
  }
  warnedFallbackUpload = !1;
  /** A pending image: rendered immediately, excluded from the Markdown until
   *  its upload resolves (see the `data-uploading` turndown rule). */
  insertPendingImage(e, t) {
    const u = X("img", {
      src: bs(e),
      alt: t ?? xs(e),
      "data-uploading": ""
    }), i = document.createElement("p");
    i.appendChild(u);
    const r = X("p", {}, "<br>"), a = D(this.content) || this.content.lastElementChild;
    return a ? (a.after(i), i.after(r), a.tagName === "P" && fe(a).trim() === "" && !a.querySelector("img,input,hr") && a.remove()) : this.content.append(i, r), _(r), u;
  }
  placeCaretAtPoint(e, t) {
    const u = document;
    let i = null;
    if (typeof u.caretRangeFromPoint == "function")
      i = u.caretRangeFromPoint(e, t);
    else if (typeof u.caretPositionFromPoint == "function") {
      const r = u.caretPositionFromPoint(e, t);
      r && (i = document.createRange(), i.setStart(r.offsetNode, r.offset), i.collapse(!0));
    }
    if (i && (this.content.contains(i.startContainer) || i.startContainer === this.content)) {
      const r = O();
      r && (r.removeAllRanges(), r.addRange(i));
    }
  }
  /** Batch DOM mutations into ONE undo step + ONE change event. Re-entrant. */
  transact(e) {
    this.transactionDepth += 1;
    try {
      return e();
    } finally {
      this.transactionDepth -= 1, this.transactionDepth === 0 && this.afterMutation();
    }
  }
  undo() {
    this.flushPendingHistory(), !(this.historyIndex <= 0) && (this.historyIndex -= 1, this.restore(this.history[this.historyIndex]));
  }
  redo() {
    this.historyIndex >= this.history.length - 1 || (this.historyIndex += 1, this.restore(this.history[this.historyIndex]));
  }
  setReadOnly(e) {
    this.opts.readOnly = e, this.content.setAttribute("contenteditable", e ? "false" : "true"), this.blockHandles?.setEnabled(!e), this.tableControls?.setEnabled(!e), this.fixedToolbar?.setEnabled(!e), e && (this.toolbar?.hide(), this.slash?.close(), this.ui.closeAll());
  }
  /** Build the configured toolbar(s); destroys whatever was there before. */
  buildToolbar() {
    this.toolbar?.destroy(), this.toolbar = null, this.fixedToolbar?.destroy(), this.fixedToolbar = null;
    const e = this.toolbarCfg;
    if (e.mode === "none") return;
    const t = e.items ? e.items.map((u) => this.registry.toolbarItems.find((i) => i.id === u)).filter((u) => !!u) : this.registry.toolbarItems;
    e.mode === "floating" ? this.toolbar = new Za(t, this.ctx) : (this.fixedToolbar = new Qa(t, this.ctx, this.host, this.content), this.fixedToolbar.setEnabled(!this.opts.readOnly), this.fixedToolbar.update(this.buildSelectionInfo()));
  }
  /** Switch the toolbar mode / button set at runtime. */
  setToolbar(e) {
    this.destroyed || (this.toolbarCfg = On(e), this.buildToolbar(), this.handleSelectionChange());
  }
  /** Switch between the document ("page") and embedded ("fill") layouts. */
  setLayout(e) {
    this.destroyed || this.host.classList.toggle("ew--fill", e === "fill");
  }
  on(e, t) {
    return this.listeners[e].add(t), () => this.off(e, t);
  }
  off(e, t) {
    this.listeners[e].delete(t);
  }
  destroy() {
    if (!this.destroyed) {
      this.destroyed = !0;
      for (const e of this.pluginCleanups)
        try {
          e();
        } catch (t) {
          console.error("[edodo-write] plugin cleanup failed:", t);
        }
      for (const e of this.registry.plugins)
        e.on?.destroy && V(e.name, "on.destroy", () => e.on.destroy(this.ctx));
      this.content.removeEventListener("beforeinput", this.onBeforeInput), this.content.removeEventListener("scroll", this.onContentScroll), this.content.removeEventListener("input", this.onInput), this.content.removeEventListener("compositionend", this.onCompositionEnd), this.content.removeEventListener("keydown", this.onKeyDown), this.content.removeEventListener("focus", this.onFocus), this.content.removeEventListener("blur", this.onBlur), this.content.removeEventListener("copy", this.onCopy), this.content.removeEventListener("cut", this.onCut), this.content.removeEventListener("paste", this.onPaste), this.content.removeEventListener("dragover", this.onDragOver), this.content.removeEventListener("drop", this.onDrop), this.content.removeEventListener("click", this.onClick), document.removeEventListener("selectionchange", this.onSelectionChange), this.toolbar?.destroy(), this.fixedToolbar?.destroy(), this.slash?.destroy(), this.blockHandles?.destroy(), this.tableControls?.destroy(), this.ui.destroy(), this.changeTimer && clearTimeout(this.changeTimer), this.host.classList.remove("ew--fill"), this.content.remove(), ["change", "selection", "focus", "blur", "submit"].forEach((e) => this.listeners[e].clear());
    }
  }
  // ── Context & plugin wiring ─────────────────────────────────────────────────
  buildContext() {
    const e = this.content;
    return {
      editor: this,
      root: e,
      exec: (t, ...u) => this.exec(t, ...u),
      transact: (t) => this.transact(t),
      markdown: {
        parse: (t) => this.pipeline.parse(t),
        serialize: (t) => this.pipeline.serialize(t),
        insert: (t) => this.transact(() => Mt(e, t, this.pipeline))
      },
      dom: {
        currentBlock: () => D(e),
        currentListItem: () => ge(e),
        blockKindOf: (t) => pe(t),
        textBeforeCaret: (t) => rt(t).replace(/ /g, " ").split(Es).join(""),
        isAtBlockStart: (t) => _u(t),
        deleteLeadingChars: (t, u) => at(t, u),
        ensureNotEmpty: (t) => Y(t),
        placeCaretAtStart: (t) => _(t),
        placeCaretAtEnd: (t) => J(t),
        placeCaretAfter: (t) => He(t),
        toggleInlineTag: (t) => Iu(e, t),
        isInlineTagActive: (t) => Dt(e, t),
        selectionRect: () => Me()
      },
      ui: this.ui
    };
  }
  runPluginSetups() {
    for (const e of this.registry.plugins) {
      if (e.setup) {
        const u = V(e.name, "setup", () => e.setup(this.ctx));
        typeof u == "function" && this.pluginCleanups.push(u);
      }
      const t = e.on;
      t && (t.change && this.on("change", (u) => V(e.name, "on.change", () => t.change(u, this.ctx))), t.selection && this.on("selection", (u) => V(e.name, "on.selection", () => t.selection(u, this.ctx))), t.focus && this.on("focus", () => V(e.name, "on.focus", () => t.focus(this.ctx))), t.blur && this.on("blur", () => V(e.name, "on.blur", () => t.blur(this.ctx))));
    }
  }
  // ── Internals ──────────────────────────────────────────────────────────────
  handleInput(e) {
    if (!(this.applying || this.opts.readOnly) && !e?.isComposing) {
      this.applying = !0;
      try {
        this.normalize(), Aa(this.content, this.rules, this.ctx);
      } finally {
        this.applying = !1;
      }
      this.updatePlaceholder(), this.opts.slashMenu && this.slash?.sync(), this.keepCaretVisible(), this.scheduleChange();
    }
  }
  /**
   * Keep what you are writing comfortably on screen. `.ew-content` is its
   * own scroller in fill layout, so this is the box to move; in page layout
   * the content is not scrollable and the browser (plus the document-length
   * bottom padding) already does the right thing, so this no-ops.
   */
  keepCaretVisible() {
    this.content.scrollHeight <= this.content.clientHeight || wa(this.content);
  }
  /**
   * Typing or deleting over a select-all must reset the document to a plain
   * paragraph (Notion behavior) — natively, Chrome keeps the first block's
   * emptied shell and the replacement text lands inside a stale heading.
   */
  handleBeforeInput(e) {
    if (this.opts.readOnly || e.isComposing) return;
    const t = e.inputType;
    if (!(t === "insertText" || t === "insertParagraph" || t === "deleteContentBackward" || t === "deleteContentForward") || !this.isFullDocSelection()) return;
    e.preventDefault(), this.content.innerHTML = vt;
    const i = this.content.firstElementChild;
    if (t === "insertText" && e.data) {
      i.textContent = e.data;
      const r = O();
      if (r && i.firstChild) {
        const a = document.createRange();
        a.setStart(i.firstChild, i.firstChild.length), a.collapse(!0), r.removeAllRanges(), r.addRange(a);
      }
    } else
      _(i);
    this.afterMutation();
  }
  isFullDocSelection() {
    const e = O();
    if (!e || e.isCollapsed || !je(this.content)) return !1;
    const t = e.toString().replace(/\s+/g, ""), u = fe(this.content).replace(/\s+/g, "");
    return u.length > 0 && t.length >= u.length;
  }
  handleKey(e) {
    this.slash?.onKeyDown(e) || Ra(this.content, e, {
      notify: () => this.afterMutation(),
      undo: () => this.undo(),
      redo: () => this.redo(),
      submit: this.opts.submitOn ? { on: this.opts.submitOn, fire: () => this.fireSubmit() } : void 0
    }, this.registry.keymap, this.ctx);
  }
  /**
   * The composer's submit key was pressed (EditorOptions.submitOn). Flush the
   * debounced change first so a host reading its own state — not
   * `getMarkdown()` — sees the final keystroke rather than the one before it.
   */
  fireSubmit() {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer), this.changeTimer = null, this.recordHistory();
      const e = this.getMarkdown();
      this.listeners.change.forEach((t) => t(e));
    }
    this.listeners.submit.forEach((e) => e());
  }
  handleClick(e) {
    const t = e.target;
    if (t && t.tagName === "INPUT" && t.type === "checkbox") {
      if (this.opts.readOnly) {
        e.preventDefault();
        return;
      }
      const i = t;
      queueMicrotask(() => {
        i.checked ? i.setAttribute("checked", "") : i.removeAttribute("checked"), i.closest("li")?.setAttribute("data-task", i.checked ? "done" : "todo"), this.afterMutation();
      });
      return;
    }
    const u = t?.closest?.("a");
    if (u && this.content.contains(u) && !this.opts.readOnly) {
      e.preventDefault(), Bt(this.ctx, u);
      return;
    }
    if (t === this.content && !this.opts.readOnly) {
      const i = this.content.lastElementChild;
      if (i && e.clientY > i.getBoundingClientRect().bottom) {
        if (i.tagName === "P" && fe(i).trim() === "") {
          _(i);
          return;
        }
        const r = X("p", {}, "<br>");
        this.content.appendChild(r), _(r), this.afterMutation();
      }
    }
  }
  openBlockMenu(e, t) {
    if (this.opts.readOnly) return;
    const u = O()?.rangeCount ? O().getRangeAt(0) : null;
    if (!(!!u && e.contains(u.startContainer))) {
      const a = e.tagName === "TABLE" ? e.querySelector("th, td") ?? e : e;
      _(a);
    }
    const r = this.registry.blockMenuItems.filter((a) => !a.when || V("block-menu", `when "${a.id}"`, () => a.when(this.ctx, e))).map((a) => ({
      id: a.id,
      title: a.title,
      group: a.group ?? "Actions",
      danger: a.danger,
      action: () => {
        const s = O()?.rangeCount ? O().getRangeAt(0) : null;
        (!s || !e.contains(s.startContainer)) && _(e), this.transact(
          () => V("block-menu", `item "${a.id}"`, () => a.run(this.ctx, e))
        ), this.focus();
      }
    }));
    this.ui.menu({ anchor: t, items: r });
  }
  insertParagraphAfter(e) {
    if (this.opts.readOnly) return;
    const t = X("p", {}, "<br>");
    e.after(t), _(t), this.content.focus(), this.afterMutation();
  }
  afterMutation() {
    this.transactionDepth > 0 || (this.normalize(), this.updatePlaceholder(), this.recordHistory(), this.scheduleChange(), this.handleSelectionChange(), this.keepCaretVisible());
  }
  /** Re-establish the document schema; re-place the caret if it was reset. */
  normalize() {
    if (Mn(this.content)) {
      const t = this.content.firstElementChild;
      t && (document.activeElement === this.content || je(this.content)) && _(t);
    }
  }
  updatePlaceholder() {
    this.content.classList.toggle("ew-content--empty", this.isEmpty());
  }
  scheduleChange() {
    this.changeTimer && clearTimeout(this.changeTimer), this.changeTimer = setTimeout(() => {
      this.changeTimer = null, this.recordHistory();
      const e = this.getMarkdown();
      this.listeners.change.forEach((t) => t(e));
    }, 120);
  }
  // ── History (undo/redo) ────────────────────────────────────────────────────
  seedHistory() {
    this.history = [{ md: this.getMarkdown(), caret: 0 }], this.historyIndex = 0;
  }
  recordHistory() {
    if (this.restoring) return;
    const e = this.getMarkdown();
    this.history[this.historyIndex]?.md !== e && (this.history.length = this.historyIndex + 1, this.history.push({ md: e, caret: ra(this.content) ?? 0 }), this.history.length > vs && this.history.shift(), this.historyIndex = this.history.length - 1);
  }
  flushPendingHistory() {
    this.changeTimer && (clearTimeout(this.changeTimer), this.changeTimer = null), this.recordHistory();
  }
  restore(e) {
    this.restoring = !0, this.setMarkdown(e.md, { silent: !0 });
    try {
      aa(this.content, e.caret);
    } catch {
    }
    this.restoring = !1;
    const t = e.md;
    this.listeners.change.forEach((u) => u(t)), this.handleSelectionChange();
  }
  // ── Selection ──────────────────────────────────────────────────────────────
  handleSelectionChange() {
    if (this.destroyed) return;
    const e = this.buildSelectionInfo();
    this.opts.readOnly || (this.toolbar?.update(e), this.fixedToolbar?.update(e)), this.updateBlockPlaceholder(e), this.listeners.selection.forEach((t) => t(e));
  }
  /** Notion-style hint on the FOCUSED empty paragraph (the document-level
   *  placeholder only covers the empty-document case). */
  updateBlockPlaceholder(e) {
    const t = this.content.querySelector(".ew-block-empty");
    let u = null;
    if (e && e.collapsed && !this.opts.readOnly && !this.isEmpty()) {
      const i = D(this.content);
      i && i.tagName === "P" && fe(i).trim() === "" && (u = i);
    }
    t && t !== u && t.classList.remove("ew-block-empty"), u && u.classList.add("ew-block-empty");
  }
  buildSelectionInfo() {
    if (!je(this.content)) return null;
    const e = O();
    if (!e) return null;
    const t = e.isCollapsed, u = e.toString().trim(), i = {};
    for (const [r, a] of this.registry.commands)
      a.spec.isActive && (i[r] = !!V(a.plugin, `isActive "${r}"`, () => a.spec.isActive(this.ctx)));
    return {
      empty: t || u === "",
      collapsed: t,
      bold: !!i.bold,
      italic: !!i.italic,
      strike: !!i.strike,
      code: !!i.code,
      link: !!i.link,
      marks: i,
      block: pe(D(this.content)),
      rect: t ? null : Me()
    };
  }
  emit(e) {
    this.listeners[e].forEach((t) => t());
  }
}
const As = ["script", "style", "iframe", "noscript", "object", "embed"], Cs = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " "
};
function Ss(n) {
  return n.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (e, t) => Cs[t] ?? e);
}
function ju(n, e) {
  let t = n;
  for (const u of e)
    t = t.replace(new RegExp(`<${u}\\b[^>]*>[\\s\\S]*?</${u}>`, "gi"), ""), t = t.replace(new RegExp(`<${u}\\b[^>]*/?>`, "gi"), "");
  return t;
}
function sn(n, e) {
  return ju(n, e).replace(/<[^>]+>/g, " ");
}
function ve(n, e) {
  return n.decodeEntities ? Ss(e) : e;
}
function Be(n, e) {
  let t = "";
  for (const u of n)
    switch (u.type) {
      case "text":
        t += Array.isArray(u.tokens) ? Be(u.tokens, e) : ve(e, String(u.text ?? ""));
        break;
      case "escape":
      case "codespan":
        t += ve(e, String(u.text ?? ""));
        break;
      case "strong":
      case "em":
      case "del":
      case "link":
        t += Be(u.tokens ?? [], e);
        break;
      case "br":
        t += " ";
        break;
      case "image":
        t += String(u.text ?? "");
        break;
      case "html":
        t += sn(String(u.text ?? ""), e.stripTags);
        break;
      case "emoji":
        t += String(u.glyph ?? "");
        break;
      default:
        if (String(u.type).startsWith("mention")) {
          const i = u.item ?? {}, r = typeof u.raw == "string" && u.raw.length ? u.raw[0] : "@";
          t += `${r}${i.display ?? ""}`;
        } else Array.isArray(u.tokens) ? t += Be(u.tokens, e) : typeof u.text == "string" ? t += ve(e, u.text) : typeof u.raw == "string" && (t += u.raw);
    }
  return t;
}
function qe(n, e) {
  const t = [];
  for (const u of n)
    switch (u.type) {
      case "space":
      case "table":
      // tables dropped entirely
      case "def":
        break;
      case "heading":
      // drop the #, keep the text
      case "paragraph":
        t.push(Be(u.tokens ?? [], e));
        break;
      case "text":
        t.push(Array.isArray(u.tokens) ? Be(u.tokens, e) : ve(e, String(u.text ?? "")));
        break;
      case "blockquote":
        t.push(qe(u.tokens ?? [], e));
        break;
      case "code":
        t.push(ve(e, String(u.text ?? "")));
        break;
      case "hr":
        t.push(`
`);
        break;
      case "html": {
        const i = sn(String(u.text ?? ""), e.stripTags).trim();
        i && t.push(i);
        break;
      }
      case "list": {
        const i = (u.items ?? []).map(
          (r) => "- " + qe(r.tokens ?? [], e).replace(/\s*\n+\s*/g, " ").trim()
        );
        t.push(i.join(`
`));
        break;
      }
      case "list_item":
        t.push("- " + qe(u.tokens ?? [], e));
        break;
      default:
        Array.isArray(u.tokens) ? t.push(qe(u.tokens, e)) : typeof u.text == "string" && t.push(ve(e, u.text));
    }
  return t.filter((u) => u !== "").join(`

`);
}
function lo(n, e = {}) {
  if (n == null || n === "") return "";
  const t = {
    decodeEntities: e.decodeEntities !== !1,
    stripTags: e.stripTags ?? As
  }, u = e.preserveLineBreaks === !0, i = e.wordBoundary !== !1, r = e.ellipsis == null ? "…" : e.ellipsis, a = e.maxLength;
  let s;
  try {
    const o = new Vt({ gfm: !0, breaks: !1 });
    for (const d of [ot(), ...e.plugins ?? []])
      for (const l of d.markdown?.marked ?? []) o.use(l);
    const c = ju(String(n), t.stripTags);
    s = qe(o.lexer(c), t);
  } catch {
    s = sn(ve(t, String(n)), t.stripTags);
  }
  if (u ? s = s.replace(/[^\S\n]+/g, " ").replace(/ *\n */g, `
`).replace(/\n{3,}/g, `

`).trim() : s = s.replace(/\s+/g, " ").trim(), s = s.replace(/:([a-z0-9_+-]*[a-z_][a-z0-9_+-]*):/gi, "$1"), a && s.length > a) {
    const o = a - r.length;
    if (o <= 0) return r;
    let c = s.slice(0, o);
    if (i) {
      const l = c.lastIndexOf(" ");
      l > o * 0.5 && (c = c.slice(0, l));
    }
    const d = c.charCodeAt(c.length - 1);
    return d >= 55296 && d <= 56319 && (c = c.slice(0, -1)), c + r;
  }
  return s;
}
function fo(n, e) {
  return Qt(n, e);
}
function Ts(n = [], e) {
  const t = rn([ot(), ...n], e), u = Zt(t.markedExtensions, t.sanitize);
  return { render: (i, r) => u(i, r) };
}
function ho(n, e, t) {
  const { exclude: u, ...i } = t ?? {};
  return Ts(e, u).render(n, i);
}
function po(n) {
  return Nu(n);
}
function mo(n, e) {
  const t = Qt(n);
  return e && (e.classList.add("ew"), e.innerHTML = `<div class="ew-content ew-content--readonly">${t}</div>`), t;
}
function bo() {
  return re({
    name: "highlight",
    commands: {
      highlight: {
        run: (n) => n.dom.toggleInlineTag("mark"),
        isActive: (n) => n.dom.isInlineTagActive("mark")
      }
    },
    inputRules: [
      { kind: "inline", trigger: /==([^=\n]+)==$/, apply: "mark" }
    ],
    keymap: {
      "Mod-Shift-h": "highlight"
    },
    toolbarItems: [
      { id: "highlight", label: "H", title: "Highlight  (⌘⇧H)", command: "highlight" }
    ],
    markdown: {
      marked: [{
        extensions: [{
          name: "highlight",
          level: "inline",
          start: (n) => n.indexOf("=="),
          tokenizer(n) {
            const e = /^==([^=\n]+)==/.exec(n);
            if (e)
              return {
                type: "highlight",
                raw: e[0],
                text: e[1],
                tokens: this.lexer.inlineTokens(e[1])
              };
          },
          renderer(n) {
            return `<mark>${this.parser.parseInline(n.tokens ?? [])}</mark>`;
          }
        }]
      }],
      turndown: (n) => {
        n.addRule("highlight", {
          filter: "mark",
          replacement: (e) => `==${e}==`
        });
      }
    }
    // <mark> is already in the sanitizer allow-list; a tag that isn't would
    // need: sanitize: { tags: ["mark"] }
  });
}
const Vu = ["note", "tip", "important", "warning", "caution"], Ns = new RegExp(`^\\[!(${Vu.join("|")})\\] $`, "i");
function go() {
  return re({
    name: "callout",
    commands: {
      callout: {
        run: (n, e) => {
          const t = n.dom.currentBlock();
          if (!t) return !1;
          const u = e?.kind ?? "note";
          if (t.tagName === "BLOCKQUOTE") {
            t.setAttribute("data-callout", u);
            return;
          }
          const i = document.createElement("blockquote");
          for (i.setAttribute("data-callout", u); t.firstChild; ) i.appendChild(t.firstChild);
          n.dom.ensureNotEmpty(i), t.replaceWith(i), n.dom.placeCaretAtEnd(i);
        },
        isActive: (n) => !!n.dom.currentBlock()?.hasAttribute("data-callout")
      }
    },
    inputRules: [
      {
        // `> ` already became a blockquote (core rule); typing `[!note] `
        // inside one upgrades it. `within` scopes the rule to blockquotes.
        kind: "block",
        within: ["BLOCKQUOTE"],
        trigger: Ns,
        apply: (n, e, t) => (t.setAttribute("data-callout", e[1].toLowerCase()), n.dom.deleteLeadingChars(t, e[0].length), !0)
      }
    ],
    slashItems: [
      { id: "callout-note", title: "Callout", hint: "Highlighted note (> [!NOTE])", keywords: ["callout", "note", "aside", "info"], group: "Media", command: "callout", payload: { kind: "note" } },
      { id: "callout-warning", title: "Warning callout", hint: "Attention-grabbing warning", keywords: ["callout", "warning", "caution", "alert"], group: "Media", command: "callout", payload: { kind: "warning" } }
    ],
    // The parsed HTML carries data-callout — widen the sanitizer for it.
    sanitize: { attributes: { blockquote: ["data-callout"] } },
    markdown: {
      marked: [{
        renderer: {
          // marked v12 renderer: receives the blockquote's inner HTML.
          blockquote(n) {
            const e = /^<p>\s*\[!(\w+)\]\s*(?:<br\s*\/?>\s*|\n)?/i.exec(n);
            if (!e || !Vu.includes(e[1].toLowerCase())) return !1;
            const t = e[1].toLowerCase();
            let u = n.replace(e[0], "<p>");
            return u = u.replace(/^<p>\s*<\/p>\s*/, ""), `<blockquote data-callout="${t}">
${u}</blockquote>
`;
          }
        }
      }],
      turndown: (n) => {
        n.addRule("callout", {
          filter: (e) => e.nodeName === "BLOCKQUOTE" && !!e.getAttribute("data-callout"),
          replacement: (e, t) => {
            const u = (t.getAttribute("data-callout") ?? "note").toUpperCase(), i = e.replace(/^\n+|\n+$/g, "").replace(/^/gm, "> ").replace(/^> $/gm, ">");
            return `

> [!${u}]
${i}

`;
          }
        });
      }
    }
  });
}
function on(n, e) {
  const t = document.createElement("figure");
  t.setAttribute("data-widget", n), t.setAttribute("data-source", e), t.setAttribute("contenteditable", "false");
  const u = document.createElement("div");
  return u.className = "ew-widget__surface", t.appendChild(u), t;
}
function _s(n) {
  let e = n.querySelector(":scope > .ew-widget__surface");
  return e || (e = document.createElement("div"), e.className = "ew-widget__surface", n.textContent = "", n.appendChild(e)), e;
}
function be(n, e) {
  n.root.querySelectorAll(`figure[data-widget="${e.kind}"]`).forEach((u) => {
    u.setAttribute("contenteditable", "false");
    const i = u.getAttribute("data-source") ?? "";
    if (u.getAttribute("data-rendered") === i) return;
    u.setAttribute("data-rendered", i);
    const r = _s(u);
    r.classList.add("is-busy"), e.busyText && r.setAttribute("aria-label", e.busyText), Promise.resolve().then(() => e.render(i, r, n)).then(() => r.classList.remove("is-busy")).catch((a) => {
      r.classList.remove("is-busy"), r.textContent = "";
      const s = document.createElement("div");
      s.className = "ew-widget__error", s.textContent = `${e.kind}: ${a instanceof Error ? a.message : String(a)}`, r.appendChild(s);
    });
  });
}
function cn(n, e) {
  const t = (u) => {
    const r = u.target.closest?.(`figure[data-widget="${e.kind}"]`);
    if (!(!r || !n.root.contains(r)) && e.edit !== !1) {
      if (u.preventDefault(), u.stopPropagation(), typeof e.edit == "function") {
        e.edit(r, n);
        return;
      }
      Ls(n, e, r);
    }
  };
  return n.root.addEventListener("click", t), () => n.root.removeEventListener("click", t);
}
function Ls(n, e, t) {
  n.ui.popover({
    anchor: t,
    placement: "below",
    render(u, i) {
      u.classList.add("ew-widget-editor");
      const r = document.createElement("textarea");
      r.className = "ew-widget-editor__source", r.value = t.getAttribute("data-source") ?? "", r.rows = Math.min(14, Math.max(4, r.value.split(`
`).length + 1)), r.setAttribute("aria-label", `${e.kind} source`), u.appendChild(r);
      const a = document.createElement("div");
      a.className = "ew-popover__actions";
      const s = document.createElement("button");
      s.type = "button", s.className = "ew-popover__btn ew-popover__btn--primary", s.textContent = "Save", s.addEventListener("click", () => {
        i(), n.transact(() => {
          t.setAttribute("data-source", r.value), t.removeAttribute("data-rendered");
        }), be(n, e);
      });
      const o = document.createElement("button");
      o.type = "button", o.className = "ew-popover__btn", o.textContent = "Cancel", o.addEventListener("click", () => i()), a.append(s, o), u.appendChild(a), setTimeout(() => r.focus(), 0);
    }
  });
}
function P(n) {
  return n.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function ln(n, e, t) {
  if (e.textContent = "", t) {
    const u = document.createElement("code");
    u.textContent = n, e.appendChild(u);
  } else
    e.textContent = n;
}
let Pn = null;
function Rs() {
  return Pn ??= import("katex").then(
    (n) => {
      const e = n.default;
      return (t, u, i) => e.render(t, u, { displayMode: i, throwOnError: !1 });
    },
    () => ln
  ), Pn;
}
const Is = /^\$([^\s$](?:[^$\n]*[^\s$])?)\$(?!\d)/, $s = /^\$\$[ \t]*\n([\s\S]*?)\n[ \t]*\$\$[ \t]*(?=\n|$)/, qs = /^\$\$([^\n$]+)\$\$[ \t]*(?=\n|$)/;
function Ds(n, e) {
  n.root.querySelectorAll("span[data-math]").forEach((t) => {
    t.classList.add("ew-math"), t.setAttribute("contenteditable", "false");
    const u = t.getAttribute("data-math") ?? "";
    t.getAttribute("data-rendered") !== u && (t.setAttribute("data-rendered", u), e().then((i) => {
      if (!(!t.isConnected || t.getAttribute("data-math") !== u)) {
        t.textContent = "";
        try {
          i(u, t, !1);
        } catch {
          ln(u, t, !1);
        }
      }
    }));
  });
}
function Bs(n) {
  const e = on("math", n), t = e.querySelector(".ew-widget__surface");
  return t && (t.textContent = n), e;
}
function Ms(n, e) {
  const t = (u) => {
    const r = u.target.closest?.("span[data-math]");
    !r || !n.root.contains(r) || (u.preventDefault(), u.stopPropagation(), Os(n, r, e));
  };
  return n.root.addEventListener("click", t), () => n.root.removeEventListener("click", t);
}
function Os(n, e, t) {
  n.ui.popover({
    anchor: e,
    placement: "below",
    render(u, i) {
      u.classList.add("ew-widget-editor");
      const r = document.createElement("input");
      r.className = "ew-widget-editor__source", r.value = e.getAttribute("data-math") ?? "", r.setAttribute("aria-label", "math source"), u.appendChild(r);
      const a = document.createElement("div");
      a.className = "ew-popover__actions";
      const s = document.createElement("button");
      s.type = "button", s.className = "ew-popover__btn ew-popover__btn--primary", s.textContent = "Save", s.addEventListener("click", () => {
        const c = r.value.trim();
        i(), c && (n.transact(() => {
          e.setAttribute("data-math", c), e.removeAttribute("data-rendered"), e.textContent = c;
        }), t());
      });
      const o = document.createElement("button");
      o.type = "button", o.className = "ew-popover__btn is-danger", o.textContent = "Remove", o.addEventListener("click", () => {
        i(), n.transact(() => {
          e.replaceWith(document.createTextNode(e.getAttribute("data-math") ?? ""));
        });
      }), a.append(s, o), u.appendChild(a), r.addEventListener("keydown", (c) => {
        c.key === "Enter" && (c.preventDefault(), s.click());
      }), setTimeout(() => r.focus(), 0);
    }
  });
}
function xo(n = {}) {
  const e = n.render ? () => Promise.resolve(n.render) : Rs, t = {
    kind: "math",
    busyText: "Rendering math…",
    render: async (i, r) => {
      const a = await e();
      r.textContent = "";
      try {
        a(i, r, !0);
      } catch {
        ln(i, r, !0);
      }
    }
  }, u = (i) => {
    be(i, t), Ds(i, e);
  };
  return re({
    name: "math",
    inputRules: [
      {
        // The typed closing `$` converts — same edges as the marked tokenizer.
        kind: "inline",
        trigger: /\$([^\s$](?:[^$\n]*[^\s$])?)\$$/,
        apply: (i) => {
          const r = document.createElement("span");
          return r.className = "ew-math", r.setAttribute("data-math", i[1]), r.setAttribute("contenteditable", "false"), r.textContent = i[1], r;
        }
      }
    ],
    slashItems: [
      {
        id: "math-block",
        title: "Math block",
        hint: "Display TeX equation ($$)",
        keywords: ["math", "tex", "latex", "katex", "equation", "formula"],
        group: "Advanced",
        run(i) {
          const r = i.dom.currentBlock(), a = Bs("E = mc^2");
          i.transact(() => {
            r ? r.replaceWith(a) : i.root.appendChild(a);
          }), be(i, t), a.dispatchEvent(new MouseEvent("click", { bubbles: !0, cancelable: !0 }));
        }
      }
    ],
    sanitize: {
      tags: ["figure"],
      attributes: {
        figure: ["data-widget", "data-source"],
        span: ["data-math"]
      }
    },
    markdown: {
      marked: [{
        extensions: [
          {
            name: "math-block",
            level: "block",
            // Only cut paragraphs at a LINE starting with `$$` — a mid-line
            // "costs $$ money" must never split its paragraph.
            start(i) {
              const r = /(?:^|\n)\$\$/.exec(i);
              if (r)
                return r[0].startsWith(`
`) ? r.index + 1 : r.index;
            },
            tokenizer(i) {
              let r = $s.exec(i), a;
              if (r)
                a = r[1];
              else {
                if (r = qs.exec(i), !r) return;
                a = r[1].trim();
              }
              return { type: "math-block", raw: r[0], text: a };
            },
            renderer(i) {
              const r = P(String(i.text));
              return `<figure data-widget="math" data-source="${r}"><div class="ew-widget__surface">${r}</div></figure>
`;
            }
          },
          {
            name: "math-inline",
            level: "inline",
            start: (i) => i.indexOf("$"),
            tokenizer(i) {
              const r = Is.exec(i);
              if (r)
                return { type: "math-inline", raw: r[0], text: r[1] };
            },
            renderer(i) {
              const r = P(String(i.text));
              return `<span class="ew-math" data-math="${r}">${r}</span>`;
            }
          }
        ]
      }],
      turndown: (i) => {
        i.addRule("math-inline", {
          filter: (r) => r.nodeName === "SPAN" && r.hasAttribute("data-math"),
          replacement: (r, a) => `$${a.getAttribute("data-math") ?? ""}$`
        }), i.addRule("math-block", {
          filter: (r) => r.nodeName === "FIGURE" && r.getAttribute("data-widget") === "math",
          replacement: (r, a) => `

$$
${a.getAttribute("data-source") ?? ""}
$$

`
        });
      }
    },
    setup: (i) => {
      u(i);
      const r = cn(i, t), a = Ms(i, () => u(i));
      return () => {
        r(), a();
      };
    },
    on: {
      change: (i, r) => u(r)
    }
  });
}
const Ze = "diagram", Ps = {
  edd: `scene {
  a[Start] --> b[Finish]
}`,
  mermaid: `flowchart LR
  a[Start] --> b[Finish]`
};
function Et(n) {
  return n.nodeName === "FIGURE" && n.getAttribute("data-widget") === Ze;
}
function Hn(n) {
  const e = n.getAttribute("data-lang") ?? "", t = n.getAttribute("data-source") ?? "";
  return `

\`\`\`${e}
${t ? `${t}
` : ""}\`\`\`

`;
}
const At = /* @__PURE__ */ new WeakMap();
function Wu(n, e, t) {
  const u = {
    kind: Ze,
    busyText: "Rendering diagram…",
    render(i, r, a) {
      const s = r.parentElement?.getAttribute("data-lang") ?? "", o = e[s];
      if (!o) throw new Error(`no renderer registered for "${s}"`);
      return r.textContent = "", o(i, r, a);
    }
  };
  return re({
    name: n,
    commands: {
      diagram: {
        run: (i, r) => {
          const a = r?.lang ?? Object.keys(e)[0], s = i.dom.currentBlock();
          if (!a || !s) return !1;
          const o = on(Ze, r?.source ?? Ps[a] ?? "");
          o.setAttribute("data-lang", a);
          const c = document.createElement("p");
          c.appendChild(document.createElement("br")), s.after(o), o.after(c), (s.textContent ?? "").trim() === "" && s.tagName === "P" && s.remove(), i.dom.placeCaretAtStart(c), be(i, u);
        }
      }
    },
    slashItems: t.map((i) => ({
      id: `diagram-${i.lang}`,
      title: i.title,
      hint: i.hint,
      keywords: ["diagram", "chart", "graph", i.lang, ...i.keywords ?? []],
      group: "Media",
      run(r) {
        if (!r.exec("diagram", { lang: i.lang })) return;
        const a = r.dom.currentBlock()?.previousElementSibling;
        a && Et(a) && a.dispatchEvent(new MouseEvent("click", { bubbles: !0, cancelable: !0 }));
      }
    })),
    sanitize: { tags: ["figure"], attributes: { figure: ["data-widget", "data-source", "data-lang"] } },
    markdown: {
      marked: [{
        renderer: {
          // marked v12: code(code, infostring, escaped). Returning false falls
          // through to the default code rendering — an unregistered language
          // (```js, bare ```) must stay an ordinary code block.
          code(i, r) {
            const a = (r ?? "").trim().split(/\s+/)[0] ?? "";
            return !a || !(a in e) ? !1 : `<figure data-widget="${Ze}" data-lang="${P(a)}" data-source="${P(i)}"></figure>
`;
          }
        }
      }],
      turndown: (i) => {
        i.addRule("diagram", {
          filter: (s) => Et(s),
          replacement: (s, o) => Hn(o)
        });
        const r = i.rules, a = r.blankRule.replacement;
        r.blankRule.replacement = (s, o, c) => Et(o) ? Hn(o) : a(s, o, c);
      }
    },
    setup(i) {
      be(i, u);
      const r = cn(i, u);
      let a = null, s = null;
      const o = /* @__PURE__ */ new WeakMap();
      typeof ResizeObserver < "u" && (a = new ResizeObserver((d) => {
        let l = !1;
        for (const p of d) {
          const w = `${Math.round(p.contentRect.width)}x${Math.round(p.contentRect.height)}`, A = o.get(p.target);
          o.set(p.target, w), A !== void 0 && A !== w && p.contentRect.width > 0 && (l = !0);
        }
        l && (s && clearTimeout(s), s = setTimeout(() => {
          i.root.querySelectorAll(`figure[data-widget="${u.kind}"]`).forEach((p) => p.removeAttribute("data-rendered")), be(i, u), c();
        }, 150));
      }));
      const c = () => {
        a && i.root.querySelectorAll(`figure[data-widget="${u.kind}"] .ew-widget__surface`).forEach((d) => a.observe(d));
      };
      return c(), At.set(i.root, c), () => {
        r(), At.delete(i.root), a?.disconnect(), s && clearTimeout(s);
      };
    },
    on: {
      change: (i, r) => {
        be(r, u), At.get(r.root)?.();
      }
    }
  });
}
function ko(n) {
  const e = Object.keys(n.renderers).map((t) => ({
    lang: t,
    title: t === "mermaid" ? "Mermaid diagram" : `Diagram (${t})`,
    hint: `Rendered \`\`\`${t} block`
  }));
  return Wu("diagrams", n.renderers, e);
}
function wo(n = {}) {
  const e = n.languages ?? ["edd", "mermaid"];
  let t = null;
  const u = () => t ??= import("edododraw"), i = /* @__PURE__ */ new WeakMap(), r = (o) => async (c, d) => {
    const { EdodoDraw: l } = await u();
    i.get(d)?.destroy(), i.delete(d), d.textContent = "";
    const p = new l(d, { interactive: !1 });
    i.set(d, p);
    const w = o === "edd" ? c : `mermaid """
${c}
"""`, { diagnostics: A } = await p.render(w), R = A.find((T) => T.severity === "error");
    if (R) throw new Error(`${R.message} (line ${R.line})`);
  }, a = {};
  for (const o of e) a[o] = r(o);
  const s = e.map((o) => o === "edd" ? { lang: o, title: "Diagram", hint: "edodo-draw (text to diagram)", keywords: ["edd", "edodo", "draw", "flowchart"] } : o === "mermaid" ? { lang: o, title: "Mermaid diagram", hint: "Mermaid, hand-drawn", keywords: ["mermaid", "flowchart"] } : { lang: o, title: `Diagram (${o})` });
  return Wu("edodo-draw", a, s);
}
const Hs = " ";
function zs(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function yo(n) {
  const e = n.trigger ?? "#", t = n.allowCreate ?? !0, u = Math.max(0, n.allowSpaces ?? 0), i = "[\\w-]*", r = new RegExp(
    `(^|\\s)${zs(e)}(${i}(?: ${i}){0,${u}})$`
  );
  let a = null, s = 0;
  const o = (f) => f.href ?? (n.href ? n.href(f) : null), c = (f) => {
    const h = f.dom.currentBlock();
    if (!h || h.tagName === "PRE") return null;
    const k = Lu(f.root);
    if (!k) return null;
    const v = r.exec(k.text);
    return v ? { block: k.line, query: v[2] } : null;
  }, d = () => {
    s += 1, a?.close();
  }, l = () => {
    const f = a;
    if (!f) return;
    const h = f.list.querySelectorAll(".ew-menu__item");
    h.forEach((k, v) => {
      k.classList.toggle("is-active", v === f.index), k.setAttribute("aria-selected", v === f.index ? "true" : "false");
    }), st(f.list, h[f.index]);
  }, p = (f) => {
    const h = a;
    return !h || h.entries.length === 0 ? !1 : (h.index = (h.index + f + h.entries.length) % h.entries.length, l(), !0);
  }, w = (f) => {
    const h = a;
    h && (h.list.textContent = "", h.entries.forEach((k, v) => {
      const N = document.createElement("button");
      N.type = "button", N.className = "ew-menu__item" + (v === h.index ? " is-active" : ""), N.setAttribute("role", "option"), N.setAttribute("aria-selected", v === h.index ? "true" : "false");
      const C = document.createElement("span");
      if (C.className = "ew-menu__title", C.textContent = k.create ? `Create ${e}${k.label}` : `${e}${k.label}`, N.appendChild(C), k.hint) {
        const $ = document.createElement("span");
        $.className = "ew-menu__hint", $.textContent = k.hint, N.appendChild($);
      }
      N.addEventListener("mouseenter", () => {
        a !== h || !h.mouseArmed || (h.index = v, l());
      }), N.addEventListener("click", ($) => {
        $.preventDefault(), G(f, k);
      }), h.list.appendChild(N);
    }));
  }, A = (f, h) => {
    const k = f.ui.popover({
      anchor: f.dom.selectionRect() ?? h,
      placement: "below",
      render(v) {
        v.classList.add("ew-menu"), v.setAttribute("role", "listbox"), v.addEventListener(
          "mousemove",
          () => {
            a && (a.mouseArmed = !0);
          },
          { once: !0 }
        );
      },
      onClose: () => {
        a = null;
      }
    });
    a = { close: k.close, list: k.el, entries: [], index: 0, mouseArmed: !1 };
  }, R = (f, h, k, v) => {
    const N = [];
    if (z && n.allowBroadcast) {
      const C = n.allowBroadcast;
      (h === "" || C.display.toLowerCase().startsWith(h.toLowerCase())) && N.push({ label: C.display, href: null, token: { id: C.id, display: C.display } });
    }
    for (const C of v)
      N.push({
        label: C.label,
        hint: C.hint,
        href: o(C),
        // In token mode, carry the id/display so `pick()` inserts a chip that
        // `serialize()` turns into exactly `serialize(item)`.
        token: z ? { id: C.id ?? "", display: C.display ?? C.label } : void 0
      });
    if (t && h && N.length === 0 && N.push({ label: h, href: o({ label: h }), create: !0 }), N.length === 0) {
      d();
      return;
    }
    a || A(f, k), a && (a.entries = N, a.index = 0, w(f));
  }, T = (f) => {
    const h = c(f);
    if (!h) {
      d();
      return;
    }
    const k = ++s, v = n.source(h.query);
    if (Array.isArray(v)) {
      R(f, h.query, h.block, v);
      return;
    }
    Promise.resolve(v).then(
      (N) => {
        k === s && R(f, h.query, h.block, N ?? []);
      },
      () => {
        k === s && d();
      }
    );
  }, G = (f, h) => {
    const k = c(f);
    if (d(), !k || !h) return;
    const v = e.length + k.query.length;
    f.transact(() => {
      const N = Ru(k.block, v);
      if (!N) return;
      const C = N.endContainer;
      if (C.nodeType === Node.TEXT_NODE) {
        const b = C.data;
        let x = N.endOffset;
        for (; x < b.length && /[\w-]/.test(b[x]); ) x += 1;
        N.setEnd(C, x);
      }
      N.deleteContents();
      const $ = document.createTextNode(Hs), m = z && h.token ? ke(h.token) : h.href ? Us(h.href, e + h.label) : document.createTextNode(e + h.label);
      N.insertNode($), N.insertNode(m), f.dom.placeCaretAfter($);
    });
  }, ae = (f) => {
    f.root.querySelectorAll("a").forEach((h) => {
      (h.textContent ?? "").startsWith(e) ? (h.classList.add("ew-tag"), h.dataset.tagTrigger = e) : h.dataset.tagTrigger === e && (h.classList.remove("ew-tag"), delete h.dataset.tagTrigger);
    });
  }, z = !!(n.serialize && n.parse), ee = `mention_${n.name ?? "tags"}`, K = /* @__PURE__ */ new WeakSet(), Ce = () => {
    const f = n.parse, h = f.pattern.flags.replace(/[gy]/g, ""), k = new RegExp(`^(?:${f.pattern.source})`, h), v = new RegExp(f.pattern.source, h);
    return {
      marked: [{
        extensions: [{
          name: ee,
          level: "inline",
          start(C) {
            const $ = C.search(v);
            return $ < 0 ? void 0 : $;
          },
          tokenizer(C) {
            const $ = k.exec(C);
            if ($)
              return { type: ee, raw: $[0], item: f.toItem($) };
          },
          renderer(C) {
            return xe(C.item);
          }
        }]
      }],
      turndown: (C) => {
        C.addRule(ee, {
          filter: ($) => $.nodeName === "SPAN" && $.hasAttribute("data-mention-id"),
          replacement: ($, m) => {
            const b = m;
            return n.serialize({
              id: b.getAttribute("data-mention-id") ?? "",
              display: b.getAttribute("data-mention-display") ?? ""
            });
          }
        });
      }
    };
  }, xe = (f) => {
    const h = String(f.id ?? ""), k = String(f.display ?? ""), v = n.resolveMention?.(h, k)?.display ?? k;
    return `<span class="ew-mention" data-mention-id="${P(h)}" data-mention-display="${P(k)}" contenteditable="false">${P(e + v)}</span>`;
  }, ke = (f) => {
    if (n.render) {
      const v = n.render(f, n.resolveMention);
      return K.add(v), v;
    }
    const h = document.createElement("span");
    h.className = "ew-mention", h.setAttribute("data-mention-id", f.id), h.setAttribute("data-mention-display", f.display), h.setAttribute("contenteditable", "false");
    const k = n.resolveMention?.(f.id, f.display)?.display ?? f.display;
    return h.textContent = e + k, K.add(h), h;
  }, se = (f) => {
    f.root.querySelectorAll("span[data-mention-id]").forEach((h) => {
      if (K.has(h)) return;
      const k = h.getAttribute("data-mention-id") ?? "", v = h.getAttribute("data-mention-display") ?? "";
      if (n.render)
        h.replaceWith(ke({ id: k, display: v }));
      else {
        h.classList.add("ew-mention"), h.setAttribute("contenteditable", "false");
        const N = n.resolveMention?.(k, v)?.display ?? v;
        h.textContent = e + N, K.add(h);
      }
    });
  }, oe = z ? Ce() : null, y = {
    name: n.name ?? "tags",
    setup(f) {
      const h = (k) => {
        k.isComposing || T(f);
      };
      return f.root.addEventListener("input", h), ae(f), z && se(f), () => {
        f.root.removeEventListener("input", h), d();
      };
    },
    // Bindings act ONLY while the menu is open — otherwise they return false
    // and fall through to the next binding / the structural engine. Every
    // binding ignores IME composition keydowns (Firefox/Safari deliver the
    // real key with isComposing=true; consuming it would navigate the menu
    // instead of the IME candidate list, or commit a pick mid-composition).
    keymap: {
      ArrowDown: (f, h) => !h.isComposing && p(1),
      ArrowUp: (f, h) => !h.isComposing && p(-1),
      Enter: (f, h) => !a || h.isComposing ? !1 : (G(f, a.entries[a.index]), !0),
      Escape: (f, h) => !a || h.isComposing ? !1 : (d(), !0)
    },
    on: {
      change: (f, h) => {
        ae(h), z && se(h);
      },
      // Caret left the trigger span (click elsewhere, arrow-left past the
      // trigger, selection left the editor) → close. Still inside it
      // (ArrowLeft within the query) → REFILTER, so the rows always match
      // what a pick would consume.
      selection: (f, h) => {
        a && (!f || !c(h) ? d() : T(h));
      },
      blur: () => d()
    }
  };
  return oe && (y.markdown = oe, y.sanitize = {
    tags: ["span"],
    attributes: { span: ["data-mention-id", "data-mention-display", "contenteditable"] }
  }), re(y);
}
function Us(n, e) {
  const t = document.createElement("a");
  return t.className = "ew-tag", t.setAttribute("href", n), t.textContent = e, t;
}
const Fs = {
  // Smileys
  smile: "😄",
  smiley: "😃",
  grin: "😁",
  grinning: "😀",
  laughing: "😆",
  joy: "😂",
  rofl: "🤣",
  sweat_smile: "😅",
  blush: "😊",
  innocent: "😇",
  slightly_smiling_face: "🙂",
  upside_down_face: "🙃",
  wink: "😉",
  relieved: "😌",
  heart_eyes: "😍",
  smiling_face_with_three_hearts: "🥰",
  star_struck: "🤩",
  kissing_heart: "😘",
  yum: "😋",
  stuck_out_tongue: "😛",
  stuck_out_tongue_winking_eye: "😜",
  zany_face: "🤪",
  face_with_raised_eyebrow: "🤨",
  neutral_face: "😐",
  expressionless: "😑",
  no_mouth: "😶",
  smirk: "😏",
  unamused: "😒",
  roll_eyes: "🙄",
  grimacing: "😬",
  thinking: "🤔",
  shushing_face: "🤫",
  face_with_hand_over_mouth: "🤭",
  hugs: "🤗",
  sunglasses: "😎",
  nerd_face: "🤓",
  monocle_face: "🧐",
  confused: "😕",
  worried: "😟",
  frowning_face: "☹️",
  open_mouth: "😮",
  astonished: "😲",
  flushed: "😳",
  pleading_face: "🥺",
  cry: "😢",
  sob: "😭",
  scream: "😱",
  fearful: "😨",
  cold_sweat: "😰",
  disappointed: "😞",
  weary: "😩",
  tired_face: "😫",
  yawning_face: "🥱",
  triumph: "😤",
  rage: "😡",
  angry: "😠",
  exploding_head: "🤯",
  dizzy_face: "😵",
  mask: "😷",
  sleeping: "😴",
  drooling_face: "🤤",
  partying_face: "🥳",
  smiling_imp: "😈",
  skull: "💀",
  clown_face: "🤡",
  ghost: "👻",
  alien: "👽",
  robot: "🤖",
  poop: "💩",
  // Gestures & people
  "+1": "👍",
  thumbsup: "👍",
  "-1": "👎",
  thumbsdown: "👎",
  ok_hand: "👌",
  wave: "👋",
  raised_hands: "🙌",
  clap: "👏",
  pray: "🙏",
  handshake: "🤝",
  muscle: "💪",
  point_up: "☝️",
  point_down: "👇",
  point_left: "👈",
  point_right: "👉",
  crossed_fingers: "🤞",
  v: "✌️",
  metal: "🤘",
  call_me_hand: "🤙",
  writing_hand: "✍️",
  eyes: "👀",
  eye: "👁️",
  brain: "🧠",
  ear: "👂",
  nose: "👃",
  facepalm: "🤦",
  shrug: "🤷",
  bow: "🙇",
  raising_hand: "🙋",
  man_technologist: "👨‍💻",
  woman_technologist: "👩‍💻",
  family: "👪",
  people_hugging: "🫂",
  // Hearts & symbols
  heart: "❤️",
  orange_heart: "🧡",
  yellow_heart: "💛",
  green_heart: "💚",
  blue_heart: "💙",
  purple_heart: "💜",
  black_heart: "🖤",
  white_heart: "🤍",
  broken_heart: "💔",
  two_hearts: "💕",
  sparkling_heart: "💖",
  heartpulse: "💗",
  cupid: "💘",
  gift_heart: "💝",
  100: "💯",
  anger: "💢",
  boom: "💥",
  collision: "💥",
  dizzy: "💫",
  sweat_drops: "💦",
  dash: "💨",
  zzz: "💤",
  fire: "🔥",
  sparkles: "✨",
  star: "⭐",
  star2: "🌟",
  zap: "⚡",
  comet: "☄️",
  rainbow: "🌈",
  // Nature & weather
  sunny: "☀️",
  partly_sunny: "⛅",
  cloud: "☁️",
  rain_cloud: "🌧️",
  snowflake: "❄️",
  snowman: "⛄",
  umbrella: "☔",
  ocean: "🌊",
  crescent_moon: "🌙",
  full_moon: "🌕",
  earth_africa: "🌍",
  earth_americas: "🌎",
  earth_asia: "🌏",
  volcano: "🌋",
  mountain: "⛰️",
  seedling: "🌱",
  herb: "🌿",
  four_leaf_clover: "🍀",
  maple_leaf: "🍁",
  fallen_leaf: "🍂",
  cactus: "🌵",
  palm_tree: "🌴",
  evergreen_tree: "🌲",
  deciduous_tree: "🌳",
  bouquet: "💐",
  cherry_blossom: "🌸",
  rose: "🌹",
  sunflower: "🌻",
  tulip: "🌷",
  hibiscus: "🌺",
  // Animals
  dog: "🐶",
  cat: "🐱",
  mouse: "🐭",
  hamster: "🐹",
  rabbit: "🐰",
  fox_face: "🦊",
  bear: "🐻",
  panda_face: "🐼",
  koala: "🐨",
  tiger: "🐯",
  lion: "🦁",
  cow: "🐮",
  pig: "🐷",
  frog: "🐸",
  monkey_face: "🐵",
  see_no_evil: "🙈",
  hear_no_evil: "🙉",
  speak_no_evil: "🙊",
  chicken: "🐔",
  penguin: "🐧",
  bird: "🐦",
  baby_chick: "🐤",
  duck: "🦆",
  eagle: "🦅",
  owl: "🦉",
  bat: "🦇",
  wolf: "🐺",
  horse: "🐴",
  unicorn: "🦄",
  bee: "🐝",
  bug: "🐛",
  butterfly: "🦋",
  snail: "🐌",
  ant: "🐜",
  spider: "🕷️",
  turtle: "🐢",
  snake: "🐍",
  octopus: "🐙",
  squid: "🦑",
  shrimp: "🦐",
  crab: "🦀",
  whale: "🐳",
  dolphin: "🐬",
  fish: "🐟",
  shark: "🦈",
  crocodile: "🐊",
  elephant: "🐘",
  gorilla: "🦍",
  dodo: "🦤",
  "t-rex": "🦖",
  sauropod: "🦕",
  // Food & drink
  apple: "🍎",
  banana: "🍌",
  grapes: "🍇",
  strawberry: "🍓",
  watermelon: "🍉",
  lemon: "🍋",
  peach: "🍑",
  pineapple: "🍍",
  mango: "🥭",
  avocado: "🥑",
  broccoli: "🥦",
  corn: "🌽",
  hot_pepper: "🌶️",
  bread: "🍞",
  cheese: "🧀",
  egg: "🥚",
  bacon: "🥓",
  hamburger: "🍔",
  fries: "🍟",
  pizza: "🍕",
  hotdog: "🌭",
  taco: "🌮",
  burrito: "🌯",
  ramen: "🍜",
  sushi: "🍣",
  bento: "🍱",
  curry: "🍛",
  rice: "🍚",
  dumpling: "🥟",
  cookie: "🍪",
  doughnut: "🍩",
  cake: "🍰",
  birthday: "🎂",
  cupcake: "🧁",
  chocolate_bar: "🍫",
  candy: "🍬",
  lollipop: "🍭",
  icecream: "🍦",
  popcorn: "🍿",
  coffee: "☕",
  tea: "🍵",
  milk_glass: "🥛",
  beer: "🍺",
  beers: "🍻",
  clinking_glasses: "🥂",
  wine_glass: "🍷",
  tumbler_glass: "🥃",
  cocktail: "🍸",
  tropical_drink: "🍹",
  champagne: "🍾",
  cup_with_straw: "🥤",
  // Activities & objects
  soccer: "⚽",
  basketball: "🏀",
  football: "🏈",
  baseball: "⚾",
  tennis: "🎾",
  volleyball: "🏐",
  "8ball": "🎱",
  ping_pong: "🏓",
  trophy: "🏆",
  medal_sports: "🏅",
  "1st_place_medal": "🥇",
  "2nd_place_medal": "🥈",
  "3rd_place_medal": "🥉",
  dart: "🎯",
  video_game: "🎮",
  game_die: "🎲",
  jigsaw: "🧩",
  chess_pawn: "♟️",
  performing_arts: "🎭",
  art: "🎨",
  clapper: "🎬",
  microphone: "🎤",
  headphones: "🎧",
  musical_note: "🎵",
  notes: "🎶",
  guitar: "🎸",
  drum: "🥁",
  trumpet: "🎺",
  violin: "🎻",
  tada: "🎉",
  hooray: "🎉",
  confetti_ball: "🎊",
  balloon: "🎈",
  gift: "🎁",
  ribbon: "🎀",
  crystal_ball: "🔮",
  camera: "📷",
  video_camera: "📹",
  movie_camera: "🎥",
  // Travel & places
  rocket: "🚀",
  airplane: "✈️",
  helicopter: "🚁",
  car: "🚗",
  taxi: "🚕",
  bus: "🚌",
  truck: "🚚",
  tractor: "🚜",
  bike: "🚲",
  motorcycle: "🏍️",
  train: "🚆",
  metro: "🚇",
  ship: "🚢",
  sailboat: "⛵",
  anchor: "⚓",
  fuelpump: "⛽",
  traffic_light: "🚥",
  construction: "🚧",
  house: "🏠",
  office: "🏢",
  school: "🏫",
  hospital: "🏥",
  bank: "🏦",
  hotel: "🏨",
  church: "⛪",
  stadium: "🏟️",
  statue_of_liberty: "🗽",
  tokyo_tower: "🗼",
  tent: "⛺",
  desert_island: "🏝️",
  world_map: "🗺️",
  compass: "🧭",
  // Work & tech
  computer: "💻",
  desktop_computer: "🖥️",
  keyboard: "⌨️",
  computer_mouse: "🖱️",
  printer: "🖨️",
  iphone: "📱",
  telephone: "☎️",
  battery: "🔋",
  electric_plug: "🔌",
  bulb: "💡",
  flashlight: "🔦",
  tv: "📺",
  radio: "📻",
  satellite: "📡",
  floppy_disk: "💾",
  cd: "💿",
  film_strip: "🎞️",
  envelope: "✉️",
  email: "📧",
  inbox_tray: "📥",
  outbox_tray: "📤",
  package: "📦",
  mailbox: "📫",
  memo: "📝",
  pencil2: "✏️",
  pen: "🖊️",
  paintbrush: "🖌️",
  crayon: "🖍️",
  briefcase: "💼",
  file_folder: "📁",
  open_file_folder: "📂",
  calendar: "📆",
  date: "📅",
  chart_with_upwards_trend: "📈",
  chart_with_downwards_trend: "📉",
  bar_chart: "📊",
  clipboard: "📋",
  pushpin: "📌",
  round_pushpin: "📍",
  paperclip: "📎",
  straight_ruler: "📏",
  scissors: "✂️",
  card_index_dividers: "🗂️",
  newspaper: "📰",
  bookmark: "🔖",
  label: "🏷️",
  book: "📖",
  books: "📚",
  notebook: "📓",
  ledger: "📒",
  page_facing_up: "📄",
  bookmark_tabs: "📑",
  microscope: "🔬",
  telescope: "🔭",
  test_tube: "🧪",
  dna: "🧬",
  wrench: "🔧",
  hammer: "🔨",
  hammer_and_wrench: "🛠️",
  screwdriver: "🪛",
  nut_and_bolt: "🔩",
  gear: "⚙️",
  toolbox: "🧰",
  magnet: "🧲",
  broom: "🧹",
  soap: "🧼",
  key: "🔑",
  old_key: "🗝️",
  lock: "🔒",
  unlock: "🔓",
  closed_lock_with_key: "🔐",
  shield: "🛡️",
  link: "🔗",
  chains: "⛓️",
  syringe: "💉",
  pill: "💊",
  stethoscope: "🩺",
  bell: "🔔",
  no_bell: "🔕",
  mega: "📣",
  loudspeaker: "📢",
  hourglass: "⌛",
  hourglass_flowing_sand: "⏳",
  watch: "⌚",
  alarm_clock: "⏰",
  stopwatch: "⏱️",
  timer_clock: "⏲️",
  clock1: "🕐",
  mag: "🔍",
  mag_right: "🔎",
  moneybag: "💰",
  dollar: "💵",
  credit_card: "💳",
  money_with_wings: "💸",
  coin: "🪙",
  gem: "💎",
  scales: "⚖️",
  crown: "👑",
  tophat: "🎩",
  graduation_cap: "🎓",
  eyeglasses: "👓",
  dark_sunglasses: "🕶️",
  closed_umbrella: "🌂",
  handbag: "👜",
  shopping_cart: "🛒",
  // Flags & signs
  checkered_flag: "🏁",
  triangular_flag_on_post: "🚩",
  white_flag: "🏳️",
  rainbow_flag: "🏳️‍🌈",
  warning: "⚠️",
  no_entry: "⛔",
  no_entry_sign: "🚫",
  white_check_mark: "✅",
  heavy_check_mark: "✔️",
  ballot_box_with_check: "☑️",
  x: "❌",
  negative_squared_cross_mark: "❎",
  question: "❓",
  exclamation: "❗",
  bangbang: "‼️",
  interrobang: "⁉️",
  heavy_plus_sign: "➕",
  heavy_minus_sign: "➖",
  heavy_division_sign: "➗",
  curly_loop: "➰",
  loop: "➿",
  part_alternation_mark: "〽️",
  recycle: "♻️",
  trident: "🔱",
  beginner: "🔰",
  o: "⭕",
  red_circle: "🔴",
  orange_circle: "🟠",
  yellow_circle: "🟡",
  green_circle: "🟢",
  large_blue_circle: "🔵",
  purple_circle: "🟣",
  black_circle: "⚫",
  white_circle: "⚪",
  red_square: "🟥",
  green_square: "🟩",
  blue_square: "🟦",
  arrow_right: "➡️",
  arrow_left: "⬅️",
  arrow_up: "⬆️",
  arrow_down: "⬇️",
  arrows_counterclockwise: "🔄",
  repeat: "🔁",
  fast_forward: "⏩",
  rewind: "⏪",
  arrow_forward: "▶️",
  pause_button: "⏸️",
  stop_button: "⏹️",
  record_button: "⏺️",
  new: "🆕",
  free: "🆓",
  up: "🆙",
  cool: "🆒",
  ok: "🆗",
  sos: "🆘",
  top: "🔝",
  soon: "🔜",
  on: "🔛",
  end: "🔚",
  back: "🔙",
  information_source: "ℹ️",
  id: "🆔",
  copyright: "©️",
  registered: "®️",
  tm: "™️",
  hash: "#️⃣",
  zero: "0️⃣",
  one: "1️⃣",
  two: "2️⃣",
  three: "3️⃣",
  speech_balloon: "💬",
  thought_balloon: "💭",
  wavy_dash: "〰️",
  infinity: "♾️"
};
function zn(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function vo(n = {}) {
  const e = n.map ?? Fs, t = n.trigger ?? ":", u = (n.storedForm ?? "shortcode") !== "unicode", i = zn(t), r = new RegExp(`^${i}([a-z0-9_+-]+)${i}`, "i"), a = new RegExp(`${i}[a-z0-9_+-]+${i}`, "i"), s = /* @__PURE__ */ new WeakSet(), o = (y, f) => `<span class="ew-emoji" data-shortcode="${P(y)}">${P(f)}</span>`, c = (y, f) => {
    if (n.render) return n.render(f, y);
    const h = document.createElement("span");
    return h.className = "ew-emoji", h.setAttribute("data-shortcode", y), h.textContent = f, h;
  }, d = Object.keys(e), l = d.length ? [{
    kind: "inline",
    trigger: new RegExp(`${i}(${d.map(zn).join("|")})${i}$`, "i"),
    apply: (y) => {
      const f = y[1].toLowerCase(), h = e[f] ?? "";
      return u ? c(f, h) : document.createTextNode(h);
    }
  }] : [], p = (y) => {
    !n.render || !u || y.root.querySelectorAll("span[data-shortcode]").forEach((f) => {
      if (s.has(f)) return;
      const h = f.getAttribute("data-shortcode") ?? "", k = e[h.toLowerCase()] ?? f.textContent ?? "", v = n.render(k, h);
      s.add(v), f.replaceWith(v);
    });
  }, w = "​", A = n.autocomplete !== !1, R = new RegExp(`(^|\\s)${i}([a-z0-9_+-]{2,})$`, "i");
  let T = null;
  const G = (y) => {
    const f = y.dom.currentBlock();
    if (!f || f.tagName === "PRE") return null;
    const h = Lu(y.root);
    if (!h) return null;
    const k = R.exec(h.text);
    return k ? { block: h.line, query: k[2].toLowerCase() } : null;
  }, ae = (y) => {
    const f = [], h = [];
    for (const k of Object.keys(e).sort())
      k.startsWith(y) ? f.push(k) : k.includes(y) && h.push(k);
    return [...f, ...h].slice(0, 8);
  }, z = () => {
    T?.close();
  }, ee = (y) => {
    const f = T;
    f && (f.list.textContent = "", f.entries.forEach((h, k) => {
      const v = document.createElement("button");
      v.type = "button", v.className = "ew-menu__item ew-menu__item--emoji" + (k === f.index ? " is-active" : ""), v.setAttribute("role", "option"), v.setAttribute("aria-selected", k === f.index ? "true" : "false");
      const N = document.createElement("span");
      N.className = "ew-emoji-menu__glyph", N.textContent = e[h];
      const C = document.createElement("span");
      C.className = "ew-menu__title", C.textContent = `${t}${h}${t}`, v.appendChild(N), v.appendChild(C), v.addEventListener("mousemove", () => {
        T !== f || !f.mouseArmed || (f.index = k, K());
      }), v.addEventListener("mousedown", ($) => $.preventDefault()), v.addEventListener("click", () => se(y, h)), f.list.appendChild(v);
    }));
  }, K = () => {
    const y = T;
    if (!y) return;
    const f = y.list.querySelectorAll(".ew-menu__item");
    f.forEach((h, k) => {
      h.classList.toggle("is-active", k === y.index), h.setAttribute("aria-selected", k === y.index ? "true" : "false");
    }), st(y.list, f[y.index]);
  }, Ce = (y) => {
    const f = T;
    return !f || f.entries.length === 0 ? !1 : (f.index = (f.index + y + f.entries.length) % f.entries.length, K(), !0);
  }, xe = (y, f) => {
    const h = y.ui.popover({
      anchor: y.dom.selectionRect() ?? f,
      placement: "below",
      render(k) {
        k.classList.add("ew-menu"), k.setAttribute("role", "listbox"), k.addEventListener(
          "mousemove",
          () => {
            T && (T.mouseArmed = !0);
          },
          { once: !0 }
        );
      },
      onClose: () => {
        T = null;
      }
    });
    T = { close: h.close, list: h.el, entries: [], index: 0, mouseArmed: !1 };
  }, ke = (y) => {
    const f = G(y), h = f ? ae(f.query) : [];
    if (!f || h.length === 0) {
      z();
      return;
    }
    T || xe(y, f.block), T && (T.entries = h, T.index = 0, ee(y));
  }, se = (y, f) => {
    const h = G(y);
    if (z(), !h) return;
    const k = e[f];
    k !== void 0 && y.transact(() => {
      const v = Ru(h.block, t.length + h.query.length);
      if (!v) return;
      const N = v.endContainer;
      if (N.nodeType === Node.TEXT_NODE) {
        const C = N.data;
        let $ = v.endOffset;
        for (; $ < C.length && /[a-z0-9_+-]/i.test(C[$]); ) $ += 1;
        v.setEnd(N, $);
      }
      if (v.deleteContents(), u) {
        const C = document.createTextNode(w);
        v.insertNode(C), v.insertNode(c(f, k)), y.dom.placeCaretAfter(C);
      } else {
        const C = document.createTextNode(k);
        v.insertNode(C), y.dom.placeCaretAfter(C);
      }
    });
  }, oe = {
    name: "emoji",
    inputRules: l,
    markdown: {
      marked: [{
        extensions: [{
          name: "emoji",
          level: "inline",
          start: (y) => {
            const f = a.exec(y);
            return f ? f.index : -1;
          },
          tokenizer(y) {
            const f = r.exec(y);
            if (!f) return;
            const h = f[1].toLowerCase(), k = e[h];
            if (k)
              return { type: "emoji", raw: f[0], code: h, glyph: k };
          },
          renderer(y) {
            const f = String(y.code), h = String(y.glyph);
            return u ? o(f, h) : P(h);
          }
        }]
      }],
      turndown: u ? (y) => {
        y.addRule("emoji", {
          filter: (f) => f.nodeName === "SPAN" && f.hasAttribute("data-shortcode"),
          replacement: (f, h) => `${t}${h.getAttribute("data-shortcode") ?? ""}${t}`
        });
      } : void 0
    },
    setup: (y) => {
      if (p(y), !A) return;
      const f = (h) => {
        h.isComposing || ke(y);
      };
      return y.root.addEventListener("input", f), () => {
        y.root.removeEventListener("input", f), z();
      };
    },
    // Bindings act ONLY while the menu is open — otherwise they return false
    // and fall through to the next binding / the structural engine. Tab picks
    // too (Slack muscle memory).
    // Every binding ignores IME composition keydowns (Firefox/Safari deliver
    // the real key with isComposing=true; consuming it would navigate the menu
    // instead of the IME candidate list, or commit a pick mid-composition).
    keymap: A ? {
      ArrowDown: (y, f) => !f.isComposing && Ce(1),
      ArrowUp: (y, f) => !f.isComposing && Ce(-1),
      Enter: (y, f) => !T || f.isComposing ? !1 : (se(y, T.entries[T.index]), !0),
      Tab: (y, f) => !T || f.isComposing ? !1 : (se(y, T.entries[T.index]), !0),
      Escape: (y, f) => !T || f.isComposing ? !1 : (z(), !0)
    } : void 0,
    on: {
      change: (y, f) => p(f),
      ...A ? {
        // Caret left the trigger span (click elsewhere, arrow past it,
        // selection left the editor) → close. Still inside it (ArrowLeft
        // within the query) → REFILTER, so the rows always match what a
        // pick would consume.
        selection: (y, f) => {
          T && (!y || !G(f) ? z() : ke(f));
        },
        blur: () => z()
      } : {}
    }
  };
  return u && (oe.sanitize = { tags: ["span"], attributes: { span: ["data-shortcode"] } }), re(oe);
}
const js = "​", Vs = /^https?:\/\/\S+$/, Ws = /\.(mp4|webm|mov)$/, Gs = /\.(mp3|wav|ogg|m4a)$/, Un = /^[\w-]{6,}$/;
function Fn(n) {
  return n.split(js).join("");
}
function Gu(n) {
  try {
    return new URL(n).hostname;
  } catch {
    return n;
  }
}
function Ks(n) {
  let e;
  try {
    e = new URL(n);
  } catch {
    return { kind: "bookmark" };
  }
  const t = e.hostname.toLowerCase().replace(/^(www|m)\./, "");
  if (t === "youtu.be") {
    const i = e.pathname.split("/").filter(Boolean)[0] ?? "";
    if (Un.test(i)) return { kind: "youtube", id: i };
  }
  if (t === "youtube.com" || t === "music.youtube.com") {
    const i = e.searchParams.get("v");
    if (e.pathname === "/watch" && i && Un.test(i)) return { kind: "youtube", id: i };
    const r = /^\/(?:shorts|embed)\/([\w-]{6,})/.exec(e.pathname);
    if (r) return { kind: "youtube", id: r[1] };
  }
  if (t === "vimeo.com") {
    const i = /^\/(\d+)\/?$/.exec(e.pathname);
    if (i) return { kind: "vimeo", id: i[1] };
  }
  const u = e.pathname.toLowerCase();
  return Ws.test(u) ? { kind: "video" } : Gs.test(u) ? { kind: "audio" } : { kind: "bookmark" };
}
function Ct(n) {
  const e = Fn(n.textContent ?? "").trim();
  if (!Vs.test(e) || n.querySelector("*:not(br):not(a)")) return null;
  const t = n.querySelectorAll("a");
  if (t.length > 1) return null;
  if (t.length === 1) {
    const u = t[0].getAttribute("href") ?? "";
    if (Fn(t[0].textContent ?? "").trim() !== u || u !== e) return null;
  }
  return e;
}
function Zs(n) {
  const e = window.getSelection();
  if (!e) return !1;
  for (let t = 0; t < e.rangeCount; t++) {
    const u = e.getRangeAt(t);
    if (n.contains(u.startContainer) || n.contains(u.endContainer)) return !0;
  }
  return !1;
}
function jn(n, e, t) {
  const u = document.createElement("iframe");
  u.className = "ew-embed__frame", u.src = e, u.title = t, u.setAttribute("allowfullscreen", ""), u.setAttribute("loading", "lazy"), n.appendChild(u);
}
async function Qs(n, e, t) {
  let u = {};
  if (t)
    try {
      u = await t(e) ?? {};
    } catch {
      u = {};
    }
  const i = document.createElement("div");
  if (i.className = "ew-embed__card", u.image) {
    const o = document.createElement("img");
    o.className = "ew-embed__card-thumb", o.src = u.image, o.alt = "", i.appendChild(o);
  }
  const r = document.createElement("div");
  r.className = "ew-embed__card-body";
  const a = document.createElement("div");
  if (a.className = "ew-embed__card-title", a.textContent = u.title || Gu(e), r.appendChild(a), u.description) {
    const o = document.createElement("div");
    o.className = "ew-embed__card-desc", o.textContent = u.description, r.appendChild(o);
  }
  const s = document.createElement("div");
  s.className = "ew-embed__card-url", s.textContent = e, r.appendChild(s), i.appendChild(r), n.appendChild(i);
}
function Xs(n, e) {
  const t = n.getAttribute("data-source") ?? "";
  e.ui.popover({
    anchor: n,
    placement: "below",
    render(u, i) {
      u.classList.add("ew-widget-editor");
      const r = document.createElement("input");
      r.className = "ew-widget-editor__source", r.value = t, r.readOnly = !0, r.setAttribute("aria-label", "embed URL"), u.appendChild(r);
      const a = document.createElement("div");
      a.className = "ew-popover__actions";
      const s = (o, c, d) => {
        const l = document.createElement("button");
        l.type = "button", l.className = c, l.textContent = o, l.addEventListener("click", d), a.appendChild(l);
      };
      s("Open", "ew-popover__btn ew-popover__btn--primary", () => {
        window.open(t, "_blank", "noopener,noreferrer");
      }), s("Turn into link", "ew-popover__btn", () => {
        i(), e.transact(() => {
          const o = document.createElement("p"), c = document.createElement("a");
          c.setAttribute("href", t), c.textContent = Gu(t), o.appendChild(c), n.replaceWith(o), e.dom.placeCaretAtEnd(o);
        });
      }), s("Remove", "ew-popover__btn is-danger", () => {
        i(), e.transact(() => n.remove());
      }), u.appendChild(a);
    }
  });
}
function Eo(n = {}) {
  const e = {
    kind: "embed",
    busyText: "Loading embed…",
    edit: Xs,
    async render(u, i) {
      i.textContent = "";
      const r = Ks(u);
      switch (r.kind) {
        case "youtube":
          jn(i, `https://www.youtube-nocookie.com/embed/${r.id}`, "YouTube video");
          return;
        case "vimeo":
          jn(i, `https://player.vimeo.com/video/${r.id}`, "Vimeo video");
          return;
        case "video": {
          const a = document.createElement("video");
          a.className = "ew-embed__media", a.controls = !0, a.src = u, i.appendChild(a);
          return;
        }
        case "audio": {
          const a = document.createElement("div");
          a.className = "ew-embed__card";
          const s = document.createElement("audio");
          s.className = "ew-embed__media", s.controls = !0, s.src = u, a.appendChild(s), i.appendChild(a);
          return;
        }
        case "bookmark":
          await Qs(i, u, n.fetchMetadata);
      }
    }
  }, t = (u) => {
    const i = [];
    u.root.querySelectorAll(":scope > p").forEach((r) => {
      const a = Ct(r);
      a && !Zs(r) && i.push({ p: r, url: a });
    }), i.length && u.transact(() => {
      for (const { p: r, url: a } of i) r.replaceWith(on("embed", a));
    }), be(u, e);
  };
  return re({
    name: "embeds",
    // setup runs after the constructor value is loaded — one pass here covers
    // the initial document (setMarkdown-silent never fires `change`).
    setup(u) {
      return t(u), cn(u, e);
    },
    on: {
      change: (u, i) => t(i)
    },
    markdown: {
      // No marked extension: a bare URL line is native GFM (autolinked on
      // parse). The turndown twins below write BOTH editor states back to it.
      turndown: (u) => {
        const i = (o) => o.nodeName === "FIGURE" && o.getAttribute("data-widget") === "embed" ? o.getAttribute("data-source") ?? "" : null, r = (o) => o ? `

${o}

` : "";
        u.addRule("embedWidget", {
          filter: (o) => i(o) !== null,
          replacement: (o, c) => r(i(c))
        });
        const a = u.rules, s = a.blankRule.replacement;
        a.blankRule.replacement = (o, c, d) => {
          const l = i(c);
          return l !== null ? r(l) : s(o, c, d);
        }, u.addRule("embedBareUrl", {
          filter: (o) => o.nodeName === "P" && Ct(o) !== null,
          replacement: (o, c) => `

${Ct(c)}

`
        });
      }
    }
  });
}
const Ys = /^\[\^([^\]\s]+)\]:[ \t]*([^\n]*(?:\n(?:[ \t]{4}|\t)[^\n]*)*)/, Js = /^\[\^([^\]\s]+)\]/;
function Ao() {
  let n = /* @__PURE__ */ new Map(), e = [];
  const t = () => {
    n = /* @__PURE__ */ new Map(), e = [];
  }, u = (r, a) => `<sup class="ew-fn-ref"><a href="#fn-${P(r)}" id="fnref-${P(r)}">${a}</a></sup>`, i = () => e.length === 0 ? "" : `
<section class="ew-footnotes"><ol>${e.map((a) => {
    const s = n.get(a);
    return `<li id="fn-${P(a)}" data-fn-id="${P(a)}">${s.html}</li>`;
  }).join("")}</ol></section>
`;
  return re({
    name: "footnote",
    commands: {
      insertFootnote: {
        run: (r) => {
          const a = /* @__PURE__ */ new Set();
          r.root.querySelectorAll("sup.ew-fn-ref a[id], section.ew-footnotes li[data-fn-id]").forEach((c) => {
            const d = (c.getAttribute("id") ?? c.getAttribute("data-fn-id") ?? "").replace(/^fn(?:ref)?-/, "");
            d && a.add(d);
          });
          let s = 1;
          for (; a.has(String(s)); ) s += 1;
          const o = String(s);
          return r.transact(() => {
            const c = document.createElement("sup");
            c.className = "ew-fn-ref";
            const d = document.createElement("a");
            d.setAttribute("href", `#fn-${o}`), d.setAttribute("id", `fnref-${o}`), d.textContent = o, c.appendChild(d);
            const l = typeof window < "u" ? window.getSelection() : null, p = l && l.rangeCount && r.root.contains(l.getRangeAt(0).startContainer) ? l.getRangeAt(0) : null;
            p && (p.collapse(!1), p.insertNode(c), r.dom.placeCaretAfter(c));
            const w = document.createElement("p");
            return w.textContent = `[^${o}]: `, r.root.appendChild(w), !0;
          });
        }
      }
    },
    slashItems: [{
      id: "footnote",
      title: "Footnote",
      hint: "Insert a [^n] reference + definition",
      keywords: ["footnote", "note", "citation", "reference"],
      group: "Advanced",
      command: "insertFootnote"
    }],
    // The trailing section + the ref chips need `section` and a per-item id.
    sanitize: {
      tags: ["section"],
      attributes: { li: ["data-fn-id"], a: ["id"] }
    },
    markdown: {
      marked: [{
        hooks: {
          preprocess(r) {
            return t(), r;
          },
          postprocess(r) {
            return r + i();
          }
        },
        extensions: [
          {
            name: "footnoteDef",
            level: "block",
            start(r) {
              const a = /(?:^|\n)\[\^[^\]\s]+\]:/.exec(r);
              if (a)
                return a[0].startsWith(`
`) ? a.index + 1 : a.index;
            },
            tokenizer(r) {
              const a = Ys.exec(r);
              if (!a) return;
              const s = a[1];
              n.has(s) || (e.push(s), n.set(s, { num: e.length, html: "", filled: !1 }));
              const o = a[2].replace(/\n(?:[ \t]{4}|\t)/g, `
`);
              return {
                type: "footnoteDef",
                raw: a[0],
                fnId: s,
                tokens: this.lexer.inlineTokens(o)
              };
            },
            renderer(r) {
              const a = String(r.fnId), s = n.get(a);
              return s && !s.filled && (s.html = this.parser.parseInline(r.tokens ?? []), s.filled = !0), "";
            }
          },
          {
            name: "footnoteRef",
            level: "inline",
            start: (r) => r.indexOf("[^"),
            tokenizer(r) {
              const a = Js.exec(r);
              if (!a) return;
              const s = n.get(a[1]);
              if (s)
                return { type: "footnoteRef", raw: a[0], fnId: a[1], num: s.num };
            },
            renderer(r) {
              return u(String(r.fnId), Number(r.num));
            }
          }
        ]
      }],
      turndown: (r) => {
        r.addRule("footnoteRef", {
          filter: (a) => a.nodeName === "SUP" && a.classList.contains("ew-fn-ref"),
          replacement: (a, s) => {
            const c = s.querySelector("a");
            return `[^${c?.getAttribute("id")?.replace(/^fnref-/, "") ?? c?.getAttribute("href")?.replace(/^#fn-/, "") ?? ""}]`;
          }
        }), r.addRule("footnoteSection", {
          filter: (a) => a.nodeName === "SECTION" && a.classList.contains("ew-footnotes"),
          replacement: (a, s) => `

` + Array.from(s.querySelectorAll("li")).map((c) => {
            const d = c.getAttribute("data-fn-id") ?? (c.getAttribute("id") ?? "").replace(/^fn-/, ""), l = r.turndown(c.innerHTML).replace(/\n+/g, " ").trim();
            return `[^${d}]: ${l}`;
          }).join(`

`) + `

`
        });
      }
    }
  });
}
const eo = /^!file\[([^\]]*)\]\(([^)]+)\)/, to = /^!unfurl\[([^\]]*)\]\(([^)]+)\)/;
function no(n, e) {
  const t = n || e;
  return `<a class="ew-file" href="${P(e)}" data-file-name="${P(n)}" data-file-url="${P(e)}" target="_blank" rel="noopener noreferrer" contenteditable="false">📎 ${P(t)}</a>`;
}
function uo(n, e) {
  const t = n || e;
  return `<a class="ew-unfurl" href="${P(e)}" data-unfurl-title="${P(n)}" data-unfurl-url="${P(e)}" target="_blank" rel="noopener noreferrer" contenteditable="false">🔗 ${P(t)}</a>`;
}
function io(n, e) {
  if (!e.uploader || typeof document > "u") return;
  const t = document.createElement("input");
  t.type = "file", e.accept && (t.accept = e.accept), t.style.display = "none", document.body.appendChild(t), t.addEventListener("change", () => {
    const u = t.files?.[0];
    t.remove(), u && Promise.resolve(e.uploader(u)).then(
      (i) => {
        const r = typeof i == "string" ? i : i.url, a = typeof i == "string" ? u.name : i.name ?? u.name;
        r && n.exec("insertFile", { name: a, url: r });
      },
      () => n.ui.notify("Upload failed")
    );
  }), t.click();
}
function Co(n = {}) {
  return re({
    name: "file",
    commands: {
      insertFile: {
        run: (e, t) => {
          if (!t?.url) return !1;
          e.markdown.insert(`!file[${t.name ?? ""}](${t.url})`);
        }
      },
      insertUnfurl: {
        run: (e, t) => {
          if (!t?.url) return !1;
          e.markdown.insert(`!unfurl[${t.title ?? ""}](${t.url})`);
        }
      }
    },
    slashItems: n.uploader ? [{
      id: "file",
      title: "File",
      hint: "Attach a file",
      keywords: ["file", "attachment", "attach", "upload", "document"],
      group: "Media",
      run: (e) => io(e, n)
    }] : [],
    // The parsed chips carry data-file-*/data-unfurl-*/contenteditable on <a>.
    sanitize: {
      attributes: {
        a: [
          "contenteditable",
          "data-file-name",
          "data-file-url",
          "data-unfurl-title",
          "data-unfurl-url"
        ]
      }
    },
    markdown: {
      marked: [{
        extensions: [
          {
            name: "file",
            level: "inline",
            start: (e) => e.indexOf("!file["),
            tokenizer(e) {
              const t = eo.exec(e);
              if (t)
                return { type: "file", raw: t[0], fileName: t[1], fileUrl: t[2] };
            },
            renderer(e) {
              return no(String(e.fileName), String(e.fileUrl));
            }
          },
          {
            name: "unfurl",
            level: "inline",
            start: (e) => e.indexOf("!unfurl["),
            tokenizer(e) {
              const t = to.exec(e);
              if (t)
                return { type: "unfurl", raw: t[0], title: t[1], unfurlUrl: t[2] };
            },
            renderer(e) {
              return uo(String(e.title), String(e.unfurlUrl));
            }
          }
        ]
      }],
      turndown: (e) => {
        e.addRule("file", {
          filter: (t) => t.nodeName === "A" && t.classList.contains("ew-file"),
          replacement: (t, u) => {
            const i = u, r = i.getAttribute("data-file-name") ?? "", a = i.getAttribute("data-file-url") ?? i.getAttribute("href") ?? "";
            return `!file[${r}](${a})`;
          }
        }), e.addRule("unfurl", {
          filter: (t) => t.nodeName === "A" && t.classList.contains("ew-unfurl"),
          replacement: (t, u) => {
            const i = u, r = i.getAttribute("data-unfurl-title") ?? "", a = i.getAttribute("data-unfurl-url") ?? i.getAttribute("href") ?? "";
            return `!unfurl[${r}](${a})`;
          }
        });
      }
    }
  });
}
const ro = /^<details([^>]*)>[ \t]*\n?[ \t]*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>[ \t]*(?=\n|$)/;
function St(n, e) {
  return new RegExp(`(?:^|\\s)${e}(?=[\\s=>]|$)`, "i").test(n);
}
function So() {
  return re({
    name: "details",
    commands: {
      insertDetailsBlock: {
        run: (n) => {
          n.markdown.insert(
            `<details data-md-open><summary>Toggle</summary>

Details

</details>`
          );
        }
      }
    },
    slashItems: [{
      id: "details",
      title: "Toggle",
      hint: "Collapsible details block",
      keywords: ["toggle", "details", "collapse", "collapsible", "expand", "accordion"],
      group: "Media",
      command: "insertDetailsBlock"
    }],
    // <details>/<summary> are not in the core floor; `open` is not a global
    // attr. Widen for them (data-md-* markers ride on class/id-adjacent slots).
    sanitize: {
      tags: ["details", "summary"],
      attributes: {
        details: ["open", "data-md-open", "data-md-empty", "data-md-block"]
      }
    },
    markdown: {
      marked: [{
        extensions: [{
          name: "details",
          level: "block",
          start(n) {
            const e = /(?:^|\n)<details[\s>]/.exec(n);
            if (e)
              return e[0].startsWith(`
`) ? e.index + 1 : e.index;
          },
          tokenizer(n) {
            const e = ro.exec(n);
            if (!e) return;
            const t = e[1], u = e[2].trim(), i = e[3].trim();
            return {
              type: "details",
              raw: e[0],
              open: St(t, "open") || St(t, "data-md-open"),
              hasBlock: St(t, "data-md-block"),
              summaryTokens: this.lexer.inlineTokens(u),
              bodyTokens: this.lexer.blockTokens(i)
            };
          },
          renderer(n) {
            const e = this.parser.parseInline(n.summaryTokens ?? []), t = this.parser.parse(n.bodyTokens ?? []);
            return `<details${(n.open ? " open" : "") + (n.hasBlock ? " data-md-block" : "")}><summary>${e}</summary>${t}</details>
`;
          }
        }]
      }],
      turndown: (n) => {
        n.addRule("details", {
          filter: (e) => e.nodeName === "DETAILS",
          replacement: (e, t) => {
            const u = t, i = u.querySelector("summary"), r = u.hasAttribute("open") || u.hasAttribute("data-md-open"), a = u.hasAttribute("data-md-block"), s = (i ? n.turndown(i.innerHTML) : "").replace(/\s+/g, " ").trim(), o = u.cloneNode(!0);
            o.querySelector("summary")?.remove();
            const c = n.turndown(o.innerHTML).trim(), d = s === "";
            let l = "";
            return a && (l += " data-md-block"), r && (l += " data-md-open"), d && (l += " data-md-empty"), `

<details${l}><summary>${s}</summary>${c}</details>

`;
          }
        });
      }
    }
  });
}
export {
  Vu as CALLOUT_KINDS,
  ds as DATA_URL_MAX_BYTES,
  wt as DOWNSCALE_MAX_DIMENSION,
  co as EdodoWrite,
  xa as applyCommand,
  go as callout,
  ot as corePreset,
  Zt as createMarkdownParser,
  Tu as createMarkdownSerializer,
  Ts as createRenderCodec,
  on as createWidget,
  fs as dataUrlUploader,
  _r as decorateTaskLists,
  Fs as defaultEmojiMap,
  re as definePlugin,
  So as detailsToggle,
  ko as diagrams,
  wo as edodoDraw,
  Eo as embeds,
  vo as emoji,
  P as escapeAttr,
  Co as file,
  Ao as footnote,
  bo as highlight,
  Nu as htmlToMarkdown,
  Mt as insertMarkdown,
  kt as isImageFile,
  oo as isInlineActive,
  xo as math,
  be as mountWidgets,
  Qt as parseMarkdown,
  mo as renderMarkdown,
  ho as renderMarkdownWithPlugins,
  Kt as sanitizeHtml,
  yo as tags,
  na as tidyMarkdown,
  fo as toHTML,
  po as toMarkdown,
  lo as toPlainText,
  cn as wireWidgetEditing
};

