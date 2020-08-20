const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4')

// const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next(); //Pŕoximo middleware

  console.timeEnd(logLabel);
}

function validateRepoId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
      return response.status(400).json({ error: 'Invalid repository ID.'});
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepoId)
app.use('/repositories/:id/like', validateRepoId)

app.get("/repositories", (request, response) => {
  const { title, url, techs } = request.query;

  let results = repositories

  if (title)
  {
    results = repositories.filter(repo => repo.title.includes(title))
  } 
  else if (url)
  {
    results = repositories.filter(repo => repo.url.includes(url))
  }
  // else if (techs)
  // {
  //   results = repositories.filter(repo => {
  //     repo.techs.forEach(tech => {
  //       techs.forEach(techQuery => {
  //         tech === techQuery
  //       });
  //     });
  //   })
  // }

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const likes = 0;

  const repo = { id: uuid(), title, url, techs, likes}

  repositories.push(repo);

  return response.json(repo);

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0) {
      return response.status(400).json({ error: 'Repository not found.'})
  }

  const repo = {
      id,
      title,
      url,
      techs,
      likes: repositories[repoIndex].likes
  };

  repositories[repoIndex] = repo;

  return response.json(repo);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0) {
      return response.status(400).json({ error: 'Repository not found.'})
  }


  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'})
  }

  const likes = repositories[repoIndex].likes + 1

  const repo = { 
    id: id, 
    title: repositories[repoIndex].title, 
    url: repositories[repoIndex].url, 
    techs: repositories[repoIndex].techs, 
    likes: likes
  };

  repositories[repoIndex] = repo;

  return response.json(repo);
});

module.exports = app;
