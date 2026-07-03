import { FormEvent, useEffect, useState } from "react";
import axios from "axios";

type InventoryItem = {
  id: number;
  name: string;
  description?: string;
  quantity: number;
};

const initialForm = {
  name: "",
  description: "",
  quantity: 1
};

const App = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [adjustId, setAdjustId] = useState("");
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [newQuantity, setNewQuantity] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get<InventoryItem[]>("/api/inventory");
      setItems(response.data);
    } catch (err) {
      setError("Unable to load inventory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFormChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!form.name.trim()) {
      setStatus("Item name is required.");
      return;
    }

    if (form.quantity < 0) {
      setStatus("Quantity cannot be negative.");
      return;
    }

    try {
      await axios.post("/api/inventory", form);
      setForm(initialForm);
      setStatus("Item added successfully.");
      fetchItems();
    } catch (err) {
      console.error(err);
      setStatus("Failed to add item. Check the backend logs.");
    }
  };

  const handleAdjust = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    setError("");

    const itemId = Number(adjustId);
    if (!itemId) {
      setStatus("Select an item to adjust.");
      return;
    }

    const payload: { adjustment?: number; newQuantity?: number } = {};

    if (newQuantity !== "") {
      payload.newQuantity = Number(newQuantity);
    }

    if (adjustmentValue !== 0) {
      payload.adjustment = adjustmentValue;
    }

    if (!("adjustment" in payload) && !("newQuantity" in payload)) {
      setStatus("Provide either an adjustment or a new quantity.");
      return;
    }

    try {
      await axios.patch(`/api/inventory/${itemId}/quantity`, payload);
      setAdjustmentValue(0);
      setNewQuantity("");
      setStatus("Quantity updated.");
      fetchItems();
    } catch (err) {
      console.error(err);
      setStatus("Update failed. Ensure the backend is running.");
    }
  };

  const selectedItem = items.find((item) => item.id === Number(adjustId));

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>HR Inventory Console</h1>
        <p>Track laptops, peripherals, licenses, and other IT assets.</p>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Add inventory</h2>
          <form onSubmit={handleAdd} className="form-stack">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="e.g. Laptop"
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Dell XPS 15"
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                value={form.quantity}
                onChange={(event) => handleFormChange("quantity", Number(event.target.value))}
                min={0}
              />
            </label>
            <button type="submit">Add item</button>
          </form>
        </div>

        <div className="panel">
          <h2>Adjust quantity</h2>
          <form onSubmit={handleAdjust} className="form-stack">
            <label>
              Select item
              <select value={adjustId} onChange={(event) => setAdjustId(event.target.value)}>
                <option value="">Choose an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.quantity})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Adjustment (+/-)
              <input
                type="number"
                value={adjustmentValue}
                onChange={(event) => setAdjustmentValue(Number(event.target.value))}
              />
            </label>
            <label>
              New quantity (optional)
              <input
                type="number"
                value={newQuantity}
                onChange={(event) => setNewQuantity(event.target.value ? Number(event.target.value) : "")}
                min={0}
              />
            </label>
            <button type="submit" disabled={!adjustId}>
              Update
            </button>
          </form>
          {selectedItem && (
            <p className="muted">
              Currently: {selectedItem.name} — {selectedItem.quantity} unit(s)
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Current inventory</h2>
          <button onClick={fetchItems} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No inventory recorded yet.</p>
        ) : (
          <ul className="inventory-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.description ?? "No description"}</p>
                </div>
                <span className="quantity">{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {status && <p className="status">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;
