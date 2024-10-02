import axios from "axios";
import { getLatestCount } from "../helpers/getLatestCount";

const API_KEY = process.env.REACT_APP_API_KEY;
const ASIN = process.env.REACT_APP_ASIN;

export const fetchMainProduct = async () => {
  const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&offers=20`;
  try {
    const response = await axios.get(url);
    const mainProduct = response.data.products[0];

    const variantASINs = Array.from(
      new Set(mainProduct.variations?.map((variation) => variation.asin) || [])
    );
    //console.log("VARIANT ASINS:" + variantASINs);

    return variantASINs;
  } catch (err) {
    console.error(`Error fetching main product data:`, err);
  }
};

export const fetchProductData = async (variantASINs) => {
  if (variantASINs.length === 0) return [];

  //console.log("FETCHING DATA FOR ASINS:", variantASINs);

  const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${variantASINs.join(
    ","
  )}&rating=1&offers=20`;
  try {
    const response = await axios.get(url);
    const products = response.data.products; // Get the array of products

    console.log("RECEIVED PRODUCT DATA:", JSON.stringify(products, null, 2));

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

        const monthlySold = product.monthlySold;

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
          sales: monthlySold,
        });
        console.log(`SALES FOR ${product.asin}: ${monthlySold}`);
        console.log(
          `TOTAL RATINGS FOR ${product.asin}: ${getLatestCount(
            product.reviews?.ratingCount || []
          )}`
        );
      }
    });

    const allProductData = Array.from(productMap.values());
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
    return []; // return array if error
  }
};

export const fetchLastMonthData = async (variantASINs) => {
  if (variantASINs.length === 0) return [];

  const lastMonthUrl = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${variantASINs.join(
    ","
  )}&rating=1&stats=30`;
  try {
    const response = await axios.get(lastMonthUrl);
    const products = response.data.products;

    return products.map((product) => ({
      asin: product.asin,
      lastMonthRatings: getLatestCount(product.reviews?.ratingCount || []),
      lastMonthReviews: getLatestCount(product.reviews?.reviewCount || []),
    }));
  } catch (err) {
    console.error(
      `Error fetching last month's data for ASINs ${variantASINs.join(", ")}:`,
      err
    );
    return [];
  }
};
