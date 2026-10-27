
import "./ExpenseChart.css";

function ExpenseChart({ monthlyData }) {
  const maxValue = Math.max(
    1,
    ...monthlyData.map((item) =>
      Math.max(item.income, item.expenses)
    )
  );

  return (
    <section className="panel chart-panel">
      <h2>Income vs Expenses</h2>

      <div className="chart-legend">
        <span>🟢 Income</span>
        <span>🔴 Expenses</span>
      </div>

      <div className="bar-chart">
        {monthlyData.map((month) => (
          <div className="chart-column" key={month.label}>
            <div className="bar-pair">
              <div
                className="chart-bar income-bar"
                style={{
                  height: `${(month.income / maxValue) * 100}%`,
                }}
                title={`Income: ₹${month.income}`}
              />

              <div
                className="chart-bar expense-bar"
                style={{
                  height: `${(month.expenses / maxValue) * 100}%`,
                }}
                title={`Expenses: ₹${month.expenses}`}
              />
            </div>

            <span className="chart-period">{month.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExpenseChart;
