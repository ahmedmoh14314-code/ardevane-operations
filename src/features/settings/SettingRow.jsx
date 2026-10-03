import styled from "styled-components";
import { below } from "../../styles/breakpoints";

const StyledSettingRow = styled.div`
  display: grid;
  grid-template-columns: 6.4rem 1fr auto;
  align-items: center;
  gap: 2.4rem;
  padding: 2.4rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  ${below.tablet} {
    grid-template-columns: 4.8rem 1fr;
    align-items: start;
    gap: 1.6rem;
    padding: 2rem 0;

    /* The stepper drops under the text and takes the full width */
    & > :last-child {
      grid-column: 1 / -1;
      display: flex;
    }

    & > :last-child input {
      flex: 1;
    }
  }
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: var(--color-${(props) => props.$color}-100);

  & svg {
    width: 2.8rem;
    height: 2.8rem;
    color: var(--color-${(props) => props.$color}-700);
  }

  ${below.tablet} {
    & svg {
      width: 2.2rem;
      height: 2.2rem;
    }
  }
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);

  ${below.tablet} {
    font-size: 1.7rem;
  }
`;

const Description = styled.p`
  margin-top: 0.2rem;
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

// One setting: an icon, what it is, what it does, and the control for it
function SettingRow({ icon, color, title, description, children }) {
  return (
    <StyledSettingRow>
      <Icon $color={color} aria-hidden="true">
        {icon}
      </Icon>

      <div>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </div>

      {children}
    </StyledSettingRow>
  );
}

export default SettingRow;
