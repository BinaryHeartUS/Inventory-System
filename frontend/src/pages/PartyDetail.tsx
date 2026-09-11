import { useParams } from "react-router";
import PartyDetailContainer from "../containers/PartyDetailContainer";

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <PartyDetailContainer id={id} />;
}
