/**
 * Static ambient backdrop for the content wrapper (Skills → Footer).
 *
 * CSS only — soft red light pools + a very faint dot grid. No JS, no
 * animation, no filters and no background-attachment: fixed, so it costs
 * nothing per frame and simply scrolls with the page. It is the FIRST child
 * of the wrapper (absolute inset-0, z-0) with pointer-events: none, so it
 * always paints behind all content and can never sit above the hero canvas.
 */
export function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        // Soft red light pools, ~600-900px across, alternating left/right
        // at different heights so every section keeps a little glow near
        // its cards. Layered above a faint 1px dot grid (~3% opacity).
        backgroundImage: [
          "radial-gradient(circle 340px at 12% 7%, rgba(225, 6, 0, 0.13), transparent 70%)",
          "radial-gradient(circle 400px at 88% 26%, rgba(180, 8, 8, 0.12), transparent 70%)",
          "radial-gradient(circle 320px at 10% 47%, rgba(225, 6, 0, 0.10), transparent 70%)",
          "radial-gradient(circle 380px at 86% 66%, rgba(200, 8, 8, 0.12), transparent 70%)",
          "radial-gradient(circle 300px at 14% 88%, rgba(225, 6, 0, 0.11), transparent 70%)",
          "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1.5px)",
        ].join(","),
        backgroundSize: "auto, auto, auto, auto, auto, 24px 24px",
        backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat",
      }}
    />
  );
}
