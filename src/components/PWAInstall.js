import React, { useState, useEffect } from 'react';

const MINUTE = 60000;

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (supportsPWA && !localStorage.getItem('installPromptShown')) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('installPromptShown', 'true');
      }, MINUTE * 10);

      return () => clearTimeout(timer);
    }
  }, [supportsPWA]);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setShowPrompt(false);
    });
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptShown', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm mx-auto z-50">
      <p className="text-lg font-semibold mb-3">Install <img src='logo-black.png' className="w-8 h-8 overflow-hidden rounded-full inline" />Coplay App?</p>
      <div className="flex justify-between">
        <button 
          onClick={onClick}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Yes!! Install
        </button>
        <button 
          onClick={dismissPrompt}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

const IOSInstallInstructions = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('installPromptShown')) {
      const timer = setTimeout(() => {
        setShowInstructions(true);
        localStorage.setItem('installPromptShown', 'true');
      }, MINUTE * 2);

      return () => clearTimeout(timer);
    }
  }, []);

  const dismissInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('installPromptShown', 'true');
  };

  if (!showInstructions) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm mx-auto z-50">
      <p className="text-lg font-semibold mb-3">Install <img src='logo-black.png' className="w-8 h-8 overflow-hidden rounded-full inline" />Coplay App?</p>
      <ol className="list-decimal list-inside mb-4 text-gray-700">
        <li className="mb-2">Tap the <img src='image.png' className="w-8 h-8 overflow-hidden rounded-full inline" /><br /> icon in your search barch.</li>
        <li className="mb-2">Scroll down and tap "Add to Home Screen" <i className="fa fa-plus p-1 rounded border border-2 text-gray-600 border-gray-600"></i></li>
      </ol>
      <button 
        onClick={dismissInstructions}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Got it
      </button>
    </div>
  );
};

const PWAInstall = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
  }, []);

  return (
    <div className="app-install">
      {isIOS ? <IOSInstallInstructions /> : <InstallPWA />}
    </div>
  );
};

export default PWAInstall;