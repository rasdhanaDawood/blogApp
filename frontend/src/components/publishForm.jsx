import toast, { Toaster } from "react-hot-toast"
import AnimationWrapper from "../common/animation"
import { useContext } from "react"
import { EditorContext } from "../pages/editor"
import Tag from "./tag"
import axios from "axios"
import { UserContext } from "../App"
import { useNavigate } from "react-router-dom"
import { API } from "../common/api"

const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 5;

    let { blog, blog: { banner,title,content,tags,desc,drafts },setEditorState,setBlog } = useContext(EditorContext);
        
    let { userAuth: { access_token } } = useContext(UserContext);
    
    let navigate = useNavigate()
    const handleCloseEvent = () => {

        setEditorState("editor");

    }

    const handleBlogTitleChange = (e) => {

        let input = e.target;
        setBlog({ ...blog, title: input.value });
    }

    const handleBlogDescChange = (e) => {

        let input = e.target;
        setBlog({ ...blog, desc: input.value });
    }

    const handleTitleKeyDown = (e) => {
              
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const publishBlog = (e) => {
        if (e.target.className.includes("disable")) return;

        if (!title.length) return toast.error("Write blog title before publishing")
        
        if (!desc.length || desc.length > characterLimit) return toast.error(`Write description about your blog within ${characterLimit}`)
        
        if (!tags.length) return toast.error("Enter atleast 1 tag to help us rank your blog")
        
        let loadingToast = toast.loading("Publishing...")
        
        e.target.classList.add('disable');
        let blogObj = {
            title, banner, desc, content, tags, drafts: false
        }
        axios.post(API + "/create-blog", blogObj, {
            headers: {
                'Authorization':`Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.classList.remove("disable")
                toast.dismiss(loadingToast);
                toast.success("Published");

                setTimeout(() => {
                    navigate("/")
                }, 500);
            })
            .catch(({ response }) => {
                e.target.classList.remove('disable')
                toast.dismiss(loadingToast)
                return toast.error(response.data.error)
            
        })

    }

    const handleKeyDown = (e) => {

        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();
            let tag = e.target.value;
            if (tags.length < tagLimit) {

                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] })
                    
                }
            } else {
                toast.error(`You can add max ${tagLimit} Tags`);
            }

            e.target.value = "";
        }
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-gray-600 mb-1">
                        Preview
                    </p>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 mt-4">
                        <img src={banner} />
                    </div>
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{desc}</p>
                </div>

                <div className="border-gray-200 lg:border lg:pl-8">
                    <p className="text-gray-600 mb-2 mt-9">Blog title</p>
                    <input type="text" placeholder="Blog Title" defaultValue={title}className="input-box pl-4" onChange={handleBlogTitleChange} />
                    <p className="text-gray-600 mb-2 mt-9">Blog description about your blog</p>
                    
                    <textarea
                        maxLength={characterLimit}
                        defaultValue={desc}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDescChange}
                    onKeyDown={handleTitleKeyDown}>

                    </textarea>
                    
                    <p className="mt-1 text-gray-600 text-sm text-right">{characterLimit - desc.length} characters left</p>

                    <p className="text-gray-600 mb-2 mt-9">Topics-( Helps is searching and ranking your blog post)</p>
                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white" onKeyDown={handleKeyDown}/>
                        {
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex={i} key={i} />
                            })
                        }

                    </div>

                    <p className="mt-1 mb-4 text-gray-600 text-light">{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8" onClick={publishBlog}>Publish</button>
                </div>
            </section>
       </AnimationWrapper>
    )
} 
export default PublishForm