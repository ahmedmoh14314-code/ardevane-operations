import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";

export function useUser() {
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  // Being signed in is not enough: guests have accounts too
  return { isLoading, user, isStaff: Boolean(user?.staff) };
}
