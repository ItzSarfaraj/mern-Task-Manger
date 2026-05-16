import React, { useState, useContext } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS} from "../../utils/apiPath";
import { UserContext} from "../../context/userContext";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { updateUser} = useContext(UserContext);
  const navigate = useNavigate();

  //Handle login form submit
  const handleLogin = async(e) =>{
    e.preventDefault();

    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }

    if(!password){
      setError("Please enter the password.");
      return;
    }

    setError("");

    //Login API call
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {email, password});
        const {token,role} = response.data;

        if(token){
          localStorage.setItem("token", token);
          updateUser(response.data);//update user context with logged in user data

          //redirect based on role
          if(role === "admin"){
            navigate("/admin/dashboard");
          }else{
            navigate("/user/dashboard");
          }
        }
     }catch(error){
        //  console.log(error);
         if(error.response && error.response.data.message){
          setError(error.response.data.message);
         }else{
          setError("Something went wrong. Please try again later.");
          // setError(error.message);
         }
    }
  };

  return (
    <AuthLayout>
      <div className=''>
        <h3 className='text-4xl font-bold text-gray-900 mb-3 tracking-tight'>
        Welcome Back
        </h3>

        <p className='text-gray-500 text-base mb-8 leading-6'>
            Please enter your details to log in to your account.
        </p>

        <form onSubmit={handleLogin}>
          <Input 
            value = {email}
            onChange = {({ target }) => setEmail(target.value)}
            label = "Email Address"
            placeholder = "srs@example.com"
            type = "text"/>
            
          <Input 
            value = {password}
            onChange = {({ target }) => setPassword(target.value)}
            label = "Password"
            placeholder = "Min 8 characters"
            type = "password"/>

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <button type="submit" className="btn-primary">
              LOGIN
            </button>

            <p className="text-[13px] text-slate-800 mt-3">
              Don't have an account?{""}
              <Link className="font-medium text-primary underline" to="/signup"> SignUp </Link>
            </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login