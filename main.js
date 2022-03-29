let http = require('http');
let url = require('url');
let fs = require('fs');
let qs = require('querystring');

function createHTML(title, description, list, CUDInterface) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${CUDInterface}
    <h2>${title}</h2>
    <p>${description}</p>
  </body>
  </html>
  `;
}

function createForm(pathname) {
  return `
  <form action="http://localhost:3000/create_process" method="post">
    <p><input type="text" name="title" placeholder="title"></p>
    <p><textarea name="description" placeholder="description"></textarea></p>
    <p><input type="submit"></p>
  </form>
  `;
}

function updateForm(pathname, title) {
  return `
  <form action="http://localhost:3000/update_process" method="post">
    <input type="hidden" name="preTitle" value="${title}">
    <p><input type="text" name="title" placeholder="title"></p>
    <p><textarea name="description" placeholder="description"></textarea></p>
    <p><input type="submit"></p>
  </form>
  `;
}


let app = http.createServer(function(request,response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let title = queryData.id;
  let html;
  let pathname = url.parse(_url, true).pathname;

  let files = fs.readdirSync('./data')
  list = `<ul>`
  for(let i = 0 ; i < files.length ; i++) {
   list += `<li><a href ="/?id=${files[i]}">${files[i]}</a></li>`;
  }
  list += `</ul>`

  if(pathname == '/') {
    if(queryData.id === undefined) {
      title = 'WEB';
      fs.readFile(`./main_data/web`,'utf8',function(err,description) {
        html = createHTML(title,description,list,`<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
      });
    }
    else {
      fs.readFile(`./data/${title}`,'utf8',function(err,description) {
        html = createHTML(title,description,list,`<a href="/create">create</a> <a href="/update">update</a> 
        <form action='/delete_process' method="post">
          <input type="hidden" name="title" value="${title}">
          <input type="submit" value="delete">
        </form>
        `);
        response.writeHead(200);
        response.end(html);
      });
    }
  } else if (pathname == `/create`) {
      let form = createForm(pathname);
      html = createHTML(`create`,form,list,``);
      response.writeHead(200);
      response.end(html);
  } else if (pathname == `/create_process`) {
    let body = '';
    request.on('data', function(data){
      body = body + data;
    });

    request.on('end', function () {
      let post = qs.parse(body);
      let title = post.title;
      let description = post.description;
      fs.writeFile(`./data/${title}`,`${description}`, function(err) {
      response.writeHead(302, {
        Location: `/?id=${title}`
      });
      response.end();
      });
    });
  } else if (pathname == `/update`) {
    let form = updateForm(pathname, title);
    fs.readFile(`./data/${title}`,'utf8',function(err,description) {
      html = createHTML(`update`,form,list,``);
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname == `/update_process`) {
    let body = '';
    request.on('data', function(data){
      body = body + data;
    });

    request.on('end', function () {
      let post = qs.parse(body);
      let preTitle = post.preTitle;
      let title = post.title;
      let description = post.description;

      fs.rename(`./data/${preTitle}`, `./data/${title}`, function (err) {
        fs.writeFile(`./data/${title}`,`${description}`, function(err) {
          response.writeHead(302, {
            Location: `/?id=${title}`
          });
          response.end();
        });
      });
    });
  } else if (pathname == `/delete_process`) {
    let body = '';
    request.on('data', function(data){
      body = body + data;
    });

    request.on('end', function () {
      let post = qs.parse(body);
      let title = post.title;
      fs.unlink(`./data/${title}`, function(err) {
        response.writeHead(302, {
          Location: `/`
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});

app.listen(3000);