import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.split("/")[2] || "dashboard";

  const handlePageChange = (page: string) => {
    navigate(`/admin/${page}`);
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={handlePageChange}>
      <Outlet />
    </AdminLayout>
  );
}
