import { createBrowserRouter } from "react-router";
import { Login } from "./components/Login";
import { Survey } from "./components/Survey";
import { Result } from "./components/Result";
import { AdminResults } from "./components/AdminResults";
import { ProtectedRoute } from "./components/ProtectedRoute";

function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#2d3748' }}>페이지를 찾을 수 없습니다</h1>
        <p className="text-lg mb-8" style={{ color: '#718096' }}>요청하신 페이지가 존재하지 않습니다.</p>
        <a 
          href="/login" 
          className="px-6 py-3 rounded-md text-white font-medium"
          style={{ background: '#4a5568' }}
        >
          로그인 페이지로 이동
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/survey",
    element: (
      <ProtectedRoute>
        <Survey />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/result/:surveyId",
    element: (
      <ProtectedRoute>
        <Result />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminResults />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "*",
    element: <ErrorPage />
  }
]);