"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CurriculumModule, Faq } from "@/db/models/course";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createCourse, updateCourse } from "./actions";

export interface CourseFormInitial {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  shortDesc: string | null;
  contentMd: string;
  tools: string[];
  whoIsItFor: string[];
  skills: string[];
  curriculum: CurriculumModule[];
  faqs: Faq[];
  badge: string | null;
  color: string | null;
  students: number;
  duration: string;
  level: string;
  price: number;
  imageUrl: string | null;
  mentorId: string | null;
  published: boolean;
}

interface CourseFormProps {
  initial?: CourseFormInitial;
  categories: { id: string; name: string }[];
  mentors: { id: string; name: string }[];
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";
const labelClass = "text-sm font-medium text-gray-700";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "description", label: "Description" },
  { id: "curriculum", label: "Curriculum" },
  { id: "content", label: "Content & FAQs" },
] as const;

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function CourseForm({ initial, categories, mentors }: CourseFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [mentorId, setMentorId] = useState(initial?.mentorId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [contentMd, setContentMd] = useState(initial?.contentMd ?? "");
  const [tools, setTools] = useState((initial?.tools ?? []).join(", "));
  // Newline-separated: these entries contain commas, so comma-splitting them
  // would shred the sentences.
  const [whoIsItFor, setWhoIsItFor] = useState((initial?.whoIsItFor ?? []).join("\n"));
  const [skills, setSkills] = useState((initial?.skills ?? []).join("\n"));
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>(initial?.curriculum ?? []);
  const [faqs, setFaqs] = useState<Faq[]>(initial?.faqs ?? []);
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [color, setColor] = useState(initial?.color ?? "#00bdb8");
  const [students, setStudents] = useState(String(initial?.students ?? 0));
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [level, setLevel] = useState(initial?.level ?? LEVEL_OPTIONS[0]);
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLastStep = step === STEPS.length - 1;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    setError("");
    setLoading(true);

    const input = {
      title,
      categoryId,
      description,
      shortDesc,
      contentMd,
      tools: tools
        .split(",")
        .map((tool) => tool.trim())
        .filter(Boolean),
      whoIsItFor: toLines(whoIsItFor),
      skills: toLines(skills),
      curriculum: curriculum.map((m) => ({ ...m, topics: m.topics.filter(Boolean) })),
      faqs,
      badge,
      color,
      students: Number(students) || 0,
      duration,
      level,
      price: Number(price) || 0,
      imageUrl,
      mentorId,
      published,
    };

    const result = initial ? await updateCourse(initial.id, input) : await createCourse(input);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ol className="flex items-center">
        {STEPS.map((s, i) => (
          <li key={s.id} className={`flex items-center ${i === STEPS.length - 1 ? "" : "flex-1"}`}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className="flex items-center gap-2.5 shrink-0"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i === step
                    ? "bg-gradient-to-br from-teal-500 to-blue-600 text-white"
                    : i < step
                      ? "bg-teal-50 text-teal-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check size={15} /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  i === step ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i !== STEPS.length - 1 && (
              <span className={`mx-3 h-px flex-1 ${i < step ? "bg-teal-200" : "bg-gray-100"}`} />
            )}
          </li>
        ))}
      </ol>

      <div className="max-h-[60vh] overflow-y-auto pr-1">
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className={labelClass} htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="MERN Stack Development"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass}
                >
                  {categories.length === 0 && <option value="">No categories yet</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="mentor">
                  Mentor
                </label>
                <select
                  id="mentor"
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="level">
                  Level
                </label>
                <select
                  id="level"
                  required
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClass}
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="duration">
                  Duration
                </label>
                <input
                  id="duration"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="16 weeks"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="NPR 45,000"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="badge">
                  Badge
                </label>
                <input
                  id="badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Most Popular"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="students">
                  Students enrolled
                </label>
                <input
                  id="students"
                  type="number"
                  min={0}
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="color">
                  Accent colour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#00bdb8"
                    className={inputClass}
                  />
                  <input
                    type="color"
                    aria-label="Pick accent colour"
                    value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#00bdb8"}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="imageUrl">
                Image URL
              </label>
              <input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Published
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="shortDesc">
                Short description{" "}
                <span className="font-normal text-gray-500">(shown on the course card)</span>
              </label>
              <textarea
                id="shortDesc"
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="One line summary for course cards and listings"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="description">
                Full description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview shown on the course detail page"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="tools">
                Tools &amp; technologies
              </label>
              <input
                id="tools"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="React, Node.js, MongoDB"
                className={inputClass}
              />
              <p className="text-xs text-gray-400">Comma-separated</p>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="whoIsItFor">
                Who is it for
              </label>
              <textarea
                id="whoIsItFor"
                rows={4}
                value={whoIsItFor}
                onChange={(e) => setWhoIsItFor(e.target.value)}
                placeholder={"One per line\nFresh graduates looking to enter the tech industry"}
                className={inputClass}
              />
              <p className="text-xs text-gray-500">One per line.</p>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="skills">
                Skills taught
              </label>
              <textarea
                id="skills"
                rows={4}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder={"One per line\nReact.js"}
                className={inputClass}
              />
              <p className="text-xs text-gray-500">One per line.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={labelClass}>Curriculum</span>
              <button
                type="button"
                onClick={() => setCurriculum((mods) => [...mods, { title: "", topics: [] }])}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-teal-600 hover:bg-teal-50"
              >
                <Plus size={14} /> Add module
              </button>
            </div>

            {curriculum.length === 0 && (
              <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                No modules yet.
              </p>
            )}

            <div className="space-y-3">
              {curriculum.map((mod, index) => (
                <div key={index} className="space-y-2 rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-gray-500 ring-1 ring-gray-950/5">
                      {index + 1}
                    </span>
                    <input
                      value={mod.title}
                      onChange={(e) =>
                        setCurriculum((mods) =>
                          mods.map((m, i) => (i === index ? { ...m, title: e.target.value } : m)),
                        )
                      }
                      placeholder="Module title"
                      aria-label={`Module ${index + 1} title`}
                      className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setCurriculum((mods) => mods.filter((_, i) => i !== index))}
                      aria-label={`Remove module ${index + 1}`}
                      className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={mod.topics.join("\n")}
                    onChange={(e) =>
                      setCurriculum((mods) =>
                        mods.map((m, i) =>
                          i === index ? { ...m, topics: e.target.value.split("\n") } : m,
                        ),
                      )
                    }
                    placeholder={"Topics, one per line"}
                    aria-label={`Module ${index + 1} topics`}
                    className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="contentMd">
                Full content
              </label>
              <RichTextEditor
                value={contentMd}
                onChange={setContentMd}
                placeholder="Curriculum, outcomes, who it's for…"
              />
              <p className="text-xs text-gray-500">
                Saved as Markdown to <code className="text-gray-600">contentMd</code>. Rendered as
                the &quot;About this course&quot; section on the public course page.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelClass}>FAQs</span>
                <button
                  type="button"
                  onClick={() => setFaqs((list) => [...list, { q: "", a: "" }])}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-teal-600 hover:bg-teal-50"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              </div>

              {faqs.length === 0 && (
                <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  No FAQs yet.
                </p>
              )}

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2 rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={faq.q}
                        onChange={(e) =>
                          setFaqs((list) =>
                            list.map((f, i) => (i === index ? { ...f, q: e.target.value } : f)),
                          )
                        }
                        placeholder="Question"
                        aria-label={`FAQ ${index + 1} question`}
                        className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFaqs((list) => list.filter((_, i) => i !== index))}
                        aria-label={`Remove FAQ ${index + 1}`}
                        className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) =>
                        setFaqs((list) =>
                          list.map((f, i) => (i === index ? { ...f, a: e.target.value } : f)),
                        )
                      }
                      placeholder="Answer"
                      aria-label={`FAQ ${index + 1} answer`}
                      className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step === 0 ? router.push("/admin/courses") : setStep((s) => s - 1))}
          disabled={loading}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : isLastStep ? (
            initial ? (
              "Save Changes"
            ) : (
              "Create Course"
            )
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </form>
  );
}
