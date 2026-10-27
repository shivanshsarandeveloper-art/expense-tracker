
import { useMemo } from "react";
import "./CategoryChart.css";

function CategoryChart({ transactions = [] }) {
  const categoryData = useMemo(() => {
    const totals = {};

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const category = transaction.category || "Other";
      const amount = Number(transaction.amount || 0);

      totals[category] = (totals[category] || 0) + amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpenses = categoryData.reduce(
    (total, item) => total + item.amount,
    0
  );

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section className="category-chart">
      <div className="category-chart-heading">
        <div>
          <h2>Expense Breakdown</h2>
          <p>Your spending by category</p>
        </div>
        <span>{formatMoney(totalExpenses)}</span>
      </div>

      {categoryData.length === 0 ? (
        <p className="category-empty">
          Abhi koi expense nahi hai. Expense add karne par chart dikhega.
        </p>
      ) : (
        <div className="category-list">
          {categoryData.map((item) => {
            const percentage =
              totalExpenses > 0
                ? (item.amount / totalExpenses) * 100
                : 0;

            return (
              <div className="category-item" key={item.category}>
                <div className="category-item-info">
                  <span>{item.category}</span>
                  <span>
                    {formatMoney(item.amount)} · {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="category-progress-track">
                  <div
                    className="category-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CategoryChart;
