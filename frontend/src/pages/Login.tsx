import LoginContainer from "../containers/LoginContainer";
import CentralLoginContainer from "../containers/CentralLoginContainer";
import { getAuthConfig } from "../services/authConfig";

export default function Login() {
  return getAuthConfig().enabled ? <CentralLoginContainer /> : <LoginContainer />;
}
