import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_KEY = process.env.REACT_APP_API_KEY;
  const ASIN = process.env.REACT_APP_ASIN;

  useEffect(() => {
    const getLatestCount = (dataArray) => {
      if (dataArray.length === 0) return 0;
      return dataArray[dataArray.length - 1];
    };

    const fetchProductData = async () => {
      const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&offers=20`;
      try {
        const response = await axios.get(url);
        const product = response.data.products[0];

        const filteredData = {
          asin: product.asin,
          images: product.imagesCSV ? product.imagesCSV.split(",") : [],
          size: product.size,
          color: product.color,
          offers: product.offers,
          reviews: product.reviews?.reviewCount || [],
          ratings: product.reviews?.ratingCount || [],
          variation: product.variations,
          totalRatings: getLatestCount(product.reviews?.ratingCount || []),
          totalReviews: getLatestCount(product.reviews?.reviewCount || []),
        };

        return filteredData;
      } catch (err) {
        console.error(`Error fetching data for ASIN ${ASIN}:`, err);
      }
    };

    const fetchLastMonthData = async () => {
      const lastMonthUrl = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&stats=30`;
      try {
        const response = await axios.get(lastMonthUrl);
        const product = response.data.products[0];

        return {
          lastMonthRatings: getLatestCount(product.reviews?.ratingCount || []),
          lastMonthReviews: getLatestCount(product.reviews?.reviewCount || []),
        };
      } catch (err) {
        console.error(
          `Error fetching last month's data for ASIN ${ASIN}:`,
          err
        );
      }
    };

    const fetchData = async () => {
      setLoading(true);
      const productData = await fetchProductData();
      const lastMonthData = await fetchLastMonthData();

      if (productData && lastMonthData) {
        const ratingDifference =
          productData.totalRatings - lastMonthData.lastMonthRatings;
        const reviewDifference =
          productData.totalReviews - lastMonthData.lastMonthReviews;

        setData({
          ...productData,
          ratingDifference,
          reviewDifference,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [ASIN, API_KEY]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Keepa Product Data</h1>
      {data && (
        <table>
          <thead>
            <tr>
              <th>ASIN</th>
              <th>Attributes</th>
              <th>Variation Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p>{data.asin}</p>
                {data.images.length > 0 && (
                  <img
                    src={`https://images-na.ssl-images-amazon.com/images/I/${data.images[0]}.jpg`}
                    alt={data.asin}
                    style={{ width: "100px" }}
                  />
                )}
              </td>
              <td>
                <p>Size: {data.size}</p>
                <p>Color: {data.color}</p>
              </td>
              <td>
                <p>Total Ratings: {data.totalRatings}</p>
                <p>Total Reviews: {data.totalReviews}</p>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
