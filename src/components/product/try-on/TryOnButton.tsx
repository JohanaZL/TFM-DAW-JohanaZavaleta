'use client';

import { useState } from "react";
import { TryOnModal } from "./TryOnModal";

interface Props {
  productImage: string;
  productTitle: string;
}

export const TryOnButton = ({ productImage, productTitle }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-secondary my-2 w-full" onClick={() => setIsOpen(true)}>
        Pruébate esta prenda
      </button>
      <TryOnModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productImage={productImage}
        productTitle={productTitle}
      />
    </>
  );
};
