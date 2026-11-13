import logo from "../assets/fin.jpg";

export default function BrandLogo({ className = "", alt = "Event Connect" }) {
  return (
    <img
      className={`event-connect-logo ${className}`.trim()}
      src={logo}
      alt={alt}
      decoding="async"
      style={{ borderRadius: "50%" }}
    />
  );
}
