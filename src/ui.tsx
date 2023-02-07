import * as React from "react";
import * as ReactDOM from "react-dom";
import "./ui.css";


declare function require(path: string): any;

function App() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [imageArr, setImageArr] = React.useState([]);

  const onCreate = () => {
    parent.postMessage({pluginMessage:{ type: "download" }}, "*");
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };
  React.useEffect(() => {
  window.onmessage = async event => {
    const msg = event.data.pluginMessage;
    console.log(msg.type);
    if (msg.type === "download") {
      console.log("download");
      var element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(msg.content));
    element.setAttribute('download', 'frame');
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
    }
    if(msg.type === "img"){
      const bytes = msg.bytes;
      const filename = msg.filename;
      setImageArr([...imageArr, [filename,bytes]]);
      // async function blobToDataURL(blob) {
      // return new Promise((resolve, reject) => {
      //     let reader = new FileReader();
      //     reader.onload = function(e) {
      //     resolve(e.target.result);
      //     };
      //     reader.onerror = reject;
      //     reader.readAsDataURL(blob);
      // });
      // }
      // const url = await blobToDataURL(new Blob([bytes]))
      // parent.postMessage({pluginMessage:{ type: "src", url }}, "*");
    }}
  },[])

  return (
    <main>
        <button id="download" onClick={onCreate}>
          Download
        </button>
        <button onClick={onCancel}>Cancel</button>
    </main>
  );
}

ReactDOM.render(<App />, document.getElementById("react-page"));
