import styled from "styled-components";
import { useUser } from "./useUser";
import InitialsAvatar from "../../ui/InitialsAvatar";
import { below } from "../../styles/breakpoints";
import { staffRoleLabel } from "../../utils/constants";

const StyledUserAvatar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
`;

const Avatar = styled.img`
  display: block;
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  outline: 2px solid var(--color-brand-100);
`;

const Who = styled.div`
  line-height: 1.3;

  /* The avatar carries the meaning on a small screen */
  ${below.tablet} {
    display: none;
  }
`;

const Name = styled.p`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Role = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

function UserAvatar() {
  const { user } = useUser();
  const { fullName, avatar } = user.user_metadata;

  return (
    <StyledUserAvatar>
      {avatar ? (
        <Avatar src={avatar} alt={`Avatar of ${fullName}`} />
      ) : (
        <InitialsAvatar name={fullName} />
      )}

      <Who>
        <Name>{fullName}</Name>
        <Role>{staffRoleLabel(user.staff?.role)}</Role>
      </Who>
    </StyledUserAvatar>
  );
}

export default UserAvatar;
