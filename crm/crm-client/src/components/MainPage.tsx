import React, { useState, useEffect } from "react";

// Utility for modern UI
const modernInput = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
  width: "100%",
  boxSizing: "border-box" as const,
  background: "#f9f9fb"
};
const sectionStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 8px 0 #e9e9f0",
  padding: 28,
  marginBottom: 28
};
const label = {
  fontWeight: 600,
  color: "#333",
  marginBottom: 6,
  display: "block"
};
const subLabel = {
  fontWeight: 400,
  color: "#555",
  fontSize: "14px",
  marginTop: 3
};

const paymentOptions = [
  { value: "full_cash", label: "Full Cash (1 time payment)", terms: 1 },
  { value: "installment", label: "Installment (up to 10 terms)", terms: 10 },
  { value: "travel_funds", label: "Travel Funds (up to 10 terms)", terms: 10 },
  { value: "down_payment", label: "Down Payment (2 time payment)", terms: 2 }
];

// Companion type with extra fields
type Companion = {
  name: string;
  dob: string;
  address: string;
  occupation: string;
};

type PaymentDetail = {
  date: string;
  depositSlip?: File | null;
  receipt?: File | null;
};

const MainPage: React.FC = () => {
  // State
  const [paymentTerm, setPaymentTerm] = useState(paymentOptions[0].value);
  const [termCount, setTermCount] = useState(1); // How many terms for installment/travel_funds
  const [selectedPaymentBox, setSelectedPaymentBox] = useState<number | null>(null);

  // Companions (with details)
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [newCompanion, setNewCompanion] = useState<Companion>({
    name: "",
    dob: "",
    address: "",
    occupation: ""
  });

  // Passports: always 1 for client, + companions
  const passports = [
    { label: "Client", name: "" },
    ...companions.map((comp, idx) => ({ label: `Companion ${idx + 1}`, name: comp.name }))
  ];

  // PaymentTerm-driven behavior
  const currentOption = paymentOptions.find(opt => opt.value === paymentTerm)!;
  const showTermCount = paymentTerm === "installment" || paymentTerm === "travel_funds";
  const paymentBoxes = Array.from({ length: currentOption.value === "installment" || currentOption.value === "travel_funds" ? termCount : currentOption.terms }, (_, i) => i + 1);

  // Payment Details Table for terms
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>(
    Array.from({ length: termCount }, () => ({ date: "", depositSlip: null, receipt: null }))
  );

  // Sync paymentDetails rows with termCount
  useEffect(() => {
    setPaymentDetails(prev => {
      const next = [...prev];
      if (next.length < termCount) {
        for (let i = next.length; i < termCount; i++) next.push({ date: "", depositSlip: null, receipt: null });
      } else if (next.length > termCount) {
        next.length = termCount;
      }
      return next;
    });
  }, [termCount]);

  const handlePaymentDetailChange = (
    idx: number,
    field: "date" | "depositSlip" | "receipt",
    value: string | React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentDetails(pd =>
      pd.map((row, i) => {
        if (i !== idx) return row;
        if (field === "date") {
          return { ...row, date: value as string };
        }
        const event = value as React.ChangeEvent<HTMLInputElement>;
        const file = event?.target?.files?.[0] || null;
        return { ...row, [field]: file };
      })
    );
  };

  // Handlers
  function handleCompanionFieldChange(field: keyof Companion, value: string) {
    setNewCompanion({ ...newCompanion, [field]: value });
  }

  function handleAddCompanion() {
    if (newCompanion.name.trim()) {
      setCompanions([...companions, newCompanion]);
      setNewCompanion({ name: "", dob: "", address: "", occupation: "" });
    }
  }

  function handleRemoveCompanion(idx: number) {
    setCompanions(companions.filter((_, i) => i !== idx));
  }

  function handlePaymentTermChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    setPaymentTerm(selected);
    const opt = paymentOptions.find(o => o.value === selected)!;
    if (selected === "installment" || selected === "travel_funds") {
      setTermCount(2); // default for these types
    } else {
      setTermCount(opt.terms);
    }
    setSelectedPaymentBox(null);
  }

  return (
    <div style={{
      maxWidth: 960,
      margin: "40px auto",
      padding: 0,
      background: "#f4f7fa",
      borderRadius: 16,
      boxShadow: "0 4px 32px 0 #e2e6f0"
    }}>
      <form style={{ padding: 24 }} autoComplete="off">
        {/* Client Info */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Client No</label>
              <input style={modernInput} type="text" placeholder="Auto-generated or enter client number" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Status</label>
              <select style={modernInput}>
                <option>Active</option>
                <option>Lead</option>
                <option>Referral</option>
                <option>Transferred</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Agent</label>
              <input style={modernInput} type="text" placeholder="Agent name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Contact No</label>
              <input style={modernInput} type="text" placeholder="Contact number" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Contact Name</label>
              <input style={{ ...modernInput, fontWeight: "bold" }} type="text" placeholder="Full name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Email</label>
              <input style={modernInput} type="email" placeholder="Email address" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Date of Birth</label>
              <input style={modernInput} type="date" />
            </div>
          </div>
        </div>

        {/* Package & Companions */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Package</label>
              <input style={modernInput} type="text" placeholder="Package name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Travel Date</label>
              <input style={modernInput} type="date" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>No. of Pax</label>
              <input style={modernInput} type="number" min={1} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Booking Confirmation</label>
              <input style={modernInput} type="text" placeholder="Booking reference" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={label}>Package Link</label>
              <input style={modernInput} type="url" placeholder="URL" />
            </div>
          </div>

          {/* Companions Section */}
          <div style={{ marginTop: 18 }}>
            <label style={label}>Companions</label>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
              {companions.map((comp, idx) => (
                <div key={idx} style={{
                  background: "#eef2ff",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 10,
                  minWidth: 300,
                  position: "relative"
                }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompanion(idx)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 8,
                      background: "none",
                      border: "none",
                      color: "#6366f1",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: 17,
                    }}>×</button>
                  <div>
                    <label style={label}>Name</label>
                    <input
                      style={modernInput}
                      type="text"
                      value={comp.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label style={label}>Date of Birth</label>
                    <input
                      style={modernInput}
                      type="date"
                      value={comp.dob}
                      readOnly
                    />
                  </div>
                  <div>
                    <label style={label}>Address</label>
                    <input
                      style={modernInput}
                      type="text"
                      value={comp.address}
                      readOnly
                    />
                  </div>
                  <div>
                    <label style={label}>Occupation</label>
                    <input
                      style={modernInput}
                      type="text"
                      value={comp.occupation}
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Add new companion form */}
            <div style={{
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              minWidth: 300,
              boxShadow: "0 1px 3px #e0e7ff"
            }}>
              <div>
                <label style={label}>Name</label>
                <input
                  style={modernInput}
                  type="text"
                  placeholder="Companion name"
                  value={newCompanion.name}
                  onChange={e => handleCompanionFieldChange("name", e.target.value)}
                />
              </div>
              <div>
                <label style={label}>Date of Birth</label>
                <input
                  style={modernInput}
                  type="date"
                  value={newCompanion.dob}
                  onChange={e => handleCompanionFieldChange("dob", e.target.value)}
                />
              </div>
              <div>
                <label style={label}>Address</label>
                <input
                  style={modernInput}
                  type="text"
                  placeholder="Address"
                  value={newCompanion.address}
                  onChange={e => handleCompanionFieldChange("address", e.target.value)}
                />
              </div>
              <div>
                <label style={label}>Occupation</label>
                <input
                  style={modernInput}
                  type="text"
                  placeholder="Occupation"
                  value={newCompanion.occupation}
                  onChange={e => handleCompanionFieldChange("occupation", e.target.value)}
                />
              </div>
              <button
                type="button"
                style={{
                  marginTop: 10,
                  background: "#2563eb",
                  color: "#fff",
                  padding: "7px 18px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                onClick={handleAddCompanion}
                disabled={!newCompanion.name.trim()}
              >
                Add Companion
              </button>
            </div>
          </div>
        </div>

        {/* Payment Terms & Counts */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
            <div style={{ flex: 2 }}>
              <label style={label}>Payment Terms</label>
              <select style={modernInput} value={paymentTerm} onChange={handlePaymentTermChange}>
                {paymentOptions.map(opt =>
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
              </select>
            </div>
            {showTermCount && (
              <div style={{ flex: 1 }}>
                <label style={label}>Terms</label>
                <input
                  style={modernInput}
                  type="number"
                  min={1}
                  max={currentOption.terms}
                  value={termCount}
                  onChange={e => {
                    let v = parseInt(e.target.value);
                    if (isNaN(v)) v = 1;
                    if (v < 1) v = 1;
                    if (v > currentOption.terms) v = currentOption.terms;
                    setTermCount(v);
                    setSelectedPaymentBox(null);
                  }}
                />
                <span style={subLabel}>(1 to {currentOption.terms} terms allowed)</span>
              </div>
            )}
            <div style={{ flex: 2 }}>
              <label style={label}>Payment Counts</label>
              <div style={{ display: "flex", gap: 8 }}>
                {paymentBoxes.map(num => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setSelectedPaymentBox(num)}
                    style={{
                      width: 34, height: 34,
                      fontSize: 15,
                      marginRight: 3,
                      border: "1.5px solid #6366f1",
                      borderRadius: 8,
                      background: selectedPaymentBox === num ? "#6366f1" : "#fff",
                      color: selectedPaymentBox === num ? "#fff" : "#222",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "background .13s"
                    }}>
                    {num}
                  </button>
                ))}
              </div>
              {showTermCount &&
                <span style={subLabel}>Click a box to select active payment term.</span>
              }
            </div>
          </div>
          {/* Payment Details Table */}
          {showTermCount && (
            <div style={{ marginTop: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafaff", borderRadius: 8, boxShadow: "0 1px 4px #e5e7eb" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Payment No</th>
                    <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Date</th>
                    <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Deposit Slip</th>
                    <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentDetails.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center", padding: 8, border: "1px solid #e5e7eb" }}>{idx + 1}</td>
                      <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                        <input
                          type="date"
                          style={modernInput}
                          value={row.date}
                          onChange={e => handlePaymentDetailChange(idx, "date", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={e => handlePaymentDetailChange(idx, "depositSlip", e)}
                        />
                        {row.depositSlip && (
                          <div style={{ fontSize: 12, color: "#2563eb" }}>{row.depositSlip.name}</div>
                        )}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={e => handlePaymentDetailChange(idx, "receipt", e)}
                        />
                        {row.receipt && (
                          <div style={{ fontSize: 12, color: "#2563eb" }}>{row.receipt.name}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visa Services */}
        <div style={sectionStyle}>
          <label style={label}>Visa Services</label>
          <div style={{ display: "flex", gap: 28, marginBottom: 10 }}>
            <label><input type="checkbox" /> Visa Service</label>
            <label><input type="checkbox" /> Insurance Service</label>
            <label><input type="checkbox" /> E+TA</label>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            <label><input type="checkbox" /> PDF deposit slip</label>
            <label><input type="checkbox" /> PDF deposit slip</label>
          </div>
        </div>

        {/* Passports */}
        <div style={sectionStyle}>
          <label style={label}>Passports</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {passports.map((comp, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 110px 1fr 70px 60px 60px 1fr 60px",
                  alignItems: "center",
                  background: i === 0 ? "#f3f4f6" : "#f8fafc",
                  borderRadius: 8,
                  padding: "12px 0",
                  gap: 8,
                  overflowX: "auto"
                }}
              >
                <span>{i === 0 ? "Client" : `Companion ${i}`}</span>
                <input
                  style={{ ...modernInput, width: "100%", minWidth: 100, background: "#fff" }}
                  type="text"
                  placeholder={`Name ${i + 1}`}
                  value={comp.name}
                  readOnly
                />
                <span style={{ color: "#555" }}>Attachment:</span>
                <input type="file" />
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" /> PDF
                </label>
                <span style={{ color: "#555" }}>Visa:</span>
                <input type="file" />
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" /> PDF
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Schedule */}
        <div style={sectionStyle}>
          <label style={label}>Payment Schedule</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <label style={{ marginRight: 16 }}><input type="checkbox" /> 1st Payment Date:</label>
            <input type="date" style={{ ...modernInput, width: 160 }} />
            <span style={{ marginLeft: 22 }}>Deposit Slip:</span>
            <label style={{ marginLeft: 6 }}><input type="checkbox" /> PDF</label>
            <span style={{ marginLeft: 22 }}>Receipt:</span>
            <label style={{ marginLeft: 6 }}><input type="checkbox" /> PDF</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <span>2nd Payment Date:</span>
            <input type="date" style={{ ...modernInput, width: 160 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <span>3rd Payment Date:</span>
            <input type="date" style={{ ...modernInput, width: 160 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label><input type="checkbox" /> Other Payments:</label>
            <input type="text" placeholder="Specify" style={{ ...modernInput, width: 220 }} />
            <span style={{ marginLeft: 18 }}>Attachment</span>
            <input type="file" style={{ marginLeft: 6 }} />
          </div>
        </div>

        {/* Embassy */}
        <div style={sectionStyle}>
          <label style={label}>Embassy</label>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div>
              <span style={{ minWidth: 140, display: "inline-block" }}>Appointment Date:</span>
              <input type="date" style={modernInput} />
            </div>
            <div>
              <span style={{ minWidth: 170, display: "inline-block" }}>Release of Visa Date:</span>
              <input type="date" style={modernInput} />
            </div>
            <div>
              <span style={{ minWidth: 180, display: "inline-block" }}>Visa Result Advisory Date:</span>
              <input type="date" style={modernInput} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MainPage;