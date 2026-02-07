import { Navigate } from "react-router-dom";

// Redirect /map to /map/risk as the default view
export default function MapRedirect() {
  return <Navigate to="/map/risk" replace />;
}
