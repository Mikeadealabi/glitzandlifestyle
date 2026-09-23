import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/** Story body (Markdown) to safe HTML. Editors are trusted, but pasted snippets still can't inject script. */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ["p", "br", "strong", "em", "blockquote", "ul", "ol", "li", "h2", "h3", "a", "img", "hr"],
    allowedAttributes: { a: ["href", "title", "rel", "target"], img: ["src", "alt", "loading"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_t, a) =>
        /^https?:/i.test(a.href ?? "")
          ? { tagName: "a", attribs: { ...a, rel: "noopener noreferrer", target: "_blank" } }
          : { tagName: "a", attribs: a },
      img: (_t, a) => ({ tagName: "img", attribs: { ...a, loading: "lazy", alt: a.alt ?? "" } }),
    },
  });
}

export function readMinutes(md: string): number {
  return Math.max(1, Math.round((md ?? "").split(/\s+/).filter(Boolean).length / 220));
}
