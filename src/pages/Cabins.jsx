import CabinGrid from "../features/cabins/CabinGrid";
import PageHeader from "../ui/PageHeader";
import Row from "../ui/Row";

import AddCabin from "../features/cabins/AddCabin";
import CabinTableOperations from "../features/cabins/CabinTableOperations";

function Cabins() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="All cabins"
        description="The rooms you can sell, and the ones you have archived."
      >
        <CabinTableOperations />
      </PageHeader>

      <Row>
        <CabinGrid />
        <AddCabin />
      </Row>
    </>
  );
}

export default Cabins;
