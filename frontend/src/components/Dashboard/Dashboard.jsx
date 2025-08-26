import { useUserStore } from "../../store/useUserStore";
import AdolescentDashboard from "./AdolescentDashboard";
import AdultDashboard from "./AdultDashboard";
import HealthcareDashboard from "./HealthcareDashboard";

const Dashboard = () => {
	const { user } = useUserStore();

	if (!user) return null;

	switch (user?.userType) {
		case "adolescent":
			return <AdolescentDashboard />;
		case "adult":
			return <AdultDashboard />;
		case "health_prof":
			return <HealthcareDashboard />;
		default:
			return <AdultDashboard />;
	}
};

export default Dashboard;
