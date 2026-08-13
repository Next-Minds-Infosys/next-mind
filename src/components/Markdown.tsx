import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * The one place admin-authored markdown gets rendered.
 *
 * Course bodies and blog posts each called ReactMarkdown directly with their
 * own wrapper classes, and the two had already diverged: the course page
 * carried a long inline `[&_h1]:...` chain, the blog page pointed at an
 * `.nm-prose` class that did not exist. Neither styled tables.
 *
 * Styling lives in `.nm-prose` in globals.css.
 */
export default function Markdown({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`nm-prose ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // A wide table has to scroll inside its own box. Without this the
          // page itself scrolls sideways on a phone, which breaks the layout
          // for every other element too.
          table: ({ children: c }) => (
            <div className="nm-prose-table-wrap">
              <table>{c}</table>
            </div>
          ),
          // Authored links to other sites should not silently hand over the
          // referrer or opener.
          a: ({ href, children: c }) => {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {c}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
