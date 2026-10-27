
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "./component/Navbar";
import SummaryCard from "./component/SummaryCard";
import ExpenseChart from "./component/ExpenseChart";
import CategoryChart from "./component/CategoryChart";
import TransactionForm from "./component/TransactionForm";
import TransactionList from "./component/TransactionLists";

import { getCurrentUser, logoutUser } from "./utils/auth";
import "./App.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getCurrentUser());

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Dynamic monthly budget: no hardcoded default limit
  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");

  // Load user's transactions and budget
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setTransactionsLoaded(false);

    try {
      const savedTransactions = localStorage.getItem(
        `transactions_${user.id}`
      );

      const parsedTransactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : [];

      setTransactions(
        Array.isArray(parsedTransactions) ? parsedTransactions : []
      );

      const savedBudget = localStorage.getItem(
        `monthly_budget_${user.id}`
      );

      const parsedBudget = Number(savedBudget);

      if (
        savedBudget !== null &&
        Number.isFinite(parsedBudget) &&
        parsedBudget > 0
      ) {
        setBudget(parsedBudget);
        setBudgetInput(String(parsedBudget));
      } else {
        setBudget(0);
        setBudgetInput("");
      }
    } catch (error) {
      console.error("Unable to load saved data:", error);
      setTransactions([]);
      setBudget(0);
      setBudgetInput("");
    }

    setTransactionsLoaded(true);
  }, [user, navigate]);

  // Save transactions after initial loading
  useEffect(() => {
    if (!user || !transactionsLoaded) return;

    localStorage.setItem(
      `transactions_${user.id}`,
      JSON.stringify(transactions)
    );
  }, [transactions, user, transactionsLoaded]);

  // Save or update the monthly budget
  const handleSaveBudget = (event) => {
    event.preventDefault();

    const amount = Number(budgetInput);

    if (
      budgetInput.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setBudgetMessage("Please enter a valid budget greater than zero.");
      return;
    }

    try {
      localStorage.setItem(
        `monthly_budget_${user.id}`,
        String(amount)
      );

      setBudget(amount);
      setBudgetInput(String(amount));
      setBudgetMessage("Monthly budget updated successfully!");
    } catch (error) {
      console.error("Unable to save budget:", error);
      setBudgetMessage("Unable to save budget. Please try again.");
    }
  };

  // Logout
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate("/login", { replace: true });
  };

  // Add transaction
  const handleAddTransaction = (transactionData) => {
    const newTransaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    setTransactions((previous) => [newTransaction, ...previous]);
  };

  // Update transaction
  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );

    setEditingTransaction(null);
  };

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    setTransactions((previous) =>
      previous.filter((transaction) => transaction.id !== id)
    );

    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  // Search, type and date filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = [
        transaction.description,
        transaction.category,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      const matchesType =
        filterType === "all" || transaction.type === filterType;

      const matchesStartDate =
        !startDate ||
        (transaction.date && transaction.date >= startDate);

      const matchesEndDate =
        !endDate ||
        (transaction.date && transaction.date <= endDate);

      return (
        matchesSearch &&
        matchesType &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [transactions, search, filterType, startDate, endDate]);

  // All-time income, expenses and balance
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const balance = income - expenses;

  // Format currency in Indian Rupees
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  // Calculate current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();

    return transactions
      .filter((transaction) => {
        if (transaction.type !== "expense" || !transaction.date) {
          return false;
        }

        const date = new Date(`${transaction.date}T12:00:00`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [transactions]);

  // Budget calculations update automatically
  const budgetPercentage =
    budget > 0 ? (currentMonthExpenses / budget) * 100 : 0;

  const remainingBudget = budget - currentMonthExpenses;

  // Report for selected date range
  const selectedMonthSummary = useMemo(() => {
    const now = new Date();

    const rangeStart = startDate
      ? new Date(`${startDate}T00:00:00`)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const rangeEnd = endDate
      ? new Date(`${endDate}T23:59:59.999`)
      : new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

    const reportTransactions = transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const date = new Date(`${transaction.date}T12:00:00`);

      return (
        !Number.isNaN(date.getTime()) &&
        date >= rangeStart &&
        date <= rangeEnd
      );
    });

    const reportIncome = reportTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );

    const reportExpenses = reportTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );

    return {
      income: reportIncome,
      expenses: reportExpenses,
      balance: reportIncome - reportExpenses,
    };
  }, [transactions, startDate, endDate]);

  // Six-month chart data
  const monthlyData = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        income: 0,
        expenses: 0,
      });
    }

    transactions.forEach((transaction) => {
      if (!transaction.date) return;

      const date = new Date(`${transaction.date}T12:00:00`);

      if (Number.isNaN(date.getTime())) return;

      const monthData = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (!monthData) return;

      const amount = Number(transaction.amount || 0);

      if (transaction.type === "income") {
        monthData.income += amount;
      } else if (transaction.type === "expense") {
        monthData.expenses += amount;
      }
    });

    return months;
  }, [transactions]);

  // Export transactions and summary to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("Export karne ke liye koi transaction nahi hai.");
      return;
    }

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Amount",
    ];

    const rows = transactions.map((transaction) => [
      transaction.date,
      transaction.type,
      transaction.category,
      transaction.description,
      transaction.amount,
    ]);

    const summaryRows = [
      [],
      ["Report Summary"],
      ["Total Income", income],
      ["Total Expenses", expenses],
      ["Net Balance", balance],
      ["Current Month Expenses", currentMonthExpenses],
      ["Monthly Budget", budget > 0 ? budget : "Not set"],
      [
        "Budget Remaining",
        budget > 0 ? remainingBudget : "Not set",
      ],
    ];

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
      ...summaryRows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-tracker-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setStartDate("");
    setEndDate("");
  };

  if (!user) return null;

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="dashboard">
        {/* Dashboard header */}
        <div className="dashboard-header">
          <div>
            <h1>Expense Tracker</h1>
            <p>Welcome back, {user.name || "User"}!</p>
          </div>

          <button
            type="button"
            className="export-button"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>

        {/* Summary cards */}
        <section className="summary-cards">
          <SummaryCard
            title="Total Income"
            amount={income}
            type="income"
          />

          <SummaryCard
            title="Total Expenses"
            amount={expenses}
            type="expense"
          />

          <SummaryCard
            title="Balance"
            amount={balance}
            type="balance"
          />
        </section>

        {/* Dynamic monthly budget */}
        <section className="budget-card">
          <div className="budget-heading">
            <div>
              <p className="budget-eyebrow">MONTHLY OVERVIEW</p>
              <h2>Monthly Budget</h2>
            </div>

            <span className="budget-limit">
              {budget > 0
                ? `Limit: ${formatMoney(budget)}`
                : "No limit set"}
            </span>
          </div>

          {/* Budget input form */}
          <form
            className="budget-edit-form"
            onSubmit={handleSaveBudget}
          >
            <label htmlFor="monthly-budget-input">
              Set your monthly expense limit
            </label>

            <div className="budget-input-row">
              <input
                id="monthly-budget-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount (e.g. 15000)"
                value={budgetInput}
                onChange={(event) => {
                  setBudgetInput(event.target.value);
                  setBudgetMessage("");
                }}
                required
              />

              <button type="submit" className="budget-save-button">
                {budget > 0 ? "Update Limit" : "Set Limit"}
              </button>
            </div>

            {budgetMessage && (
              <p
                className="budget-message"
                role="status"
                aria-live="polite"
              >
                {budgetMessage}
              </p>
            )}
          </form>

          {budget > 0 ? (
            <>
              <div className="budget-amounts">
                <div>
                  <span>Spent this month</span>
                  <h3>{formatMoney(currentMonthExpenses)}</h3>
                </div>

                <div className="budget-remaining">
                  <span>
                    {remainingBudget >= 0 ? "Remaining" : "Over budget"}
                  </span>
                  <h3>{formatMoney(Math.abs(remainingBudget))}</h3>
                </div>
              </div>

              <div
                className="budget-progress-track"
                role="progressbar"
                aria-label="Monthly budget used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(
                  Math.round(budgetPercentage),
                  100
                )}
              >
                <div
                  className={`budget-progress-fill ${
                    budgetPercentage >= 100
                      ? "over-budget"
                      : budgetPercentage >= 80
                        ? "near-budget"
                        : ""
                  }`}
                  style={{
                    width: `${Math.min(budgetPercentage, 100)}%`,
                  }}
                />
              </div>

              <div className="budget-progress-label">
                <span>{budgetPercentage.toFixed(0)}% used</span>
                <span>{formatMoney(budget)} budget</span>
              </div>

              {budgetPercentage >= 100 ? (
                <p className="budget-alert danger">
                  ⚠️ Monthly budget cross ho gaya! Apne expenses check karo.
                </p>
              ) : budgetPercentage >= 80 ? (
                <p className="budget-alert warning">
                  ⚠️ Tumne budget ka 80% ya usse zyada use kar liya hai.
                </p>
              ) : (
                <p className="budget-alert success">
                  ✓ Tum budget ke andar ho. Spending track karte raho!
                </p>
              )}
            </>
          ) : (
            <p className="budget-note">
              Apna monthly budget enter karke Set Limit par click karo.
              Spending progress aur alerts uske baad show honge.
            </p>
          )}
        </section>

        {/* Monthly expense chart */}
        <section className="dashboard-section">
          <ExpenseChart monthlyData={monthlyData} />
        </section>

        {/* Category breakdown */}
        <section className="dashboard-section">
          <CategoryChart transactions={transactions} />
        </section>

        {/* Period summary */}
        <section className="monthly-report">
          <h2>Period Summary</h2>

          <p>
            {startDate || endDate
              ? `${startDate || "Beginning"} to ${endDate || "Today"}`
              : "Current Month"}
          </p>

          <div className="report-grid">
            <div>
              <span>Income</span>
              <h3>{formatMoney(selectedMonthSummary.income)}</h3>
            </div>

            <div>
              <span>Expenses</span>
              <h3>{formatMoney(selectedMonthSummary.expenses)}</h3>
            </div>

            <div>
              <span>Net Balance</span>
              <h3>{formatMoney(selectedMonthSummary.balance)}</h3>
            </div>
          </div>
        </section>

        {/* Add and edit transaction */}
        <section className="dashboard-section">
          <TransactionForm
            onAddTransaction={handleAddTransaction}
            editingTransaction={editingTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
          />
        </section>

        {/* Transactions and filters */}
        <section className="dashboard-section">
          <div className="transaction-heading">
            <h2>Transactions</h2>
          </div>

          <div className="transaction-filters">
            <input
              type="search"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>

            <label className="date-filter">
              <span>From Date</span>
              <input
                type="date"
                aria-label="Start date"
                value={startDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setStartDate(value);

                  if (endDate && value && endDate < value) {
                    setEndDate("");
                  }
                }}
              />
            </label>

            <label className="date-filter">
              <span>To Date</span>
              <input
                type="date"
                aria-label="End date"
                min={startDate || undefined}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
            onEdit={setEditingTransaction}
          />
        </section>
      </main>
    </>
  );
}

export default Dashboard;
