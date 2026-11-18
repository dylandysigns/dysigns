/** Calls `cb` with the hero's scene ("a", "toB", "b", "toA") now and whenever it changes. The hero
 *  is the `.ph` around `el` (PortalHero.tsx). Things in the opening scene (the agent's orb, the
 *  little globe) use it to stop drawing once that scene is gone: in scene "b" they are faded out,
 *  but still on screen, so an IntersectionObserver alone would keep them going. */
export function watchHeroScene(el: Element | null | undefined, cb: (scene: string) => void): () => void {
  const ph = el?.closest<HTMLElement>(".ph");
  if (!ph) return () => {};
  const read = () => cb(ph.dataset.scene ?? "a");
  read();
  const mo = new MutationObserver(read);
  mo.observe(ph, { attributes: true, attributeFilter: ["data-scene"] });
  return () => mo.disconnect();
}
