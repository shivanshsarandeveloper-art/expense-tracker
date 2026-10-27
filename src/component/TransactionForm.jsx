
import { useEffect, useState } from "react";

const getInitialForm = () => ({
  type: "expense",
  amount: "",
  category: "",
  description: "",
  date: new Date().toLocaleDateString("en-CA"),
});

function TransactionForm({
  onAddTransaction,
  editingTransaction,
  onUpdateTransaction,
  onCancelEdit,
}) {
  const [form, setForm] = useState(getInitialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type || "expense",
        amount: String(editingTransaction.amount ?? ""),
        category: editingTransaction.category || "",
        description: editingTransaction.description || "",
        date: editingTransaction.date || getInitialForm().date,
      });
    } else {
      setForm(getInitialForm());
    }

    setError("");
  }, [editingTransaction]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);
    const category = form.category.trim();
    const description = form.description.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount zero se zyada hona chahiye.");
      return;
    }

    if (!category || !description || !form.date) {
      setError("Please saari fields sahi se fill karo.");
      return;
    }

    if (!["income", "expense"].includes(form.type)) {
      setError("Please valid transaction type select karo.");
      return;
    }

    const transactionData = {
      type: form.type,
      amount,
      category,
      description,
      date: form.date,
    };

    if (editingTransaction) {
      onUpdateTransaction({
        ...transactionData,
        id: editingTransaction.id,
      });
    } else {
      onAddTransaction(transactionData);
    }

    setForm(getInitialForm());
    setError("");
  };

  const handleCancel = () => {
    setForm(getInitialForm());
    setError("");
    onCancelEdit?.();
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h2>
        {editingTransaction ? "Edit Transaction" : "Add Transaction"}
      </h2>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <label>
        Transaction Type
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label>
        Amount (₹)
        <input
          type="number"
          name="amount"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          placeholder="Enter amount"
          required
        />
      </label>

      <label>
        Category
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Food, Salary, Travel"
          maxLength={50}
          required
        />
      </label>

      <label>
        Description
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What was this transaction for?"
          maxLength={120}
          required
        />
      </label>

      <label>
        Date
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit" className="submit-button">
        {editingTransaction ? "Update Transaction" : "Add Transaction"}
      </button>

      {editingTransaction && (
        <button
          type="button"
          className="cancel-button"
          onClick={handleCancel}
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}

export default TransactionForm;
