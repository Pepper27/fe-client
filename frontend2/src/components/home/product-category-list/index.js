import React, { useEffect } from 'react';
import { CATEGORIES_DATA } from "../../../data/category"
import { CategoryCard } from "./category-card"
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import "./index.scss";

export const Categories = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true, 
        });
        AOS.refresh();
    }, []);

    return (
        <div className="categories-wrapper">
            <div data-aos="fade-up" className="categories-grid">
                {CATEGORIES_DATA.map((item, i) => (
                    <div
                        key={item.id || i}
                        data-aos="fade-up"
                        data-aos-delay={i * 200}
                    >
                        <CategoryCard
                            image={item.image}
                            name={item.name}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};