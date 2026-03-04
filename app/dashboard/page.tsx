import DashboardOverview from "@/components/DashboardComponent/DashboardOverview/DashboardOverview";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
         <ProtectedRoute>
           <DashboardOverview/>
         </ProtectedRoute>
    </div>
  );
}