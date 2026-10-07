import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: ({ user }) => {
      toast.success("User account successfully updated");
      // The update returns the bare account; keep the staff membership
      queryClient.setQueryData(["user"], (current) => ({
        ...user,
        staff: current?.staff,
      }));
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateUser, isUpdating };
}
