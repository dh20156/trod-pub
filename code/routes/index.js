const router = require("koa-router")();

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "技术风险开放数据 | TROD",
    keywords: "trod,首页",
    description:"TROD,技术风险开放数据"
  });
});

router.get("/string", async (ctx, next) => {
  ctx.body = "koa2 string";
});

router.get("/json", async (ctx, next) => {
  ctx.body = {
    title: "koa2 json",
  };
});

module.exports = router;
