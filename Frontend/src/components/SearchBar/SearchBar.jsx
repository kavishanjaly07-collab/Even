import { useState } from "react";
import { LayoutGrid, Calendar, MapPin, Users, Search } from "lucide-react";
import { serviceCategories, guestCounts } from "../../data/siteData";
import "./SearchBar.css";

export default function SearchBar() {
 
  const [search, setSearch] = useState({
    category: serviceCategories[0],
    date: "",
    city: "",
    guests: guestCounts[1],
  });


  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", search); 
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
    </form>
  );
}
