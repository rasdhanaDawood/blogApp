import {Link, Navigate} from "react-router-dom"
import InputBox from "../components/inputBox"
import googleIcon from "../images/google-icon.png"
import AnimationWrapper from "../common/animation"
import {Toaster, toast} from "react-hot-toast"
import axios from "axios"
import {useContext} from "react"
import {storeInSession} from "../common/session"
import {UserContext} from "../App"
import { authWithGoogle } from "../common/firebase"
import { API } from "../common/api"

const UserAuthForm = ({type}) => {

  let {
    userAuth: {access_token},
    setUserAuth
  } = useContext(UserContext)  

  const userAuthThroughServer = (serverRoute, formData) => {
   
    axios
      .post(`${API}${serverRoute}`, formData)
      .then(({ data }) => {
        
        storeInSession("user", JSON.stringify(data))
       
        setUserAuth(data)
      })
      .catch(err => {
        toast.error(err.response.data.error);
       
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let serverRoute = type == "sign-in" ? "/signin" : "/signup"

    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    let passwordRegex = /^(?=.*\d)(?=.*\W)(?=.*[a-zA-Z])(?!.*\s).{8,}$/

    let form = new FormData(formElement)

    let formData = {}

    for (let [key, value] of form.entries()) {
      formData[key] = value
    }

    let {fullname, email, password} = formData

    if (fullname) {
      if (fullname.length < 3)
        return toast.error("Fullname must have atleast 3 letters long!")
    }
    if (!email.length) return toast.error("Enter Email!")

    if (!emailRegex.test(email)) return toast.error("Invalid Email Id")

    if (!passwordRegex.test(password))
      return toast.error(
        "Password should have minimum 8 characters. Password must have a number, a special character and a letter. No spaces allowed."
      )

    userAuthThroughServer(serverRoute, formData);

  }
  const handleGoogleAuth = async (e) => {
    try {
      e.preventDefault()

    let result = await authWithGoogle()
    
      if (!result || !result.idToken) {
        toast.error('Failed to get Firebase ID token');
        return;
      }
      let serverRoute = "/google-auth"

      let formData = {
        idToken: result.idToken
      }
      userAuthThroughServer(serverRoute, formData)
    }
    
    
      catch(err){
        toast.error('Trouble login through google');
        return console.log(err);
        
      }
  }
  
  return (
    access_token ?
    <Navigate to="/" />  
      :
    <>
      <AnimationWrapper keyValue={type}>
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Toaster />
          <form id="formElement" action="" className="w-[80%] max-w-[400px]">
            <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
              {type == "sign-in" ? "welcome back" : "join us today"}
            </h1>
            {type != "sign-in" && (
              <InputBox
                name="fullname"
                type="text"
                placeholder="Full name"
                icon="fi-rr-user"
              />
            )}
            <InputBox
              name="email"
              type="email"
              placeholder="Email"
              icon="fi-rr-envelope"
            />

            <InputBox
              name="password"
              type="password"
              placeholder="Password"
              icon="fi-rr-key"
            />

            <button
              className="btn-dark center mt-14 hover:cursor-pointer"
              type="submit"
              onClick={handleSubmit}
            >
              {type.replace("-", " ")}
            </button>

            <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
              <hr className="w-1/2 border-black" />
              <p>or</p>
              <hr className="w-1/2 border-black" />
            </div>

            <button className="btn-dark flex items-center hover:cursor-pointer justify-center gap-4 w-[90%] center" onClick={handleGoogleAuth}>
              <img src={googleIcon} className="w-5" />
              Continue with Google
            </button>

            {type == "sign-in" ? (
              <p className="mt-6 text-gray-500 text-xl text-center">
                Don't have an account?
                <Link
                  to="/signup"
                  className="underline text-black text-xl ml-1"
                >
                  Join us today
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-gray-500 text-xl text-center">
                Already a member?
                <Link
                  to="/signin"
                  className="underline text-black text-xl ml-1"
                >
                  Sign in here
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </>
  )
}
export default UserAuthForm
