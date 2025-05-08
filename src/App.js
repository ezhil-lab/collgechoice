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

    let minCutoff = baseCutoff;
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
    } else {
      minCutoff = 0;
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
          that band). <br />
          If no range is provided, it will show all colleges with cutoff less
          than or equal to your mark.
        </p>

        {/* Remaining UI and table logic continues... */}
      </div>
    </div>
  );
}

export default App;
