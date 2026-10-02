import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";
import Heading from "../ui/Heading";
import PageHeader from "../ui/PageHeader";
import Row from "../ui/Row";

function Account() {
  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Your account"
        description="Your name, your photo and your password."
      />

      <Row>
        <Heading as="h3">Update user data</Heading>
        <UpdateUserDataForm />
      </Row>

      <Row>
        <Heading as="h3">Update password</Heading>
        <UpdatePasswordForm />
      </Row>
    </>
  );
}

export default Account;
