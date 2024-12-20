/* eslint-disable no-restricted-globals */
import Papa from "papaparse";

self.onmessage = function (e) {
  const { fileContent, filePath } = e.data;

  if (fileContent) {
    // Parse the chunked file content directly
    Papa.parse(fileContent, {
      header: false,
      complete: (results) => {
        const parsedData = results.data;
        postMessage({ success: true, data: parsedData });
      },
      error: (error) => {
        postMessage({
          success: false,
          message: `Error parsing CSV: ${error.message}`,
        });
      },
    });
  } else if (filePath) {
    // Fetch and parse the CSV from a file path
    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch the file.");
        }
        return response.text(); // Get the file content as text
      })
      .then((csvData) => {
        Papa.parse(csvData, {
          header: false,
          complete: (results) => {
            const parsedData = results.data;
            postMessage({ success: true, data: parsedData });
          },
          error: (error) => {
            postMessage({
              success: false,
              message: `Error parsing CSV: ${error.message}`,
            });
          },
        });
      })
      .catch((error) => {
        postMessage({
          success: false,
          message: `Error fetching file: ${error.message}`,
        });
      });
  }
};
