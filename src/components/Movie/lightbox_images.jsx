import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export default function LightboxImages({ images }) {
  const [index, setIndex] = useState(-1);

  return (
    <div>
      {images.map((image, i) => (
        <img key={image.img}
             src={image.thumb}
             width="100"
             alt={`${i + 1}`}
             loading="lazy"
             onClick={() => setIndex(i)} />
      ))}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((image) => ({ src: image.img }))}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .85)' } }}
      />
    </div>
  );
}
