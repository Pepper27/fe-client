import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectFade, Navigation, Pagination } from 'swiper/modules';
import '../../components/banner/index.scss'

export const BannerImage = () => {
    const images = [
        {
            id: 1,
            image: "/image/README.jpg"
        },
        {
            id: 2,
            image: "/image/banner1.jpg"
        },
        {
            id: 3,
            image: "/image/banner2.jpg"
        },
        {
            id: 4,
            image:"/image/README.jpg"
        }
    ]
    return (
        < >
            <Swiper
                spaceBetween={30}
                effect={'fade'}
                navigation={true}
                pagination={{
                    clickable: true,
                }}
                modules={[EffectFade, Navigation, Pagination]}
                className="mySwiper"
            >
                {images.map((item) => (
                    <SwiperSlide key={item.id}>
                        <img
                            src={item.image}
                            alt={`slide-${item.id}`}
                            className='image'
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}
