import { Star, Sparkles, Gem, BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { trustMarks } from "../../data/siteData";
import "./Hero.css";


const HERO_IMAGE = null;

const trustIcons = [BadgeCheck, Lock, Star];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__text">
        <span className="hero__tag">
          <Star size={10} fill="currentColor" /> THE HAUTE EVENT CURATION PLATFORM
        </span>

        <h1 className="hero__title">
          Connecting Services, <em>Creating Celebrations.</em>
        </h1>
        <p className="hero__subtitle">
          Find trusted event professionals and plan unforgettable events with ease.
        </p>

        <div className="hero__buttons">
          <button className="btn btn--plum"><Sparkles size={14} /> Book Services</button>
          <button className="btn btn--white"><Gem size={14} /> Become a Provider</button>
        </div>

        <ul className="hero__trust">
          {trustMarks.map((mark, i) => {
            const Icon = trustIcons[i];
            return (
              <li key={mark}><Icon size={13} /> {mark}</li>
            );
          })}
        </ul>
      </div>

      <div className="hero__visual">
        <div
          className="hero__image"
          style={HERO_IMAGE ? { backgroundImage: `url(${HERO_IMAGE})` } : undefined}
          role="img"
          aria-label="Elegant banquet hall with floral chandeliers"
        />

        <div className="hero__badge hero__badge--top">
          <span className="hero__badge-icon hero__badge-icon--gold"><BadgeCheck size={16} /></span>
          <div>
            <strong>100% Verified Providers</strong>
            <small>Strict Multi-Stage Vetting</small>
          </div>
        </div>

        <div className="hero__badge hero__badge--bottom">
          <span className="hero__badge-icon hero__badge-icon--purple"><ShieldCheck size={16} /></span>
          <div>
            <strong>20% Escrow Protection</strong>
            <small>Zero-Risk Milestones</small>
          </div>
        </div>

        <div className="hero__rating">
          <Star size={13} fill="var(--gold)" color="var(--gold)" />
          <strong>4.9/5</strong>
          <small>Over 1,200+ Reviews</small>
        </div>
      </div>
    </section>
  );
}
