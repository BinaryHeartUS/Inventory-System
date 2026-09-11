import { useParams } from "react-router";
import DeviceDetailContainer from "../containers/DeviceDetailContainer";

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  return <DeviceDetailContainer id={id} />;
}
