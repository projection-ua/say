import s from '../../assets/styles/main.module.css';
import SliderProducts from '../../components/SliderProducts/SliderProducts';
import HeroSlider from "../../components/OfferBlock/OfferBlock.tsx";
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid';
import AboutBlock from "../../components/AboutBlock/AboutBlock.tsx";
import TipsBlock from "../../components/TipsBlock/TipsBlock.tsx";
import InstagramBlock from "../../components/InstagramBlock/InstagramBlock.tsx";


const HomePage = () => {





    return (
        <div className={s.pageWrap}>

            <HeroSlider/>

            <div className={s.container}>
                <SliderProducts filterTag="sale" title="Акції" />
                <SliderProducts filterTag="new" title="Новинки" />
                <CategoryGrid />
                <AboutBlock />
                <TipsBlock />
                <InstagramBlock />
            </div>
        </div>
    );




};

export default HomePage;
