import React from "react";

const Variant = ({
  variant,
  offers,
  lowestPrice,
  totalRatings,
  ratingDifference,
  totalReviews,
  reviewDifference,
}) => {
  const variantImage = `https://images-na.ssl-images-amazon.com/images/I/${variant.images[0]}.jpg`;

  return (
    <div className="variant">
      <h3>ASIN: {variant.asin}</h3>
      {variant.images.length > 0 && (
        <img src={variantImage} alt={variant.asin} className="variant-image" />
      )}
      <p>Size: {variant.attributes.size}</p>
      <p>Color: {variant.attributes.color}</p>
      <p>
        Variation Ratings: {totalRatings} +{ratingDifference}
      </p>
      <p>
        Variation Reviews: {totalReviews} +{reviewDifference}
      </p>
    </div>
  );
};

export default Variant;
