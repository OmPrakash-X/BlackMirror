import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "@/redux/slices/userSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const useGetUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/api/user/me`);
        if (response.data?.user) {
          dispatch(setUserData(response.data.user));
        }
      } catch (err: any) {
        console.error(err.response?.data?.message || "Failed to fetch user")
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default useGetUser;
