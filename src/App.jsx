import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import ProductTable from "./ProductTable";

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

    const fetchMainProduct = async () => {
      const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&offers=20`;
      try {
        const response = await axios.get(url);
        const mainProduct = response.data.products[0];

        const variantASINs = Array.from(
          new Set(
            mainProduct.variations?.map((variation) => variation.asin) || []
          )
        );
        //console.log("VARIANT ASINS:" + variantASINs);

        return variantASINs;
      } catch (err) {
        console.error(`Error fetching main product data:`, err);
      }
    };

    const fetchProductData = async (variantASINs) => {
      if (variantASINs.length === 0) return [];

      console.log("FETCHING DATA FOR ASINS:", variantASINs);

      const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${variantASINs.join(
        ","
      )}&rating=1&offers=20`;
      try {
        const response = await axios.get(url);
        const products = response.data.products; // Get the array of products

        console.log("RECEIVED PRODUCT DATA:", products);

        const productMap = new Map();

        // Map products to include their ASINs
        products.forEach((product) => {
          if (product && product.asin && !productMap.has(product.asin)) {
            // Check for uniqueness
            const offersArray = product.offers
              ? product.offers
                  .map((offer) => {
                    const offerCSV = offer.offerCSV || [];
                    return offerCSV.length >= 2
                      ? offerCSV[offerCSV.length - 2]
                      : null;
                  })
                  .filter((price) => price !== null)
              : [];

            const numberOfOffers = offersArray.length;
            const lowestPriceCents =
              numberOfOffers > 0 ? Math.min(...offersArray) : null;
            const lowestPriceDollars =
              lowestPriceCents !== null
                ? (lowestPriceCents / 100).toFixed(2)
                : null;

            productMap.set(product.asin, {
              asin: product.asin,
              images: product.imagesCSV ? product.imagesCSV.split(",") : [],
              size: product.size,
              color: product.color,
              offers: offersArray,
              reviews: product.reviews?.reviewCount || [],
              ratings: product.reviews?.ratingCount || [],
              totalRatings: getLatestCount(product.reviews?.ratingCount || []),
              totalReviews: getLatestCount(product.reviews?.reviewCount || []),
              numberOfOffers,
              lowestPrice: lowestPriceDollars,
            });
            console.log(
              `TOTAL RATINGS FOR ${product.asin}: ${getLatestCount(
                product.reviews?.ratingCount || []
              )}`
            );
          }
        });

        const allProductData = Array.from(productMap.values()); // Convert Map back to array
        console.log(
          "ALL PRODUCT DATA (AFTER PROCESSING):",
          JSON.stringify(allProductData, null, 2)
        );

        // Check for duplicates
        const uniqueASINs = new Set();
        allProductData.forEach((product) => {
          if (uniqueASINs.has(product.asin)) {
            console.warn(`Duplicate found: ${product.asin}`);
          }
          uniqueASINs.add(product.asin);
        });

        return allProductData; // Return the array of product data
      } catch (err) {
        console.error(
          `Error fetching data for ASINs ${variantASINs.join(", ")}:`,
          err
        );
        return []; // Return an empty array in case of an error
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
      try {
        const variantASINs = await fetchMainProduct(); // Get variant ASINs first
        console.log("MAIN PRODUCT VARIANT ASINS:", variantASINs);

        // Pass variantASINs to fetchProductData
        const productsData =
          variantASINs.length > 0 ? await fetchProductData(variantASINs) : [];
        const lastMonthData = await fetchLastMonthData();

        // If you want to process the productsData further, you can do it here
        // For example, you can aggregate results or just set the data directly
        if (productsData.length > 0 && lastMonthData) {
          const aggregatedData = productsData.map((productData) => {
            const ratingDifference =
              productData.totalRatings - lastMonthData.lastMonthRatings;
            const reviewDifference =
              productData.totalReviews - lastMonthData.lastMonthReviews;

            console.log("RATINGDIFF: " + ratingDifference);

            return {
              ...productData,
              ratingDifference,
              reviewDifference,
            };
          });

          setData(aggregatedData); // Set the aggregated data
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
      } finally {
        setLoading(false); // Ensure loading is set to false in the end
      }
    };

    fetchData();
  }, [ASIN, API_KEY]);

  return (
    <div>
      <h1>Keepa Product Data</h1>
      {data && <ProductTable data={data} />}
    </div>
  );
}

export default App;
