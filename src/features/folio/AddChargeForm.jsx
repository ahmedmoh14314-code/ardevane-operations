import { useState } from "react";

import SpinnerMini from "../../ui/SpinnerMini";
import { useServices } from "./useFolio";
import { useAddCharge } from "./useFolioActions";
import { formatCurrency } from "../../utils/helpers";
import { readAmount } from "../../utils/folio";
import {
  AmountField,
  Chip,
  Chips,
  TillForm,
  TillHint,
  TillInput,
  TillLabel,
  TillSubmit,
} from "./tillStyles";

const CUSTOM = "custom";

// Something added to the stay: one of the hotel's services (its price
// filled in, still editable) or anything else, written in
function AddChargeForm({ bookingId, onDone }) {
  const { services, isLoading } = useServices();
  const { addChargeTo, isAddingCharge } = useAddCharge();

  const [choice, setChoice] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const service = services?.find((item) => item.id === choice);
  const text = choice === CUSTOM ? description.trim() : service?.name;
  const value = readAmount(amount);
  const canAdd = Boolean(text) && value !== null && !isAddingCharge;

  function pickService(item) {
    setChoice(item.id);
    setAmount(String(item.price));
  }

  function pickCustom() {
    setChoice(CUSTOM);
    setAmount("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canAdd) return;

    addChargeTo(
      { bookingId, serviceId: service?.id, description: text, amount: value },
      { onSuccess: onDone },
    );
  }

  return (
    <TillForm onSubmit={handleSubmit} aria-label="Add a charge">
      <div>
        <TillLabel as="p">What for</TillLabel>
        {isLoading ? (
          <SpinnerMini />
        ) : (
          <Chips>
            {services?.map((item) => (
              <Chip
                key={item.id}
                aria-pressed={choice === item.id}
                onClick={() => pickService(item)}
              >
                {item.name} <small>{formatCurrency(item.price)}</small>
              </Chip>
            ))}
            <Chip aria-pressed={choice === CUSTOM} onClick={pickCustom}>
              Something else
            </Chip>
          </Chips>
        )}
      </div>

      {choice === CUSTOM && (
        <div>
          <TillLabel htmlFor="charge-description">Description</TillLabel>
          <TillInput
            id="charge-description"
            value={description}
            maxLength={120}
            placeholder="Late checkout, minibar…"
            autoFocus
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      )}

      {choice && (
        <div>
          <TillLabel htmlFor="charge-amount">Amount</TillLabel>
          <AmountField>
            <input
              id="charge-amount"
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
            />
          </AmountField>
          {amount && value === null && (
            <TillHint data-warn="true">
              Enter an amount above zero, like 15 or 12.50.
            </TillHint>
          )}
        </div>
      )}

      <TillSubmit disabled={!canAdd}>
        {isAddingCharge
          ? "Adding…"
          : value !== null && text
            ? `Add ${formatCurrency(value)} to the folio`
            : "Add charge"}
      </TillSubmit>
    </TillForm>
  );
}

export default AddChargeForm;
