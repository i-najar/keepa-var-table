import React from "react";
import "./Variant.css";

const Variant = ({ variant, isMainProduct }) => {
  const variantImage =
    variant.images && variant.images.length > 0
      ? `https://images-na.ssl-images-amazon.com/images/I/${variant.images[0]}.jpg`
      : "";

  return (
    <tr>
      <td className="asin-cell">
        <p>{variant.asin}</p>
        {variantImage && (
          <img
            src={variantImage}
            alt={variant.asin}
            className="product-image"
          />
        )}
      </td>
      <td className="attributes-cell">
        <p>Size: {variant.size || "N/A"}</p>
        <p>Color: {variant.color || "N/A"}</p>
      </td>
      <td className="variation-data-cell">
        <p>
          {variant.numberOfOffers} offers from ${variant.lowestPrice}
        </p>
        <p>
          Variation Ratings: {variant.totalRatings} (+{variant.ratingDifference}{" "}
          last month)
        </p>
        <p>
          Variation Reviews: {variant.totalReviews} (+{variant.reviewDifference}{" "}
          last month)
        </p>

        {variant.sales !== undefined && (
          <p>Variation Sales: {variant.sales}+/month</p>
        )}
      </td>
    </tr>
  );
};

export default Variant;
