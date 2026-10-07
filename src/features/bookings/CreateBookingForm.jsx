import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addDays } from "date-fns";

import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";

import { useCabins } from "../cabins/useCabins";
import { useSettings } from "../settings/useSettings";
import { useBookingQuote } from "./useBookingQuote";
import { useCreateStaffBooking } from "./useCreateStaffBooking";
import { formatCurrency, toISODate, todayISO } from "../../utils/helpers";

const Title = styled(Heading)`
  margin-bottom: 2.4rem;
`;

// The price, or why the stay can't be booked, straight from the database
const Quote = styled.p`
  font-size: 1.5rem;
  padding: 1.4rem 1.8rem;
  border-radius: var(--border-radius-md);
  color: ${(props) =>
    props.$refused ? "var(--color-red-700)" : "var(--color-grey-700)"};
  background-color: ${(props) =>
    props.$refused ? "var(--color-red-100)" : "var(--color-brand-50)"};

  & strong {
    font-family: var(--font-numbers);
    font-variant-numeric: tabular-nums;
  }
`;

const Hint = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

const SOURCES = [
  { value: "walk_in", label: "Walk-in, at the desk" },
  { value: "phone", label: "By phone" },
];

// A booking made by the front desk for a guest at the desk or on the phone.
// The database applies exactly the same rules as on the guest website (open
// cabin, house rules, capacity, free nights) and works out the price.
function CreateBookingForm({ onCloseModal }) {
  const navigate = useNavigate();
  const { cabins } = useCabins();
  const { settings } = useSettings();
  const { isBooking, createStaffBooking } = useCreateStaffBooking();

  const openCabins = (cabins ?? []).filter((cabin) => cabin.is_active);

  const today = todayISO();
  const firstDeparture = toISODate(
    addDays(new Date(), settings?.minBookingLength ?? 1),
  );

  const { register, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      source: "walk_in",
      startDate: today,
      endDate: firstDeparture,
      numGuests: 2,
    },
  });
  const { errors } = formState;

  const { cabinId, startDate, endDate, numGuests } = watch();
  const { isComplete, isFetching, quote, error } = useBookingQuote({
    cabinId,
    startDate,
    endDate,
    numGuests,
  });

  function onSubmit(data) {
    createStaffBooking(
      {
        ...data,
        cabinId: Number(data.cabinId),
        numGuests: Number(data.numGuests),
      },
      {
        onSuccess: (booking) => {
          onCloseModal?.();
          navigate(`/bookings/${booking.id}`);
        },
      },
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="modal">
      <Title as="h2">New booking</Title>

      <FormRow label="Booked">
        <Select id="source" options={SOURCES} {...register("source")} />
      </FormRow>

      <FormRow label="Guest name" error={errors?.guestFullName?.message}>
        <Input
          id="guestFullName"
          disabled={isBooking}
          {...register("guestFullName", { required: "Who is staying?" })}
        />
      </FormRow>

      <FormRow label="Guest email" error={errors?.guestEmail?.message}>
        <Input
          id="guestEmail"
          type="email"
          disabled={isBooking}
          {...register("guestEmail", {
            required: "We need an email for every guest",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please provide a valid email address",
            },
          })}
        />
      </FormRow>

      <FormRow label="Cabin" error={errors?.cabinId?.message}>
        <Select
          id="cabinId"
          disabled={isBooking}
          options={[
            { value: "", label: "Choose a cabin…" },
            ...openCabins.map((cabin) => ({
              value: cabin.id,
              label: `Cabin ${cabin.name} · sleeps ${cabin.maxCapacity}`,
            })),
          ]}
          {...register("cabinId", { required: "Choose a cabin" })}
        />
      </FormRow>

      <FormRow label="Arrival">
        <Input
          id="startDate"
          type="date"
          min={today}
          disabled={isBooking}
          {...register("startDate", { required: true })}
        />
      </FormRow>

      <FormRow label="Departure">
        <Input
          id="endDate"
          type="date"
          min={startDate || today}
          disabled={isBooking}
          {...register("endDate", { required: true })}
        />
      </FormRow>

      <FormRow label="Guests">
        <Input
          id="numGuests"
          type="number"
          min={1}
          disabled={isBooking}
          {...register("numGuests", { required: true, min: 1 })}
        />
      </FormRow>

      <FormRow label="Notes">
        <Textarea
          id="observations"
          disabled={isBooking}
          placeholder="Arrival time, a cot for the baby, anything the team should know"
          {...register("observations")}
        />
      </FormRow>

      <FormRow>
        {!isComplete && (
          <Hint>
            A guest the hotel already knows by this email keeps their history.
          </Hint>
        )}

        {isComplete && !isFetching && error && (
          <Quote $refused>{error.message}</Quote>
        )}

        {isComplete && !isFetching && quote && (
          <Quote>
            {quote.nights} nights &times;{" "}
            <strong>{formatCurrency(quote.nightly_price)}</strong> ={" "}
            <strong>{formatCurrency(quote.total_price)}</strong>
          </Quote>
        )}
      </FormRow>

      <FormRow>
        <Button
          variation="secondary"
          type="reset"
          disabled={isBooking}
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isBooking || !quote || Boolean(error)}>
          Book it
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateBookingForm;
