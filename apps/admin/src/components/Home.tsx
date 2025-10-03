import React from "react";
import Hero from "./Hero";          // Hero is in the same components folder
import ToursList from "../pages/tours"; // ToursList is in src/pages/tours (index.tsx)

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