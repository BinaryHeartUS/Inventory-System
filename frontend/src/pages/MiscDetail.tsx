import { useParams } from "react-router";
import MiscDetailContainer from "../containers/MiscDetailContainer";

export default function MiscDetail() {
  const { id } = useParams<{ id: string }>();
  return <MiscDetailContainer id={id} />;
}
