import LoginForm from "../features/authentication/LoginForm";
import PhotoPage from "../ui/PhotoPage";
import { useLogin } from "../features/authentication/useLogin";

function Login() {
  const { login, isLoading, isLeaving } = useLogin();

  return (
    <PhotoPage
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle={
        <>
          Access your cabins, bookings, and operations
          <br />
          all in one place.
        </>
      }
      isLeaving={isLeaving}
    >
      <LoginForm login={login} isLoading={isLoading || isLeaving} />
    </PhotoPage>
  );
}

export default Login;
