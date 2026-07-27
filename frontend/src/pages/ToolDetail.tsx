import { useParams } from "react-router-dom";
import ToolDetailContainer from "../containers/ToolDetailContainer";

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  return <ToolDetailContainer id={id} />;
}
