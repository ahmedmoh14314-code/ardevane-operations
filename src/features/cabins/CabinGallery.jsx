import styled from "styled-components";
import { HiOutlineTrash } from "react-icons/hi2";

import {
  useAddCabinImage,
  useCabinImages,
  useDeleteCabinImage,
} from "./useCabinImages";

import Spinner from "../../ui/Spinner";
import FileInput from "../../ui/FileInput";
import ErrorMessage from "../../ui/ErrorMessage";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 1.2rem;
  margin-bottom: 1.2rem;
`;

const Thumb = styled.div`
  position: relative;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  aspect-ratio: 3 / 2;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CoverBadge = styled.span`
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;

  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-tiny);

  color: var(--color-brand-50);
  background-color: var(--color-brand-600);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;

  border: none;
  border-radius: var(--border-radius-sm);
  padding: 0.4rem;
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);

  display: flex;

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-red-700);
  }
`;

const Hint = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

// The gallery only exists once a cabin has been saved, because every image
// row needs a cabinId to point at.
function CabinGallery({ cabinId, cabinName }) {
  const { images, isLoading, error } = useCabinImages(cabinId);
  const { addImage, isAdding } = useAddCabinImage(cabinId);
  const { removeImage, isRemoving } = useDeleteCabinImage(cabinId);

  if (!cabinId)
    return <Hint>Save the cabin first, then add more photos to it.</Hint>;

  if (isLoading) return <Spinner />;

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;

  function handleAdd(e) {
    const file = e.target.files?.[0];

    if (file) addImage(file);

    e.target.value = "";
  }

  return (
    <div>
      <Grid>
        {images.map((image, index) => (
          <Thumb key={image.id}>
            <img
              src={image.url}
              alt={`Cabin ${cabinName}, ${index + 1} of ${images.length}`}
              loading="lazy"
            />

            {index === 0 && <CoverBadge>Cover</CoverBadge>}

            <RemoveButton
              type="button"
              disabled={isRemoving}
              onClick={() => removeImage(image.id)}
              aria-label={`Remove photo ${index + 1}`}
            >
              <HiOutlineTrash />
            </RemoveButton>
          </Thumb>
        ))}
      </Grid>

      <FileInput
        accept="image/*"
        disabled={isAdding}
        onChange={handleAdd}
        aria-label="Add a cabin photo"
      />

      <Hint>The first photo is used as the cover.</Hint>
    </div>
  );
}

export default CabinGallery;
