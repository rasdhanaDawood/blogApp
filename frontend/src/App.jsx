import {Route, Routes} from "react-router-dom"
import "./App.css"
import UserAuthForm from "./pages/userAuthForm"
import {createContext, useEffect, useState} from "react"
import {lookInSession} from "./common/session"
import UserProfilePage from "./pages/userProfilePage"
import Blogs from "./pages/blogs"
import Editor from "./pages/editor"
import Navbar from "./components/Navbar"
import PublishForm from "./components/publishForm"

export const UserContext = createContext({})

function App() {
  const [userAuth, setUserAuth] = useState({})


  useEffect(() => {
    const userInSession = lookInSession("user")

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({access_token: null})
  }, [])

  return (
    <UserContext.Provider value={{userAuth, setUserAuth}}>
      <Routes> 
        <Route path="/editor" element={<Editor />} />
        <Route path="/publish" element={<PublishForm />} />

        <Route path="user/:username" element={<UserProfilePage />} />
          <Route path="dashboard/blogs" element={<Blogs />} />
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          
          {/* <Route path="settings/edit-profile" element={<settings/>}/> */}
          
        </Route>
      </Routes>
    </UserContext.Provider>
  )
}

export default App
