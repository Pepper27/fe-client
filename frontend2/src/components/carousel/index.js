import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import "./index.scss";

export const Carousel = ({
  children,
  options = {},
  autoplay = false,
  autoplayDelay = 3500,
  showArrows = true,
  showDots = false,
  className = "",
  slideClassName = "",
}) => {
  const plugins = autoplay
    ? [
        Autoplay({
          delay: autoplayDelay,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", containScroll: "trimSnaps", ...options },
    plugins
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [snaps, setSnaps] = useState([]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api) => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect(emblaApi);
    };
    sync();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, onSelect]);

  const slides = React.Children.toArray(children);

  return (
    <div className={`embla ${className}`}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((child, i) => (
            <div className={`embla__slide ${slideClassName}`} key={i}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && slides.length > 1 ? (
        <>
          <button
            type="button"
            className="embla__btn embla__btn--prev"
            onClick={() => emblaApi && emblaApi.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous"
          >
            <AiOutlineLeft />
          </button>
          <button
            type="button"
            className="embla__btn embla__btn--next"
            onClick={() => emblaApi && emblaApi.scrollNext()}
            disabled={!canNext}
            aria-label="Next"
          >
            <AiOutlineRight />
          </button>
        </>
      ) : null}

      {showDots && snaps.length > 1 ? (
        <div className="embla__dots">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`embla__dot ${i === selected ? "is-selected" : ""}`}
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
