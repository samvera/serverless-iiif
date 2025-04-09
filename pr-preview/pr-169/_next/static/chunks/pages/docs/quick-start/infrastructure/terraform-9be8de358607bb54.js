(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[484],{6681:function(e,s,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/docs/quick-start/infrastructure/terraform",function(){return r(540)}])},540:function(e,s,r){"use strict";r.r(s),r.d(s,{Attribute:function(){return k},Input:function(){return f},Inputs:function(){return v},ModuleLink:function(){return m},Output:function(){return y},Outputs:function(){return g},PropTabs:function(){return j},__N_SSG:function(){return p},__toc:function(){return b}});var t=r(5893),i=r(6997),n=r(4664),a=r(4021);r(4759);var o=r(9575),l=r(2265),c=r.n(l),d=r(208),h=r(1404),u=r(7308),x=r(2163),p=!0;let m=e=>{let{label:s,fragment:r=""}=e,i=Object.assign({a:"a"},(0,o.a)());return(0,t.jsx)(t.Fragment,{children:(0,t.jsx)(i.a,{href:"https://github.com/samvera/serverless-iiif/tree/".concat("v5.0-streaming-iiif3","/extras/terraform").concat(r),children:s})})},k=e=>{let{Name:s,Value:r,Code:i}=e,n=Object.assign({p:"p",code:"code"},(0,o.a)());if((0,x.present)(r))return i?(0,t.jsxs)(n.p,{children:[s,": ",(0,t.jsx)(n.code,{children:(0,x.displayValue)(r)})]}):(0,t.jsxs)(n.p,{children:[s,": ",(0,x.displayValue)(r)]})},j=e=>{let{children:s}=e,{data:r}=(0,u.et)(),i=["Inputs (".concat(r.inputs.length,")"),"Outputs (".concat(r.outputs.length,")"),"Examples"];return(0,t.jsx)(d.mQ,{items:i,children:s})},f=e=>{let{AllowedPattern:s,AllowedValues:r,Default:i,Description:n,MaxLength:a,MaxValue:l,MinLength:d,MinValue:u,Name:x,Type:p}=e,m=Object.assign({div:"div",h3:"h3",span:"span"},(0,o.a)());return(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)(m.div,{className:c().tfAttribute,children:[(0,t.jsxs)(m.h3,{children:[x," ",(0,t.jsx)(m.span,{className:c().tfAttributeType,children:p})]}),(0,t.jsx)(h.R,{compiledSource:n}),(0,t.jsx)(k,{Name:"Default",Value:i,Code:!0})]})})},v=e=>{let{required:s}=e,r=Object.assign({div:"div"},(0,o.a)()),{data:i}=(0,u.et)(),n=i.inputs.filter(e=>{let{Default:r}=e;return(0,x.present)(r)!==s});return(0,t.jsx)(r.div,{children:n.filter(e=>{let{Default:r}=e;return void 0===r===s}).map(e=>(0,t.jsx)(f,{...e},"input-"+e.Name))})},y=e=>{let{Name:s,Description:r}=e,i=Object.assign({div:"div",h3:"h3"},(0,o.a)());return(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)(i.div,{className:c().tfAttribute,children:[(0,t.jsx)(i.h3,{children:s}),(0,t.jsx)(k,{Name:"Description",Value:r})]},"output-"+s)})},g=()=>{let e=Object.assign({div:"div"},(0,o.a)()),{data:{outputs:s}}=(0,u.et)();return(0,t.jsx)(e.div,{children:s.map(e=>(0,t.jsx)(y,{...e},"output-"+e.Name))})},b=[];function N(e){let s=Object.assign({p:"p",code:"code",a:"a",h3:"h3",pre:"pre",span:"span"},(0,o.a)(),e.components);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(s.p,{children:["The ",(0,t.jsx)(s.code,{children:"serverless-iiif"})," GitHub repository includes a ",(0,t.jsx)(m,{label:"Terraform Module"})," that can be used as a drop-in component in any\nTerraform manifest. Please refer to the documentation and examples below, as well as the ",(0,t.jsx)(s.a,{href:"https://developer.hashicorp.com/terraform",children:"Terraform documentation"}),"\nfor more information on how you might use these tools to deploy your own custom stack to AWS."]}),"\n",(0,t.jsxs)(j,{children:[(0,t.jsxs)(d.OK,{children:[(0,t.jsx)(s.h3,{children:"Required Inputs"}),(0,t.jsx)("hr",{}),(0,t.jsxs)(s.p,{children:["These variables must be set in the ",(0,t.jsx)(s.code,{children:"module"})," block when using this module."]}),(0,t.jsx)(v,{required:!0}),(0,t.jsx)(s.h3,{children:"Optional Inputs"}),(0,t.jsx)("hr",{}),(0,t.jsx)(s.p,{children:"These variables have default values and don't have to be set to use this module. You may set these variables to override their default\nvalues."}),(0,t.jsx)(v,{required:!1})]}),(0,t.jsx)(d.OK,{children:(0,t.jsx)(g,{})}),(0,t.jsxs)(d.OK,{children:[(0,t.jsx)(s.h3,{children:"Minimal Example"}),(0,t.jsx)(s.pre,{"data-language":"hcl","data-theme":"default",children:(0,t.jsxs)(s.code,{"data-language":"hcl","data-theme":"default",children:[(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:"module"}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:' "serverless_iiif" {'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  source          "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"github.com/samvera/serverless-iiif//extras/terraform"'})]}),"\n",(0,t.jsx)(s.span,{className:"line",children:" "}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  source_bucket   "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"iiif-images"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  stack_name      "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"my-iiif-service"'})]}),"\n",(0,t.jsx)(s.span,{className:"line",children:(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})}),(0,t.jsx)(s.h3,{children:"(Almost) Full Example"}),(0,t.jsx)(s.pre,{"data-language":"hcl","data-theme":"default",children:(0,t.jsxs)(s.code,{"data-language":"hcl","data-theme":"default",children:[(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:"module"}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:' "serverless_iiif" {'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  source                    "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"github.com/samvera/serverless-iiif//extras/terraform"'})]}),"\n",(0,t.jsx)(s.span,{className:"line",children:" "}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  source_bucket             "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"iiif-images"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  stack_name                "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"my-iiif-service"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  cors_allow_credentials    "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"true"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  cors_allow_headers        "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"X-Custom-Header,Upgrade-Insecure-Requests"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  cors_allow_origin         "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"REFLECT_ORIGIN"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  cors_expose_headers       "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Content-Encoding"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  cors_max_age              "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"600"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  force_host                "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"iiif.my-domain.edu"'})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  iiif_lambda_memory        "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"2048"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  iiif_lambda_timeout       "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"120"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  pixel_density             "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"600"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  preflight                 "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"true"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  resolver_template         "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"iiif/%s.tif"'})]}),"\n",(0,t.jsx)(s.span,{className:"line",children:" "}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  tags "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,t.jsxs)(s.span,{className:"line",children:[(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"    Project "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,t.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"my-image-service"'})]}),"\n",(0,t.jsx)(s.span,{className:"line",children:(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  }"})}),"\n",(0,t.jsx)(s.span,{className:"line",children:(0,t.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})})]})]})]})}let w={MDXContent:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:s}=Object.assign({},(0,o.a)(),e.components);return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(N,{...e})}):N(e)},pageOpts:{filePath:"pages/docs/quick-start/infrastructure/terraform.mdx",route:"/docs/quick-start/infrastructure/terraform",pageMap:[{kind:"Meta",data:{index:{type:"page",title:"Serverless IIIF",display:"hidden",theme:{layout:"raw"}},docs:{type:"page",title:"Documentation"},about:{type:"page",title:"About",theme:{typesetting:"article"}},contact:{title:"IIIF Image API ↗",type:"page",href:"https://iiif.io/api/image/2.1/",newWindow:!0}}},{kind:"MdxPage",name:"about",route:"/about"},{kind:"Folder",name:"docs",route:"/docs",children:[{kind:"Meta",data:{index:"Introduction","quick-start":"Quick Start","source-images":"Source Images","custom-sharp-layer":"Custom Sharp Layer","advanced-usage":"Advanced Usage",testing:"Testing",notes:"Notes","-- Contributing":{type:"separator",title:"Contributing"},"how-to-contribute":"Guide",contributors:"Contributors",communities:"Communities"}},{kind:"Folder",name:"advanced-usage",route:"/docs/advanced-usage",children:[{kind:"Meta",data:{cors:"Cross-Origin Request Sharing (CORS)","request-response-functions":"Request Response Functions"}},{kind:"MdxPage",name:"cors",route:"/docs/advanced-usage/cors"},{kind:"MdxPage",name:"request-response-functions",route:"/docs/advanced-usage/request-response-functions"}]},{kind:"Folder",name:"communities",route:"/docs/communities",children:[{kind:"MdxPage",name:"iiif",route:"/docs/communities/iiif"},{kind:"MdxPage",name:"samvera",route:"/docs/communities/samvera"},{kind:"Meta",data:{iiif:"Iiif",samvera:"Samvera"}}]},{kind:"MdxPage",name:"contributors",route:"/docs/contributors"},{kind:"MdxPage",name:"custom-sharp-layer",route:"/docs/custom-sharp-layer"},{kind:"MdxPage",name:"how-to-contribute",route:"/docs/how-to-contribute"},{kind:"MdxPage",name:"index",route:"/docs"},{kind:"MdxPage",name:"notes",route:"/docs/notes"},{kind:"Folder",name:"quick-start",route:"/docs/quick-start",children:[{kind:"Meta",data:{index:"Options","deployment-sam":"Deploying via the AWS Serverless Application Repository","deployment-command-line":"Deploying via the Command Line",infrastructure:"Deploying via Infrastructure Tools","deleting-the-app":"Deleting the App"}},{kind:"MdxPage",name:"deleting-the-app",route:"/docs/quick-start/deleting-the-app"},{kind:"MdxPage",name:"deployment-command-line",route:"/docs/quick-start/deployment-command-line"},{kind:"MdxPage",name:"deployment-sam",route:"/docs/quick-start/deployment-sam"},{kind:"MdxPage",name:"index",route:"/docs/quick-start"},{kind:"Folder",name:"infrastructure",route:"/docs/quick-start/infrastructure",children:[{kind:"Meta",data:{index:"Introduction",cloudformation:"AWS CloudFormation",terraform:"Terraform"}},{kind:"MdxPage",name:"cloudformation",route:"/docs/quick-start/infrastructure/cloudformation"},{kind:"MdxPage",name:"index",route:"/docs/quick-start/infrastructure"},{kind:"MdxPage",name:"terraform",route:"/docs/quick-start/infrastructure/terraform"}]}]},{kind:"MdxPage",name:"source-images",route:"/docs/source-images"},{kind:"MdxPage",name:"testing",route:"/docs/testing"}]},{kind:"MdxPage",name:"index",route:"/",frontMatter:{title:"Serverless IIIF – Serve images via IIIF"}}],flexsearch:{codeblocks:!0},title:"Terraform",headings:b},pageNextRoute:"/docs/quick-start/infrastructure/terraform",nextraLayout:n.ZP,themeConfig:a.Z};s.default=(0,i.j)(w)},7793:function(e){"use strict";e.exports=Object.entries({"!GetAtt":{type:"string",quoted:!1},"!Sub":{type:"string",quoted:!0},"!Ref":{type:"string",quoted:!1},"!Split":{type:"array",quoted:!1}}).map(e=>{let[s,{quoted:r}]=e,t="!Ref"===s?"Ref":s.replace(/^!/,"Fn::");return{tag:s,identify:e=>Object.keys(e)[0]===t,resolve:e=>({[t]:e}),stringify:e=>{let s=e.value[t];return r?'"'.concat(s,'"'):s}}})},2163:function(e,s,r){"use strict";let t=r(7793),i=r(4160);e.exports={displayValue:function(e){return""===e?'""':e.join?e.join(" | "):e},fence:function(e,s){return"```"+"".concat(s,"\n").concat(e,"\n")+"```"},present:function(e){return 0===e||""===e||!!e},snake:function(e){return e.replace(/\B([A-Z])/g,"_$1").toLowerCase()},stringify:function(e,s){switch(s){case"json":return JSON.stringify(e,null,2);case"yaml":return i.stringify(e,{customTags:t});default:return e.toString()}}}},4021:function(e,s,r){"use strict";r.d(s,{Z:function(){return o}});var t=r(5893),i=r(645),n=r.n(i),a=r(1163),o={footer:{text:(0,t.jsxs)("span",{children:["MIT ",new Date().getFullYear()," \xa9 ",(0,t.jsx)("a",{href:"#",children:"Serverless IIIF"}),"."]})},head:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("meta",{property:"og:title",content:"Serverless IIIF"}),(0,t.jsx)("meta",{property:"og:description",content:"Serve images via IIIF"}),(0,t.jsx)("link",{rel:"shortcut icon",type:"image/png",href:"/favicon.png"})]}),logo:(0,t.jsx)(function(){return(0,t.jsxs)("span",{className:"jsx-6558685ef54f338d",children:[(0,t.jsxs)("svg",{id:"serverless-iiif-logo",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 635.01 75.82",className:"jsx-6558685ef54f338d",children:[(0,t.jsx)("path",{fill:"currentColor",d:"m23.41,61.94c4.03,0,6.92-.73,8.68-2.18,1.75-1.46,2.63-3.19,2.63-5.21,0-1.87-.69-3.38-2.07-4.54-1.38-1.16-3.42-2.15-6.1-2.97l-5.94-1.9c-4.03-1.34-7.6-2.84-10.7-4.48-3.1-1.64-5.49-3.77-7.17-6.38C1.06,31.66.22,28.34.22,24.3c0-6.2,2.35-11.12,7.06-14.78,4.7-3.66,11.24-5.49,19.6-5.49,4.26,0,8.04.41,11.37,1.23,3.32.82,5.94,2.04,7.84,3.64,1.9,1.61,2.86,3.57,2.86,5.88,0,1.72-.39,3.19-1.18,4.42s-1.77,2.3-2.97,3.19c-1.72-1.19-4-2.22-6.83-3.08-2.84-.86-5.97-1.29-9.41-1.29s-6.27.58-8.06,1.74c-1.79,1.16-2.69,2.67-2.69,4.54,0,1.49.6,2.71,1.79,3.64,1.19.93,2.99,1.77,5.38,2.52l6.16,1.9c6.79,2.09,12.02,4.87,15.68,8.34,3.66,3.47,5.49,8.12,5.49,13.94,0,6.27-2.43,11.37-7.28,15.29-4.85,3.92-11.87,5.88-21.06,5.88-4.56,0-8.62-.49-12.21-1.46-3.58-.97-6.44-2.39-8.57-4.26-2.13-1.87-3.19-4.03-3.19-6.5,0-1.94.58-3.6,1.74-4.98,1.16-1.38,2.44-2.41,3.86-3.08,2.02,1.64,4.54,3.12,7.56,4.42,3.02,1.31,6.44,1.96,10.25,1.96Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m66.98,54.88l-.67-11.2,27.78-4.37c-.15-2.09-1.05-4.03-2.69-5.82-1.64-1.79-4.07-2.69-7.28-2.69s-6.16,1.14-8.4,3.42c-2.24,2.28-3.44,5.51-3.58,9.69l.56,7.73c.67,4.11,2.43,7.04,5.26,8.79,2.84,1.76,6.2,2.63,10.08,2.63,3.14,0,6.08-.45,8.85-1.34,2.76-.9,5-1.83,6.72-2.8,1.12.67,2.03,1.61,2.74,2.8.71,1.2,1.06,2.46,1.06,3.81,0,2.24-.88,4.11-2.63,5.6-1.76,1.49-4.18,2.61-7.28,3.36-3.1.75-6.63,1.12-10.58,1.12-5.75,0-10.92-1.08-15.51-3.25-4.59-2.17-8.2-5.41-10.81-9.74-2.61-4.33-3.92-9.74-3.92-16.24,0-4.78.76-8.92,2.3-12.43,1.53-3.51,3.58-6.4,6.16-8.68,2.58-2.28,5.49-3.98,8.74-5.1,3.25-1.12,6.63-1.68,10.14-1.68,5.15,0,9.65,1.03,13.5,3.08,3.84,2.05,6.85,4.83,9.02,8.34,2.17,3.51,3.25,7.58,3.25,12.21,0,2.32-.64,4.07-1.9,5.26-1.27,1.2-3.02,1.94-5.26,2.24l-35.62,5.26Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m133.17,34.61v14h-16.58v-16.02c0-2.09.5-3.86,1.51-5.32,1.01-1.46,2.41-2.74,4.2-3.86,2.46-1.49,5.43-2.67,8.9-3.53,3.47-.86,7.11-1.29,10.92-1.29,7.62,0,11.42,2.54,11.42,7.62,0,1.2-.17,2.31-.5,3.36-.34,1.05-.73,1.94-1.18,2.69-.75-.15-1.66-.28-2.74-.39-1.08-.11-2.26-.17-3.53-.17-2.24,0-4.48.26-6.72.78-2.24.52-4.14,1.23-5.71,2.13Zm-16.58,9.74l16.58.34v29.12c-.75.22-1.79.43-3.14.62-1.34.19-2.8.28-4.37.28-3.14,0-5.43-.56-6.89-1.68s-2.18-3.14-2.18-6.05v-22.62Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m200.59,19.04c2.31,0,4.24.5,5.77,1.51,1.53,1.01,2.3,2.71,2.3,5.1,0,1.34-.37,3.44-1.12,6.27-.75,2.84-1.74,6.12-2.97,9.86-1.23,3.73-2.6,7.54-4.09,11.42-1.49,3.88-2.99,7.52-4.48,10.92-1.49,3.4-2.84,6.22-4.03,8.46-.82.6-2.13,1.14-3.92,1.62-1.79.48-3.77.73-5.94.73-2.54,0-4.72-.34-6.55-1.01-1.83-.67-3.12-1.72-3.86-3.14-.82-1.57-1.83-3.77-3.02-6.61-1.2-2.84-2.46-6.07-3.81-9.69-1.34-3.62-2.69-7.37-4.03-11.26-1.34-3.88-2.58-7.62-3.7-11.2-1.12-3.58-2.02-6.72-2.69-9.41.97-.97,2.22-1.81,3.75-2.52,1.53-.71,3.19-1.06,4.98-1.06,2.31,0,4.22.49,5.71,1.46,1.49.97,2.58,2.8,3.25,5.49l5.04,17.81c.6,2.09,1.21,4.18,1.85,6.27.63,2.09,1.21,4.03,1.74,5.82.52,1.79.97,3.32,1.34,4.59h.45c1.79-6.05,3.6-12.52,5.43-19.43,1.83-6.91,3.45-13.64,4.87-20.22,2.24-1.19,4.82-1.79,7.73-1.79Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m222.54,54.88l-.67-11.2,27.78-4.37c-.15-2.09-1.05-4.03-2.69-5.82-1.64-1.79-4.07-2.69-7.28-2.69s-6.16,1.14-8.4,3.42c-2.24,2.28-3.44,5.51-3.58,9.69l.56,7.73c.67,4.11,2.43,7.04,5.26,8.79,2.84,1.76,6.2,2.63,10.08,2.63,3.14,0,6.08-.45,8.85-1.34,2.76-.9,5-1.83,6.72-2.8,1.12.67,2.03,1.61,2.74,2.8.71,1.2,1.06,2.46,1.06,3.81,0,2.24-.88,4.11-2.63,5.6-1.76,1.49-4.18,2.61-7.28,3.36-3.1.75-6.63,1.12-10.58,1.12-5.75,0-10.92-1.08-15.51-3.25-4.59-2.17-8.2-5.41-10.81-9.74-2.61-4.33-3.92-9.74-3.92-16.24,0-4.78.76-8.92,2.3-12.43,1.53-3.51,3.58-6.4,6.16-8.68,2.58-2.28,5.49-3.98,8.74-5.1,3.25-1.12,6.63-1.68,10.14-1.68,5.15,0,9.65,1.03,13.5,3.08,3.84,2.05,6.85,4.83,9.02,8.34,2.17,3.51,3.25,7.58,3.25,12.21,0,2.32-.64,4.07-1.9,5.26-1.27,1.2-3.02,1.94-5.26,2.24l-35.62,5.26Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m288.73,34.61v14h-16.58v-16.02c0-2.09.5-3.86,1.51-5.32,1.01-1.46,2.41-2.74,4.2-3.86,2.46-1.49,5.43-2.67,8.9-3.53,3.47-.86,7.11-1.29,10.92-1.29,7.62,0,11.42,2.54,11.42,7.62,0,1.2-.17,2.31-.5,3.36-.34,1.05-.73,1.94-1.18,2.69-.75-.15-1.66-.28-2.74-.39-1.08-.11-2.26-.17-3.53-.17-2.24,0-4.48.26-6.72.78-2.24.52-4.14,1.23-5.71,2.13Zm-16.58,9.74l16.58.34v29.12c-.75.22-1.79.43-3.14.62-1.34.19-2.8.28-4.37.28-3.14,0-5.43-.56-6.89-1.68s-2.18-3.14-2.18-6.05v-22.62Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m331.29,53.31l-16.69-.34V1.01c.75-.22,1.79-.45,3.14-.67,1.34-.22,2.8-.34,4.37-.34,3.21,0,5.54.56,7,1.68,1.46,1.12,2.18,3.17,2.18,6.16v45.47Zm-16.69-8.96l16.69.34v29.12c-.75.22-1.79.43-3.14.62-1.34.19-2.8.28-4.37.28-3.14,0-5.45-.56-6.94-1.68-1.49-1.12-2.24-3.14-2.24-6.05v-22.62Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m349.21,54.88l-.67-11.2,27.78-4.37c-.15-2.09-1.05-4.03-2.69-5.82-1.64-1.79-4.07-2.69-7.28-2.69s-6.16,1.14-8.4,3.42c-2.24,2.28-3.44,5.51-3.58,9.69l.56,7.73c.67,4.11,2.43,7.04,5.26,8.79,2.84,1.76,6.2,2.63,10.08,2.63,3.14,0,6.08-.45,8.85-1.34,2.76-.9,5-1.83,6.72-2.8,1.12.67,2.03,1.61,2.74,2.8.71,1.2,1.06,2.46,1.06,3.81,0,2.24-.88,4.11-2.63,5.6-1.76,1.49-4.18,2.61-7.28,3.36-3.1.75-6.63,1.12-10.58,1.12-5.75,0-10.92-1.08-15.51-3.25-4.59-2.17-8.2-5.41-10.81-9.74-2.61-4.33-3.92-9.74-3.92-16.24,0-4.78.76-8.92,2.3-12.43,1.53-3.51,3.58-6.4,6.16-8.68,2.58-2.28,5.49-3.98,8.74-5.1,3.25-1.12,6.62-1.68,10.14-1.68,5.15,0,9.65,1.03,13.5,3.08,3.84,2.05,6.85,4.83,9.02,8.34,2.17,3.51,3.25,7.58,3.25,12.21,0,2.32-.63,4.07-1.9,5.26-1.27,1.2-3.02,1.94-5.26,2.24l-35.62,5.26Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m442.39,58.24c0,5.45-2.05,9.73-6.16,12.82-4.11,3.1-10.08,4.65-17.92,4.65-6.12,0-11.16-.9-15.12-2.69-3.96-1.79-5.94-4.44-5.94-7.95,0-1.57.34-2.93,1.01-4.09.67-1.16,1.53-2.07,2.58-2.74,2.09,1.2,4.54,2.3,7.34,3.3,2.8,1.01,5.99,1.51,9.58,1.51,5.45,0,8.18-1.57,8.18-4.7,0-1.34-.49-2.41-1.46-3.19-.97-.78-2.58-1.36-4.82-1.74l-4.7-1.12c-5.97-1.27-10.44-3.23-13.38-5.88-2.95-2.65-4.42-6.29-4.42-10.92,0-5.23,2.11-9.39,6.33-12.49,4.22-3.1,9.91-4.65,17.08-4.65,3.58,0,6.85.35,9.8,1.06,2.95.71,5.28,1.79,7,3.25,1.72,1.46,2.58,3.27,2.58,5.43,0,1.49-.3,2.8-.9,3.92-.6,1.12-1.38,2.05-2.35,2.8-.82-.52-2.07-1.08-3.75-1.68-1.68-.6-3.51-1.08-5.49-1.46-1.98-.37-3.83-.56-5.54-.56-2.69,0-4.78.36-6.27,1.06-1.49.71-2.24,1.81-2.24,3.3,0,.97.43,1.81,1.29,2.52.86.71,2.37,1.29,4.54,1.74l4.48,1.12c6.64,1.49,11.42,3.64,14.34,6.44,2.91,2.8,4.37,6.44,4.37,10.92Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m493.35,58.1c0,5.5-2.07,9.81-6.21,12.94-4.14,3.12-10.17,4.69-18.08,4.69-6.18,0-11.26-.9-15.25-2.71-3.99-1.81-5.99-4.48-5.99-8.02,0-1.58.34-2.96,1.02-4.12.68-1.17,1.54-2.09,2.6-2.77,2.11,1.21,4.58,2.32,7.4,3.33,2.83,1.02,6.05,1.53,9.66,1.53,5.5,0,8.25-1.58,8.25-4.75,0-1.36-.49-2.43-1.47-3.22-.98-.79-2.6-1.37-4.86-1.75l-4.75-1.13c-6.03-1.28-10.53-3.26-13.5-5.93-2.98-2.67-4.46-6.35-4.46-11.02,0-5.27,2.13-9.47,6.38-12.6,4.26-3.13,10-4.69,17.23-4.69,3.62,0,6.91.36,9.89,1.07,2.98.72,5.33,1.81,7.06,3.28,1.73,1.47,2.6,3.3,2.6,5.48,0,1.51-.3,2.82-.9,3.95-.6,1.13-1.39,2.07-2.37,2.83-.83-.53-2.09-1.09-3.79-1.69-1.7-.6-3.54-1.09-5.54-1.47-2-.38-3.86-.56-5.59-.56-2.71,0-4.82.36-6.33,1.07-1.51.72-2.26,1.83-2.26,3.33,0,.98.43,1.83,1.3,2.54.86.72,2.39,1.3,4.58,1.75l4.52,1.13c6.7,1.51,11.53,3.67,14.46,6.5,2.94,2.82,4.41,6.5,4.41,11.02Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m523.12,40.77h-9.07V6.05c.37-.15.95-.32,1.74-.5.78-.19,1.62-.28,2.52-.28,1.64,0,2.86.32,3.64.95.78.64,1.18,1.7,1.18,3.19v31.36Zm-9.07-7.5h9.07v40.43c-.38.15-.93.32-1.68.5-.75.19-1.57.28-2.46.28-1.64,0-2.88-.34-3.7-1.01-.82-.67-1.23-1.72-1.23-3.14v-37.07Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m549.11,40.77h-9.07V6.05c.37-.15.95-.32,1.74-.5.78-.19,1.62-.28,2.52-.28,1.64,0,2.86.32,3.64.95.78.64,1.18,1.7,1.18,3.19v31.36Zm-9.07-7.5h9.07v40.43c-.38.15-.93.32-1.68.5-.75.19-1.57.28-2.46.28-1.64,0-2.88-.34-3.7-1.01-.82-.67-1.23-1.72-1.23-3.14v-37.07Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m575.09,40.77h-9.07V6.05c.37-.15.95-.32,1.74-.5.78-.19,1.62-.28,2.52-.28,1.64,0,2.86.32,3.64.95.78.64,1.18,1.7,1.18,3.19v31.36Zm-9.07-7.5h9.07v40.43c-.38.15-.93.32-1.68.5-.75.19-1.57.28-2.46.28-1.64,0-2.88-.34-3.7-1.01-.82-.67-1.23-1.72-1.23-3.14v-37.07Z",className:"jsx-6558685ef54f338d"}),(0,t.jsx)("path",{fill:"currentColor",d:"m600.96,46.37l-9.07-.11V10.75c0-1.49.45-2.69,1.34-3.58.9-.9,2.09-1.34,3.58-1.34.82,0,1.64.11,2.46.34.82.22,1.38.41,1.68.56v39.65Zm-9.07-12.32h9.18v39.76c-.38.08-.95.2-1.74.39-.78.19-1.59.28-2.41.28-1.64,0-2.89-.34-3.75-1.01-.86-.67-1.29-1.68-1.29-3.02v-36.4Zm4.93-20.5v-7.73h37.18c.22.3.45.78.67,1.46.22.67.34,1.38.34,2.13,0,1.2-.3,2.18-.9,2.97-.6.78-1.46,1.18-2.58,1.18h-34.72Zm0,31.02v-7.73h33.26c.22.37.45.88.67,1.51.22.64.34,1.33.34,2.07,0,1.19-.3,2.18-.9,2.97-.6.78-1.46,1.18-2.58,1.18h-30.8Z",className:"jsx-6558685ef54f338d"})]}),(0,t.jsx)(n(),{id:"6558685ef54f338d",children:"svg.jsx-6558685ef54f338d{height:1rem}span.jsx-6558685ef54f338d{padding:.5rem .5rem .5rem 0;-webkit-mask-image:-webkit-linear-gradient(30deg,black 25%,rgba(0,0,0,.2)50%,black 75%);mask-image:-webkit-linear-gradient(30deg,black 25%,rgba(0,0,0,.2)50%,black 75%);mask-image:-moz-linear-gradient(30deg,black 25%,rgba(0,0,0,.2)50%,black 75%);mask-image:-o-linear-gradient(30deg,black 25%,rgba(0,0,0,.2)50%,black 75%);mask-image:linear-gradient(60deg,black 25%,rgba(0,0,0,.2)50%,black 75%);-webkit-mask-size:400%;mask-size:400%;-webkit-mask-position:0%;mask-position:0%}span.jsx-6558685ef54f338d:hover{-webkit-mask-position:100%;mask-position:100%;-webkit-transition:mask-position 1s ease,-webkit-mask-position 1s ease;-moz-transition:mask-position 1s ease,-webkit-mask-position 1s ease;-o-transition:mask-position 1s ease,-webkit-mask-position 1s ease;transition:mask-position 1s ease,-webkit-mask-position 1s ease}"})]})},{}),primaryHue:209,project:{link:"https://github.com/samvera/serverless-iiif"},sidebar:{autoCollapse:!0,defaultMenuCollapseLevel:1},useNextSeoProps(){let{asPath:e}=(0,a.useRouter)();if("/"!==e)return{titleTemplate:"%s – Serverless IIIF"}}}},2265:function(e){e.exports={cfAttribute:"custom_cfAttribute__HtOk5",tfAttribute:"custom_tfAttribute__O4A_D",tfAttributeType:"custom_tfAttributeType__iYrqp"}}},function(e){e.O(0,[695,160,888,774,179],function(){return e(e.s=6681)}),_N_E=e.O()}]);