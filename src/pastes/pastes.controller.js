const pastes = require("../data/pastes-data");

function list(req, res) {
    res.json({data:pastes});
}
let lastPasteId = pastes.reduce((maxId, paste) => Math.max(maxId, paste.id), 0);
 
function bodyDataHas(propertyName){
    return function(req, res, next){
        const {data = {}} = req.body;
        if(data[propertyName]){
            return next();
        }
        next ({status: 400, message: `Must include a ${propertyName}`});
    }
}

function exposurePropertyIsValid(req, res, next) {
    const { data: { exposure } = {} } = req.body;
    const validExposure = ["private", "public"];
    if (validExposure.includes(exposure)) {
      return next();
    }
    next({
      status: 400,
      message: `Value of the 'exposure' property must be one of ${validExposure}. Received: ${exposure}`,
    });
  }
  
  function syntaxPropertyIsValid(req, res, next) {
    const { data: { syntax } = {} } = req.body;
    const validSyntax = ["None", "Javascript", "Python", "Ruby", "Perl", "C", "Scheme"];
    if (validSyntax.includes(syntax)) {
      return next();
    }
    next({
      status: 400,
      message: `Value of the 'syntax' property must be one of ${validSyntax}. Received: ${syntax}`,
    });
  }
  
  function expirationIsValidNumber(req, res, next){
    const { data: { expiration }  = {} } = req.body;
    if (expiration <= 0 || !Number.isInteger(expiration)){
        return next({
            status: 400,
            message: `Expiration requires a valid number`
        });
    }
    next();
  }

  function pasteExist(req, res, next){
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    if (foundPaste){
        return next();
    }
    next({
        status: 404,
        message: `Paste id not found: ${pasteId}`,
    })
  }

  function read(req, res){
    const {pasteId} = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    res.json({data:foundPaste});
  }
   
  function create (req, res){
    const {data: {name, syntax, exposure, expiration, text, user_id} ={}} = req.body;
    const newPaste = {
      id: ++lastPasteId,
      name,
      syntax,
      exposure,
      expiration,
      text,
      user_id,
    };
    pastes.push(newPaste);
    res.status(201).json({data:newPaste});
  }

  function update(req, res){
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    const {data: {name, syntax, exposure, expiration, text} = {}} = req.body;

    foundPaste.name = name;
    foundPaste.syntax = syntax;
    foundPaste.exposure = exposure;
    foundPaste.expiration = expiration;
    foundPaste.text = text;

    res.json({data: foundPaste})
  }

  //most common type of DEL returns 204 with no response body so use this instead
  function destroy(req, res){
    const {pasteId} = req.params;
    const index = pastes.findIndex((paste) => paste.id === Number(pasteId));
    // use splice(), returns array of deleted item
    const deletePastes = pastes.splice(index, 1)
    res.sendStatus(204);
  }

module.exports = {
    create:[
        bodyDataHas("name"),
        bodyDataHas("syntax"),
        bodyDataHas("exposure"),
        bodyDataHas("expiration"),
        bodyDataHas("text"),
        bodyDataHas("user_id"),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        create],
    list,
    read: [pasteExist, read],
    update: [
        bodyDataHas("name"),
        bodyDataHas("syntax"),
        bodyDataHas("exposure"),
        bodyDataHas("expiration"),
        bodyDataHas("text"),
        bodyDataHas("user_id"),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        update 
    ],
    destroy: [pasteExist, destroy]
};