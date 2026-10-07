import Tag from "../../ui/Tag";
import { bookingStatus } from "../../utils/constants";

// The same words and colour for a status everywhere in the dashboard
function BookingStatusTag({ status }) {
  const { label, tag } = bookingStatus(status);

  return <Tag type={tag}>{label}</Tag>;
}

export default BookingStatusTag;
