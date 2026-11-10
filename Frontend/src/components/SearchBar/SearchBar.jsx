import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Calendar, MapPin, Users, Search } from "lucide-react";
import { serviceCategories, guestCounts } from "../../data/siteData";
import "./SearchBar.css";

export default function SearchBar() {
  const navigate = useNavigate();

 
  const [search, setSearch] = useState({
    category: serviceCategories[0],
    date: "",
    city: "",
    guests: guestCounts[1],
  });
  const [searchError, setSearchError] = useState("");


  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
    setSearchError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!serviceCategories.includes(search.category) || !guestCounts.includes(search.guests)) {
      setSearchError("Please select a valid service category and guest count.");
      return;
    }

    if (search.date) {
      const today = new Date();
      const todayValue = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      if (Number.isNaN(Date.parse(`${search.date}T00:00:00`)) || search.date < todayValue) {
        setSearchError("Please choose a valid event date that is today or later.");
        return;
      }
    }

    const params = new URLSearchParams();

    if (search.category && search.category !== "Select Experience") {
      params.set("category", search.category);
    }

    if (search.date) {
      params.set("date", search.date);
    }

    if (search.city.trim()) {
      params.set("city", search.city.trim());
    }

    if (search.guests) {
      params.set("guests", search.guests);
    }

    navigate(`/BrowseServices?${params.toString()}`);
  };

  return (
    <form className="search" onSubmit={handleSubmit}>
      <label className="search__field">
        <span><LayoutGrid size={12} /> Service Category</span>
        <select name="category" value={search.category} onChange={handleChange}>
          {serviceCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <label className="search__field">
        <span><Calendar size={12} /> Event Date</span>
        <input type="date" name="date" value={search.date} onChange={handleChange} />
      </label>

      <label className="search__field">
        <span><MapPin size={12} /> City or Destination</span>
        <input
          type="text"
          name="city"
          placeholder="e.g. New York, Beverly Hills"
          value={search.city}
          onChange={handleChange}
        />
      </label>

      <label className="search__field">
        <span><Users size={12} /> Guest Count</span>
        <select name="guests" value={search.guests} onChange={handleChange}>
          {guestCounts.map((g) => <option key={g}>{g}</option>)}
        </select>
      </label>

      <button type="submit" className="btn btn--gold search__submit">
        <Search size={14} /> Find Event
      </button>
      {searchError && <p className="search__error" role="alert">{searchError}</p>}
    </form>
  );
}
