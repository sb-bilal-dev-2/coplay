 const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
};

 const getCountryCode = async (latitude, longitude) => {
  const apiKey = "cf5aca3db6a14e619416b3103c040c67";
  const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].components.country_code.toUpperCase();
  } else {
    throw new Error("Unable to get country code from location.");
  }
};

const countryToLanguageISO = {
  EN: "en",
  UZ: 'uz',
  KO: "ko",
  ZH: "zh"
};

 const getLanguageFromCountryCode = (countryCode) => {
  return countryToLanguageISO[countryCode] || "EN"; // Default to English if country code not found
};


export const getUserLanguage = async () => {
  try {
    const location = await getUserLocation();
    const countryCode = await getCountryCode(
      location.latitude,
      location.longitude
    );

    const languageFormLocation = getLanguageFromCountryCode(countryCode);

    return languageFormLocation;
  } catch (error) {
    console.error(error);
    return "en-US"; // Default to English if an error occurs
  }
};

