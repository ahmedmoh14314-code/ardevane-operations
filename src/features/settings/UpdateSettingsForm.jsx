import { useRef, useState } from "react";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUsers,
} from "react-icons/hi2";

import SettingRow from "./SettingRow";
import Stepper from "../../ui/Stepper";
import Spinner from "../../ui/Spinner";
import { useSettings } from "./useSettings";
import { below } from "../../styles/breakpoints";
import { useUpdateSetting } from "./useUpdateSetting";

// Saves once the clicking stops, not on every press of + or -
const SAVE_AFTER_MS = 700;

const Card = styled.div`
  padding: 0.8rem 3.2rem;

  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  ${below.tablet} {
    padding: 0.4rem 1.6rem;
  }
`;

// Each setting, and the range it may take. The two lengths of stay keep each
// other honest: the minimum can never pass the maximum, nor the other way.
const SETTINGS = [
  {
    field: "minBookingLength",
    title: "Minimum nights per booking",
    description: "The shortest stay a guest can book.",
    icon: <HiOutlineCalendarDays />,
    color: "green",
    bounds: (values) => ({ min: 1, max: values.maxBookingLength }),
  },
  {
    field: "maxBookingLength",
    title: "Maximum nights per booking",
    description: "The longest stay a guest can book.",
    icon: <HiOutlineMoon />,
    color: "yellow",
    bounds: (values) => ({ min: values.minBookingLength, max: 365 }),
  },
  {
    field: "maxGuestsPerBooking",
    title: "Maximum guests per booking",
    description: "How many people can share a single booking.",
    icon: <HiOutlineUsers />,
    color: "blue",
    bounds: () => ({ min: 1, max: 50 }),
  },
  {
    field: "breakfastPrice",
    title: "Breakfast price",
    description: "Per guest, per night, in USD. Offered at check in.",
    icon: <HiOutlineSun />,
    color: "yellow",
    prefix: "$",
    bounds: () => ({ min: 0, max: 500 }),
  },
];

function SettingsCard({ settings }) {
  const [values, setValues] = useState(settings);
  const { updateSetting } = useUpdateSetting();
  const timers = useRef({});

  function handleChange(setting, value) {
    const next = { ...values, [setting.field]: value };
    setValues(next);

    clearTimeout(timers.current[setting.field]);

    timers.current[setting.field] = setTimeout(() => {
      const { min, max } = setting.bounds(next);

      // Half way through typing a number, or nothing actually changed
      if (value < min || value > max) return;
      if (value === settings[setting.field]) return;

      updateSetting({ [setting.field]: value });
    }, SAVE_AFTER_MS);
  }

  return (
    <Card>
      {SETTINGS.map((setting) => {
        const { min, max } = setting.bounds(values);

        return (
          <SettingRow
            key={setting.field}
            icon={setting.icon}
            color={setting.color}
            title={setting.title}
            description={setting.description}
          >
            <Stepper
              value={values[setting.field]}
              onChange={(value) => handleChange(setting, value)}
              min={min}
              max={max}
              prefix={setting.prefix}
              label={setting.title}
            />
          </SettingRow>
        );
      })}
    </Card>
  );
}

function UpdateSettingsForm() {
  const { isLoading, settings } = useSettings();

  if (isLoading) return <Spinner />;

  return <SettingsCard settings={settings} />;
}

export default UpdateSettingsForm;
