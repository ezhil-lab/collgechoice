import React, { useState } from "react";
import data from "./cutoff.json";
import "./index.css";

const categories = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

function App() {
  const [cutoff, setCutoff] = useState("");
  const [category, setCategory] = useState("BC");
  const [branches, setBranches] = useState([]);
  const [results, setResults] = useState([]);
  const [plusRange, setPlusRange] = useState("");
  const [minusRange, setMinusRange] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");

  const allBranches = [...new Set(data.map((d) => d.brn.toLowerCase()))].sort();

  const getLocationFromCollege = (college) => {
    if (!college) return "";
    const parts = college.split(",");
    let location = parts.length > 1 ? parts[parts.length - 1].trim() : "";
    location = location.replace(/-.*/, "").trim();
    return location;
  };

  const handleSearch = () => {
    const baseCutoff = parseFloat(cutoff);
    const plus = parseFloat(plusRange);
    const minus = parseFloat(minusRange);

    if (isNaN(baseCutoff)) return;

    let minCutoff = 0;
    let maxCutoff = baseCutoff;

    if (!isNaN(plus) && !isNaN(minus)) {
      minCutoff = baseCutoff - minus;
      maxCutoff = baseCutoff + plus;
    } else if (!isNaN(plus)) {
      minCutoff = baseCutoff;
      maxCutoff = baseCutoff + plus;
    } else if (!isNaN(minus)) {
      minCutoff = baseCutoff - minus;
      maxCutoff = baseCutoff;
    }

    let filtered = data.filter((entry) => {
      const categoryCutoff = parseFloat(entry[category]);
      if (
        isNaN(categoryCutoff) ||
        categoryCutoff < minCutoff ||
        categoryCutoff > maxCutoff
      )
        return false;
      if (!Object.keys(entry).includes(category)) return false;
      if (branches.length && !branches.includes(entry.brn.toLowerCase()))
        return false;
      return true;
    });

    setResults(filtered);
    setLocationFilter("");
  };

  const sortedResults = [...results].sort((a, b) => {
    const aCutoff = parseFloat(a[category]) || 0;
    const bCutoff = parseFloat(b[category]) || 0;
    return sortAsc ? aCutoff - bCutoff : bCutoff - aCutoff;
  });

  const locationList = [
    ...new Set(results.map((r) => getLocationFromCollege(r.con))),
  ].sort();

  const finalResults = locationFilter
    ? sortedResults.filter(
        (r) => getLocationFromCollege(r.con) === locationFilter
      )
    : sortedResults;

  const downloadCSV = () => {
    const csvHeader = ["College", "Location", "Branch", `Cutoff (${category})`];
    const csvRows = finalResults.map((r) => [
      r.con,
      getLocationFromCollege(r.con),
      r.brn,
      r[category],
    ]);

    const csvContent = [csvHeader, ...csvRows]
      .map((e) =>
        e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tnea_results.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-300">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
          TNEA College Finder
        </h1>

        <p className="text-center text-sm text-gray-600 mb-6">
          Based on publicly available cutoff data for 2024 from{" "}
          <a
            href="https://cutoff.tneaonline.org/"
            className="text-blue-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            cutoff.tneaonline.org
          </a>
          . <br />
          Use the + / − range fields to search within a range of your cutoff
          (e.g., ±5 will match colleges where your category cutoff is within
          that band). If no range is given, results will show for colleges with
          cutoff less than or equal to your score.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cutoff Mark
            </label>
            <input
              type="number"
              value={cutoff}
              onChange={(e) => setCutoff(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 w-full rounded"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              + Range (optional)
            </label>
            <input
              type="number"
              value={plusRange}
              onChange={(e) => setPlusRange(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              - Range (optional)
            </label>
            <input
              type="number"
              value={minusRange}
              onChange={(e) => setMinusRange(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Branches (Optional)
            </label>
            <select
              multiple
              value={branches}
              onChange={(e) =>
                setBranches(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="border p-2 w-full h-40 rounded"
            >
              {allBranches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-4">
          <button
            onClick={handleSearch}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 shadow"
          >
            Search
          </button>
          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download CSV
          </button>
        </div>

        {results.length > 0 && (
          <div className="mb-4 text-right">
            <label className="mr-2 text-sm font-medium">
              Filter by Location:
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              {locationList.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 text-blue-900">
            Results ({finalResults.length})
          </h2>
          <div className="overflow-x-auto rounded shadow">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="p-2 border">College</th>
                  <th className="p-2 border">Location</th>
                  <th className="p-2 border">Branch</th>
                  <th
                    className="p-2 border cursor-pointer"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    Cutoff ({category}) {sortAsc ? "↑" : "↓"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {finalResults.map((r, idx) => (
                  <tr key={idx} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="p-2 border">{r.con}</td>
                    <td className="p-2 border">
                      {getLocationFromCollege(r.con)}
                    </td>
                    <td className="p-2 border">{r.brn}</td>
                    <td className="p-2 border">{r[category]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
