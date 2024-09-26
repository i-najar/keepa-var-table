import React from "react";
import Variant from "./Variant";

const ProductTable = ({ data }) => {
  console.log("DATA:", JSON.stringify(data, null, 2)); // Log the data structure

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>ASIN</th>
          <th>Attributes</th>
          <th>Variation Data</th>
        </tr>
      </thead>
      <tbody>
        {data.map((product, index) => (
          <React.Fragment key={product.asin || index}>
            {" "}
            {/* Use ASIN as key for better uniqueness */}
            {/* Main Product */}
            <Variant variant={product} isMainProduct={true} />
            {/* Variants */}
            {product.variations && product.variations.length > 0 && (
              <React.Fragment>
                {product.variations.map((variant, variantIndex) => (
                  <Variant
                    key={variant.asin || variantIndex}
                    variant={variant}
                  />
                ))}
              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
