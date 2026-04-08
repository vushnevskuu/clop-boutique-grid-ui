import { Navigate, useParams } from "react-router-dom";

/** Старые ссылки /product/:id ведут на главную с открытием попапа. */
export default function ProductRedirect() {
  const { id } = useParams<{ id: string }>();
  if (id == null || id === "") {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={{ pathname: "/", search: `?item=${encodeURIComponent(id)}` }} replace />;
}
