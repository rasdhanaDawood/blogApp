import { Link } from "react-router-dom"
import AnimationWrapper from "../common/animation"
import { useContext } from "react"
import { UserContext } from "../App"
import { removeFromSession } from "../common/session"

const UserNavigationPanel = ({type}) => {

    const { userAuth,userAuth: { }, setUserAuth } = useContext(UserContext);
    const {username}=userAuth
    console.log({ username });    
    
    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
        
    }


    return (<>
        
                <AnimationWrapper
                    transition={{duration:0.2}}
                    className="absolute right-0 z-50"
                    keyValue={type}
        >
            <div className="bg-white absolute right-0 border border-gray-200 w-60 duration-200">
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                   <i className="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>
                <Link to={username?`/user/${username}`:"/"} className="link pl-8 py-4">
                    Profile
                </Link>

                <Link to="/dashboard/blogs" className="link pl-8 py-4">
                    Dashboard
                </Link>

                <Link to="/settings/edit-profile" className="link pl-8 py-4">
                    Settings
                </Link>

                <span className="absolute border border-t border-gray-200 w-full"></span>

                <button className="text-left p-4 hover:bg-gray-200 w-full pl-8 py-4"
                onClick={signOutUser}>
                    <h1 className="font-bold text-xl m-1">Sign Out</h1>
                    <p className="text-gray-500">@{username}</p>
                </button>
                
            </div>

        </AnimationWrapper>
        </>
    )
}
export default UserNavigationPanel