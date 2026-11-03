import { LoaderCircle } from "lucide-react";

export function Spinner({ small = false }) {
  return (
    <LoaderCircle
      className={`spin${small ? " spin-small" : ""}`}
      aria-hidden="true"
    />
  );
}
