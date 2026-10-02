import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import EmptyState from "./EmptyState";

function Empty({ resourceName }) {
  return (
    <EmptyState
      icon={<HiOutlineMagnifyingGlass />}
      title={`No ${resourceName} found`}
      description={`This ${resourceName} may have been removed, or the link is out of date.`}
    />
  );
}

export default Empty;
