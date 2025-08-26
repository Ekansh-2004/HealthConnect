import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import ConsultationsPage from "./components/Consultations/ConsultationsPage";
import Dashboard from "./components/Dashboard/Dashboard";
import Layout from "./components/Layout/Layout";
import LearnPage from "./components/Learn/LearnPage";
import StoriesPage from "./components/Stories/StoriesPage";

import { useEffect } from "react";
import { useUserStore } from "./store/useUserStore.jsx";

const AppContent = () => {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	return (
		<Router>
			<Routes>
				<Route
					path="/login"
					element={
						!user ? (
							<LoginForm />
						) : (
							<Navigate
								to="/dashboard"
								replace
							/>
						)
					}
				/>
				<Route
					path="/signup"
					element={
						!user ? (
							<SignupForm />
						) : (
							<Navigate
								to="/dashboard"
								replace
							/>
						)
					}
				/>

				<Route
					path="/"
					element={<Layout />}
				>
					<Route
						index
						element={
							<Navigate
								to="/dashboard"
								replace
							/>
						}
					/>
					<Route
						path="dashboard"
						element={<Dashboard />}
					/>
					<Route
						path="learn"
						element={<LearnPage />}
					/>
					<Route
						path="stories"
						element={<StoriesPage />}
					/>
					<Route
						path="consultations"
						element={<ConsultationsPage />}
					/>
					<Route
						path="admin"
						element={<Dashboard />}
					/>
				</Route>

				<Route
					path="*"
					element={
						<Navigate
							to={user ? "/dashboard" : "/login"}
							replace
						/>
					}
				/>
			</Routes>
		</Router>
	);
};

function App() {
	return <AppContent />;
}

export default App;
