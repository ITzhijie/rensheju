'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/home.test.js', () => {
  it('should assert', () => {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));

    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  });

  it('should GET /', () => {
    return app.httpRequest()
      .get('/admin/login')
      // .expect('hi, egg')
      .expect(200);
  });

  it('should md5',async  () => {
    const ctx = app.mockContext();
    // 通过 ctx 访问到 service.user
    const md5Str = await ctx.service.tools.md5('123456');
    assert(md5Str);
    assert(md5Str === 'e10adc3949ba59abbe56e057f20f883e');
  });



});
