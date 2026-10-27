
function SummaryCard({ title, amount, type }) {
  return (
    <div className={`summary-card ${type || ""}`}>
      <p className="summary-title">{title}</p>
      <h2 className="summary-amount">{amount}</h2>
    </div>
  );
}

export default SummaryCard;
