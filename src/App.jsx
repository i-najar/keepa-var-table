import React, { useEffect, useState } from "react";
import "./App.css";
import ProductTable from "./ProductTable";
import {
  fetchMainProduct,
  fetchProductData,
  fetchLastMonthData,
} from "./api/keepaApi";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_KEY = process.env.REACT_APP_API_KEY;
  const ASIN = process.env.REACT_APP_ASIN;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const variantASINs = await fetchMainProduct(ASIN);
        const productsData =
          variantASINs.length > 0 ? await fetchProductData(variantASINs) : [];
        const lastMonthData = await fetchLastMonthData(variantASINs);

        if (productsData.length > 0 && lastMonthData) {
          const aggregatedData = productsData.map((productData) => {
            const lastMonthEntry =
              lastMonthData.find((entry) => entry.asin === productData.asin) ||
              {};
            const ratingDifference =
              productData.totalRatings - lastMonthEntry.lastMonthRatings;
            const reviewDifference =
              productData.totalReviews - lastMonthEntry.lastMonthReviews;

            return {
              ...productData,
              ratingDifference,
              reviewDifference,
            };
          });
          setData(aggregatedData);
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ASIN, API_KEY]);

  return (
    <div>
      <h1>Keepa Product Variations Data</h1>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading ... </p>
        </div>
      ) : (
        data && <ProductTable data={data} />
      )}
    </div>
  );
}

export default App;
