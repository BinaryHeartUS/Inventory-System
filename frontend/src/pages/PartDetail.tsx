import { useParams } from "react-router";
import PartDetailContainer from "../containers/PartDetailContainer";

export default function PartDetail() {
  const { id } = useParams<{ id: string }>();
  return <PartDetailContainer id={id} />;
}
