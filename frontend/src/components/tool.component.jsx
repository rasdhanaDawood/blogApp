import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code"
import { uploadImage } from "../common/aws"

// const uploadImageByFile = (e) => {

//     return uploadImage(e).then(url => {
//         if (url) {
//             const result= {
//                 success: 1,
//                 file:{url}
//             }
//             console.log(result);
            
//         }
//     }).catch(err=>console.error(err.message))
// }

const uploadImageByFile = (file) => {
  return uploadImage(file)
    .then((url) => {
      if (!url) {
        // Explicit failure format
        return { success: 0 };
      }
        return { success: 1, file: { url:url } };

    //   return {
    //     success: 1,
    //     file: { url: typeof url === "string" ? url : url.url },
    //   };
    })
    .catch((err) => {
      console.error("uploadImageByFile error", err);
      return { success: 0 };
    });
};


const uploadImageByURL = (e) => {

    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }
    })
    return link.then(url => {
        return {
            success: 1,
            file:{url}
        }
    })
    
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true,
        
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile:uploadImageByFile,
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel:2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode
}

