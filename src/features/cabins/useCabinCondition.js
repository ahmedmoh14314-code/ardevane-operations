import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { setCabinCondition } from "../../services/apiCabins";
import { cabinCondition } from "../../utils/operations";

// Ready, dirty, cleaning, out of service. The card changes at once and goes
// back if the request fails, like archiving does.
export function useCabinCondition() {
  const queryClient = useQueryClient();

  const { mutate: changeCondition, isLoading: isChanging } = useMutation({
    mutationFn: setCabinCondition,

    onMutate: async ({ id, condition }) => {
      await queryClient.cancelQueries({ queryKey: ["cabins"] });

      const previous = queryClient.getQueryData(["cabins"]);

      queryClient.setQueryData(["cabins"], (old) =>
        old?.map((cabin) =>
          cabin.id === id ? { ...cabin, condition } : cabin,
        ),
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["cabins"], context.previous);
      toast.error(err.message);
    },

    onSuccess: (cabin) => {
      toast.success(
        `Cabin ${cabin.name} is ${cabinCondition(cabin.condition).label.toLowerCase()}`,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cabins"] });
    },
  });

  return { changeCondition, isChanging };
}
