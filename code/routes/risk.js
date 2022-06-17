const router = require("koa-router")();
const fs = require("fs");
const mntSummaryFile = process.env.mntSummaryFile;
const mntTrodFile = process.env.mntTrodFile;

router.prefix('/risk')

router.get("/", async (ctx, next) => {
    var data,keyword;
    keyword = ctx.query.q;
    if(keyword){
        ctx.status = 301;
        ctx.redirect('/risk/q/'+keyword);
        return;
    }
    if (fs.existsSync(mntSummaryFile)) {
        data = JSON.parse(fs.readFileSync(mntSummaryFile));
    }
    await ctx.render("risk", {
        title: "IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk",
        data: data
    });
});

router.get("/q/:keyword", async (ctx, next) => {
    var keyword = ctx.params.keyword;
    keyword = keyword ? keyword.toLowerCase() : "";
    var data,result;
    if (keyword && fs.existsSync(mntTrodFile)) {
        data = JSON.parse(fs.readFileSync(mntTrodFile));
        result = [];
        //search risk data
        for (let i=0;i<data.length;i++) {
            let matchStr = data[i].field + data[i].stack + data[i].risk + data[i].description + data[i].solution;
            if(matchStr.toLowerCase().includes(keyword)){
                result.push({
                    'id': i,
                    'title': data[i].risk,
                    'description': data[i].description
                });
            }
        }
    }
    await ctx.render("search", {
        title: "搜索关键词："+keyword+" | IT系统稳定性技术风险开放数据",
        keywords: keyword+",JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk/q/"+keyword,
        result: result,
        keyword: keyword
    });
});

router.get("/contributor/:contributor", async (ctx, next) => {
    var contributor = ctx.params.contributor,risk=[];
    if (fs.existsSync(mntSummaryFile)) {
        data = JSON.parse(fs.readFileSync(mntSummaryFile));
        risk = data.contributor[contributor];
    }
    if(!risk){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    await ctx.render("contributor", {
        title: contributor+"贡献的风险数据 | IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk/contributor"+contributor,
        data: risk.commits,
        contributor: contributor
    });
});

router.get('/field/:field', async function(ctx, next) {
    var field = ctx.params.field;
    var summary,data,risk;
    if (fs.existsSync(mntSummaryFile)) {
        risk = JSON.parse(fs.readFileSync(mntSummaryFile)).risk;
        data = risk[field];
    }
    if(!data){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    await ctx.render("riskfield", {
        title: field + "领域的技术风险数据 | IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk/field/"+field,
        data: data,
        risk: risk,
        field: field,
        stack: null
    });
});

router.get('/field/:field/:stack', async function(ctx, next) {
    var field = ctx.params.field,stack = ctx.params.stack;
    var summary,data,risk;
    if (fs.existsSync(mntSummaryFile)) {
        risk = JSON.parse(fs.readFileSync(mntSummaryFile)).risk;
        data = risk[field];
        summary = data ? data[stack] : null;
    }
    if(!summary){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    await ctx.render("riskfield", {
        title: field + "/" + stack + "领域的技术风险数据 | IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk/field/"+field+"/"+stack,
        data: summary,
        risk: risk,
        field: field,
        stack: stack
    });
});

router.get('/severity/:level', async function(ctx, next) {
    var severity = ctx.params.level;
    var summary,data;
    if (fs.existsSync(mntSummaryFile)) {
        data = JSON.parse(fs.readFileSync(mntSummaryFile)).severity;
        summary = data[severity];
    }
    if(!summary){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    await ctx.render("riskseverity", {
        title: "风险等级为" + severity + "级别的技术风险数据 | IT系统稳定性技术风险开放数据",
        keywords: "JVM参数配置,JDK缺陷故障,服务器端口配置,数据库连接池配置,日志框架异步配置,缓存配置,文件句柄占用,HashMap并发,Netty死循环,Mybatis框架静态SQL不规范,System.gc,同步锁竞争",
        description:"IT系统稳定性技术风险开放数据是一个开源项目，收集了大量实践中遇到的JVM参数配置、JDK缺陷故障、服务器端口配置、数据库连接池配置、日志框架异步配置、缓存配置、文件句柄占用、HashMap并发、Netty死循环、Mybatis框架静态SQL不规范、System.gc、同步锁竞争等风险诊断项并详细介绍了问题发生的原因及解决方案",
        canonical:"https://trod.pub/risk/severity/"+severity,
        data: data,
        summary: summary,
        severity: severity
    });
});

router.get('/item/:id', async function(ctx, next) {
    var riskID = parseInt(ctx.params.id);
    if(isNaN(riskID) || riskID < 0){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    var trod;
    if (fs.existsSync(mntTrodFile)) {
        trod = JSON.parse(fs.readFileSync(mntTrodFile))[riskID];
    }
    if(!trod){
        ctx.status = 301;
        ctx.redirect('/404');
        return;
    }
    await ctx.render("riskdetail", {
        title: trod.risk + " | IT系统稳定性技术风险开放数据",
        keywords: trod.field + "," + trod.stack + "," + trod.risk,
        description:trod.description,
        canonical:"https://trod.pub/risk/item"+riskID,
        data: trod
    });
});

module.exports = router;
