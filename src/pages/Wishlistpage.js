import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || []
    setWishlist(saved)
  }, [])

  const handleRemove = (propertyId) => {
    const updated = wishlist.filter((item) => Number(item.id) !== Number(propertyId))
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p>No properties in wishlist.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {wishlist.map((property) => (
            <div key={property.id} className="bg-white shadow rounded-lg p-4">
              <img
                src={property.image || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="font-semibold">{property.title}</h2>
              <p className="text-gray-500 text-sm">
                {property.city}{property.state ? `, ${property.state}` : ""}
              </p>

              <Link
                to={`/properties/${property.id}`}
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                View Details
              </Link>

              <button
                onClick={() => handleRemove(property.id)}
                className="ml-4 text-red-600 text-sm mt-2 inline-block"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
