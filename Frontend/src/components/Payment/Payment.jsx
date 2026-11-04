import { useState } from "react";
import "./Payment.css";

const EMPTY_FORM = {
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
};

export default function Payment() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "cardNumber") {
      nextValue = value.replace(/\D/g, "").slice(0, 16);
    } else if (name === "expiryDate") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    } else if (name === "cvv") {
      nextValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.cardholderName.trim() || !form.cardNumber || !form.expiryDate || !form.cvv) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (!/^\d{16}$/.test(form.cardNumber)) {
      setMessage("Card number must contain 16 digits.");
      return;
    }

    const expiryMatch = form.expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!expiryMatch) {
      setMessage("Enter a valid expiry date in MM/YY format.");
      return;
    }

    const expiryMonth = Number(expiryMatch[1]);
    const expiryYear = 2000 + Number(expiryMatch[2]);
    const now = new Date();
    if (expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
      setMessage("Expiry date must be in the future.");
      return;
    }

    if (!/^\d{3}$/.test(form.cvv)) {
      setMessage("CVV must contain 3 digits.");
      return;
    }

    setForm(EMPTY_FORM);
    setMessage("Demo only – real payment processing is not available.");
  }

  return (
    <div className="payment-page">
      <form className="payment-card" onSubmit={handleSubmit} autoComplete="off">
        <h1 id="payment-title">PAYMENT</h1>
        <p className="payment-demo-notice">
          Demo only. No real payment will be processed.
        </p>

        <label htmlFor="cardholderName">Cardholder Name</label>
        <input
          id="cardholderName"
          name="cardholderName"
          type="text"
          value={form.cardholderName}
          onChange={handleChange}
          autoComplete="off"
        />

        <label htmlFor="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          name="cardNumber"
          type="text"
          inputMode="numeric"
          maxLength={16}
          value={form.cardNumber}
          onChange={handleChange}
          autoComplete="off"
        />

        <div className="row">
          <div className="column">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              maxLength={5}
              value={form.expiryDate}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="column">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              inputMode="numeric"
              maxLength={3}
              value={form.cvv}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
        </div>

        <button type="submit" className="pay-btn">PAY</button>
        {message && <p className="payment-message" role="status">{message}</p>}
      </form>
    </div>
  );
}
