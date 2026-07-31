import { RouterProvider, type DataRouter } from "react-router";
import { router } from "./routes";

// App is only ever rendered client-side (see src/main.tsx), where `router`
// is always defined — see the guard comment in ./routes.
export default function App() {
  return <RouterProvider router={router as DataRouter} />;
}
