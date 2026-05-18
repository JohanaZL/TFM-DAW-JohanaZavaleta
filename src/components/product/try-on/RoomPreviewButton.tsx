'use client';

import { useState } from 'react';
import { RoomPreviewModal } from './RoomPreviewModal';

interface Props {
  productImageId: number;
  productTitle: string;
}

export const RoomPreviewButton = ({ productImageId, productTitle }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-secondary my-2 w-full" onClick={() => setIsOpen(true)}>
        🏠 Ver en tu hogar
      </button>
      <RoomPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productImageId={productImageId}
        productTitle={productTitle}
      />
    </>
  );
};
