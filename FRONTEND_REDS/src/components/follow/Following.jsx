import { useState, useEffect } from 'react';
import { Global } from '../../helpers/Global';
import { UserList } from '../user/UserList';
import { useParams } from 'react-router-dom';
import { GetProfile } from '../../helpers/getProfile';

export const Following = () => {
  
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams(); 
  const [userProfile,setUserProfile] = useState({});
  useEffect(() => {
    getUsers(1);
    GetProfile(params.userId, setUserProfile);
  }, []);
  
  const getUsers = async (nextPage = 1) => {
    setLoading(true);
    const userId = params.userId;
    const request = await fetch(Global.URL + 'follow/following/' + userId +"/"+ nextPage, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("token")
      }
    });

    const data = await request.json();
    let cleanUsers = [];
    data.follows.forEach(follow => {
        cleanUsers = [...cleanUsers, follow.followed]
    })
    data.users = cleanUsers;
    console.log(data.users);

    if (data.users && data.status === 'success') {
      let newUsers = data.users;

      if (users.length >= 1) {
        newUsers = [...users, ...data.users];
      }
      setUsers(newUsers);
      setFollowing(data.user_following);
      setLoading(false);

      if (users.length >= (data.total - data.users.length)) {
        setMore(false);
      }
    }
  }

  /*
  const getProfile = async() => {
    const request = await fetch(Global.URL + "user/profile/" + params.userId,{
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
      }
    })
    const data = await request.json();
    if (data.status === "success"){
        setUserProfile(data.user);
    }   
    
  }
   */
  return (
    <>
      <header className="content__header">
        <h1 className="content__title">users following {userProfile.name} {userProfile.surname}</h1>
      </header>
       <UserList users={users} getUsers={getUsers} following={following} setFollowing={setFollowing} page= {page } setPage={setPage} more={more}  loading= {loading}/>
       

    </>
  );
}

