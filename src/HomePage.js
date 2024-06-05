import React from 'react';
import './HomePage.css';
import HorizontalScrollMenu from './components/HorizontalScrollMenu';
import StickyHeader from './components/StickyHeader';
import Footer from './components/Footer';
import useRequests, { BASE_SERVER_URL } from './useRequests';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const {
        items: movies
    } = useRequests('movies')
    const {
        items: clips
    } = useRequests('clips')
    const {
        items: quizzes
    } = useRequests('quizzes')
    const {
        items: wordCollections
    } = useRequests('wordCollections')

    return (
        <div className='page-container home-page'>
            <StickyHeader />
            <Hero />
            <div className='section bg-gray-900'>
                
                <h2>Movies</h2>
                <HorizontalScrollMenu items={movies} baseRoute={'movie'} />
            </div>
            <div className='section bg-gray-900'>
                <h2>Music</h2>
                <HorizontalScrollMenu items={clips} baseRoute="clip" />
            </div>
            <div className='section bg-gray-900'>
                <h2>Word Collections</h2>
                <HorizontalScrollMenu items={wordCollections} />
            </div>
            {/* <div className='section bg-gray-900'>
                <h2>Learn by Quiz</h2>
                <HorizontalScrollMenu items={wordCollections} />
            </div> */}
            <Footer />
        </div>
    )
}
const BASE_BUCKET_URI = BASE_SERVER_URL + '/movieFiles'
function Hero() {
    return (
        <div className="relative heroContainer">
            <img className="w-full" src={`${BASE_BUCKET_URI}/frozen.hero.jpg`} alt="American Nightmare banner placeholder" />
            <div className="info absolute bottom-20 left-10">
                <h1 className="text-4xl font-bold mb-4">LEARN ENGLISH WITH FROZEN</h1>
                <div className="flex">
                    <button className="flex items-center rounded-sm bg-white text-black px-4 py-2 mr-4">
                        <Link to={'/movie/frozen'}><i className="fas fa-play mr-2"></i> Play</Link>
                    </button>
                    <button className="primary-button-2 flex items-center px-4 py-2">
                        <i className="fas fa-info-circle mr-2"></i>Frozen Vocab 
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomePage;
