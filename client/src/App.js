import React, { useState, useEffect } from "react";
import "./App.css";

// Component Imports
const Dashboard = ({ apiUrl, setLoading }) => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      // FIX: Changed endpoint to match server's dashboard endpoint
      const response = await fetch(`${apiUrl}/dashboard-stats`);
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError("Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  if (!summary) return <div className="view-content">Loading...</div>;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>System Overview</h2>
        <p>Real-time Industrial Symbiosis Metrics</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-value">{summary.total_industries || 0}</div>
          <div className="metric-label">Connected Industries</div>
          <div className="metric-chart"></div>
        </div>

        <div className="metric-card success">
          <div className="metric-value">{summary.available_materials || 0}</div>
          <div className="metric-label">Available Materials</div>
          <div className="metric-chart"></div>
        </div>

        <div className="metric-card accent">
          <div className="metric-value">
            {summary.completed_transactions || 0}
          </div>
          <div className="metric-label">Completed Transactions</div>
          <div className="metric-chart"></div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-value">
            {Math.round((summary.avg_feasibility || 0) * 100)}%
          </div>
          <div className="metric-label">Avg Feasibility Index</div>
          <div className="metric-chart"></div>
        </div>

        <div className="metric-card info">
          <div className="metric-value">
            {(summary.total_material_quantity || 0).toFixed(0)}
          </div>
          <div className="metric-label">Total Material Stock (tons)</div>
          <div className="metric-chart"></div>
        </div>

        <div className="metric-card success">
          <div className="metric-value">{summary.active_connections || 0}</div>
          <div className="metric-label">Active Symbiosis Connections</div>
          <div className="metric-chart"></div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🔄 Circulation Efficiency</h4>
            <p>
              Material reabsorption cycles are optimizing with each transaction,
              reducing waste disposal timelines.
            </p>
          </div>
          <div className="insight-card">
            <h4>🌍 Ecosystem Impact</h4>
            <p>
              {summary.completed_transactions} successful material transfers
              have prevented equivalent tonnage from landfill.
            </p>
          </div>
          <div className="insight-card">
            <h4>📊 Predictive Accuracy</h4>
            <p>
              Compatibility assessments consistently identify viable reuse
              pathways across {summary.total_industries} industrial sectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndustriesView = ({ apiUrl, setLoading }) => {
  const [industries, setIndustries] = useState([]);
  const [newIndustry, setNewIndustry] = useState({
    name: "",
    sector: "",
    description: "",
    location: "",
    annual_output: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/industries`);
      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error("Error fetching industries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/industries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIndustry),
      });

      if (response.ok) {
        setNewIndustry({
          name: "",
          sector: "",
          description: "",
          location: "",
          annual_output: "",
        });
        setShowForm(false);
        fetchIndustries();
      }
    } catch (error) {
      console.error("Error adding industry:", error);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Industrial Ecosystem</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "× Cancel" : "+ Add Industry"}
        </button>
      </div>

      {showForm && (
        <form className="form-container" onSubmit={handleAddIndustry}>
          <div className="form-group">
            <label>Industry Name *</label>
            <input
              type="text"
              value={newIndustry.name}
              onChange={(e) =>
                setNewIndustry({ ...newIndustry, name: e.target.value })
              }
              placeholder="e.g., Steel Manufacturing Co."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sector *</label>
              <select
                value={newIndustry.sector}
                onChange={(e) =>
                  setNewIndustry({ ...newIndustry, sector: e.target.value })
                }
                required
              >
                <option value="">Select Sector</option>
                <option value="Steel">Steel Manufacturing</option>
                <option value="Chemicals">Chemical Manufacturing</option>
                <option value="Textiles">Textiles</option>
                <option value="Construction">Construction Materials</option>
                <option value="Electronics">Electronics</option>
                <option value="Food">Food & Beverage</option>
                <option value="Energy">Energy Generation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newIndustry.location}
                onChange={(e) =>
                  setNewIndustry({ ...newIndustry, location: e.target.value })
                }
                placeholder="e.g., Industrial Zone, Region"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newIndustry.description}
              onChange={(e) =>
                setNewIndustry({ ...newIndustry, description: e.target.value })
              }
              placeholder="Brief description of industry operations..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Annual Output (tons)</label>
            <input
              type="number"
              value={newIndustry.annual_output}
              onChange={(e) =>
                setNewIndustry({
                  ...newIndustry,
                  annual_output: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>
          <button type="submit" className="btn btn-success">
            Submit Industry
          </button>
        </form>
      )}

      <div className="industries-grid">
        {industries.map((industry) => (
          <div key={industry.id} className="industry-card">
            <div className="card-header">
              <h3>{industry.name}</h3>
              <span className="sector-badge">{industry.sector}</span>
            </div>
            <div className="card-body">
              <p className="card-description">{industry.description}</p>
              <div className="card-meta">
                <span>📍 {industry.location || "Unknown"}</span>
                <span>📊 {industry.annual_output || "N/A"} tons/year</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MaterialsView = ({ apiUrl, setLoading }) => {
  const [materials, setMaterials] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    material_type: "",
    quantity_available: "",
    unit: "kg",
    industry_id: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("available");

  useEffect(() => {
    fetchMaterials();
    fetchIndustries();
  }, [filterStatus]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // FIX: Server now handles ?status=
      const response = await fetch(
        `${apiUrl}/materials?status=${filterStatus}`,
      );
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await fetch(`${apiUrl}/industries`);
      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      // FIX: Map quantity_available to quantity for server schema
      const payload = {
        ...newMaterial,
        quantity: parseFloat(newMaterial.quantity_available),
        // Remove the old key so it doesn't cause confusion
        quantity_available: undefined,
      };

      const response = await fetch(`${apiUrl}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewMaterial({
          name: "",
          material_type: "",
          quantity_available: "",
          unit: "kg",
          industry_id: "",
        });
        setShowForm(false);
        fetchMaterials();
      }
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Material Inventory</h2>
        <div className="header-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="archived">Archived</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "× Cancel" : "+ Add Material"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="form-container" onSubmit={handleAddMaterial}>
          <div className="form-row">
            <div className="form-group">
              <label>Material Name *</label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, name: e.target.value })
                }
                placeholder="e.g., Recycled Steel Scrap"
                required
              />
            </div>
            <div className="form-group">
              <label>Material Type *</label>
              <input
                type="text"
                value={newMaterial.material_type}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    material_type: e.target.value,
                  })
                }
                placeholder="e.g., Metal, Plastic, Chemical"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Source Industry *</label>
              <select
                value={newMaterial.industry_id}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    industry_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={newMaterial.quantity_available}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    quantity_available: e.target.value,
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select
                value={newMaterial.unit}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, unit: e.target.value })
                }
              >
                <option value="kg">Kilogram</option>
                <option value="ton">Ton</option>
                <option value="liter">Liter</option>
                <option value="unit">Unit</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-success">
            Add Material
          </button>
        </form>
      )}

      <div className="materials-list">
        {materials.length === 0 ? (
          <div className="empty-state">No materials found</div>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="material-row">
              <div className="material-info">
                <h4>{material.name}</h4>
                <span className="material-type">{material.material_type}</span>
              </div>
              <div className="material-details">
                <span>Source: {material.industry_name}</span>
                <span className="material-quantity">
                  {/* FIX: Server uses 'quantity' */}
                  {material.quantity} {material.unit}
                </span>
              </div>
              <div className="material-status">
                <span
                  className={`status-badge ${material.availability_status}`}
                >
                  {material.availability_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SymbiosisNetwork = ({ apiUrl, setLoading }) => {
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      // FIX: Server now has this endpoint
      const response = await fetch(`${apiUrl}/symbiosis/network`);
      const data = await response.json();
      setNetwork(data);
    } catch (error) {
      console.error("Error fetching network:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Industrial Symbiosis Network</h2>
        <p>Visual representation of cross-industry material reuse pathways</p>
      </div>

      <div className="network-visualization">
        <div className="network-canvas">
          <svg className="network-svg">
            {/* Network edges */}
            {network?.edges?.map((edge) => (
              <g key={`edge-${edge.id}`} className="network-edge">
                <line
                  x1={`${((edge.source - 1) % 3) * 250 + 100}`}
                  y1={`${Math.floor((edge.source - 1) / 3) * 250 + 100}`}
                  x2={`${((edge.target - 1) % 3) * 250 + 100}`}
                  y2={`${Math.floor((edge.target - 1) / 3) * 250 + 100}`}
                  strokeWidth={Math.max(1, edge.strength * 3)}
                  stroke={`rgba(100, 150, 200, ${edge.strength})`}
                />
              </g>
            ))}

            {/* Network nodes */}
            {network?.nodes?.map((node) => (
              <g key={`node-${node.id}`} className="network-node">
                <circle
                  cx={`${((node.id - 1) % 3) * 250 + 100}`}
                  cy={`${Math.floor((node.id - 1) / 3) * 250 + 100}`}
                  r="40"
                  className="node-circle"
                />
                <text
                  x={`${((node.id - 1) % 3) * 250 + 100}`}
                  y={`${Math.floor((node.id - 1) / 3) * 250 + 100}`}
                  textAnchor="middle"
                  className="node-label"
                >
                  {node.name.split(" ")[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="network-legend">
          <h4>Network Statistics</h4>
          <div className="legend-item">
            <span className="legend-color primary"></span>
            <span>Nodes: {network?.nodes?.length || 0} Industries</span>
          </div>
          <div className="legend-item">
            <span className="legend-color secondary"></span>
            <span>Edges: {network?.edges?.length || 0} Connections</span>
          </div>
          <div className="legend-info">
            <p>
              Line thickness represents connection strength. Darker lines
              indicate stronger symbiosis potential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompatibilityAssessment = ({ apiUrl, setLoading }) => {
  const [assessments, setAssessments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [newAssessment, setNewAssessment] = useState({
    source_material_id: "",
    target_industry_id: "",
    chemical_similarity: 75,
    mechanical_tolerance: 75,
    thermodynamic_stability: 75,
    regulatory_alignment: 75,
    functional_viability: 75,
    preprocessing_requirements: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAssessments();
    fetchMaterials();
    fetchIndustries();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      // FIX: Changed endpoint from /compatibility/assessments to /reuse-opportunities
      const response = await fetch(`${apiUrl}/reuse-opportunities`);
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${apiUrl}/materials?status=available`);
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await fetch(`${apiUrl}/industries`);
      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };

  const handleAssess = async (e) => {
    e.preventDefault();
    try {
      // FIX: Changed endpoint from /compatibility/assess to /reuse-opportunities
      const response = await fetch(`${apiUrl}/reuse-opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAssessment,
          source_material_id: parseInt(newAssessment.source_material_id),
          target_industry_id: parseInt(newAssessment.target_industry_id),
        }),
      });

      if (response.ok) {
        setNewAssessment({
          source_material_id: "",
          target_industry_id: "",
          chemical_similarity: 75,
          mechanical_tolerance: 75,
          thermodynamic_stability: 75,
          regulatory_alignment: 75,
          functional_viability: 75,
          preprocessing_requirements: "",
        });
        setShowForm(false);
        fetchAssessments();
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
    }
  };

  const getFeasibilityColor = (value) => {
    if (value >= 80) return "#10b981";
    if (value >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Compatibility Assessment</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "× Cancel" : "+ New Assessment"}
        </button>
      </div>

      {showForm && (
        <form className="form-container" onSubmit={handleAssess}>
          <div className="form-row">
            <div className="form-group">
              <label>Source Material *</label>
              <select
                value={newAssessment.source_material_id}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    source_material_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Material</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Target Industry *</label>
              <select
                value={newAssessment.target_industry_id}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    target_industry_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="assessment-params">
            <h4>Assessment Parameters</h4>
            {[
              "chemical_similarity",
              "mechanical_tolerance",
              "thermodynamic_stability",
              "regulatory_alignment",
              "functional_viability",
            ].map((param) => (
              <div key={param} className="param-slider">
                <label>{param.replace(/_/g, " ")}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newAssessment[param]}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      [param]: parseInt(e.target.value),
                    })
                  }
                />
                <span className="param-value">{newAssessment[param]}%</span>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Preprocessing Requirements</label>
            <textarea
              value={newAssessment.preprocessing_requirements}
              onChange={(e) =>
                setNewAssessment({
                  ...newAssessment,
                  preprocessing_requirements: e.target.value,
                })
              }
              placeholder="Describe any preprocessing needed..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-success">
            Run Assessment
          </button>
        </form>
      )}

      <div className="assessments-list">
        {assessments.length === 0 ? (
          <div className="empty-state">
            No assessments yet. Create one to get started.
          </div>
        ) : (
          assessments.map((assessment) => (
            <div key={assessment.id} className="assessment-card">
              <div className="assessment-header">
                {/* FIX: Server aliased this as target_industry_name */}
                <h4>
                  {assessment.material_name} → {assessment.target_industry_name}
                </h4>
                <div
                  className="feasibility-score"
                  style={{
                    backgroundColor: getFeasibilityColor(
                      assessment.feasibility_index * 100,
                    ),
                  }}
                >
                  {Math.round(assessment.feasibility_index * 100)}%
                </div>
              </div>
              <div className="assessment-params-display">
                <span>
                  🧪 Chemistry: {assessment.chemical_similarity || 75}%
                </span>
                <span>
                  ⚙️ Mechanics: {assessment.mechanical_tolerance || 75}%
                </span>
                <span>
                  🌡️ Thermodynamics: {assessment.thermodynamic_stability || 75}%
                </span>
                <span>
                  ⚖️ Regulation: {assessment.regulatory_alignment || 75}%
                </span>
                <span>
                  🔧 Function: {assessment.functional_viability || 75}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TransactionsView = ({ apiUrl, setLoading }) => {
  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // FIX: Added status query param
      const response = await fetch(
        `${apiUrl}/transactions?status=${filterStatus}`,
      );
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Material Transactions</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="transactions-timeline">
        {transactions.length === 0 ? (
          <div className="empty-state">No transactions found</div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-timeline-marker"></div>
              <div className="transaction-content">
                <div className="transaction-header">
                  <h4>{transaction.material_name}</h4>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="transaction-route">
                  {transaction.source_industry} → {transaction.target_industry}
                </p>
                <div className="transaction-details">
                  <span>
                    📦 {transaction.quantity_transferred} {transaction.unit}
                  </span>
                  <span>
                    📅{" "}
                    {new Date(
                      transaction.transaction_date,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Analytics = ({ apiUrl, setLoading }) => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // FIX: Server now has this endpoint
      const response = await fetch(`${apiUrl}/analytics/circulation`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Analytics & Insights</h2>
        <p>Material circulation metrics and system performance</p>
      </div>

      <div className="analytics-section">
        <div className="chart-container">
          <h3>Circulation Velocity Trends</h3>
          <div className="placeholder-chart">
            <p>Material reabsorption rates trending upward</p>
            <div className="chart-bars">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="chart-bar"
                  style={{ height: `${40 + Math.random() * 50}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="metrics-table">
          <h3>Material Circulation Metrics</h3>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Industry</th>
                <th>Days to Reabsorption</th>
                <th>Circulation Cycles</th>
                <th>Reabsorption Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.slice(0, 10).map((metric) => (
                <tr key={metric.id}>
                  <td>{metric.material_name || "N/A"}</td>
                  <td>{metric.industry_name}</td>
                  <td>{metric.days_to_reabsorption || 0}</td>
                  <td>{metric.circulation_cycles || 0}</td>
                  <td>{((metric.reabsorption_rate || 0) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [apiUrl] = useState("http://localhost:5000/api");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "network", label: "Symbiosis Network", icon: "🕸️" },
    { id: "industries", label: "Industries", icon: "🏭" },
    { id: "materials", label: "Materials", icon: "📦" },
    { id: "compatibility", label: "Compatibility", icon: "🔬" },
    { id: "transactions", label: "Transactions", icon: "💱" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  const renderView = () => {
    const props = { apiUrl, setLoading };

    switch (currentView) {
      case "dashboard":
        return <Dashboard {...props} />;
      case "network":
        return <SymbiosisNetwork {...props} />;
      case "industries":
        return <IndustriesView {...props} />;
      case "materials":
        return <MaterialsView {...props} />;
      case "compatibility":
        return <CompatibilityAssessment {...props} />;
      case "transactions":
        return <TransactionsView {...props} />;
      case "analytics":
        return <Analytics {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            Industrial Symbiosis Intelligence Engine
          </h1>
          <p className="app-subtitle">
            Predictive Material Reuse Discovery System
          </p>
        </div>
      </header>

      <div className="app-container">
        <nav className="sidebar">
          <div className="nav-header">Navigation</div>
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-button ${currentView === item.id ? "active" : ""}`}
                  onClick={() => setCurrentView(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="main-content">
          {loading && <div className="loading-overlay">Processing...</div>}
          {renderView()}
        </main>
      </div>
    </div>
  );
}
