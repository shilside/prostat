const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const axios = require("axios");

const { Configuration, OpenAIApi } = require("openai");
const { response } = require("express");
const configuration = new Configuration({
  organization: "org-C0wFNez81Npi4RAk4WCdNoBp",
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const app = express();

//pls add cors use express
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.post("/", async (req, res) => {
  const { message } = req.body;
  console.log(message);

  // Split message into an array of words
  const messageWords = message.split(" ");
  console.log(messageWords);

  // Initialize variable to store the team id
  let teamId;

  // Loop through words in message
  for (const word of messageWords) {
    // Make call to search route using word as parameter
    const searchOptions = {
      method: "GET",
      url: `https://api-football-v1.p.rapidapi.com/v2/teams/search/${word}`,
      headers: {
        "X-RapidAPI-Key": "4a25981d3amshae769b7619f8598p1e41e2jsn58e1eb50d029",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    };
    try {
      const searchResponse = await axios.request(searchOptions);
      // console.log(searchResponse.data.api.teams);

      // Check if any returned teams have a name that matches the word
      for (const team of searchResponse.data.api.teams) {
        if (team.name.toLowerCase() === word.toLowerCase()) {
          // If match is found, store team id and break out of loop
          teamId = team.team_id;
          console.log(teamId);
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Check if a team id was found
  if (!teamId) {
    return res.status(400).json({
      error: "Could not find a team with that name",
    });
  }

  let teamData;

  // Use team id to make call to the teams endpoint
  try {
    const teamOptions = {
      method: "GET",
      url: `https://api-football-v1.p.rapidapi.com/v2/teams/team/${teamId}`,
      headers: {
        "X-RapidAPI-Key": "4a25981d3amshae769b7619f8598p1e41e2jsn58e1eb50d029",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    };
    const teamResponse = await axios.request(teamOptions);
    teamData = teamResponse.data.api.teams[0];
    console.log(teamData);

    // Use team data to create response message
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Use team id to make call to the fixtures endpoint
  try {
    const fixturesOptions = {
      method: "GET",
      url: `https://api-football-v1.p.rapidapi.com/v2/fixtures/team/${teamId}/next/1`,
      params: { timezone: "Europe/London" },
      headers: {
        "X-RapidAPI-Key": "4a25981d3amshae769b7619f8598p1e41e2jsn58e1eb50d029",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    };

    const fixturesResponse = await axios.request(fixturesOptions);
    // console.log(fixturesResponse.data);
    const fixturesData = fixturesResponse.data.api.fixtures;
    console.log(fixturesData);
    // Pass fixture data to OpenAI API to generate response
    const openaiResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `The next fixtures for ${teamData.name} are: ${JSON.stringify(
        fixturesData
      )}. Please format this information in a way that is easy to read.`,
      max_tokens: 100,
      temperature: 0.9,
    });
    console.log(openaiResponse.data);
    console.log(openaiResponse.data.choices[0].text);
    return res.json({ message: openaiResponse.data.choices[0].text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3002, () => {
  console.log("Server started on http://localhost:3002");
});

//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
