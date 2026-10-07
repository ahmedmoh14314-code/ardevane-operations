import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { login as loginApi } from "../../services/apiAuth";
import { LOGIN_LEAVE_MS } from "../../utils/motion";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),

    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);

      // The card leaves first and the welcome splash takes over. With
      // reduced motion turned on, both still happen, as a plain fade.
      setIsLeaving(true);

      setTimeout(
        () =>
          navigate("/dashboard", { replace: true, state: { welcome: true } }),
        LOGIN_LEAVE_MS,
      );
    },

    onError: (err) => toast.error(err.message),
  });

  return { login, isLoading, isLeaving };
}
