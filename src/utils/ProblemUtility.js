const axios = require("axios");

const languageMap = {
  c: 50,
  "c++": 54,
  java: 62,
  javascript: 63,
  python2: 70,
  python3: 71,
  php: 68,
  ruby: 72,
  swift: 83,
  go: 60,
  typescript: 74,
  kotlin: 78,
  rust: 73,
  scala: 81,
  bash: 46,
  sql: 82,
  perl: 85,
  dart: 91,
  r: 80,
  fortran: 59,
  haskell: 61,
};

const getLanguageById = (lang) => {
  return languageMap[lang?.toLowerCase()] ?? null;
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": "08de7ef9e6msh72e703549d88a53p12638cjsn1fcb1e0d6599",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions: submissions,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("SubmitBatch Error:", error?.response?.data || error.message);
    return null;
  }
};

const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "08de7ef9e6msh72e703549d88a53p12638cjsn1fcb1e0d6599",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  while (true) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      if (!result || !result.submissions) {
        console.log("Waiting for valid response...");
        await waiting(1000);
        continue;
      }

      const isDone = result.submissions.every((r) => r.status_id > 2);

      if (isDone) {
        return result.submissions;
      }

      await waiting(1000);
    } catch (error) {
      console.error("Axios Error:", error?.response?.data || error.message);
      await waiting(1000);
    }
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
