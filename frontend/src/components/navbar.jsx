import {Link, Outlet, useNavigate} from "react-router-dom"
import logo from "../images/logo.png"
import {useContext, useState} from "react"
import { UserContext } from "../App"
import UserNavigationPanel from "./userNavigation"
const Navbar = () => {

  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false)
  const [userNavPanel, setUserNavPanel] = useState(false)

  let navigate = useNavigate();

  const {userAuth,userAuth:{access_token,profile_img} } = useContext(UserContext);

  const handleUserNavPanel = () => {
    setUserNavPanel(currentVal => !currentVal);

  }
  
  const handleMouseDown = (e) => {
    e.preventDefault();
  }
  const handleSearch = (e) => {
    let query = e.target.value
      if(e.keyCode == 13 && query.length){
        navigate(`/search/${query}`)
      }
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} className="w-20" alt="logo" />
        </Link>
        <div
          className={
"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-gray-200 py-4 px-[5vw] " +
(searchBoxVisibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") +
" md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:opacity-100 md:pointer-events-auto"
}
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-gray-200 p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-gray-500 md:pl-12"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button className={"md:hidden bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center "+(searchBoxVisibility ? "hide" : "show")}>
            <i
              className="fi fi-rr-search text-xl text-gray-500"
              onClick={() =>
                setSearchBoxVisibility((currentVal) => !currentVal)
              }
            ></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>

          {

            access_token ?
              <>
                <Link to="/dashboard/notification" >
                  <button className="w-12 h-12 rounded-full bg-gray-200 relative hover:bg-black/10" >
                  <i className="fi fi-rr-bell text-2xl block mt-1" ></i>
                  </button></Link>
                <div className="relative" onClick={handleUserNavPanel} onMouseDown={handleMouseDown}>
                  <button className="w-12 h-12 mt-1" >
                    <img src ={profile_img} className="w-full h-full object-cover rounded-full" />
                  </button>
               
                  {userNavPanel && <UserNavigationPanel type="" />}
                </div>
              </>
              :
            <>
          <Link className="btn-dark py-2" to="/signin">
            Sign In
          </Link>
          <Link className="btn-light py-2 hidden md:block" to="/signup">
            Sign Up
          </Link></>
          }
          
        </div>
      </nav>

      <Outlet />
    </>
  )
}
export default Navbar
