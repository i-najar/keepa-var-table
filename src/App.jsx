import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_KEY = process.env.REACT_APP_API_KEY;
  const ASIN = process.env.REACT_APP_ASIN;

  useEffect(() => {
    const fetchProductData = async () => {
      const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&offers=20`;

      try {
        const response = await axios.get(url);

        const product = response.data.products[0];

        const getLatestCount = (dataArray) => {
          if (dataArray.length === 0) return 0;
          return dataArray[dataArray.length - 1];
        };

        const filteredData = {
          asin: product.asin,
          images: product.imagesCSV ? product.imagesCSV.split(",") : [],
          size: product.size,
          color: product.color,
          offers: product.offers,
          reviews: product.reviews?.reviewCount || [], // Might be redundant
          ratings: product.reviews?.ratingCount || [],
          variation: product.variations,
          totalRatings: getLatestCount(product.reviews?.ratingCount || []),
          totalReviews: getLatestCount(product.reviews?.reviewCount || []),
        };
        console.log(`DATA FOR ASIN ${ASIN}:`, filteredData);

        return filteredData;
      } catch (err) {
        console.error(`Error fetching data for ASIN ${ASIN}:`, err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      const productData = await fetchProductData();
      setData(productData);
      setLoading(false);
    };

    fetchData();
  }, [ASIN, API_KEY]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Keepa Product Data</h1>
      {data && (
        <div>
          <h2>ASIN: {data.asin}</h2>
          {data.images.length > 0 && (
            <img
              src={`https://images-na.ssl-images-amazon.com/images/I/${data.images[0]}.jpg`}
              alt={data.title}
              style={{ width: "100px" }}
            />
          )}
          <h2>Attributes</h2>
          <ul>
            <li>{data.size}</li>
            <li>{data.color}</li>
          </ul>
          <h2>Total Ratings:</h2>
          <p>{data.totalRatings}</p>
          <h2>Total Reviews:</h2>
          <p>{data.totalReviews}</p>
        </div>
      )}
    </div>
  );
}

export default App;
