import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Global } from '../../helpers/Global';
import { SerializeForm } from '../../helpers/SerializeForm';
import avatar from '../../assets/img/user.png';
export const Settings = () => {
  const { auth,setAuth } = useAuth();
  const [saved, setSaved] = useState("not_saved");

  const updateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let newDataUser = SerializeForm(e.target);
    delete newDataUser.file0;
    const request = await fetch(Global.URL + "user/update",{method: "PUT",body: JSON.stringify(newDataUser),headers: {"Content-Type": "application/json","Authorization":token}});
    const data = await request.json();
    console.log(data);
    if (data.status === "success" && data.user){
      delete data.user.password;
      setAuth(data.user);
      setSaved("saved");
      console.log("auth");
    }else{
      setSaved("error");
    }
    const fileInput = document.querySelector("#file1");
    if (fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append("file0", fileInput.files[0]);
       const uploadRequest = await fetch(Global.URL + "user/upload",{method: "POST",body:formData,headers: {"Authorization":token}});
       const uploadData = await uploadRequest.json();
       if (uploadData.status == "success" && uploadData.user){
           delete uploadData.password;
           setAuth(uploadData.user);
           setSaved("saved");
       }else{
        setSaved("error");
       }

    }
    //console.log(newDataUser);
    // Lógica para actualizar el usuario aquí
    // Puedes agregar la lógica asíncrona y manejar el estado 'saved' en consecuencia
    // Por ejemplo, puedes usar una llamada a una API o realizar alguna operación asíncrona aquí
    // y luego actualizar el estado 'saved' en función del resultado.

    // Ejemplo de llamada a una API ficticia:
    // try {
    //   const response = await api.updateUser(userData);
    //   setSaved("saved");
    // } catch (error) {
    //   console.error(error);
    //   setSaved("error");
    // }
  };

  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Settings</h1>
      </header>
      <div className="content__posts">
        {saved === "saved" && (
          <strong className="alert alert-success">User updated successfully</strong>
        )}
        {saved === "error" && (
          <strong className="alert alert-danger">Error updating</strong>
        )}
        <form className="settings-form" onSubmit={updateUser}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" defaultValue={auth.name}/>
          </div>
          <div className="form-group">
            <label htmlFor="surname">Last Name</label>
            <input type="text" name="surname" defaultValue={auth.surname}/>
          </div>
          <div className="form-group">
            <label htmlFor="nick">Nick</label>
            <input type="text" name="nick" defaultValue={auth.nick} />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea name="bio" defaultValue={auth.bio}/>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email"  defaultValue={auth.email}/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" />
          </div>
          <div className="form-group">
            <label htmlFor="file0">Avatar</label>
            <div className="general-info__container-avatar">
                            {auth.image != "default.png" && <img src={Global.URL + "user/avatar/" + auth.image} className="container-avatar__img" alt="Foto de perfil"/> } 
                            {auth.image == "default.png" && <img src={avatar} className="container-avatar__img" alt="Foto de perfil"/> } 
            </div>
           <br/>
            <input type="file" name="file0" id="file1" className="button-file1" />
          </div>
          <br/>
          <input type="submit" value="Save Changes" className="btn btn-success" />
        </form>
      </div>
    </>
  );
};
