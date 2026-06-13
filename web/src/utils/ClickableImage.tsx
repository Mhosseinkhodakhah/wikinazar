import { useState } from 'react';

import { Lightbox } from './Lightbox';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClickableImage = (props: Record<string, any>) => {
  const [open, setOpen] = useState(false);
  const { onClick, alt, ...imgProps } = props;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          onClick?.(e);
          setOpen(true);
        }}
        className="w-1/3"
      >
        <img alt={alt ?? ''} {...imgProps} />
      </button>
      {open && (
        <Lightbox src={props.src || ''} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export { ClickableImage };
