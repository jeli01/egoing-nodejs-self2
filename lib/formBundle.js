module.exports = {
  create: function (pathname) {
    return `
    <form action="http://localhost:3000/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p><input type="submit"></p>
    </form>
    `;
  },
  update: function (pathname, title) {
    return `
    <form action="http://localhost:3000/update_process" method="post">
      <input type="hidden" name="preTitle" value="${title}">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p><input type="submit"></p>
    </form>
    `;
  }
}