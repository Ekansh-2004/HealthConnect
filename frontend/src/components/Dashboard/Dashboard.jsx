import AdolescentDashboard from "./AdolescentDashboard";
import AdultDashboard from "./AdultDashboard";
import HealthcareDashboard from "./HealthcareDashboard";

const Dashboard = () => {
	const user = { role: "adult" };

	if (!user) return null;

	switch (user.role) {
		case "adolescent":
			return <AdolescentDashboard />;
		case "adult":
			return <AdultDashboard />;
		case "healthcare_professional":
			return <HealthcareDashboard />;
		default:
			return <AdultDashboard />;
	}
};

export default Dashboard;
