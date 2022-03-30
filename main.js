let http = require('http');
let url = require('url');
let fs = require('fs');
let qs = require('querystring');
let formBundle = require('./lib/formBundle.js');
let path = require('path');
let sanitizeHtml = require('sanitize-html');

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
        sanitizedDescription = sanitizeHtml(description);
        html = createHTML(title,sanitizedDescription,list,`<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
      });
    }
    else {
      filteredTitle = path.parse(title).name;
      fs.readFile(`./data/${filteredTitle}`,'utf8',function(err,description) {
        sanitizedDescription = sanitizeHtml(description);
        html = createHTML(title,sanitizedDescription,list,`<a href="/create">create</a> <a href="/update">update</a> 
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
      let form = formBundle.create();
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
    let form = formBundle.update(title);
    html = createHTML(`update`,form,list,``);
    response.writeHead(200);
    response.end(html);

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
      filteredTitle = path.parse(title).name;
      fs.unlink(`./data/${filteredTitle}`, function(err) {
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