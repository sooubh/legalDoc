"use client";
import { Chrono } from "react-chrono";

export default function AIGeneratedTimeline({ events }: { events: any[] }) {
  // "events" is an array of objects you’ll get from your AI model
  return (
    <div className="w-full h-[600px]">
      <Chrono
        items={events}
        mode="VERTICAL_ALTERNATING" // also "HORIZONTAL", "VERTICAL"
        theme={{
          primary: "#2563eb",  // Tailwind blue-600
          secondary: "#1e293b", // slate-800
          cardBgColor: "#f8fafc",
          titleColor: "#0f172a",
        }}
        scrollable
      />
    </div>
  );
}
