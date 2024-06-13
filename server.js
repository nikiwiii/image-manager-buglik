const express = require('express');
const hbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer');
const port = 4000;
const bodyParser = require('body-parser')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine(
  'hbs',
  hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {},
  })
);
let currentPath = './upload/';
let currentFile = '';

const segregate = () => {
  let folders = [];
  let files = [];
  let tab = fs.readdirSync(currentPath);
  tab.forEach((e) => {
    if (fs.lstatSync(currentPath + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
        path: currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e, //query zachowa path z '~' zamiast '/'
      });
    } else {
      const format = e.substr(e.lastIndexOf('.')+1, e.length)
      format == "jpg" || format == "jpeg" || format == "png" ?
      files.push({
        name: e.substr(0, e.lastIndexOf('.')),
        format: e.substr(e.lastIndexOf('.'), e.length),
        type: false,
        fullname: e,
        path: currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e,
      }) : null;
    }
  });
  return [folders, files];
};

const getPathArr = () => {
  let pathobj = [];
  patharr = currentPath.substr(2, currentPath.length).split('/');
  temp = '';
  patharr.forEach((e, i) => {
    if (i != 0) temp += e + '~'; 
    else temp += '~';
    pathobj.push({
      path: temp,
      name: e,
    });
  });
  pathobj[pathobj.length - 1].path.substr(0, pathobj[pathobj.length - 1].path.length - 1); //usuniecie ostatniego '/'
  return pathobj;
};

app.get('/', (req, res) => {
  res.render('index.hbs', {
    files: segregate(),
    pathArr: getPathArr(),
    nonuploadfolder: currentPath.length !== 9 ? true : false, //czy obecny folder jest inny niz /upload
  });
});

app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));

app.get('/name=:path', (req, res) => {
  currentPath = './upload' + (req.params.path[0] === '~' ? req.params.path.replaceAll('~', '/') : '/' + req.params.path.replaceAll('~', '/'));
  currentPath[currentPath.length - 1] !== '/' ? (currentPath += '/') : null;
  console.log(currentPath);
  res.redirect('/');
});

app.post('/newfolder', (req, res) => {
  if (!fs.existsSync(currentPath + req.body.name)) {
    fs.mkdir(currentPath + req.body.name, (err) => {
      if (err) throw err;
      console.log('stworzono ' + req.body.name);
      res.redirect('/');
    });
  } else {
    fs.mkdir(currentPath + req.body.name + '_kopia_' + new Date().valueOf(),
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + req.body.name);
        res.redirect('/');
      }
    );
  }
});

app.get('/folder&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currentPath + name)) {
    fs.rm(currentPath + name, {
        recursive: true,
        force: true,
      }, 
      (err) => {
        if (err) throw err;
        console.log('usunieto ' + name);
        res.redirect('/');
      }
    );
  } else {
    res.redirect('/');
  }
});
app.get('/file&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currentPath + name)) {
    fs.unlink(currentPath + name, (err) => {
      if (err) throw err;
      console.log('usunieto ' + req.params.name);
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

let upload = multer({ dest: currentPath });
let type = upload.single('filefold');

app.post('/uploadf', type, function (req, res) {
  console.log(req.file);
  let temp_file = req.file.path;
  let name = req.file.originalname;
  let target_file = currentPath + (name.includes('.') ?
      name.substr(0, name.lastIndexOf('.')) + '_' + req.file.filename.substr(0, 4) + name.substr(name.lastIndexOf('.'), name.length) :
      name + '_' + req.file.filename.substr(0, 4) + '.txt');
  fs.readFile(temp_file, (err, data) => {
    fs.unlink(temp_file, (err) => {
      fs.appendFile(target_file, data, (err) => {
        res.redirect('/');
      });
    });
  });
});

app.post('/newfoldername', (req, res) => {
  fs.rename(currentPath,
    currentPath.substr(
      0, currentPath.slice(0, currentPath.length - 1).lastIndexOf('/')) + '/' + req.body.name,
    (err) => {
      if (err) throw err;
      currentPath =
        currentPath.substr(0, currentPath.slice(0, currentPath.length - 1).lastIndexOf('/')) + '/' + req.body.name + '/';
      res.redirect('/');
    }
  );
});

app.get('/edit=:path', (req, res) => {
  let path = './upload/' + req.params.path.replaceAll('~', '/');
  currentFile = path;
  let format = currentFile.substr(
    currentFile.lastIndexOf('.') + 1,
    currentFile.length
  );
  const baseUrl = fs.readFileSync(currentFile, {encoding: 'base64'});
  res.render('image-editor.hbs', {
    currentFile: currentFile.substr(
      currentFile.lastIndexOf('/') + 1,
      currentFile.length
    ),
    urlPath: req.params.path,
    base64: baseUrl,
    format: format,
    path: currentFile,
    effects: [
      {name: 'grayscale'},
      {name: 'invert'},
      {name: 'sepia'},
      {name: 'none'},
    ],
  });
});

app.post('/sendChanged', (req, res) => {
  let data = JSON.parse(req.headers.body).newText;
  fs.writeFile(currentFile, data, (err) => {
    res.send(JSON.stringify('zapisano zmiany'));
  });
});

app.post('/imageSaved', (req, res) => {
  console.log("zapisuję");
  console.log(req.body);
  const img64 = req.body.newImg.substring(22, req.body.newImg.length);
  fs.writeFile(currentFile, img64, {
    encoding: 'base64'
  }, (err) => {
    if (err) console.log(err);
  });
  res.send(JSON.stringify('zapisano obraz'));
});

app.listen(port, () => console.log(`Server listening on port: ${port}`));