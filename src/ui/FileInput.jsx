import styled from "styled-components";

const FileInput = styled.input.attrs({ type: "file" })`
  font-size: 1.4rem;
  color: var(--color-grey-500);

  &::file-selector-button {
    font: inherit;
    font-weight: 500;
    padding: 0.8rem 1.4rem;
    margin-right: 1.2rem;
    cursor: pointer;

    color: var(--color-grey-800);
    background-color: var(--color-grey-0);
    border: 1.5px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    transition:
      color 0.2s,
      background-color 0.2s,
      border-color 0.2s;
  }

  &::file-selector-button:hover {
    color: var(--color-brand-700);
    border-color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  }
`;

export default FileInput;
