import React from "react";
import Variant from "./Variant";

const ProductTable = ({ data }) => {
  //console.log("DATA:", JSON.stringify(data, null, 2));

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
            <Variant variant={product} isMainProduct={true} />
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
