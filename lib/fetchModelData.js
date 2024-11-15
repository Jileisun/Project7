/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise((resolve, reject) => {
    // Use fetch to initiate the GET request
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          // Reject with an Error if status is not ok (not 200)
          return reject(new Error(`Request failed with status ${response.status}: ${response.statusText}`));
        }
        // Return the JSON response if the request is successful
        return response.json();
      })
      .then((data) => {
        // Resolve the promise with an object containing the parsed data
        resolve({ data });
      })
      .catch((error) => {
        // Catch any network errors and reject with an Error object
        reject(new Error(error.message || "Network Error"));
      });
  });
}


export default fetchModel;
