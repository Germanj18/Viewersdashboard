"use strict";(()=>{var e={};e.id=928,e.ids=[928],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},9523:e=>{e.exports=require("dns")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},90873:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>x,patchFetch:()=>S,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>d});var o={};t.r(o),t.d(o,{POST:()=>u});var s=t(49303),a=t(88716),n=t(60670),p=t(87070),i=t(55245);async function u(e){try{let{amount:r,description:t,email:o,whatsapp:s,customerName:a,timestamp:n}=await e.json();if(!r||!o||!s||!a)return p.NextResponse.json({error:"Faltan campos requeridos"},{status:400});let u=i.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:587,secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),c=process.env.ADMIN_EMAIL||"admin@yourdomain.com",l=process.env.ADMIN_WHATSAPP||"+1234567890",d=`
      Nueva Solicitud de Pago - Takenos/Payoneer
      
      📋 DETALLES DE LA SOLICITUD:
      • Cliente: ${a}
      • Email: ${o}
      • WhatsApp: +${s}
      • Monto: $${r} USD
      • Servicio: ${t}
      • Fecha: ${new Date(n).toLocaleString("es-ES")}
      
      🎯 PR\xd3XIMOS PASOS:
      1. Contactar al cliente por WhatsApp: +${s}
      2. Enviar link personalizado de Payoneer
      3. Confirmar el pago una vez completado
      
      ⚡ Tiempo de respuesta esperado: 15-30 minutos
    `;if(await u.sendMail({from:process.env.SMTP_USER,to:c,subject:`💰 Nueva Solicitud Payoneer - $${r} USD - ${a}`,text:d}),process.env.CALLMEBOT_API_KEY&&l)try{let e=encodeURIComponent(`🚨 Nueva solicitud de pago Payoneer:
💰 Monto: $${r} USD
👤 Cliente: ${a}
📧 Email: ${o}
📱 WhatsApp: +${s}
⏰ ${new Date().toLocaleString("es-ES")}`);await fetch(`https://api.callmebot.com/whatsapp.php?phone=${l.replace("+","")}&text=${e}&apikey=${process.env.CALLMEBOT_API_KEY}`)}catch(e){console.warn("Error enviando WhatsApp:",e)}return p.NextResponse.json({success:!0,message:"Solicitud enviada correctamente"})}catch(e){return console.error("Error procesando solicitud Takenos:",e),p.NextResponse.json({error:"Error interno del servidor"},{status:500})}}let c=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/takenos/request-payment/route",pathname:"/api/takenos/request-payment",filename:"route",bundlePath:"app/api/takenos/request-payment/route"},resolvedPagePath:"C:\\Users\\German\\Desktop\\Dashboard Viewers- LaCasa\\youtube-viewers-lacasa\\src\\app\\api\\takenos\\request-payment\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:l,staticGenerationAsyncStorage:d,serverHooks:m}=c,x="/api/takenos/request-payment/route";function S(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:d})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[948,972,245],()=>t(90873));module.exports=o})();