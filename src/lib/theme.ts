// Palette from the design canvas (Home / Courses / About artboards).
//
// These are hex rather than the oklch the CSS tokens use, because ~50 call
// sites build translucent variants by string concatenation (`${colors.teal}40`),
// which only works on hex. Each value is the exact sRGB conversion of the
// matching --nm-* token in globals.css - change one, change both.
export const colors = {
  bg: "#ffffff",
  surface: "#f7f8fa",
  card: "#ffffff",
  border: "#dee2e7",
  light: "#d5f8eb",
  navy: "#16273f",
  navyDeep: "#04203a",
  teal: "#00c29a",
  blue: "#0095de",
  /**
   * Darkened variants for TEXT. `teal` and `blue` above are tuned for fills -
   * dots, icon chips, gradients - and teal drops to 2.29:1 as text on white,
   * far under the 4.5:1 AA floor. These pass at 5.29:1. The design canvas
   * follows the same split: it never sets the fill teal as a text colour.
   */
  tealInk: "#007780",
  blueInk: "#006aa5",
  green: "#00b667",
  heading: "#16273f",
  body: "#414853",
  muted: "#5c646f",
  mutedSoft: "#6a727e",
  orange: "#ee9748",
} as const;

/**
 * Section gradients from the design canvas.
 *
 * `statGradient` is clipped to TEXT (the stat numbers), so it runs darker than
 * the button gradient - the button teal is only 2.29:1 on white and would be
 * unreadable as type. `ctaGradient` is the full-bleed dark band behind the
 * closing call to action.
 */
/** The pale mint-to-white wash behind the hero and page headers. */
export const heroWash = "linear-gradient(180deg, #e8f8f5, #ffffff 65%)";

export const statGradient = "linear-gradient(135deg, #009993, #0077bd)";
export const ctaGradient = "linear-gradient(135deg, #003546, #04203a)";
/** Muted teal + slate used for text ON the dark CTA band. */
export const ctaEyebrow = "#6dd3c0";
export const ctaBody = "#c0d1d7";
/** The lighter of the two rules - hairline dividers between full-width bands. */
export const borderSoft = "#e8ebef";

export const gradient = `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`;

// Dark hero / CTA panel used across the Figma pages.
export const heroGradient = `linear-gradient(135deg, ${colors.navy}, #0a3d6e)`;
