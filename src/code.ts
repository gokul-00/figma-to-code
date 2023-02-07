

figma.showUI(__html__)

// Figma API function to extract information from the selected frame
const getSelectedFrame = async() => {
  const nodes = figma.currentPage.selection;
  if (nodes.length !== 1 || nodes[0].type !== "FRAME") {
    figma.notify("Please select a single frame.");
    return;
  }
  const frame = nodes[0];
  // processNode(frame,[],[])
  return frame;
}


const generateHTMLCSS = async(frame: BaseNode, html="", css=""):Promise<{ html: string; css: string; }> => {
  // let html = "";
  // let css = "";
  if (!frame) { return { html, css } }
  if (frame.type !== 'FRAME') { return { html, css } }
  let children = frame.children.concat();
  for (const node of children) {
    console.log(node);
    switch (node.type) {
      case "RECTANGLE":
        if(Array.isArray(node.fills) && node.fills[0].type === "IMAGE"){
          // const image = figma.getImageByHash(node.fills[0].imageHash)
          // const bytes = await image.getBytesAsync()

          
          // Send the raw bytes of the file to the worker.
          // figma.ui.postMessage({type: "img", bytes, filename: `img-${node.id.replace(':','-')}`})

          // const src:string = await new Promise((resolve, reject) => {
          //   figma.ui.onmessage = value =>{ 
          //     // figma.closePlugin()
          //     if(value.type == "src") return resolve(value.url); 
          //   }
          // })

          // console.log("image",src.split(','));
          // const imageUrl = figma.getImage(node, { format: "png" }).url;
          html += `<img class="rect-${node.id.replace(':','-')}" src="./img-${node.id.replace(':','-')}" />`
          css += `.rect-${node.id.replace(':','-')} {
            position: absolute;
            width: ${node.width}px;
            height: ${node.height}px;
            left: ${node.x}px;
            top: ${node.y}px;
          }`
        }else if (Array.isArray(node.fills) && node.fills[0].type === "SOLID"){
        const rectBG = Array.isArray(node.fills) && node.fills[0].type === "SOLID" ? node.fills[0].color : {r:1,g:1,b:1};
        const borderwidth = node.strokes.length ? node.strokeWeight.toString() : 0;
        const bordercolor = Array.isArray(node.strokes) && node.strokes.length && node.strokes[0].type === "SOLID" ? `rgb(${node.strokes[0].color.r*255},${node.strokes[0].color.g*255}, ${node.strokes[0].color.b*255})` : '0';
        const border = Array.isArray(node.strokes) && node.strokes.length ? `border-width:${borderwidth}; border-style:solid; border-color:${bordercolor}` : `border:none;`;
        html += `<div class="rect-${node.id.replace(':','-')}"></div>`
        css += `.rect-${node.id.replace(':','-')} {
          position: absolute;
          width: ${node.width}px;
          height: ${node.height}px;
          left: ${node.x}px;
          top: ${node.y}px;
          border-radius: ${node.cornerRadius.toString()};
          background-color: rgb(${rectBG.r*255},${rectBG.g*255}, ${rectBG.b*255});
          ${border}
        }`
        }
        break;
      case "ELLIPSE":
        const ellipseBG = Array.isArray(node.fills) && node.fills[0].type === "SOLID" ? node.fills[0].color : {r:1,g:1,b:1};
        const borderwidth = node.strokes.length ? node.strokeWeight.toString() : 0;
        const bordercolor = Array.isArray(node.strokes) && node.strokes.length && node.strokes[0].type === "SOLID" ? `rgb(${node.strokes[0].color.r*255},${node.strokes[0].color.g*255}, ${node.strokes[0].color.b*255})` : '0';
        const border = Array.isArray(node.strokes) && node.strokes.length ? `${borderwidth} solid ${bordercolor}` : `none`;
        html += `<div class="ellipse-${node.id.replace(':','-')}"></div>`;
        css += `.ellipse-${node.id.replace(':','-')} {
          position: absolute;
          width: ${node.width}px;
          height: ${node.height}px;
          left: ${node.x}px;
          top: ${node.y}px;
          border-radius: 50%;
          background-color: rgb(${ellipseBG.r*255},${ellipseBG.g*255}, ${ellipseBG.b*255});
          border: ${border};
        }`
        break;
      case "TEXT":
        const color = Array.isArray(node.fills) && node.fills[0].type === "SOLID" ? node.fills[0].color : 'black';
        html += `<p class="text-${node.id.replace(':','-')}">${node.characters}</p>`
        css += `.text-${node.id.replace(':','-')} {
          position: absolute;
          font-size: ${node.fontSize.toString()}px;
          font-weight: ${node.fontWeight.toString()};
          left: ${node.x}px;
          top: ${node.y}px;
          color: rgb(${color.r*255},${color.g*255}, ${color.b*255}); 
        }`
        break;
      
      case "LINE":
        console.log(node);
        const lineColor = Array.isArray(node.strokes) && node.strokes[0].type === "SOLID" ? node.strokes[0].color : 'black';
        html += `<div class="line-${node.id.replace(':','-')}"></div>`
        css += `.line-${node.id.replace(':','-')} {
          position: absolute;
          width: ${node.width}px;
          height: ${node.strokeWeight.toString()}px;
          left: ${node.x}px;
          top: ${node.y}px;
          background: rgb(${lineColor.r*255},${lineColor.g*255}, ${lineColor.b*255});
          opacity: ${node.strokes[0].opacity};
          transform: rotate(${node.rotation});
        }`
        break;
    }
  }
  return { html, css };
}

let content:string;

const exportZip = async(code: { html: string; css: string; }) => {
  // const zip = new JSZip();
  content = `<!DOCTYPE html>
  <html>
  <head>
    <style>
    ${code.css}
    </style>
  </head>
  <body>
    ${code.html}
  </body>
  </html>`
  // const content = await zip.generateAsync({ type: "blob" });
  // figma.showUI(__html__, { width: 400, height: 300 });
  // figma.ui.postMessage();
  // figma.ui.postMessage({ pluginMessage: { type: "zip", content } })

  console.log(content);

}


const main = async() => {
  const frame = await getSelectedFrame();
  if (!frame) {
    return;
  }
  const code = await generateHTMLCSS(frame);
  console.log("done")
  await exportZip(code);
}

// Run the main function
main();


figma.ui.onmessage = msg => {

  console.log('code.ts')
  if (msg.type === 'download') {
    figma.ui.postMessage({ type: "download", content })
    return
  }

  if (msg.type === 'close') {
    figma.closePlugin()
  }
};