
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getCurrentUser,
  getUsers,
  logoutUser,
} from "../utils/auth";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [budget, setBudget] = useState("20000");
  const [savingsGoal, setSavingsGoal] = useState("5000");
  const [message, setMessage] = useState("");

  const [transactions, setTransactions] = useState([]);

  const settingsKey = user
    ? `profile_settings_${user.id}`
    : null;

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const savedSettings = JSON.parse(
        localStorage.getItem(settingsKey) || "{}"
      );

      setName(user.name || "");
      setPhone(savedSettings.phone || "");
      setCurrency(savedSettings.currency || "INR");
      setBudget(String(savedSettings.budget ?? 20000));
      setSavingsGoal(String(savedSettings.savingsGoal ?? 5000));

      const savedTransactions = JSON.parse(
        localStorage.getItem(`transactions_${user.id}`) || "[]"
      );

      setTransactions(
        Array.isArray(savedTransactions)
          ? savedTransactions
          : []
      );
    } catch {
      setTransactions([]);
    }
  }, [user?.id, navigate, settingsKey]);

  if (!user) {
    return null;
  }

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const totalExpenses = transactions
    .filter((item) => item.type === "expense")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const balance = totalIncome - totalExpenses;

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  const handleSave = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (
      phone.trim() &&
      !/^[0-9+\-()\s]{7,20}$/.test(phone.trim())
    ) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    if (
      budget === "" ||
      savingsGoal === "" ||
      Number(budget) < 0 ||
      Number(savingsGoal) < 0
    ) {
      setMessage("Budget and savings goal cannot be negative.");
      return;
    }

    // Update the user's display name in the session.
    const updatedUser = {
      ...user,
      name: name.trim(),
    };

    localStorage.setItem(
      "expense_tracker_session",
      JSON.stringify(updatedUser)
    );

    // Update the registered user's name.
    const users = getUsers();
    const updatedUsers = users.map((item) =>
      item.id === user.id
        ? { ...item, name: name.trim() }
        : item
    );

    localStorage.setItem(
      "expense_tracker_users",
      JSON.stringify(updatedUsers)
    );

    // Save personal and financial preferences.
    localStorage.setItem(
      settingsKey,
      JSON.stringify({
        phone: phone.trim(),
        currency,
        budget: Number(budget),
        savingsGoal: Number(savingsGoal),
      })
    );

    setMessage("Settings saved successfully!");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Delete your account and all its local data? This cannot be undone."
    );

    if (!confirmed) return;

    const remainingUsers = getUsers().filter(
      (item) => item.id !== user.id
    );

    localStorage.setItem(
      "expense_tracker_users",
      JSON.stringify(remainingUsers)
    );

    localStorage.removeItem(`transactions_${user.id}`);
    localStorage.removeItem(`profile_settings_${user.id}`);
    logoutUser();

    navigate("/signup", { replace: true });
  };

  const budgetUsed =
    Number(budget) > 0
      ? Math.min((totalExpenses / Number(budget)) * 100, 100)
      : totalExpenses > 0
        ? 100
        : 0;

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <button
          type="button"
          className="profile-back"
          onClick={() => navigate("/")}
        >
          ← Dashboard
        </button>

        <h2>ExpenseTracker</h2>

        <button
          type="button"
          className="profile-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="profile-container">
        <div className="profile-page-heading">
          <p className="profile-eyebrow">ACCOUNT MANAGEMENT</p>
          <h1>Profile & Settings</h1>
          <p>
            Manage your personal details and financial goals.
          </p>
        </div>

        <section className="profile-welcome">
          <div className="profile-avatar">
            {name.trim().charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <h2>{name || "User"}</h2>
            <p>{user.email}</p>
            <span className="profile-status">
              Personal Account
            </span>
          </div>
        </section>

        <section className="profile-financial-grid">
          <article className="profile-stat">
            <p>Total Balance</p>
            <h3>{formatMoney(balance)}</h3>
          </article>

          <article className="profile-stat">
            <p>Total Income</p>
            <h3 className="profile-income">
              {formatMoney(totalIncome)}
            </h3>
          </article>

          <article className="profile-stat">
            <p>Total Expenses</p>
            <h3 className="profile-expense">
              {formatMoney(totalExpenses)}
            </h3>
          </article>

          <article className="profile-stat">
            <p>Transactions</p>
            <h3>{transactions.length}</h3>
          </article>
        </section>

        <form className="profile-settings-card" onSubmit={handleSave}>
          <div className="profile-section-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Update your account details.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
              />
              <small>Email cannot be changed here.</small>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-section-heading">
            <div>
              <h2>Financial Preferences</h2>
              <p>Set your currency, budget and savings target.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-currency">Currency</label>
              <select
                id="profile-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-budget">
                Monthly Expense Budget
              </label>
              <input
                id="profile-budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-savings">
                Savings Goal
              </label>
              <input
                id="profile-savings"
                type="number"
                min="0"
                step="0.01"
                value={savingsGoal}
                onChange={(event) =>
                  setSavingsGoal(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="profile-budget-box">
            <div className="profile-budget-heading">
              <span>Monthly budget used</span>
              <strong>
                {Math.round(budgetUsed)}%
              </strong>
            </div>

            <div
              className="profile-progress-track"
              role="progressbar"
              aria-valuenow={Math.round(budgetUsed)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`profile-progress-fill ${
                  totalExpenses > Number(budget)
                    ? "over-budget"
                    : ""
                }`}
                style={{ width: `${budgetUsed}%` }}
              />
            </div>

            <p>
              Spent {formatMoney(totalExpenses)} out of{" "}
              {formatMoney(Number(budget) || 0)}.
            </p>

            {totalExpenses > Number(budget) &&
              Number(budget) > 0 && (
                <p className="profile-budget-warning">
                  You have exceeded your monthly budget.
                </p>
              )}

            <p className="profile-savings-note">
              Savings goal: {formatMoney(Number(savingsGoal) || 0)}
            </p>
          </div>

          {message && (
            <p className="profile-message" role="status">
              {message}
            </p>
          )}

          <div className="profile-form-actions">
            <button type="submit" className="profile-save-button">
              Save Settings
            </button>

            <button
              type="button"
              className="profile-cancel-button"
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </button>
          </div>
        </form>

        <section className="profile-danger-card">
          <div>
            <h2>Danger Zone</h2>
            <p>
              Permanently delete your local demo account and its
              saved transactions.
            </p>
          </div>

          <button
            type="button"
            className="profile-delete-account"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </section>

        <p className="profile-disclaimer">
          Demo mode: your information is stored in this browser's
          local storage. It is not synced to a secure server.
        </p>
      </main>
    </div>
  );
}

export default Profile;
