import { Link } from "react-router-dom";
import logo from "../images/R-logo.svg"
import AnimationWrapper from "../common/animation";
import defaultBanner from "../images/blogBanner.png"
import { uploadImage } from "../common/aws";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";


const BlogEditor = () => {
    // let blogBannerRef = useRef()

    let [blogBanner, setBlogBanner] = useState(defaultBanner);
    

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        
        if (img) {

            let loadingToast=toast.loading("Uploading...")
            uploadImage(img).then(url => {
                 
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded successfully!")
                    setBlogBanner(url)
                    console.log(url);
                }
            })
                .catch(err => {
                    toast.dismiss(loadingToast)
                    return toast.error(err)
                })
        }

    }
    return (
        <>
        <nav className="navbar">
            <Link to="/" className="flex-none w-10">
                <img src={logo} /></Link>
            <p className="max-md:hidden text-black line-clamp-1 w-full">
                New Blog
            </p>
            <div className="flex gap-4 ml-auto">
                <button className="btn-black py-2">
                    Publish
                </button>
                <button className="btn-black py-2">
                    Save Draft
                </button> 

            </div>
            </nav>
            <Toaster/>
            <AnimationWrapper>
                <div className="mx-auto max-w-[900px] w-full">
                    <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-gray-200">
                        <label htmlFor="uploadBanner">
                            <img src={blogBanner} alt="blog banner" />
                            <input id="uploadBanner" type="file" accept=".png,.jpg,.jpeg" hidden onChange={handleBannerUpload} />
                        </label>

                    </div>
                </div>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;