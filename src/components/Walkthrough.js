import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SAMPLE_STEPS = [
    { target: 'start-btn', description: 'Click to start!' },
    { target: 'word-card', description: 'This is a word card.' },
    { target: 'search-bar', description: 'Search words here.' },
];

const Walkthrough = ({ steps = SAMPLE_STEPS, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const overlayRef = useRef(null);
  
    useEffect(() => {
      if (steps.length === 0) return;
      updateSpotlight(steps[currentStep]?.target);
    }, [currentStep, steps]);
  
    const updateSpotlight = (targetId) => {
      const element = document.getElementById(targetId);
      if (!element) return;
  
      const rect = element.getBoundingClientRect();
      setSpotlightStyle({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.left + window.scrollX + rect.width / 2,
        width: Math.max(rect.width, rect.height) + 20,
      });
    };
  
    const nextStep = () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete?.();
      }
    };
  
    const prevStep = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };
  
    const handleClickTarget = (e) => {
      if (e.target.id === steps[currentStep]?.target) {
        nextStep();
      }
    };
  
    return (
      <>
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-70 z-50 pointer-events-none"
        >
          <motion.div
            className="absolute bg-black bg-opacity-70 z-50"
            initial={{ opacity: 1 }}
            animate={{ clipPath: `circle(${spotlightStyle.width / 2}px at ${spotlightStyle.left}px ${spotlightStyle.top}px)` }}
            transition={{ duration: 0.3 }}
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
          />
        </div>
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex space-x-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </>
    );
  };
  
  export default Walkthrough;
  