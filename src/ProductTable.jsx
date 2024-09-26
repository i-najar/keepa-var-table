import React from "react";
import Variant from "./Variant";

const ProductTable = ({ data }) => {
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
        <Variant variant={data} isMainProduct={true} />

        {data.variations &&
          data.variations.length > 0 &&
          data.variations.map((variant, index) => (
            <Variant key={index} variant={variant} />
          ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
