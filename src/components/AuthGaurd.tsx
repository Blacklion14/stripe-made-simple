// AuthGuard.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "@/services/api";
import { resetAuth, setUser } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store";

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  useEffect(() => {
    async function fetchData() {
      await authApi
        .getCurrentUser()
        .then((data: any) => {
          dispatch(
            setUser({
              user: {
                id: data.userId,
                email: data.email,
                name: data.firstName + " " + data.lastName,
                emailVerified: data.emailVerified,
                createdAt: data.createdAt,
              },
              isAuthenticated: true,
              workspaceId: data.workspaceId,
              isLoading: false,
              error: "",
            }),
          );
          navigate(location.pathname, { replace: true });
        })
        .catch((err) => {
          dispatch(resetAuth());
          navigate("/login", { replace: true });
        });
    }
    fetchData();
  }, []);

  return children;
};

export default AuthGuard;
