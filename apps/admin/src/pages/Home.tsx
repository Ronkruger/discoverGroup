import React from "react";
import Hero from "../components/Hero";
import ToursList from "./tours";

export default function Home(): JSX.Element {
  return (
    <div>
      <Hero />
      <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
        <ToursList />
      </div>
    </div>
  );
}