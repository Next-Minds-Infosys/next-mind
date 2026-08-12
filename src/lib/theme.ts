// Palette from the Figma reference site (kit-storm-14785969.figma.site).
export const colors = {
  bg: "#ffffff",
  surface: "#f4f9fc",
  card: "#ffffff",
  border: "#deeaf4",
  light: "#e8f5f5",
  navy: "#0d2d52",
  teal: "#00bdb8",
  blue: "#1a7fe8",
  /**
   * Darkened variants for TEXT. `teal` and `blue` above are tuned for fills -
   * dots, icon chips, gradients - and drop to ~2.3:1 and ~3.6:1 as text on a
   * light background, both under the 4.5:1 AA floor. These match --teal-600 /
   * --blue-600 in globals.css. Spec §1.7.
   */
  tealInk: "#0f766e",
  blueInk: "#1868a8",
  green: "#52c85a",
  heading: "#0d2d52",
  body: "#3d5166",
  muted: "#7a90a8",
  orange: "#f4a44a",
} as const;

export const gradient = `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`;

// Dark hero / CTA panel used across the Figma pages.
export const heroGradient = `linear-gradient(135deg, ${colors.navy}, #0a3d6e)`;
