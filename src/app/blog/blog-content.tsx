"use client";

import { useState } from "react";
import { colors, gradient, heroGradient } from "@/lib/theme";


const categories = ["All", "Career", "Technology", "Industry", "Tutorials"];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string;
  author: string;
  readTime: string;
  featured: boolean;
}

export default function BlogPage({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? posts : posts.filter((p) => p.category === category);

  return (
    <>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section className="py-20 px-6" style={{ background: heroGradient }}>
          <div className="max-w-7xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: `${colors.teal}20`,
                borderColor: `${colors.teal}40`,
                color: colors.teal,
              }}
            >
              Blog &amp; Insights
            </div>
            <h1
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              Insights for <span style={{ color: colors.teal }}>Nepal&apos;s IT Community</span>
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Career advice, industry trends, and practical guides from the Next Minds team.
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 flex-wrap mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={
                    category === cat
                      ? {
                          background: gradient,
                          color: colors.navy,
                          boxShadow: `0 4px 14px ${colors.teal}40`,
                        }
                      : {
                          backgroundColor: colors.surface,
                          color: colors.body,
                          border: `1px solid ${colors.border}`,
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length > 0 && (
              <div
                className="rounded-3xl overflow-hidden mb-10 grid md:grid-cols-2 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 4px 20px rgba(13,45,82,0.07)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.teal}40`;
                  e.currentTarget.style.boxShadow = "0 16px 50px rgba(13,45,82,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(13,45,82,0.07)";
                }}
              >
                <div
                  className="h-64 md:h-auto flex items-center justify-center text-6xl"
                  style={{ background: heroGradient }}
                >
                  {filtered[0].emoji}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex gap-2 mb-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${colors.teal}12`, color: colors.teal }}
                    >
                      {filtered[0].category}
                    </span>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.surface, color: colors.muted }}
                    >
                      Featured
                    </span>
                  </div>
                  <h2
                    className="font-display font-bold text-2xl mb-3 leading-snug"
                    style={{ color: colors.navy }}
                  >
                    {filtered[0].title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: colors.muted }}>
                    {filtered[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs" style={{ color: colors.muted }}>
                      {filtered[0].author} · {filtered[0].readTime}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold px-4 py-2 rounded-lg text-white"
                      style={{ background: gradient }}
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filtered.length > 1 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.slice(1).map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 flex flex-col"
                    style={{
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`,
                      boxShadow: "0 2px 8px rgba(13,45,82,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${colors.teal}40`;
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,45,82,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,45,82,0.05)";
                    }}
                  >
                    <div
                      className="h-32 flex items-center justify-center text-4xl"
                      style={{
                        background: `linear-gradient(135deg, ${colors.navy}ee, #0a3d6eee)`,
                      }}
                    >
                      {post.emoji}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full self-start mb-3"
                        style={{ backgroundColor: `${colors.teal}12`, color: colors.teal }}
                      >
                        {post.category}
                      </span>
                      <h3
                        className="font-display font-bold mb-2 leading-snug"
                        style={{ color: colors.navy }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="text-xs leading-relaxed flex-1 mb-4"
                        style={{ color: colors.muted }}
                      >
                        {post.excerpt}
                      </p>
                      <div
                        className="flex items-center justify-between border-t pt-3"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="text-xs" style={{ color: colors.muted }}>
                          {post.author} · {post.readTime}
                        </div>
                        <button
                          type="button"
                          className="text-xs font-bold"
                          style={{ color: colors.teal }}
                        >
                          Read →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: colors.navy }}>
                  No posts in this category yet
                </h3>
                <p style={{ color: colors.muted }}>
                  Check back soon — new articles are published weekly.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
