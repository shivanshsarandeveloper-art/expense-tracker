
function TransactionList({ transactions = [], onDelete, onEdit }) {
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  if (transactions.length === 0) {
    return (
      <div className="empty-transactions">
        <p>No transactions found.</p>
        <span>Add a transaction or change your search.</span>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <div
          className="transaction-item"
          key={transaction.id}
        >
          <div className="transaction-info">
            <h3>{transaction.description}</h3>

            <p>
              {transaction.category} ·{" "}
              {transaction.date
                ? new Date(transaction.date).toLocaleDateString("en-IN")
                : "No date"}
            </p>
          </div>

          <div className="transaction-actions">
            <span
              className={`transaction-amount ${transaction.type}`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatMoney(transaction.amount)}
            </span>

            <button
              type="button"
              className="edit-button"
              onClick={() => onEdit?.(transaction)}
              aria-label={`Edit ${transaction.description}`}
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={() => onDelete(transaction.id)}
              aria-label={`Delete ${transaction.description}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
