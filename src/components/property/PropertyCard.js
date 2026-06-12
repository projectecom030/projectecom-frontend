import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, Eye } from "lucide-react";
import { resolveImageUrl } from "../../utils/imageUrl";

const CARD_VARIANTS = {
  standard: {
    shell:
      "bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-300/40 focus-within:shadow-xl focus-within:shadow-slate-300/40",
    accent: "from-white via-slate-50 to-slate-100",
    premiumBadge: "bg-slate-800 text-white",
    callButton:
      "border border-slate-300 text-slate-800 bg-white hover:bg-slate-100",
    whatsappButton:
      "border border-slate-300 text-slate-800 bg-white hover:bg-slate-100",
  },
  elite: {
    shell:
      "bg-gradient-to-br from-amber-50 via-yellow-50 to-white border border-amber-300 shadow-lg shadow-amber-200/35 hover:shadow-xl hover:shadow-amber-300/35 focus-within:shadow-xl focus-within:shadow-amber-300/35",
    accent: "from-amber-100/90 via-yellow-50 to-white",
    premiumBadge: "bg-amber-400 text-amber-950",
    callButton:
      "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-300/50",
    whatsappButton:
      "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-300/50",
  },
  superElite: {
    shell:
      "bg-gradient-to-br from-yellow-100 via-amber-50 to-white border-2 border-yellow-500 shadow-xl shadow-yellow-300/45 hover:shadow-2xl hover:shadow-yellow-300/40 focus-within:shadow-2xl focus-within:shadow-yellow-300/40",
    accent: "from-yellow-200/95 via-amber-100/70 to-white",
    premiumBadge: "bg-yellow-500 text-yellow-950",
    callButton:
      "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm shadow-yellow-400/45",
    whatsappButton:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-400/45",
  },
};

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const imageFallback =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `\u20B9${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `\u20B9${(price / 100000).toFixed(2)} L`;
    }
    return `\u20B9${price.toLocaleString()}`;
  };

  const isPremium = property.subscription_plan === "premium";
  const isElite = property.subscription_plan === "elite";
  const isSuperElite = property.subscription_plan === "super_elite";

  const cardType = isSuperElite ? "superElite" : isElite ? "elite" : "standard";
  const styles = CARD_VARIANTS[cardType];

  const fallbackImg = `https://source.unsplash.com/600x400/?${property.city || "building"}`;
  const imgSrc =
    property.primary_image && property.primary_image !== ""
      ? resolveImageUrl(property.primary_image)
      : fallbackImg;
  const imageUrls = useMemo(() => {
    const gallery = String(property.image_gallery || "")
      .split("||")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => resolveImageUrl(url));

    const unique = new Set(gallery);
    if (imgSrc) unique.add(imgSrc);
    if (unique.size === 0) unique.add(fallbackImg);
    return Array.from(unique);
  }, [property.image_gallery, imgSrc, fallbackImg]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property.id]);

  useEffect(() => {
    if (imageUrls.length <= 1) return undefined;
    const intervalId = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageUrls.length);
    }, 2500);
    return () => clearInterval(intervalId);
  }, [imageUrls.length]);

  const actionUrl = `/subscription?redirectTo=${encodeURIComponent(`/properties/${property.id}`)}`;
  const cardTapToSubscription = isElite || isSuperElite;

  const handleCardClick = (event) => {
    if (!cardTapToSubscription) return;
    if (event.target.closest("a, button")) return;
    navigate(actionUrl);
  };

  const handleCardKeyDown = (event) => {
    if (!cardTapToSubscription) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigate(actionUrl);
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1 ${styles.shell} ${cardTapToSubscription ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={cardTapToSubscription ? 0 : undefined}
      role={cardTapToSubscription ? "button" : undefined}
      aria-label={cardTapToSubscription ? "Open subscription" : undefined}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100`}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out group-hover:scale-105 group-focus-within:scale-105"
          style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
        >
          {imageUrls.map((url, index) => (
            <img
              key={`${property.id}-img-${index}`}
              src={url}
              alt={property.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imageFallback;
              }}
              className="h-full w-full min-w-full object-cover"
              loading="lazy"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
              property.listing_type === "sale"
                ? "bg-blue-600/95 text-white"
                : "bg-emerald-600/95 text-white"
            }`}
          >
            For {property.listing_type === "sale" ? "Sale" : "Rent"}
          </span>
          {property.is_featured && (
            <span className="rounded-full bg-amber-400/95 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm">
              Featured
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
            {property.property_type || "Property"}
          </span>
        </div>

        {isElite && (
          <div
            className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow ${styles.premiumBadge}`}
          >
            ELITE
          </div>
        )}
        {isSuperElite && (
          <div
            className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow ${styles.premiumBadge}`}
          >
            SUPER ELITE
          </div>
        )}
        {imageUrls.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {imageUrls.map((_, index) => (
              <span
                key={`${property.id}-dot-${index}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative flex h-full flex-col space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <div className="flex items-baseline gap-1">
          <span className="text-[2rem] leading-none font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {formatPrice(property.price)}
          </span>
          {property.listing_type === "rent" && (
            <span className="text-xs font-medium text-slate-500 sm:text-sm">/month</span>
          )}
        </div>

        <h3 className="line-clamp-1 text-base font-bold text-slate-900 sm:text-lg">{property.title}</h3>

        <div className="flex items-center gap-1 text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-500 sm:h-4 sm:w-4" />
          <span className="line-clamp-1 text-xs sm:text-sm">
            {property.city}, {property.state}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-100/80 px-3 py-2 text-xs font-medium text-slate-600 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            {property.view_count || 0} views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-500" />
            {property.contact_count || 0} contacts
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 border-t border-slate-200 pt-2.5 text-slate-700 sm:flex sm:items-center sm:gap-4 sm:pt-3">
          {property.bedrooms && (
            <div className="flex items-center justify-center gap-1 text-[11px] sm:justify-start sm:text-sm">
              <Bed className="h-3.5 w-3.5 text-slate-500 sm:h-4 sm:w-4" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center justify-center gap-1 text-[11px] sm:justify-start sm:text-sm">
              <Bath className="h-3.5 w-3.5 text-slate-500 sm:h-4 sm:w-4" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.area_sqft && (
            <div className="flex items-center justify-center gap-1 text-[11px] sm:justify-start sm:text-sm">
              <Square className="h-3.5 w-3.5 text-slate-500 sm:h-4 sm:w-4" />
              <span>{property.area_sqft} sqft</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          {isPremium && (
            <Link
              to={`/properties/${property.id}`}
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-xl bg-blue-600 px-2.5 py-2 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:px-4 sm:py-2.5"
            >
              <span className="truncate whitespace-nowrap">View</span>
            </Link>
          )}

          <Link
            to={actionUrl}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 sm:gap-2 sm:px-4 sm:py-2.5 ${styles.callButton}`}
          >
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate whitespace-nowrap">Call</span>
          </Link>

          <Link
            to={actionUrl}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 sm:gap-2 sm:px-4 sm:py-2.5 ${styles.whatsappButton}`}
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate whitespace-nowrap">WhatsApp</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
