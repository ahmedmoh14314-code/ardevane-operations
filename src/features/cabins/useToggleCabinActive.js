import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { toggleCabinActive } from "../../services/apiCabins";

// Archiving is a single boolean the server never rejects, so the row can flip
// straight away and roll back if the request fails.
export function useToggleCabinActive() {
  const queryClient = useQueryClient();

  const { mutate: toggleActive, isLoading: isToggling } = useMutation({
    mutationFn: toggleCabinActive,

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["cabins"] });

      const previous = queryClient.getQueryData(["cabins"]);

      queryClient.setQueryData(["cabins"], (old) =>
        old?.map((cabin) =>
          cabin.id === id ? { ...cabin, is_active: isActive } : cabin
        )
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["cabins"], context.previous);
      toast.error(err.message);
    },

    onSuccess: (cabin) => {
      toast.success(
        cabin.is_active ? "Cabin is active again" : "Cabin archived"
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
  });

  return { toggleActive, isToggling };
}
