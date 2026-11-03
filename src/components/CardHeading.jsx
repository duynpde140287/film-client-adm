export function CardHeading({ eyebrow, title, action, trailing }) {
  return (
    <header className="card-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action || trailing}
    </header>
  );
}
