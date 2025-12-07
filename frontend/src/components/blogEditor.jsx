import { Link } from "react-router-dom";
import logo from "../images/R-logo.svg"
import AnimationWrapper from "../common/animation";
// import defaultBanner from "../images/blogBanner.png"
import { uploadImage } from "../common/aws";
import toast, { Toaster } from "react-hot-toast";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tool.component";

const BlogEditor = () => {

    let {blog, blog:{title,banner,content,tags,desc},setBlog,textEditor, setTextEditor,setEditorState } = useContext(EditorContext);
console.log(banner);

    useEffect(() => {
        setTextEditor(new EditorJS({
            holder:"textEditor",
            data: "",
            tools: tools,
            placeholder:"Lets write something Interesting"
            
        }))
       
    },[])
    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        
        if (img) {
            let loadingToast=toast.loading("Uploading...")
            uploadImage(img).then(url => {
                 
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded successfully!")
                    console.log("url: " + url);             
                    setBlog({ ...blog, banner: url });

                }
            })
                .catch(err => {
                    toast.dismiss(loadingToast)
                    return toast.error(err)
                })
        }
    }

    const handleTitleKeyDown = (e) => {
              
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
    
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";
        setBlog({ ...blog, title: input.value });
        
    }

    const handlePublishEvent = () => {
        if (!banner) {
            return toast.error("Upload a blog banner to publish")
        }
        
        if (!title.length) {
            return toast.error("Add a title to the blog")
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data })
                    setEditorState("publish")
                }
                else {
                    return toast.error("Write something in your blog to publish it");
                }
                
            })
        }

    }
    
    return (
        <>
        <nav className="navbar">
            <Link to="/" className="flex-none w-10">
                <img src={logo} /></Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    { title.length? title: "New Blog" }
            </p>
            <div className="flex gap-4 ml-auto">
                <button className="btn-dark py-2" onClick={handlePublishEvent}>
                    Publish
                </button>
                <button className="btn-light py-2">
                    Save Draft
                </button> 
            </div>
            </nav>
            <Toaster/>
            <AnimationWrapper>
                <section>
                <div className="mx-auto max-w-[900px] w-full">
                    <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-gray-200">
                        <label htmlFor="uploadBanner">
                            <img src={blog.banner} alt="blog banner" className="z-20"/>
                            <input id="uploadBanner" type="file" accept=".png,.jpg,.jpeg" hidden onChange={handleBannerUpload} />
                        </label>
                    </div>
                    <textarea placeholder="Blog Title" className="text-4xl font-medium w-full h-20 outline-none mt-10 leading-tight placeholder:opacity-40" onKeyDown={handleTitleKeyDown} onChange={handleTitleChange}>
                    </textarea>
                    <hr className="w-full opacity-10 my-5" />
                    <div id="textEditor" className="font-gelasio">
                    </div>
                </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;