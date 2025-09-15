import React from "react";
import Hero from "../sections/Hero";
import Trust from "../sections/Trust";
import ServicesGrid from "../sections/ServicesGrid";
import Process from "../sections/Process";
import Testimonials from "../sections/Testimonials";
import CtaBanner from "../sections/CtaBanner";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Trust />
      <ServicesGrid />
      <Process />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
