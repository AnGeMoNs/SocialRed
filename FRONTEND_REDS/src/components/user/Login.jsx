
import  { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
export const Login = () => {
 
  const { form, changed } = useForm({})
  const [ saved,setSaved] = useState("not_sended");
  const{setAuth} = useAuth();
  const LoginUser = async (e) => {
    e.preventDefault();
    let userToLogin = form;
    const request = await fetch(Global.URL + 'user/login', {
      method: "POST",
      body: JSON.stringify(userToLogin),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await request.json();
     if(data.status == "success"){
         localStorage.setItem("token", data.token);
         localStorage.setItem("user", JSON.stringify(data.user));
        setSaved("login");

        setAuth(data.user);
        setTimeout(() => {window.location.reload();},500);
    }else{

      setSaved("error");
    }
  }  
  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Login </h1>
      </header>
      <div className="content__posts">
        {saved === "login" && (
          <strong className="alert alert-success">Successfully registered user</strong>
        )}
        {saved === "error" && (
          <strong className="alert alert-danger">Error updating user </strong>
        )}
        <form className='form-login' onSubmit={LoginUser}>
          <div className='form-group'>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" onChange={changed} />
          </div>
          <div className='form-group'>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" onChange={changed} />
          </div>
          <input type="submit" value="identify yourself" className="btn btn-success" />
        </form>
      </div>

    </>
  )
}
