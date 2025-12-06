import { useState, useContext } from "react"
import { UserContext } from "../App"
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blogEditor";
import PublishForm from "../components/publishForm";
import { createContext } from "react";
import defaultBanner from "../images/blogBanner.png"

const blogStructure = {
    title: '',
    banner: defaultBanner,
    content: [],
    tags: [],
    desc: '',
    author:{personal_info:{}}
}

export const EditorContext = createContext({});

const Editor = () => {

    const [blog,setBlog]=useState(blogStructure)

    const [editorState, setEditorState] = useState("editor")
    let { userAuth: { access_token } } = useContext(UserContext);   
    
    return (
        <EditorContext.Provider value={{blog,setBlog,editorState,setEditorState}}>
        {
            access_token == null ? <Navigate to="/signin" />
            :editorState ==="editor"?<BlogEditor />:<PublishForm />
        }
        </EditorContext.Provider>
    )
}

export default Editor