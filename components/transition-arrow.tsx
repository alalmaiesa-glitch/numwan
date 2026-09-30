export default function TransitionArrow({ direction = "out" }: { direction?: "out" | "back" }) {
  return (
    <span className="transitionArrow" aria-hidden="true">
      {direction === "back" ? "←" : "↗"}
    </span>
  );
}
