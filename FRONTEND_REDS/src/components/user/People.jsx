import { useState, useEffect } from 'react';
import { Global } from '../../helpers/Global';
import { UserList } from './UserList';

const getUsers = async (nextPage, setUsers, setFollowing, setLoading, setMore, users) => {
  setLoading(true);
  try {
    const request = await fetch(`${Global.URL}user/list/${nextPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("token")
      }
    });

    const data = await request.json();

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
    } else {
      setLoading(false);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    setLoading(false);
  }
};

export const People = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers(1, setUsers, setFollowing, setLoading, setMore, users);
  }, []);

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">People</h1>
      </header>
      <UserList 
        users={users} 
        getUsers={(nextPage) => getUsers(nextPage, setUsers, setFollowing, setLoading, setMore, users)}
        following={following} 
        setFollowing={setFollowing} 
        page={page} 
        setPage={setPage} 
        more={more} 
        loading={loading} 
      />
    </>
  );
}



