//#region Setup 
const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('path');
const { get } = require('http');
// Helper method for generating unique ids
//const uuid = require('./helpers/uuid');

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 3001;
}
const app = express();

const apiPath = '/api/notes/';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//#endregion

//#region shared functionality 

const getTimestamp = () => {
    return `[${new Date().toLocaleDateString()}|${new Date().toLocaleTimeString([], {hour12: false})}:${new Date().getMilliseconds().toPrecision(3)}]> `;
}

//#endregion

//#region base path 
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);
//#endregion

//#region GETs 

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get(apiPath, (req, res) => {
    console.log(`${getTimestamp()}GET on apiPath: | METHOD: ${req.method} | PATH: ${req.path} \n `);
    fs.readFile('./db/db.json', (err, data) => {
        if(err) {
            console.log(`${getTimestamp()}err`,err);
            res.json(err);
        } else {
            console.log(`${getTimestamp()}JSON.parse(data)`, JSON.parse(data));
            res.json(JSON.parse(data));
        }
    });
});



//#endregion
//#region POSTs 

app.post(apiPath, (req, res) => {
    console.log(`${getTimestamp()}POST on apiPath | METHOD: ${req.method} | PATH: ${req.path} \n `);
    console.log(getTimestamp() + 'BODY:', req.body);
    const newNote = {"id": 1, "title": req.body.title, "text": req.body.text};
    fs.readFile('./db/db.json', (err, data) => {
        if(err) {
            console.log(getTimestamp() + 'err',err);
            newNote.id = 1;
            const saveData = JSON.stringify(newNote);
            //console.log(getTimestamp() + 'saveData', saveData);
            fs.writeFile(`./db/db.json`, saveData, (err2) =>
                err2 ? res.json(err2) : res.json('Delete Successful')
            );
        } else {
            const parsedData = JSON.parse(data);
            parsedData.sort((a,b) => a.id - b.id);
            //console.log(getTimestamp() + 'parsedData sorted', parsedData);
            let newId = 1;
            for (let i = 0; i < parsedData.length; i++) {
                const element = parsedData[i];
                if(Number.parseInt(element.id) != (i + 1)) {
                    newId = (i + 1);
                    break;
                } else {
                    newId = (parsedData.length + 1);
                }
            }
            newNote.id = newId;
            parsedData.push(newNote);
            parsedData.sort((a,b) => a.id - b.id);
            const saveData = JSON.stringify(parsedData);
            //console.log(getTimestamp() + 'saveData', saveData);
            fs.writeFile(`./db/db.json`, saveData, (err3) =>
                err3 ? res.json(err3) : res.json('Delete Successful')
            );
        } 
    });
});

//#endregion

//#region DELETEs 

app.delete(apiPath + ':id', (req, res) => {
    console.log(`${getTimestamp()}POST on apiPath: | METHOD: ${req.method} | PATH: ${req.path} \n `);
    const noteId = Number.parseInt(req.path.split('/')[3]);
    //console.log(getTimestamp() + 'req.path.split("/")[3]:', req.path.split('/')[3]);
    //console.log(getTimestamp() + 'noteId:', noteId);
    fs.readFile('./db/db.json', (err, data) => {
        if(err) {
            console.log(getTimestamp() + 'err',err);
            const saveData = JSON.stringify([]);
            //console.log(getTimestamp() + 'saveData', saveData);
            fs.writeFile(`./db/db.json`, saveData, (err2) =>
                err2 ? res.json(err2) : res.json('Delete Successful')
            );
        } else {
            const parsedData = JSON.parse(data);
            parsedData.sort((a,b) => a.id - b.id);
            const filteredData = parsedData.filter(note => note.id != noteId);
            //console.log(getTimestamp() + 'parsedData: ', filteredData);
            const saveData = JSON.stringify(filteredData);
            //console.log(getTimestamp() + 'saveData', saveData);
            fs.writeFile(`./db/db.json`, saveData, (err3) =>
                err3 ? res.json(err3) : res.json('Delete Successful')
            );
        } 
    });
});

//#endregion

//#region Navi 
app.listen(PORT, () =>
    console.log(`${getTimestamp()}App listening at http://localhost:${PORT}`)
);
//#endregion
