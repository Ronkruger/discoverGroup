import type { Tour } from "../types";
import { Link } from "react-router-dom";

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <img
        src={tour.images?.[0] ?? "../image.png"}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{tour.title}</h3>
        <p className="text-sm mt-2">{tour.summary}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-600">{tour.durationDays} days</span>
          <Link to={`/tour/${tour.slug}`} className="text-blue-600 hover:underline">
            More Info →
          </Link>
        </div>
      </div>
    </article>
  );
}