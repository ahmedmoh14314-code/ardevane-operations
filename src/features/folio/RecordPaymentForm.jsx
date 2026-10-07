import { useState } from "react";

import { useRecordPayment } from "./useFolioActions";
import { formatCurrency } from "../../utils/helpers";
import { readAmount } from "../../utils/folio";
import {
  AmountField,
  Chip,
  Chips,
  TillForm,
  TillHint,
  TillLabel,
  TillSubmit,
} from "./tillStyles";

// Cash taken at the desk. It starts at what is still owed; the guest may
// pay part of it now and the rest later.
function RecordPaymentForm({ bookingId, remaining, onDone }) {
  const { recordPaymentFor, isRecordingPayment } = useRecordPayment();
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : "");

  const value = readAmount(amount);
  const canRecord = value !== null && !isRecordingPayment;
  const isMoreThanOwed = value !== null && value > Math.max(remaining, 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canRecord) return;

    recordPaymentFor({ bookingId, amount: value }, { onSuccess: onDone });
  }

  return (
    <TillForm onSubmit={handleSubmit} aria-label="Record a cash payment">
      <div>
        <TillLabel htmlFor="payment-amount">Cash received</TillLabel>
        <AmountField>
          <input
            id="payment-amount"
            inputMode="decimal"
            value={amount}
            placeholder="0"
            autoFocus
            onChange={(e) => setAmount(e.target.value)}
          />
        </AmountField>
      </div>

      {remaining > 0 && (
        <Chips>
          <Chip
            aria-pressed={value === remaining}
            onClick={() => setAmount(String(remaining))}
          >
            Whole balance <small>{formatCurrency(remaining)}</small>
          </Chip>
          {remaining >= 2 && (
            <Chip
              aria-pressed={value === Math.round(remaining * 50) / 100}
              onClick={() =>
                setAmount(String(Math.round(remaining * 50) / 100))
              }
            >
              Half now
            </Chip>
          )}
        </Chips>
      )}

      {amount && value === null && (
        <TillHint data-warn="true">
          Enter an amount above zero, like 100 or 49.50.
        </TillHint>
      )}
      {isMoreThanOwed && (
        <TillHint data-warn="true">
          That is {formatCurrency(value - Math.max(remaining, 0))} more than is
          owed.
        </TillHint>
      )}

      <TillSubmit disabled={!canRecord}>
        {isRecordingPayment
          ? "Recording…"
          : value !== null
            ? `Record ${formatCurrency(value)} cash`
            : "Record payment"}
      </TillSubmit>
    </TillForm>
  );
}

export default RecordPaymentForm;
