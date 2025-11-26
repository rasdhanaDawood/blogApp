import {useState} from "react"

const InputBox = ({type, name, placeholder, value, id, icon}) => {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className="relative w-full mb-4">
      <input
        type={
          type == "password" ? (passwordVisible ? "text" : "password") : type
        }
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className="input-box"
      />
      <i className={"fi " + icon + " input-icon"}></i>

      {type == "password" ? (
        <i
          className={
            "fi fi-rr-eye" +
            (!passwordVisible ? "-crossed" : "") +
            " input-icon left-auto right-4 cursor-pointer"
          }
          onClick={() => setPasswordVisible((currentVal) => !currentVal)}
        ></i>
      ) : (
        ""
      )}
    </div>
  )
}
export default InputBox
