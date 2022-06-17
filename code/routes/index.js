const router = require("koa-router")();

router.get("/", async (ctx, next) => {
    await ctx.render("index", {
        title: "IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/"
    });
});

module.exports = router;
