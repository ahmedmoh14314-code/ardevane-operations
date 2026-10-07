import { useMutation } from "@tanstack/react-query";
import { createStaffMember } from "../../services/apiAuth";
import { toast } from "react-hot-toast";

export function useSignup() {
  const { mutate: signup, isLoading } = useMutation({
    mutationFn: createStaffMember,
    onSuccess: () => {
      toast.success(
        "Added to the team. They can sign in once they confirm their email address.",
      );
    },
    onError: (err) => toast.error(err.message),
  });

  return { signup, isLoading };
}
