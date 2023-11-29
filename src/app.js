const express = require("express");
const app = express();
const pastes = require("./data/pastes-data");
const pastesRouter = require("./pastes/pastes.router");

app.get("/pastes/:pasteId", (req, res, next) => {
  const { pasteId } = req.params;
  const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));

  if (foundPaste) {
    res.json({ data: foundPaste });
  } else {
    next({
      status: 404,
      message: `Paste id not found ${pasteId}`,
    });
  }
});

app.use("/pastes", pastesRouter);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  response.send(error);
});

module.exports = app;
