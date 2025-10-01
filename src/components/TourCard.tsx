import type { Tour } from "../types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 h-80 flex flex-col">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={tour.images?.[0] ?? "../image.png"}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        {/* Darker gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
        {/* Top badge */}
        <span className="bg-yellow-400 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full self-start shadow">
          {tour.durationDays} days
        </span>

        {/* Middle content */}
        <div className="flex flex-col gap-2 mt-auto">
          <h3 className="text-lg font-bold leading-snug drop-shadow-md">
            {tour.title}
          </h3>
          <p className="text-sm text-gray-200 drop-shadow line-clamp-2">
            {tour.summary}
          </p>
          {tour.travelDate !== undefined && tour.travelDate !== null && (
            <p className="text-xs text-gray-300 mt-1">
              Travel Date: {`${tour.travelDate}`}
            </p>
          )}
        </div>

        {/* Footer: Price + CTA */}
        <div className="flex justify-between items-center mt-4">
          {typeof tour.price === "number" && (
            <span className="text-sm font-semibold">
              From{" "}
              <span className="text-yellow-400">
                ${tour.price.toLocaleString()}
              </span>
            </span>
          )}

          <Link
            to={`/tour/${tour.slug}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
          >
            More Info <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
