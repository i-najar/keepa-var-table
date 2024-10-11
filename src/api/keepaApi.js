import axios from "axios";
import { getLatestCount } from "../helpers/getLatestCount";
import { getMonthAgoTimeStamp } from "../helpers/getMonthAgoTimeStamp";
import { findClosestValue } from "../helpers/findClosestValue";

const API_KEY = process.env.REACT_APP_API_KEY;
const ASIN = process.env.REACT_APP_ASIN;

console.log(ASIN);

/**
 * Fetches the main product information to access its variant products.
 *
 * @async
 * @function fetchMainProduct
 * @returns  {Promise<string[]>} A promise that becomes an array of unique ASINs
 *                               for the main product's variations.
 * @throws {Error} If the API request fails or if there is an issue with the response.
 *
 * @example
 * const variantASINs = await fetchMainProduct(ASIN);
 * console.log(variantASINs);
 */

export const fetchMainProduct = async () => {
  const url = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${ASIN}&rating=1&offers=20`;
  try {
    const response = await axios.get(url);
    const mainProduct = response.data.products[0];

    //    console.log("MAIN VARIATIONS:", mainProduct.variations.length);

    const variantASINs = Array.from(
      new Set(mainProduct.variations?.map((variation) => variation.asin) || [])
    );
    //console.log("VARIANT ASINS:" + variantASINs);

    return variantASINs;
  } catch (err) {
    console.error(`Error fetching main product data:`, err);
  }
};

/**
 * Fetches detailed product data for a list of variant ASINs.
 *
 * This function makes a batch request to Keepa and processes the response to map
 * all product details into an array of unique product data objects.
 *
 * @async
 * @function fetchProductData
 * @param {string[]} variantASINs - An array of ASINs for every product variant.
 *
 * @returns {Promise<Object[]>} - A promise that resolves into an array of product
 *                                data objects with detailed information for each.
 *                                Returns an empty array if no ASINs are provided,
 *                                or if an error is thrown.
 *
 * @throws {Error} If the API request fails/there are processing issues, error is thrown.
 *
 * @example
 * const productData = await fetchProductData(['ASIN1', 'ASIN2']);
 */

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

        // Get product info and turn into Map object
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
      }
    });

    // Output is an array of objects (i.e. array = [{asin: '213', size: 'med'}, {asin: ...}])
    const allProductData = Array.from(productMap.values());

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

/**
 * Fetches last month's review and rating data for a list of product ASINs.
 *
 * This function makes a batch API call for all ASIN variants and returns an array
 * of objects containing ASINs and the counts of their ratings and reviews from the
 * previous month.
 *
 * @param {string[]} variantASINs - An array of ASINs.
 *
 * @returns {Promise<Array<{asin: string, lastMonthRatings: number, lastMonthReviews: number}>>}
 *          A promise that resolves into an array of objects:
 *          - `asin`: The ASIN of the product.
 *          - `lastMonthRatings`: The count of ratings received in the last month (number)
 *          - `lastMonthReviews`: The count of reviews received in the last month (number)
 *          Returns an empty array of no ASINs are provided/if an error occurs.
 *
 * @throws {Error} Throwsn an error if there is an issue with the API request.
 *
 * @example
 * const asins = ['ASIN1', 'ASIN2'];
 * fetchLastMonthData(asins).then(data => {
 *     console.log(data);
 * });
 */

export const fetchLastMonthData = async (variantASINs) => {
  if (variantASINs.length === 0) return [];

  const lastMonthUrl = `https://api.keepa.com/product?key=${API_KEY}&domain=1&asin=${variantASINs.join(
    ","
  )}&rating=1&days=30`;

  try {
    const response = await axios.get(lastMonthUrl);
    const products = response.data.products;

    //console.log("Raw product data:", products);

    const oneMonthAgoMilliseconds = getMonthAgoTimeStamp();
    const keepaTime = Math.floor(oneMonthAgoMilliseconds / 60000 - 21564000);

    // products.forEach((product) => {
    //   console.log(`ASIN: ${product.asin}, REVIEWS:`, product.reviews);
    // });

    const lastMonthData = products.map((product) => {
      const closestRatingCount = findClosestValue(
        product.reviews?.ratingCount || [],
        keepaTime
      );
      const closestReviewCount = findClosestValue(
        product.reviews?.reviewCount || [],
        keepaTime
      );
      return {
        asin: product.asin,
        lastMonthRatings: closestRatingCount ? closestRatingCount[1] : 0,
        lastMonthReviews: closestReviewCount ? closestReviewCount[1] : 0,
      };
    });

    // lastMonthData.forEach((item) => {
    //   console.log(
    //     `LAST MONTH RAW RATINGS FOR ${item.asin}:, ${item.rawLastMonthRatings}`
    //   );
    // });

    return lastMonthData;
  } catch (err) {
    console.error(
      `Error fetching last month's data for ASINs ${variantASINs.join(", ")}:`,
      err
    );
    return [];
  }
};
