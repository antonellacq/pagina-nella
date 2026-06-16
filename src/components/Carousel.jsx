import { useState, useEffect } from 'react';

const IMAGES = [
  {
    src: '/img/premium_makeup_palette_1778612222439.png',
    alt: 'Paleta de Sombras Premium',
    caption: 'Colores Vibrantes y Lujosos'
  },
  {
    src: '/img/luxurious_lipsticks_1778612236329.png',
    alt: 'Colección de Labiales',
    caption: 'Acabados Brillantes y Mate'
  },
  {
    src: '/img/glowing_foundation_1778612251107.png',
    alt: 'Bases de Maquillaje',
    caption: 'Luminosidad y Elegancia'
  }
];

export default function Carousel({ handleCambioImagen }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play feature: change slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const changeIndex = (newIndex) => {
    setCurrentIndex(newIndex);
    if (typeof handleCambioImagen === 'function') {
      handleCambioImagen(newIndex);
    }
  };

  const goToPrev = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? IMAGES.length - 1 : currentIndex - 1;
    changeIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === IMAGES.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    changeIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    changeIndex(slideIndex);
  };

  return (
    <section className="carousel-section" id="galeria">
      <div className="carousel-container">
        {IMAGES.map((image, index) => (
          <div
            key={index}
            className="carousel-slide fade"
            style={{ display: index === currentIndex ? 'block' : 'none' }}
          >
            <img src={image.src} alt={image.alt} />
            <div className="carousel-caption">{image.caption}</div>
          </div>
        ))}

        <button 
          className="carousel-prev" 
          onClick={goToPrev}
          type="button"
          aria-label="Imagen anterior"
          style={{ border: 'none', outline: 'none' }}
        >
          &#10094;
        </button>
        <button 
          className="carousel-next" 
          onClick={goToNext}
          type="button"
          aria-label="Siguiente imagen"
          style={{ border: 'none', outline: 'none' }}
        >
          &#10095;
        </button>
      </div>

      <div className="carousel-dots">
        {IMAGES.map((_, index) => (
          <span
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}
