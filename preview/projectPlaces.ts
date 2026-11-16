/* The countries on the globe in the globe scene (GlobeScene.tsx): where we have worked. Only the
   country is shown, no cases. To add one, add a line with its name (as it should read on the
   globe) and a point on its land (latitude and longitude). `cluster: "nl"` is the Netherlands:
   Almere, Amsterdam and Eindhoven stand together there, and the map on the right shows them apart. */
export type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cluster?: "nl";
  /** which way the name is written from the dot, and how far up (a share of the globe's radius), when
   * it has to be told: countries close together would otherwise write over each other */
  label?: { side: -1 | 1; up: number };
};

export const PLACES: Place[] = [
  { id: "almere", name: "Almere", lat: 52.35, lon: 5.26, cluster: "nl" },
  { id: "amsterdam", name: "Amsterdam", lat: 52.37, lon: 4.9, cluster: "nl" },
  { id: "eindhoven", name: "Eindhoven", lat: 51.44, lon: 5.48, cluster: "nl" },
  { id: "belgium", name: "Belgium", lat: 50.6, lon: 4.6, label: { side: -1, up: 0.2 } },
  { id: "uk", name: "United Kingdom", lat: 53.6, lon: -1.9, label: { side: -1, up: -0.2 } },
  { id: "korea", name: "South Korea", lat: 36.5, lon: 127.9 },
  { id: "australia", name: "Australia", lat: -25.3, lon: 133.8 },
  { id: "dubai", name: "Dubai", lat: 25.2, lon: 55.3 },
  { id: "indonesia", name: "Indonesia", lat: -2.0, lon: 117.5 },
];
