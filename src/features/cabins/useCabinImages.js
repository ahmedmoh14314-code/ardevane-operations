import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  addCabinImage,
  deleteCabinImage,
  getCabinImages,
} from "../../services/apiCabins";

export function useCabinImages(cabinId) {
  const { isLoading, data: images, error } = useQuery({
    queryKey: ["cabin-images", cabinId],
    queryFn: () => getCabinImages(cabinId),
    enabled: Boolean(cabinId),
  });

  return { isLoading, images, error };
}

export function useAddCabinImage(cabinId) {
  const queryClient = useQueryClient();

  const { mutate: addImage, isLoading: isAdding } = useMutation({
    mutationFn: (file) => addCabinImage({ cabinId, file }),
    onSuccess: () => {
      toast.success("Image added");
      queryClient.invalidateQueries({ queryKey: ["cabin-images", cabinId] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { addImage, isAdding };
}

export function useDeleteCabinImage(cabinId) {
  const queryClient = useQueryClient();

  const { mutate: removeImage, isLoading: isRemoving } = useMutation({
    mutationFn: deleteCabinImage,
    onSuccess: () => {
      toast.success("Image removed");
      queryClient.invalidateQueries({ queryKey: ["cabin-images", cabinId] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { removeImage, isRemoving };
}
