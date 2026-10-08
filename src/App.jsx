import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./ui/ProtectedRoute";
import SpinnerFullPage from "./ui/SpinnerFullPage";
import { DarkModeProvider } from "./context/DarkModeContext";

// Every page is loaded on demand, so opening the login screen no longer
// downloads the dashboard charts with it.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Booking = lazy(() => import("./pages/Booking"));
const Checkin = lazy(() => import("./pages/Checkin"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Cabins = lazy(() => import("./pages/Cabins"));
const Requests = lazy(() => import("./pages/Requests"));
const Guests = lazy(() => import("./pages/Guests"));
const Guest = lazy(() => import("./pages/Guest"));
const Team = lazy(() => import("./pages/Team"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

// One cache shared by every query in the app.
// A minute of stale time stops a refetch on every single navigation, while
// still keeping operations data fresh enough to act on.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <GlobalStyles />
        <BrowserRouter>
          <Suspense fallback={<SpinnerFullPage />}>
            <Routes>
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate replace to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="bookings" element={<Bookings />} />
                <Route path="bookings/:bookingId" element={<Booking />} />
                <Route path="checkin/:bookingId" element={<Checkin />} />

                <Route path="calendar" element={<Calendar />} />
                <Route path="cabins" element={<Cabins />} />
                <Route path="requests" element={<Requests />} />

                <Route path="guests" element={<Guests />} />
                <Route path="guests/:guestId" element={<Guest />} />

                <Route path="team" element={<Team />} />
                {/* The old name, kept so existing links still land somewhere */}
                <Route path="users" element={<Navigate replace to="/team" />} />

                <Route path="settings" element={<Settings />} />
                <Route path="account" element={<Account />} />
              </Route>

              <Route path="login" element={<Login />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>

        {/* A small dark pill that rises from the bottom, then goes */}
        <Toaster
          position="bottom-center"
          gutter={10}
          containerStyle={{ bottom: 28 }}
          toastOptions={{
            success: {
              duration: 3000,
              iconTheme: { primary: "#7fd1a6", secondary: "#1b241f" },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: "#f0a58c", secondary: "#1b241f" },
            },
            style: {
              fontSize: "14.5px",
              fontWeight: 500,
              maxWidth: "460px",
              padding: "10px 18px 10px 14px",
              borderRadius: "999px",
              backgroundColor: "#1b241f",
              color: "#f4ede2",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
