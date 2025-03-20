
export function objectToQueryString(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}


export function convertQueryObjectToCommaSeparatedString(queryObject) {
    const queryParts = [];

    Object.entries(queryObject).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // Join array values with commas and encode the entire string
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
        } else {
            // Encode key and value for single entries
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });

    return queryParts.join('&'); // Join all key-value pairs with &
}  